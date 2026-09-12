// DeepSeek Harness plugin market — the shop window.
//
// Talks to the market API for the catalogue and, when it is embedded in the DSH
// desktop app, to the app over `postMessage` for install/uninstall. Standalone
// (a plain browser) it stays a catalogue: installation needs the client.
//
// Bridge contract — market → host:
//   { type: "dsh-market:hello" }                       on load
//   { type: "dsh-market:install", id, version? }       install / update
//   { type: "dsh-market:uninstall", id }               remove
//   { type: "dsh-market:open", id }                    open in the app's browser
// host → market:
//   { type: "dsh-market:context", installed: [{id, version}], baseUrl }
//   { type: "dsh-market:result", action, id, ok, message }
const state = {
  q: "",
  category: "",
  kind: "",
  sort: "featured",
  plugins: [],
  categories: [],
  suggested: [],
  installed: new Map(),
  embedded: false,
  bridged: false,
  theme: null,
  pending: new Map(),
  /** The plugin the drawer is showing, so its version list can be re-rendered. */
  detail: null
};

const $ = (id) => document.getElementById(id);
const els = {
  featured: $("featured"),
  chips: $("chips"),
  grid: $("grid"),
  empty: $("empty"),
  count: $("listing-count"),
  title: $("listing-title"),
  search: $("search"),
  sort: $("sort"),
  tabsThumb: $("tabs-thumb"),
  status: $("foot-status"),
  drawer: $("drawer"),
  detailIcon: $("detail-icon"),
  detailTitle: $("detail-title"),
  detailMeta: $("detail-meta"),
  detailInstall: $("detail-install"),
  detailDownload: $("detail-download"),
  detailUninstall: $("detail-uninstall"),
  detailStatus: $("detail-status"),
  detailStats: $("detail-stats"),
  detailReadme: $("detail-readme"),
  versionSection: $("version-section"),
  versionHint: $("version-hint"),
  versions: $("detail-versions"),
  modal: $("manage-modal"),
  manageInstalled: $("manage-installed"),
  toast: $("toast")
};

/** Category → line-art glyph for the featured cards, drawn in the accent tint. */
const ART = {
  开发工具: '<path d="M48 34 34 48l14 14"/><path d="M80 34l14 14-14 14"/><path d="M70 30 58 66"/>',
  内容创作: '<rect x="36" y="26" width="28" height="44" rx="6"/><path d="M44 40h12M44 50h12M44 60h8"/><path d="M76 62l14-14 8 8-14 14-10 2z"/>',
  数据分析: '<path d="M38 68V52M54 68V38M70 68V58M86 68V30"/><path d="M32 44l16-8 16 10 16-14"/>',
  效率提升: '<circle cx="64" cy="50" r="21"/><path d="M64 37v13l9 6"/><path d="M46 22l-7 7M82 22l7 7"/>',
  界面美化: '<circle cx="54" cy="42" r="14"/><circle cx="74" cy="56" r="14"/><path d="M36 74h56"/>',
  自动化: '<circle cx="40" cy="34" r="7"/><circle cx="40" cy="66" r="7"/><circle cx="86" cy="50" r="7"/><path d="M47 36l32 11M47 64l32-11"/>'
};

/** Fallback glyph: two blocks clicking together. */
const ART_DEFAULT = '<rect x="30" y="34" width="26" height="28" rx="7"/><rect x="72" y="34" width="26" height="28" rx="7"/><path d="M58 48h14"/>';

/** Accent tints, handed out per category so the grid reads as a system. */
const TINTS = ["#4a6cf7", "#c05e2a", "#218a68", "#7a4ff0", "#bf4577", "#2b86bd"];

/** A stable tint for any category name. */
function tintOf(value) {
  const text = String(value ?? "");
  let hash = 7;
  for (let index = 0; index < text.length; index += 1) hash = (hash * 31 + text.charCodeAt(index)) % 100003;
  return TINTS[hash % TINTS.length];
}

/**
 * The tile mark for one plugin: a short non-pictographic mark from the
 * manifest, else the first character of its title. Emoji are never rendered —
 * the tiles are typographic.
 */
function glyphOf(plugin) {
  const raw = String(plugin.icon ?? "").trim();
  if (raw !== "" && raw.length <= 2 && !/\p{Extended_Pictographic}/u.test(raw)) return raw;
  const title = String(plugin.title ?? plugin.id ?? "?").trim();
  return [...title][0] ?? "?";
}

/** The OS preference, used whenever the host has not named its own theme. */
const darkQuery = window.matchMedia?.("(prefers-color-scheme: dark)");

/** Paint the page in `theme`; anything but "light" reads as dark. */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme === "light" ? "light" : "dark";
}

/** Follow the OS while nobody has told us otherwise. */
function followSystemTheme() {
  if (state.theme !== null) return;
  applyTheme(darkQuery?.matches === true ? "dark" : "light");
}

/** Decode the URL into filter state. */
function readQuery() {
  const params = new URLSearchParams(location.search);
  state.q = params.get("q") ?? "";
  state.category = params.get("category") ?? "";
  state.kind = params.get("kind") ?? "";
  state.sort = params.get("sort") ?? "featured";
}

/** Write the filter state back into the URL without reloading. */
function writeQuery() {
  const params = new URLSearchParams();
  if (state.q !== "") params.set("q", state.q);
  if (state.category !== "") params.set("category", state.category);
  if (state.kind !== "") params.set("kind", state.kind);
  if (state.sort !== "featured") params.set("sort", state.sort);
  const query = params.toString();
  history.replaceState(null, "", query === "" ? location.pathname : `?${query}`);
}

/** Escape text for HTML interpolation. */
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

/** A tiny markdown subset — enough for READMEs and the help text. */
function markdown(source) {
  const lines = String(source ?? "").replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let mode = null;
  const inline = (text) =>
    esc(text)
      .replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  const closeList = () => {
    if (mode === "ul") out.push("</ul>");
    mode = null;
  };
  for (const line of lines) {
    if (/^```/.test(line)) {
      if (mode === "code") { out.push("</code></pre>"); mode = null; continue; }
      closeList();
      out.push("<pre><code>");
      mode = "code";
      continue;
    }
    if (mode === "code") { out.push(esc(line)); continue; }
    if (/^\s*$/.test(line)) { closeList(); continue; }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading !== null) { closeList(); out.push(`<h4>${inline(heading[2])}</h4>`); continue; }
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    if (bullet !== null) {
      if (mode !== "ul") { out.push("<ul>"); mode = "ul"; }
      out.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }
    closeList();
    out.push(`<p>${inline(line)}</p>`);
  }
  if (mode === "code") out.push("</code></pre>");
  closeList();
  return out.join("\n");
}

/** Transient bottom toast. */
let toastTimer = 0;
function toast(text, tone = "") {
  els.toast.textContent = text;
  els.toast.dataset.tone = tone;
  els.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { els.toast.hidden = true; }, tone === "bad" ? 6000 : 3600);
}

/** "3 天前" for a publish date, falling back to the date itself. */
function sinceText(iso) {
  const at = Date.parse(String(iso ?? ""));
  if (!Number.isFinite(at)) return "—";
  const minutes = Math.floor((Date.now() - at) / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return new Date(at).toLocaleDateString("zh-CN");
}

/** Archive size, rounded the way a reader would say it. */
function sizeText(bytes) {
  const value = Number(bytes ?? 0);
  if (!Number.isFinite(value) || value <= 0) return "—";
  return value < 1024 * 1024 ? `${Math.max(1, Math.round(value / 1024))} KB` : `${(value / 1024 / 1024).toFixed(1)} MB`;
}

/** Save one archive (the latest by default) to disk. */
function downloadVersion(id, version) {
  const query = version === undefined || version === "" ? "" : `?version=${encodeURIComponent(version)}`;
  location.href = `/api/plugins/${encodeURIComponent(id)}/download${query}`;
}

/** Installed record for an id, if the app told us about it. */
function installedOf(id) {
  return state.installed.get(id);
}

/** Fetch the catalogue with the current filters. */
async function load() {
  const params = new URLSearchParams({ sort: state.sort });
  if (state.q !== "") params.set("q", state.q);
  if (state.category !== "") params.set("category", state.category);
  if (state.kind !== "") params.set("kind", state.kind);
  els.status.textContent = "正在读取插件市场…";
  try {
    const response = await fetch(`/api/catalog?${params.toString()}`);
    const payload = await response.json();
    if (payload.ok !== true) throw new Error(payload.error ?? "读取失败");
    state.plugins = payload.plugins ?? [];
    state.categories = payload.categories ?? [];
    state.suggested = payload.suggested ?? [];
    render();
    els.status.textContent = `共 ${payload.total ?? 0} 个插件 · ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })} 更新${state.embedded ? "" : " · 浏览器模式（安装请在 DSH 客户端内进行）"}`;
  } catch (error) {
    els.status.textContent = `插件市场不可用：${error instanceof Error ? error.message : String(error)}`;
    toast("插件市场暂时不可用，请稍后再试", "bad");
  }
}

/** Repaint everything derived from state. */
function render() {
  renderFeatured();
  renderChips();
  renderGrid();
  // The drawer's version list carries the "已安装" marker, so it is a derived
  // view too — an install that finished while the drawer was open has to move
  // the marker instead of leaving it on the old row.
  if (!els.drawer.hidden && state.detail !== null) renderVersions();
  els.search.value = state.q;
  els.sort.value = state.sort;
  for (const tab of document.querySelectorAll(".tab")) {
    tab.setAttribute("aria-selected", String((tab.dataset.kind ?? "") === state.kind));
  }
  els.tabsThumb.style.transform = state.kind === "skill" ? "translateX(100%)" : "none";
  els.title.textContent = state.category === "" ? (state.kind === "skill" ? "全部技能" : "全部插件") : state.category;
}

/** The featured category cards. */
function renderFeatured() {
  const ranked = [...state.categories].sort((a, b) => b.count - a.count);
  // A card is a doorway into a category, so it only appears when the category
  // has something to show under the current filters.
  const picks = ranked
    .map((entry) => ({ entry, items: state.plugins.filter((plugin) => (plugin.category ?? "其他") === entry.name).slice(0, 3) }))
    .filter((pick) => pick.items.length > 0)
    .slice(0, 3);
  if (picks.length === 0) {
    els.featured.innerHTML = "";
    return;
  }
  els.featured.innerHTML = picks
    .map(({ entry, items }) => {
      const tint = tintOf(entry.name);
      return `<button class="feature" type="button" data-category="${esc(entry.name)}" style="--tile-tint:${tint}">
        <div class="feature-copy">
          <h3>${esc(entry.name)}</h3>
          <ul>${items.map((plugin) => `<li><i>${esc(glyphOf(plugin))}</i>${esc(plugin.title)}</li>`).join("")}</ul>
        </div>
        <div class="feature-art" style="--art-tint:${tint}" aria-hidden="true">
          <svg viewBox="0 0 128 96">${ART[entry.name] ?? ART_DEFAULT}</svg>
        </div>
      </button>`;
    })
    .join("");
}

/** Category chips: 全部 + the categories the market actually holds. */
function renderChips() {
  const names = state.categories.length > 0 ? state.categories.map((entry) => entry.name) : state.suggested;
  const chips = [{ name: "全部", value: "" }, ...names.map((name) => ({ name, value: name }))];
  els.chips.innerHTML = chips
    .map((chip) => `<button class="chip" type="button" data-category="${esc(chip.value)}" aria-pressed="${String(state.category === chip.value)}">${esc(chip.name)}</button>`)
    .join("");
}

/** The plugin grid. */
function renderGrid() {
  els.count.textContent = `${state.plugins.length} 个结果`;
  els.empty.hidden = state.plugins.length > 0;
  els.empty.textContent = state.q !== ""
    ? `没有匹配「${state.q}」的${state.kind === "skill" ? "技能" : "插件"}，换个关键词试试。`
    : state.kind === "skill" ? "这里还没有技能，用创造模式做一个再发布上来吧。" : "这里还没有插件，用创造模式做一个再发布上来吧。";
  els.grid.innerHTML = state.plugins
    .map((plugin, index) => {
      const installed = installedOf(plugin.id);
      const state_ = installed === undefined ? "idle" : installed.version === plugin.version ? "installed" : "update";
      const action = state_ === "installed"
        ? `<button class="install-btn" type="button" data-state="installed" data-install="${esc(plugin.id)}"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l3 3 6-6.6" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>已安装</button>`
        : `<button class="install-btn" type="button" data-install="${esc(plugin.id)}"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3.2v9.6M3.2 8h9.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>${state_ === "update" ? "更新" : "安装"}</button>`;
      // The meta line answers "which one am I getting, and how far behind am I"
      // before the reader has to open anything.
      const pieces = [plugin.author ?? "匿名作者", `v${plugin.version}`];
      if (Number(plugin.versionCount ?? 1) > 1) pieces.push(`${plugin.versionCount} 个版本`);
      if (installed !== undefined) pieces.push(`已装 v${installed.version}`);
      pieces.push(plugin.category ?? "其他", `${Number(plugin.downloads ?? 0)} 次下载`);
      const meta = pieces.map((piece) => `<span>${esc(piece)}</span>`).join("");
      return `<article class="card" data-open="${esc(plugin.id)}" style="animation-delay:${Math.min(index, 12) * 24}ms;--tile-tint:${tintOf(plugin.category ?? "其他")}">
        <div class="card-icon" aria-hidden="true">${esc(glyphOf(plugin))}</div>
        <div class="card-body">
          <h3 class="card-title"><span>${esc(plugin.title)}</span>${plugin.featured === true ? "<em>推荐</em>" : ""}${state_ === "update" ? "<em>可更新</em>" : ""}</h3>
          <p class="card-summary">${esc(plugin.summary)}</p>
          <p class="card-meta">${meta}</p>
        </div>
        <div class="card-action">${action}</div>
      </article>`;
    })
    .join("");
}

/** Open the detail drawer for one plugin. */
async function openDetail(id) {
  let plugin = state.plugins.find((entry) => entry.id === id);
  els.drawer.hidden = false;
  els.detailStatus.hidden = true;
  // Blank the header and the stats first: if the fetch fails, the drawer shows
  // the error alone rather than yesterday's plugin under a dead "install".
  els.detailIcon.textContent = "";
  els.detailIcon.style.removeProperty("--tile-tint");
  els.detailTitle.textContent = "";
  els.detailMeta.textContent = "";
  els.detailStats.innerHTML = "";
  delete els.detailInstall.dataset.id;
  els.detailInstall.disabled = true;
  els.detailDownload.onclick = null;
  els.detailUninstall.hidden = true;
  disarm(els.detailUninstall, "卸载");
  els.detailReadme.innerHTML = "<p>正在读取…</p>";
  try {
    const response = await fetch(`/api/plugins/${encodeURIComponent(id)}`);
    const payload = await response.json();
    if (payload.ok !== true) throw new Error(payload.error ?? "读取失败");
    plugin = payload.plugin;
  } catch (error) {
    els.detailReadme.innerHTML = `<p>读取失败：${esc(error instanceof Error ? error.message : String(error))}</p>`;
    return;
  }
  els.detailIcon.textContent = glyphOf(plugin);
  els.detailIcon.style.setProperty("--tile-tint", tintOf(plugin.category ?? "其他"));
  els.detailTitle.textContent = plugin.title;
  const count = Number(plugin.versionCount ?? (plugin.versions ?? []).length ?? 1);
  const kindLabel = plugin.kind === "skill" ? "技能" : "插件";
  els.detailMeta.textContent = [
    kindLabel,
    plugin.packageName ?? id,
    `v${plugin.version}`,
    count > 1 ? `${count} 个版本` : "",
    plugin.category ?? "其他",
    plugin.author ?? "匿名作者"
  ].filter((piece) => piece !== "").join(" · ");
  const installed = installedOf(plugin.id);
  const same = installed !== undefined && installed.version === plugin.version;
  els.detailInstall.textContent = same ? "已安装最新版" : installed === undefined ? "安装" : `更新到 v${plugin.version}`;
  els.detailInstall.dataset.state = same ? "installed" : "";
  els.detailInstall.disabled = false;
  els.detailInstall.dataset.id = plugin.id;
  els.detailInstall.dataset.version = plugin.version;
  els.detailUninstall.hidden = installed === undefined;
  els.detailUninstall.disabled = false;
  els.detailUninstall.dataset.id = plugin.id;
  disarm(els.detailUninstall, "卸载");
  els.detailDownload.onclick = () => { downloadVersion(plugin.id, ""); };
  const stats = [
    ["最新版本", `v${plugin.version}`],
    ["版本数", String(count)],
    ["下载", String(plugin.downloads ?? 0)],
    ["体积", sizeText(plugin.size)],
    ["分类", plugin.category ?? "其他"],
    ["作者", plugin.author ?? "匿名作者"]
  ];
  if (installed !== undefined) stats.push(["已安装", `v${installed.version}`]);
  if (plugin.homepage !== undefined && plugin.homepage !== "") stats.push(["主页", plugin.homepage]);
  els.detailStats.innerHTML = stats.map(([label, value]) => `<div><b>${esc(value)}</b>${esc(label)}</div>`).join("");
  state.detail = plugin;
  const skillHint = plugin.kind === "skill"
    ? "<p>这是一份<code>技能</code>：安装后出现在技能列表（<code>/</code> 可查看），由 SKILL.md 的 frontmatter 描述何时使用。它不加载代码，卸载即删目录。</p>"
    : "";
  els.detailReadme.innerHTML = skillHint + (markdown(plugin.readme ?? plugin.description ?? "") || "<p>作者还没有填写说明。</p>");
  renderVersions();
  history.replaceState(null, "", `/plugin/${plugin.id}${location.search}`);
}

/**
 * The version panel.
 *
 * The history is not decoration. A release that regresses has to be pinnable
 * back to the previous one without waiting for the author, so every row carries
 * its own install and download action, and the row the user is actually running
 * says so rather than leaving them to compare numbers.
 */
function renderVersions() {
  const plugin = state.detail;
  const versions = Array.isArray(plugin?.versions) ? plugin.versions : [];
  els.versionSection.hidden = versions.length === 0;
  if (versions.length === 0) return;
  const installed = installedOf(plugin.id);
  els.versionHint.textContent = installed === undefined
    ? `共 ${versions.length} 个版本`
    : `共 ${versions.length} 个版本 · 已装 v${installed.version}`;
  els.versions.innerHTML = versions
    .map((entry) => {
      const isLatest = entry.version === plugin.version;
      const isInstalled = installed !== undefined && installed.version === entry.version;
      const tags = [
        isLatest ? '<em class="v-tag">最新</em>' : "",
        isInstalled ? '<em class="v-tag v-on">当前安装</em>' : ""
      ].join("");
      const note = entry.note === undefined || entry.note === ""
        ? ""
        : `<p class="version-note">${esc(entry.note)}</p>`;
      const facts = [sinceText(entry.publishedAt), sizeText(entry.size)];
      if (Number(entry.files ?? 0) > 0) facts.push(`${entry.files} 个文件`);
      return `<li class="version"${isInstalled ? ' data-on="1"' : ""}>
        <div class="version-main">
          <div class="version-line"><span class="version-no">v${esc(entry.version)}</span>${tags}</div>
          <div class="version-sub">${facts.map((fact) => `<span>${esc(fact)}</span>`).join("")}</div>
          ${note}
        </div>
        <div class="version-actions">
          <button class="mini-btn" type="button" data-version-install="${esc(entry.version)}"${isInstalled ? " disabled" : ""}>${isInstalled ? "已安装" : "安装"}</button>
          <button class="mini-btn" type="button" data-version-download="${esc(entry.version)}">下载</button>
        </div>
      </li>`;
    })
    .join("");
}

/** Close the detail drawer. */
function closeDetail() {
  els.drawer.hidden = true;
  state.detail = null;
  history.replaceState(null, "", location.pathname.replace(/^\/plugin\/[^/]+$/, "/") + location.search);
}

/**
 * The manage modal's installed list: every market install, latest first by
 * name, each with its own two-step uninstall. Titles come from the install
 * record the host broadcast; when the host did not send one (an old context),
 * the id stands in.
 */
function renderInstalled() {
  const entries = [...state.installed.values()].sort((a, b) => a.id.localeCompare(b.id));
  if (entries.length === 0) {
    els.manageInstalled.innerHTML = '<p class="manage-empty">还没有从市场安装的插件或技能。</p>';
    return;
  }
  els.manageInstalled.innerHTML = entries
    .map((entry) => {
      const kindLabel = entry.kind === "skill" ? "技能" : "插件";
      return `<div class="manage-row">
        <div class="manage-main">
          <span class="manage-title">${esc(entry.title ?? entry.id)}</span>
          <span class="manage-sub">${esc(kindLabel)} · v${esc(entry.version ?? "")}</span>
        </div>
        <button class="uninstall-btn" type="button" data-manage-uninstall="${esc(entry.id)}">卸载</button>
      </div>`;
    })
    .join("");
}

/** Ask the host app to install a plugin. */
function install(id, version) {
  if (!state.embedded) {
    toast("请在 DeepSeek Harness 客户端里打开插件市场再安装", "bad");
    openDetail(id);
    return;
  }
  setInstallState(id, "busy", "安装中");
  state.pending.set(id, version ?? "");
  post({ type: "dsh-market:install", id, version });
  toast(`正在安装 ${id}…`);
}

/**
 * Ask the host app to uninstall a plugin or skill. The host drops the patch
 * row, unmounts the live entry, and deletes the directory; a skill is just the
 * directory. Results come back through {@link onMessage}.
 */
function uninstall(id) {
  if (!state.embedded) {
    toast("请在 DeepSeek Harness 客户端里打开插件市场再卸载", "bad");
    return;
  }
  post({ type: "dsh-market:uninstall", id });
  toast(`正在卸载 ${id}…`);
}

/**
 * Two-step arm/confirm for a destructive button: the first click arms it
 * ("确认卸载"), the second within the window acts, and arming decays so a
 * stray click never deletes anything. Both the detail drawer and the manage
 * list share this.
 */
const ARM_MS = 2600;
const armTimers = new WeakMap();
function armDestructive(button, onConfirm) {
  if (button.dataset.arm === "1") {
    button.dataset.arm = "";
    const timer = armTimers.get(button);
    if (timer !== undefined) clearTimeout(timer);
    button.textContent = button.dataset.armLabel ?? "卸载";
    onConfirm();
    return;
  }
  button.dataset.arm = "1";
  button.dataset.armLabel = button.textContent;
  button.textContent = "确认卸载？";
  armTimers.set(button, setTimeout(() => {
    button.dataset.arm = "";
    button.textContent = button.dataset.armLabel ?? "卸载";
  }, ARM_MS));
}

/** Restore a button left armed (an outside render or a fresh detail opening). */
function disarm(button, label) {
  button.dataset.arm = "";
  const timer = armTimers.get(button);
  if (timer !== undefined) clearTimeout(timer);
  if (label !== undefined) button.textContent = label;
}

/** Reflect an install state on every button that shows this id. */
function setInstallState(id, state_, label) {
  for (const button of document.querySelectorAll(`[data-install="${CSS.escape(id)}"]`)) {
    button.dataset.state = state_;
    if (label !== undefined) {
      const icon = button.querySelector("svg");
      button.textContent = "";
      if (icon !== null) button.append(icon);
      button.append(document.createTextNode(label));
    }
  }
  if (els.detailInstall.dataset.id === id && label !== undefined) {
    els.detailInstall.dataset.state = state_;
    els.detailInstall.textContent = label;
  }
}

/** Send one message to the embedding app. */
function post(message) {
  if (window.parent === window) return;
  window.parent.postMessage(message, "*");
}

/** Install results coming back from the app. */
function onMessage(event) {
  const data = event.data;
  if (typeof data !== "object" || data === null || typeof data.type !== "string") return;
  if (data.type === "dsh-market:theme") {
    state.theme = data.theme === "light" ? "light" : "dark";
    applyTheme(state.theme);
    return;
  }
  if (data.type === "dsh-market:context") {
    state.bridged = true;
    state.embedded = true;
    state.installed = new Map((data.installed ?? []).map((entry) => [entry.id, entry]));
    if (typeof data.theme === "string") {
      state.theme = data.theme === "light" ? "light" : "dark";
      applyTheme(state.theme);
    }
    render();
    return;
  }
  if (data.type !== "dsh-market:result") return;
  const { action, id, ok, message } = data;
  if (action === "install") {
    if (ok === true) {
      const version = data.version ?? state.pending.get(id) ?? "";
      if (version !== "") state.installed.set(id, { id, version });
      else state.installed.set(id, { id, version: state.plugins.find((entry) => entry.id === id)?.version ?? "" });
      state.pending.delete(id);
      setInstallState(id, "installed", "已安装");
      if (els.detailInstall.dataset.id === id) {
        els.detailInstall.dataset.state = "installed";
        els.detailInstall.textContent = "已安装";
        els.detailStatus.hidden = false;
        els.detailStatus.dataset.tone = "ok";
        els.detailStatus.textContent = message ?? "安装完成，已热加载。";
      }
      toast(message ?? `${id} 安装完成`, "ok");
    } else {
      state.pending.delete(id);
      setInstallState(id, "failed", "重试");
      if (els.detailInstall.dataset.id === id) {
        els.detailStatus.hidden = false;
        els.detailStatus.dataset.tone = "bad";
        els.detailStatus.textContent = message ?? "安装失败";
      }
      toast(message ?? `${id} 安装失败`, "bad");
    }
    render();
    return;
  }
  if (action === "uninstall") {
    if (ok === true) {
      state.installed.delete(id);
      if (state.detail?.id === id) {
        els.detailInstall.textContent = "安装";
        els.detailInstall.dataset.state = "";
        els.detailUninstall.hidden = true;
        disarm(els.detailUninstall, "卸载");
        els.detailStatus.hidden = true;
      }
      // The version rows carry the "当前安装" tag and the manage list shows
      // what is installed; both derive from state, so redraw them.
      renderVersions();
    } else {
      disarm(els.detailUninstall, "卸载");
    }
    renderInstalled();
    toast(message ?? (ok === true ? `${id} 已卸载` : `${id} 卸载失败`), ok === true ? "ok" : "bad");
    render();
  }
}

/** Wire the page up. */
function start() {
  readQuery();
  followSystemTheme();
  darkQuery?.addEventListener?.("change", followSystemTheme);
  state.embedded = window.parent !== window;
  window.addEventListener("message", onMessage);
  if (state.embedded) post({ type: "dsh-market:hello" });

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      state.kind = tab.dataset.kind ?? "";
      writeQuery();
      load();
    });
  });
  els.chips.addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (chip === null) return;
    state.category = chip.dataset.category ?? "";
    writeQuery();
    load();
  });
  els.featured.addEventListener("click", (event) => {
    const card = event.target.closest(".feature");
    if (card === null) return;
    state.category = card.dataset.category ?? "";
    writeQuery();
    load();
  });
  els.grid.addEventListener("click", (event) => {
    const installBtn = event.target.closest("[data-install]");
    if (installBtn !== null) {
      event.stopPropagation();
      install(installBtn.dataset.install, undefined);
      return;
    }
    const card = event.target.closest("[data-open]");
    if (card !== null) void openDetail(card.dataset.open);
  });
  els.detailInstall.addEventListener("click", () => {
    const id = els.detailInstall.dataset.id;
    if (id === undefined || id === "") return;
    if (els.detailInstall.dataset.state === "installed") return;
    install(id, els.detailInstall.dataset.version);
  });
  $("drawer-close").addEventListener("click", closeDetail);
  $("drawer-scrim").addEventListener("click", closeDetail);
  // Version rows: install pins that exact release, download saves it.
  els.versions.addEventListener("click", (event) => {
    const id = state.detail?.id;
    if (id === undefined) return;
    const installBtn = event.target.closest("[data-version-install]");
    if (installBtn !== null) {
      install(id, installBtn.dataset.versionInstall ?? "");
      return;
    }
    const downloadBtn = event.target.closest("[data-version-download]");
    if (downloadBtn !== null) downloadVersion(id, downloadBtn.dataset.versionDownload ?? "");
  });
  $("manage-btn").addEventListener("click", () => {
    renderInstalled();
    els.modal.hidden = false;
  });
  els.manageInstalled.addEventListener("click", (event) => {
    const button = event.target.closest("[data-manage-uninstall]");
    if (button === null) return;
    if (!state.embedded) {
      toast("请在 DeepSeek Harness 客户端里打开插件市场再卸载", "bad");
      return;
    }
    armDestructive(button, () => uninstall(button.dataset.manageUninstall));
  });
  els.detailUninstall.addEventListener("click", () => {
    if (els.detailUninstall.hidden || els.detailUninstall.dataset.id === undefined) return;
    if (!state.embedded) {
      toast("请在 DeepSeek Harness 客户端里打开插件市场再卸载", "bad");
      return;
    }
    armDestructive(els.detailUninstall, () => uninstall(els.detailUninstall.dataset.id));
  });
  els.modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-close]") !== null) els.modal.hidden = true;
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!els.modal.hidden) { els.modal.hidden = true; return; }
    if (!els.drawer.hidden) closeDetail();
  });
  let searchTimer = 0;
  els.search.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.q = els.search.value.trim();
      writeQuery();
      load();
    }, 220);
  });
  els.sort.addEventListener("change", () => {
    state.sort = els.sort.value;
    writeQuery();
    load();
  });

  const deepLink = /^\/plugin\/([^/]+)$/.exec(location.pathname);
  void load().then(() => {
    if (deepLink !== null) void openDetail(decodeURIComponent(deepLink[1]));
  });
}

/** Honour a pending install that the app never answered. */
setTimeout(() => {
  for (const [id] of state.pending) setInstallState(id, "", "安装");
  state.pending.clear();
}, 30000);

start();

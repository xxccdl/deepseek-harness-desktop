// Plugin market bridge — the host half of the DSH plugin market.
//
// Two jobs, one service:
//
//   1. INSTALL. Fetch a package from the market, verify it, put it where the
//      loader can import it, and mount it by writing a row into the profile's
//      user patch layer. That layer reloads live, so the plugin is up without a
//      restart — and because a rejected patch edit leaves the last good tree
//      running, a package that fails to load cannot take the app down. Anything
//      that fails after the first byte lands is rolled back, byte for byte.
//
//   2. PUBLISH. Package a local plugin directory and POST it to the market, so
//      "创造模式 → 写完插件 → 点插件发布" ends with the plugin on the shelf.
//
// The HTTP routes under /api/market/* exist for the browser surfaces; the model
// reaches the same service through the `plugin_publish` tool.
//
// @module @deepseek-ai/dsh-host-plugin-market
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { ArchiveError, packTarGz, stripRoot, unpackTarGz } from "./archive.js";

const execFileAsync = promisify(execFile);

/** Cordis plugin name. */
const name = "plugin-market";
/** Optional services: `webServer`, `connection` and `tools` are resolved with `ctx.get`. */
const inject = [];

/** Market the bridge talks to unless the state file or env overrides it. */
const DEFAULT_BASE_URL = process.env.DSH_MARKET_URL ?? "https://dsh-plugin-market.xxccdl.cn";
/** Script extensions we syntax-check before mounting a package. */
const CHECK_EXTENSIONS = [".js", ".mjs", ".cjs"];
/** Service key other plugins resolve this bridge by. */
const SERVICE_KEY = "pluginMarket";
/** Marker lines around the rows this plugin owns in the patch layer. */
const BLOCK_START = "# >>> dsh-plugin-market 自动生成：插件市场安装的插件，请勿手改本块";
const BLOCK_END = "# <<< dsh-plugin-market";
/** Row ids are prefixed so the market can own rows without colliding. */
const ROW_PREFIX = "market-";
/** How long a catalogue answer is reused when checking for updates. */
const CATALOG_TTL_MS = 10_000;

/** Thrown for anything a user should read verbatim. */
export class MarketError extends Error {}

//#region publish-hint projection
/**
 * The client-visible offer to publish what the model just wrote.
 *
 * The 「插件发布」strip must not be a permanent fixture of creation mode: it
 * only makes sense once there is something to publish. The model signals that
 * by calling the `ask-publish-plugin` tool, and the call itself — an ordinary
 * `tool/call` log event — is the whole record. A projection folds those calls
 * into a per-session hint the strip reads with `useProjection("publishHint")`,
 * so the offer survives reload (replayed from the log) and clears itself the
 * moment a `plugin_publish` call enters the log. Only standard tool events are
 * folded: a custom event type would need the log's ignorable contract and
 * would make every older build refuse the session.
 */
const PUBLISH_HINT_KEY = "publishHint";

/** Validate the folded state; the registry parses it at every checkpoint boundary. */
function parseHintState(value) {
  if (value === null) return null;
  if (typeof value !== "object" || value === null) throw new Error("publishHint state must be an object or null");
  for (const field of ["path", "kind", "title", "summary", "callId"]) {
    if (typeof value[field] !== "string") throw new Error(`publishHint state field ${field} must be a string`);
  }
  // An empty kind means the model did not commit to one — the strip then offers
  // 「自动判断」 and the user may still pin either side before publishing.
  if (value.kind !== "" && value.kind !== "plugin" && value.kind !== "skill") throw new Error("publishHint kind must be plugin, skill, or empty");
  return value;
}

/** Tool-call arguments arrive as a raw JSON string; a damaged one degrades to empty. */
function parseCallArguments(raw) {
  if (typeof raw === "string" && raw !== "") {
    try {
      const parsed = JSON.parse(raw);
      if (parsed !== null && typeof parsed === "object") return parsed;
    } catch { /* fall through to the object shape below */ }
  }
  return typeof raw === "object" && raw !== null ? raw : {};
}

/** The hint a tool call offers, or undefined when the call is not a publish offer. */
function hintOfCall(name, rawArguments, callId) {
  if (name === "plugin_publish") return null;
  if (name !== "ask-publish-plugin") return undefined;
  const args = parseCallArguments(rawArguments);
  return {
    path: typeof args.path === "string" ? args.path : "",
    kind: args.kind === "skill" ? "skill" : args.kind === "plugin" ? "plugin" : "",
    title: typeof args.title === "string" ? args.title : "",
    summary: typeof args.summary === "string" ? args.summary : "",
    callId: typeof callId === "string" ? callId : ""
  };
}

const publishHintProjection = {
  key: PUBLISH_HINT_KEY,
  stateSchema: { parse: parseHintState },
  init: () => null,
  apply: (state, event) => {
    if (event.type !== "tool/call" && event.type !== "tool/code-dispatch") return state;
    const data = event.data;
    if (data === null || typeof data !== "object") return state;
    const hint = hintOfCall(data.name, data.arguments, data.callId ?? data.subCallId);
    // A repeated offer replaces the previous one; publishing clears the strip.
    // Everything else keeps the reference, so the change feed stays quiet.
    return hint === undefined ? state : hint;
  },
  wire: { viewSchema: { parse: parseHintState }, view: (state) => state },
  stateVersion: 1
};
//#endregion

//#region paths
/** `$DSH_HOME`, matching `@deepseek-ai/dsh-home-paths`. */
function dshHome() {
  return process.env.DSH_HOME ?? join(homedir(), ".dsh");
}

/** Where this plugin's state lives. */
function statePath() {
  return join(dshHome(), "plugin-market.json");
}

/**
 * The user patch layers to write rows into: every profile's own
 * `cordis.patch.yml`. The running profile watches its file and recomposes on a
 * valid edit, which is what mounts a freshly installed plugin without a
 * restart. A headless profile present on disk gets the same rows, so a CLI run
 * sees the same plugin set; only one profile is ever composed per process, so
 * the duplicate rows are never mounted twice.
 * @returns the patch files that exist, primary first.
 */
function patchTargets() {
  const profiles = join(dshHome(), "profiles");
  const targets = [];
  try {
    for (const entry of readdirSync(profiles, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = join(profiles, entry.name, "cordis.patch.yml");
      if (existsSync(file)) targets.push({ profile: entry.name, file });
    }
  } catch {
    // No profiles directory: fall through to the home layer below.
  }
  targets.sort((a, b) => (a.profile === "web" ? -1 : b.profile === "web" ? 1 : a.profile.localeCompare(b.profile)));
  const home = join(dshHome(), "cordis.patch.yml");
  if (existsSync(home)) targets.push({ profile: "home", file: home });
  return targets;
}

/**
 * The deployment root: the directory holding `plugins/@deepseek-ai` (source
 * checkout) or `node_modules/@deepseek-ai` (packaged app). Found by walking up
 * from this module, then from the process cwd.
 * @returns `{ root, plugins, modules, installer }`.
 */
function resolveRoots() {
  const candidates = [];
  let from = dirname(fileURLToPath(import.meta.url));
  for (let depth = 0; depth < 8; depth += 1) {
    candidates.push(from);
    const next = dirname(from);
    if (next === from) break;
    from = next;
  }
  let cwd = process.cwd();
  for (let depth = 0; depth < 6; depth += 1) {
    candidates.push(cwd);
    const next = dirname(cwd);
    if (next === cwd) break;
    cwd = next;
  }
  for (const candidate of candidates) {
    const modules = join(candidate, "node_modules", "@deepseek-ai");
    const plugins = join(candidate, "plugins", "@deepseek-ai");
    if (existsSync(plugins) && existsSync(modules)) {
      return { root: candidate, plugins, modules, installer: join(candidate, "scripts", "install-plugins.mjs") };
    }
  }
  for (const candidate of candidates) {
    const modules = join(candidate, "node_modules", "@deepseek-ai");
    if (existsSync(modules)) return { root: candidate, plugins: modules, modules, installer: join(candidate, "scripts", "install-plugins.mjs") };
  }
  throw new MarketError("找不到 DeepSeek Harness 的部署目录，无法安装插件");
}

/** The flat fallback directory the harness resolves out-of-tree plugins from. */
function fallbackDir() {
  return join(dshHome(), "profiles", "node_modules", "@deepseek-ai");
}

/** The user skill root the filesystem skill provider scans.
 *
 * A skill is not a cordis row: the provider discovers `$DSH_HOME/skills/<name>/
 * SKILL.md` and watches that directory, so installing one is a file copy and
 * nothing else.
 */
function skillsRoot() {
  return join(dshHome(), "skills");
}
//#endregion

//#region state
/** Read the bridge's state file, tolerating absence and damage. */
function readState() {
  try {
    const parsed = JSON.parse(readFileSync(statePath(), "utf8"));
    if (typeof parsed !== "object" || parsed === null) return { baseUrl: DEFAULT_BASE_URL, installed: {}, tokens: {} };
    return {
      baseUrl: typeof parsed.baseUrl === "string" && parsed.baseUrl !== "" ? parsed.baseUrl : DEFAULT_BASE_URL,
      installed: typeof parsed.installed === "object" && parsed.installed !== null ? parsed.installed : {},
      tokens: typeof parsed.tokens === "object" && parsed.tokens !== null ? parsed.tokens : {}
    };
  } catch {
    return { baseUrl: DEFAULT_BASE_URL, installed: {}, tokens: {} };
  }
}

/** Write the state file atomically. */
function writeState(state) {
  const target = statePath();
  mkdirSync(dirname(target), { recursive: true });
  const scratch = `${target}.tmp`;
  writeFileSync(scratch, JSON.stringify(state, null, 2));
  renameSync(scratch, target);
  return state;
}
//#endregion

//#region patch layer
/**
 * Render this plugin's managed block for the given installed plugins.
 *
 * The rows go in an `insert` patch rather than as bare `{id, name}` entries: a
 * patch without `insert` may only *modify* a row that already exists in the
 * composed tree, while `insert` without an `id` appends to the root entry list —
 * which is what mounting an installed plugin needs.
 */
function renderBlock(installed) {
  const rows = Object.entries(installed)
    // A skill is discovered from its directory and owns no loader row; writing
    // one would name a package that does not exist and the Loader would refuse
    // the whole composition at the next start.
    .filter(([, entry]) => entry !== null && typeof entry === "object" && entry.kind !== "skill")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, entry]) => {
      const packageName = typeof entry.packageName === "string" && entry.packageName !== "" ? entry.packageName : `@deepseek-ai/${id}`;
      return `    - id: ${ROW_PREFIX}${id}\n      name: '${packageName}'`;
    });
  if (rows.length === 0) return "";
  return [BLOCK_START, "- insert:", ...rows, BLOCK_END, ""].join("\n");
}

/** Drop this plugin's managed block from a patch file body. */
function stripBlock(body) {
  const lines = body.split(/\r?\n/);
  const kept = [];
  let inside = false;
  for (const line of lines) {
    if (line.startsWith(BLOCK_START)) {
      inside = true;
      continue;
    }
    if (inside) {
      if (line.startsWith(BLOCK_END)) inside = false;
      continue;
    }
    kept.push(line);
  }
  return kept.join("\n");
}

/**
 * Write the installed set into every user patch layer, preserving everything
 * else in each file. An empty array document is replaced; otherwise the managed
 * block is appended (or rewritten in place).
 * @param installed - the installed map from the state file.
 * @returns the patch files that were written.
 */
function writeRows(installed) {
  const block = renderBlock(installed);
  const written = [];
  for (const { file } of patchTargets()) {
    const existing = readFileSync(file, "utf8");
    const kept = stripBlock(existing);
    let body;
    if (kept.replace(/^\s*(#.*)?$/gm, "").trim() === "[]" || kept.trim() === "") {
      body = block === "" ? "[]\n" : block;
    } else {
      body = block === "" ? kept.replace(/\s*$/, "\n") : `${kept.replace(/\s*$/, "\n")}\n${block}`;
    }
    const scratch = `${file}.tmp`;
    writeFileSync(scratch, body);
    renameSync(scratch, file);
    written.push(file);
  }
  if (written.length === 0) throw new MarketError("找不到可写入的 profile patch 文件（$DSH_HOME/profiles/<profile>/cordis.patch.yml）");
  return written;
}
//#endregion

//#region verification
/** Turn a package's file map into a mountable, verified directory. */
async function verifyPackage(files, id, kind) {
  const manifestBytes = files.get("package.json");
  if (manifestBytes === undefined) throw new MarketError("包里缺少 package.json");
  let manifest;
  try {
    manifest = JSON.parse(manifestBytes.toString("utf8"));
  } catch (error) {
    throw new MarketError(`package.json 不是合法 JSON：${String(error)}`);
  }
  const expected = `@deepseek-ai/${id}`;
  if (manifest.name !== expected) throw new MarketError(`package.json 的 name 应为 ${expected}，实际是 ${String(manifest.name)}`);
  for (const field of ["dependencies", "devDependencies", "optionalDependencies", "bundledDependencies"]) {
    const declared = manifest[field];
    if (declared !== undefined && typeof declared === "object" && Object.keys(declared).length > 0) {
      throw new MarketError(`这个插件声明了 ${field}，插件市场不支持需要 npm 安装的依赖`);
    }
  }
  // A skill is loaded by its frontmatter, so there is no entry module and no
  // `apply` to probe; its SKILL.md is the whole contract.
  if (kind === "skill") {
    if (files.get("SKILL.md") === undefined) throw new MarketError("技能包里缺少 SKILL.md");
    return { manifest, entry: "SKILL.md" };
  }
  const entry = (typeof manifest.exports?.["."] === "string" ? manifest.exports["."] : typeof manifest.main === "string" ? manifest.main : "lib/index.js").replace(/^\.\//, "");
  if (files.get(entry) === undefined) throw new MarketError(`入口文件不存在：${entry}`);
  return { manifest, entry };
}

/**
 * Syntax-check every shipped script as ESM: a broken client half never appears
 * in the browser, a broken host half never reaches the loader.
 *
 * The check runs as plain Node even though this process is Electron:
 * `ELECTRON_RUN_AS_NODE` turns `process.execPath` into the Node that ships with
 * it, which is the only way to get `--check` semantics out of an Electron
 * binary.
 */
async function checkScripts(files, scratch, { requireScripts = true } = {}) {
  mkdirSync(scratch, { recursive: true });
  const scripts = [...files.keys()].filter((file) => CHECK_EXTENSIONS.includes(file.slice(file.lastIndexOf("."))));
  if (scripts.length === 0) {
    // A skill ships Markdown; a plugin with no script is a plugin that cannot
    // load, and that is worth refusing before it reaches the loader.
    if (requireScripts) throw new MarketError("包里没有可执行的 .js 文件");
    return;
  }
  const nodeEnv = { ...process.env, ELECTRON_RUN_AS_NODE: "1" };
  const targets = scripts.map((file, index) => {
    const target = join(scratch, `${String(index).padStart(3, "0")}.mjs`);
    writeFileSync(target, files.get(file));
    return { file, target };
  });
  const queue = [...targets];
  const worker = async () => {
    for (;;) {
      const item = queue.shift();
      if (item === undefined) return;
      try {
        await execFileAsync(process.execPath, ["--check", item.target], { timeout: 20000, env: nodeEnv });
      } catch (error) {
        const detail = String(error?.stderr ?? error?.message ?? error).split("\n").map((line) => line.trim()).filter((line) => line !== "").slice(0, 2).join(" ");
        throw new MarketError(`语法检查未通过：${item.file} — ${detail.replaceAll(item.target, item.file)}`);
      }
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
}
//#endregion

//#region market client
/** One JSON call to the market. */
async function marketJson(baseUrl, path, init = {}) {
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, { ...init, signal: AbortSignal.timeout(20000) });
  } catch (error) {
    throw new MarketError(`连不上插件市场（${baseUrl}）：${error instanceof Error ? error.message : String(error)}`);
  }
  const payload = await response.json().catch(() => ({}));
  if (payload.ok !== true) throw new MarketError(payload.error ?? `插件市场返回 ${response.status}`);
  return payload;
}

/** Fetch one archive plus its advertised digest. */
async function marketArchive(baseUrl, id, version) {
  const query = version === undefined || version === "" ? "" : `?version=${encodeURIComponent(version)}`;
  let response;
  try {
    response = await fetch(`${baseUrl}/api/plugins/${encodeURIComponent(id)}/download${query}`, { signal: AbortSignal.timeout(60000) });
  } catch (error) {
    throw new MarketError(`下载失败：${error instanceof Error ? error.message : String(error)}`);
  }
  if (!response.ok) throw new MarketError(`下载失败（HTTP ${response.status}）`);
  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    buffer,
    version: response.headers.get("x-market-version") ?? version ?? "",
    sha256: response.headers.get("x-market-sha256") ?? ""
  };
}
//#endregion

//#region filesystem helpers
/** Recursively list a directory as `{ name, data }` pairs for packing. */
function collectDir(dir, base = dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".git" || entry === ".DS_Store" || entry.endsWith(".tmp")) continue;
    const full = join(dir, entry);
    const info = statSync(full);
    if (info.isDirectory()) collectDir(full, base, out);
    else out.push({ name: full.slice(base.length + 1).split(sep).join("/"), data: readFileSync(full) });
  }
  return out;
}

/** Remove a file, a directory, or a junction, without following it. */
function removeAny(target) {
  if (!existsSync(target)) return;
  const info = lstatSync(target);
  if (info.isSymbolicLink()) unlinkSync(target);
  else rmSync(target, { recursive: true, force: true });
}

/** Point the profile's flat fallback directory at an installed package. */
function linkFallback(id, target) {
  const link = join(fallbackDir(), id);
  mkdirSync(dirname(link), { recursive: true });
  removeAny(link);
  try {
    symlinkSync(target, link, "junction");
  } catch {
    // A platform without junction support still finds the package through
    // node_modules; the fallback is an accelerator, not the contract.
  }
}
//#endregion

/** Build the bridge service and its routes. */
function createBridge(ctx) {
  /** Installs currently in flight, so a double click cannot race itself. */
  const busyIds = new Set();

  /** Row ids the loader currently holds, or undefined when it cannot be asked. */
  const loaderRows = () => {
    const loader = ctx.get("loader", false);
    if (loader === undefined || typeof loader.entries !== "function") return undefined;
    try {
      const ids = new Set();
      for (const entry of loader.entries()) {
        const id = entry?.options?.id;
        if (typeof id === "string") ids.add(id);
      }
      return ids;
    } catch {
      return undefined;
    }
  };

  /**
   * The live loader entry carrying `rowId`, wherever in the tree it sits.
   *
   * A row mounted by `loader.create` lives in the loader's own store, but a row
   * that came from the composed config lives in the root include's nested tree —
   * `loader.remove(id)` only resolves the former, so the entry is located by
   * walking the tree and removed through its own group.
   */
  const findRow = (rowId) => {
    const loader = ctx.get("loader", false);
    if (loader === undefined || typeof loader.entries !== "function") return undefined;
    try {
      for (const entry of loader.entries()) {
        if (entry?.options?.id === rowId) return entry;
      }
    } catch {
      // An unreadable tree reads as "not mounted"; the caller reports that.
    }
    return undefined;
  };

  /**
   * Mount one row immediately through the loader service.
   *
   * The desktop app boots the profile in-process and does not install the CLI's
   * patch watchers, so a written patch row only takes effect on the next start;
   * `loader.create` mounts it in the running tree now, and the row written into
   * the profile patch layer is what keeps it mounted tomorrow. Returns
   * undefined when the loader cannot be driven, in which case the row is still
   * written and the caller reports "restart to apply".
   */
  const mountRow = async (id, packageName) => {
    const loader = ctx.get("loader", false);
    if (loader === undefined || typeof loader.create !== "function") return undefined;
    const rowId = `${ROW_PREFIX}${id}`;
    await loader.create({ id: rowId, name: packageName });
    return rowId;
  };

  /** Drop a mounted row from the running tree. */
  const unmountRow = async (id) => {
    const rowId = `${ROW_PREFIX}${id}`;
    const entry = findRow(rowId);
    if (entry === undefined) return true;
    const group = entry.parent;
    if (group === undefined || typeof group.remove !== "function") return false;
    await group.remove(rowId);
    if (typeof group.tree?.write === "function") group.tree.write();
    return findRow(rowId) === undefined;
  };

  /** The market base URL in effect. */
  const baseUrl = () => {
    const state = readState();
    return String(state.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  };

  /** The latest published version per plugin id, memoised for a moment.
   *  A failure is never cached: an unreachable market must not read as "you are
   *  up to date" for the rest of the session. */
  let catalog = { at: 0, versions: new Map() };
  const latestVersions = async () => {
    if (Date.now() - catalog.at < CATALOG_TTL_MS) return catalog.versions;
    try {
      const payload = await marketJson(baseUrl(), "/api/catalog");
      const versions = new Map((payload.plugins ?? []).map((entry) => [String(entry.id), String(entry.version ?? "")]));
      catalog = { at: Date.now(), versions };
      return versions;
    } catch {
      return new Map();
    }
  };

  /** Installed market plugins, as the browser surfaces show them.
   *
   * Each entry carries the market's latest version beside the local one, which
   * is the whole of "is there an update": a plugin in this map was installed
   * from the market, so a differing version can only mean the author shipped
   * something newer since. */
  const installedList = async () => {
    const state = readState();
    const versions = await latestVersions();
    return Object.entries(state.installed).map(([id, entry]) => {
      const version = typeof entry?.version === "string" ? entry.version : "";
      const latest = versions.get(id) ?? "";
      return {
        id,
        version,
        latest,
        hasUpdate: latest !== "" && latest !== version,
        kind: entry?.kind === "skill" ? "skill" : "plugin",
        title: typeof entry?.title === "string" ? entry.title : id,
        installedAt: typeof entry?.installedAt === "string" ? entry.installedAt : "",
        dir: typeof entry?.dir === "string" ? entry.dir : ""
      };
    });
  };

  /** Market health, for the UI's status line. */
  const probe = async () => {
    try {
      const payload = await marketJson(baseUrl(), "/api/health");
      return { reachable: true, name: payload.name, count: payload.plugins ?? 0 };
    } catch (error) {
      return { reachable: false, error: error instanceof Error ? error.message : String(error) };
    }
  };

  /** Copy a verified package into place and mount it. */
  const place = (id, files, entry, record) => {
    const roots = resolveRoots();
    const target = join(roots.plugins, id);
    const deployed = join(roots.modules, id);
    // A source checkout keeps two trees — `plugins/` is the fork's source and
    // `node_modules/` the deployed mirror — but a packaged app resolves both
    // roots onto one node_modules directory. Copying a directory onto itself is
    // an error rather than a no-op, so the mirror step is skipped when the two
    // paths coincide.
    const mirror = deployed !== target;
    const backup = join(dshHome(), "plugin-market-backup", id);
    const had = existsSync(target);
    if (had) {
      removeAny(backup);
      mkdirSync(dirname(backup), { recursive: true });
      cpSync(target, backup, { recursive: true });
    }
    try {
      removeAny(target);
      if (mirror) removeAny(deployed);
      const scratch = `${target}.staging`;
      removeAny(scratch);
      for (const [file, data] of files) {
        const full = join(scratch, file);
        mkdirSync(dirname(full), { recursive: true });
        writeFileSync(full, data);
      }
      renameSync(scratch, target);
      if (mirror) cpSync(target, deployed, { recursive: true });
      linkFallback(id, deployed);
      return { target, deployed, backup, had, roots, mirror };
    } catch (error) {
      // Put the previous package back before surfacing the failure.
      removeAny(target);
      if (had) {
        cpSync(backup, target, { recursive: true });
        if (mirror) cpSync(target, deployed, { recursive: true });
      }
      throw new MarketError(`写入插件目录失败：${error instanceof Error ? error.message : String(error)}`);
    }
  };

  /** Undo a placement. */
  const unplace = ({ target, deployed, backup, had, roots, mirror }) => {
    removeAny(target);
    if (mirror) removeAny(deployed);
    removeAny(join(fallbackDir(), target.split(sep).pop()));
    if (had) {
      cpSync(backup, target, { recursive: true });
      if (mirror) cpSync(target, deployed, { recursive: true });
      linkFallback(target.split(sep).pop(), deployed);
    }
    return roots;
  };

  /** Copy a verified skill into the user's skill root.
   *
   * Writing the directory is the whole install: the filesystem skill provider
   * scans `$DSH_HOME/skills` and watches it, so there is no patch row to write
   * and no loader row to mount — a skill is not a cordis plugin. */
  const placeSkill = (id, files) => {
    const target = join(skillsRoot(), id);
    const backup = join(dshHome(), "plugin-market-backup", `skill-${id}`);
    const had = existsSync(target);
    if (had) {
      removeAny(backup);
      mkdirSync(dirname(backup), { recursive: true });
      cpSync(target, backup, { recursive: true });
    }
    try {
      const scratch = `${target}.staging`;
      removeAny(scratch);
      for (const [file, data] of files) {
        const full = join(scratch, file);
        mkdirSync(dirname(full), { recursive: true });
        writeFileSync(full, data);
      }
      renameSync(scratch, target);
      return { skill: true, target, backup, had };
    } catch (error) {
      removeAny(target);
      if (had) cpSync(backup, target, { recursive: true });
      throw new MarketError(`写入技能目录失败：${error instanceof Error ? error.message : String(error)}`);
    }
  };

  /** Undo a skill placement. */
  const unplaceSkill = ({ target, backup, had }) => {
    removeAny(target);
    if (had) cpSync(backup, target, { recursive: true });
  };

  /** Install (or update) one plugin from the market. */
  const install = async (id, version) => {
    if (typeof id !== "string" || !/^[A-Za-z0-9._-]{1,64}$/.test(id)) throw new MarketError(`插件 id 不合法：${String(id)}`);
    if (busyIds.has(id)) throw new MarketError(`${id} 正在安装，请稍候`);
    busyIds.add(id);
    const state = readState();
    const base = baseUrl();
    let placement = null;
    let rowWritten = false;
    try {
      const detail = await marketJson(base, `/api/plugins/${encodeURIComponent(id)}`);
      const plugin = detail.plugin;
      const kind = plugin.kind === "skill" ? "skill" : "plugin";
      const wanted = version === undefined || version === "" ? plugin.version : version;
      const meta = (plugin.versions ?? []).find((item) => item.version === wanted);
      const owned = state.installed[id] !== undefined;
      const target = kind === "skill" ? join(skillsRoot(), id) : join(resolveRoots().plugins, id);
      if (existsSync(target) && !owned) {
        throw new MarketError(kind === "skill"
          ? `本地已存在同名技能 ${id}（不是从插件市场安装的），为避免覆盖已跳过`
          : `本地已存在同名插件 ${id}（不是从插件市场安装的），为避免覆盖已跳过`);
      }
      const archive = await marketArchive(base, id, wanted);
      if (meta?.sha256 !== undefined && archive.sha256 !== "" && meta.sha256 !== archive.sha256) {
        throw new MarketError(`${id} 的下载校验失败（sha256 不一致），已取消安装`);
      }
      let files;
      try {
        files = stripRoot(unpackTarGz(archive.buffer));
      } catch (error) {
        throw new MarketError(error instanceof ArchiveError ? error.message : `无法读取压缩包：${String(error)}`);
      }
      const verified = await verifyPackage(files, id, kind);
      const scratch = join(dshHome(), "plugin-market-tmp", `${id}-${Date.now()}`);
      try {
        await checkScripts(files, scratch, { requireScripts: kind === "plugin" });
      } finally {
        removeAny(scratch);
      }

      placement = kind === "skill" ? placeSkill(id, files) : place(id, files, verified.entry, plugin);
      if (kind === "plugin") {
        // The module must import and expose `apply` — the same door the loader
        // will open. A throw here is a package that would have broken the mount.
        const entryPath = join(placement.target, verified.entry);
        let loaded;
        try {
          loaded = await import(pathToFileURL(entryPath).href);
        } catch (error) {
          throw new MarketError(`插件加载失败：${error instanceof Error ? error.message : String(error)}`);
        }
        if (typeof loaded.apply !== "function") throw new MarketError(`插件入口没有导出 apply()：${verified.entry}`);
      }

      const record = {
        kind,
        version: archive.version === "" ? wanted : archive.version,
        title: plugin.title ?? id,
        packageName: plugin.packageName ?? `@deepseek-ai/${id}`,
        installedAt: new Date().toISOString(),
        dir: placement.target
      };
      const next = { ...state, installed: { ...state.installed, [id]: record } };
      const rowId = `${ROW_PREFIX}${id}`;
      // A skill is discovered from its directory, so placing it *is* the install;
      // a plugin needs both halves — a patch row for the next start and a live
      // mount now. Either way a refused mount undoes the whole attempt, so a
      // failing package can never leave a half-installed tree behind.
      if (kind === "plugin") {
        try {
          await mountRow(id, record.packageName);
        } catch (error) {
          throw new MarketError(`${record.title} 装载失败，已回滚：${error instanceof Error ? error.message : String(error)}`);
        }
      }
      writeState(next);
      writeRows(next.installed);
      rowWritten = true;
      // The installed set just changed, so the memoised catalogue is stale.
      catalog = { at: 0, versions: new Map() };
      if (kind === "skill") {
        return {
          id,
          version: record.version,
          title: record.title,
          dir: record.dir,
          reloaded: true,
          message: `技能「${record.title}」已安装，新会话即可调用。`
        };
      }
      const live = loaderRows();
      const mounted = live === undefined ? undefined : live.has(rowId);
      return {
        id,
        version: record.version,
        title: record.title,
        dir: record.dir,
        reloaded: mounted !== false,
        message: mounted === false
          ? `${record.title} 已安装，重启 DeepSeek Harness 后生效。`
          : `${record.title} 已安装并生效，刷新界面即可看到它的界面部分。`
      };
    } catch (error) {
      // Roll back everything this attempt did, in reverse order: the live mount,
      // the patch row (so the next start does not see it either), then the files,
      // restoring the previous package when there was one.
      try {
        await unmountRow(id);
      } catch {
        // A failed unmount is reported by the original error, not by this one.
      }
      if (rowWritten) {
        const current = readState();
        delete current.installed[id];
        try {
          writeState(current);
          writeRows(current.installed);
        } catch {
          // The original failure is the one worth reporting; a failed repair
          // still leaves the tree running on its last good composition.
        }
      }
      if (placement !== null) {
        if (placement.skill === true) unplaceSkill(placement);
        else unplace(placement);
      }
      throw error instanceof MarketError ? error : new MarketError(error instanceof Error ? error.message : String(error));
    } finally {
      busyIds.delete(id);
    }
  };

  /** Remove a market-installed plugin or skill. */
  const uninstall = async (id) => {
    const state = readState();
    const entry = state.installed[id];
    if (entry === undefined) throw new MarketError(`${id} 不是从插件市场安装的`);
    const installed = { ...state.installed };
    delete installed[id];
    writeState({ ...state, installed });
    // A skill owns no patch row, so this only rewrites the plugin block — and
    // for a skill it is still the right call, because a plugin installed beside
    // it must keep its row.
    writeRows(installed);
    if (entry.kind === "skill") {
      // Nothing was mounted, so there is nothing to unmount: the provider
      // notices the directory is gone and drops the skill from its catalog.
      removeAny(join(skillsRoot(), id));
      removeAny(join(dshHome(), "plugin-market-backup", `skill-${id}`));
      return {
        id,
        unloaded: true,
        message: `技能「${entry.title ?? id}」已卸载，技能列表随即刷新。`
      };
    }
    const roots = resolveRoots();
    const rowId = `${ROW_PREFIX}${id}`;
    // Unmount before the files go: the loader still holds the module path, and
    // removing the row from the patch layer keeps it gone at the next start too.
    let dropped;
    try {
      dropped = await unmountRow(id);
    } catch (error) {
      dropped = false;
    }
    removeAny(join(roots.plugins, id));
    removeAny(join(roots.modules, id));
    removeAny(join(fallbackDir(), id));
    removeAny(join(dshHome(), "plugin-market-backup", id));
    return {
      id,
      unloaded: dropped !== false,
      message: dropped === false
        ? `${id} 已从列表移除，但运行时没有卸载它，请重启一次 DeepSeek Harness。`
        : `${id} 已卸载，刷新界面后完全消失。`
    };
  };

  /** Find the package a publish targets: a plugin (package.json) or a skill (SKILL.md).
   *
   * Skills rarely carry a manifest — their identity is the frontmatter — so a
   * directory holding only SKILL.md is the skill itself, not a folder of
   * packages to search inside.
   */
  const findPackage = (hint, kind) => {
    const explicit = typeof hint === "string" && hint.trim() !== "" ? resolve(process.cwd(), hint.trim()) : "";
    const hasManifest = (dir) => {
      try {
        const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
        return typeof manifest?.name === "string";
      } catch {
        return false;
      }
    };
    const hasSkillFile = (dir) => existsSync(join(dir, "SKILL.md"));
    const acceptable = (dir) => kind === "skill" ? hasSkillFile(dir) : hasManifest(dir) || (kind === undefined && hasSkillFile(dir));
    if (explicit !== "") {
      if (!existsSync(explicit)) throw new MarketError(`目录不存在：${explicit}`);
      if (acceptable(explicit)) return explicit;
      if (kind === "skill") throw new MarketError(`目录里没有 SKILL.md：${explicit}`);
      const nested = readdirSync(explicit, { withFileTypes: true })
        .filter((item) => item.isDirectory())
        .map((item) => join(explicit, item.name))
        .filter(hasManifest);
      if (nested.length === 1) return nested[0];
      throw new MarketError(`目录里没有唯一的插件包（找到 ${nested.length} 个）：${explicit}`);
    }
    const root = process.cwd();
    const found = [];
    const scan = (dir, depth) => {
      let entries;
      try {
        entries = readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }
      if (acceptable(dir)) found.push(dir);
      if (depth === 0) return;
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (entry.name === "node_modules" || entry.name === ".git" || entry.name.startsWith(".")) continue;
        scan(join(dir, entry.name), depth - 1);
      }
    };
    scan(root, 2);
    if (found.length === 0) {
      throw new MarketError(kind === "skill"
        ? "工作目录里没有找到技能包（需要含 SKILL.md）"
        : "工作目录里没有找到插件包（需要含 package.json）");
    }
    // Prefer a package the agent wrote outside the deployment's own plugin
    // directory; inside it, only the newest package is a plausible intent.
    const authored = found.filter((dir) => !dir.startsWith(resolveRoots().plugins + sep));
    const pool = authored.length > 0 ? authored : found;
    pool.sort((a, b) => statSync(join(b, kind === "skill" ? "SKILL.md" : "package.json")).mtimeMs - statSync(join(a, kind === "skill" ? "SKILL.md" : "package.json")).mtimeMs);
    return pool[0];
  };

  /** Package a directory and publish it. */
  const publish = async (request = {}) => {
    const kind = request.kind === "skill" ? "skill" : request.kind === "plugin" ? "plugin" : undefined;
    const dir = findPackage(request.path, kind);
    const files = collectDir(dir);
    if (files.length === 0) throw new MarketError(`目录为空：${dir}`);
    const manifestBytes = files.find((file) => file.name === "package.json")?.data;
    const isSkill = kind === "skill"
      || (kind === undefined && manifestBytes === undefined && files.some((file) => file.name === "SKILL.md"));
    let manifest;
    try {
      manifest = JSON.parse(String(manifestBytes ?? "{}"));
    } catch (error) {
      throw new MarketError(`package.json 不是合法 JSON：${String(error)}`);
    }
    // The token is keyed by the id the market will store the package under: a
    // plugin by its package name, a skill by its frontmatter name (read the
    // same way the server reads it — the two must agree or the token lookup
    // silently misses and the update is refused).
    let id;
    if (isSkill) {
      const skillBytes = files.find((file) => file.name === "SKILL.md")?.data ?? "";
      const front = String(skillBytes).match(/^---\r?\n([\s\S]*?)\r?\n---/);
      const nameLine = front === null ? undefined : front[1].split(/\r?\n/).find((line) => /^name\s*:/.test(line));
      const skillName = nameLine === undefined ? "" : nameLine.replace(/^name\s*:\s*/, "").replace(/^["']|["']$/g, "").trim();
      if (skillName === "") throw new MarketError("SKILL.md 的 frontmatter 缺少 name，无法确定技能 id");
      id = skillName;
    } else {
      id = String(manifest.name).includes("/") ? String(manifest.name).slice(String(manifest.name).lastIndexOf("/") + 1) : String(manifest.name);
    }
    const meta = {
      kind: isSkill ? "skill" : "plugin",
      ...(request.title === undefined ? {} : { title: request.title }),
      ...(request.summary === undefined ? {} : { summary: request.summary }),
      ...(request.category === undefined ? {} : { category: request.category }),
      ...(request.author === undefined ? {} : { author: request.author }),
      ...(request.note === undefined ? {} : { note: request.note }),
      ...(request.version === undefined ? {} : { version: request.version }),
      ...(Array.isArray(request.tags) && request.tags.length > 0 ? { tags: request.tags } : {})
    };
    if (request.readme !== undefined) meta.readme = request.readme;
    const state = readState();
    const base = baseUrl();
    const archive = packTarGz(files.map(({ name: file, data }) => ({ name: file, data })));
    const payload = await marketJson(base, "/api/plugins", {
      method: "POST",
      headers: {
        "Content-Type": "application/gzip",
        "X-Market-Meta": Buffer.from(JSON.stringify(meta), "utf8").toString("base64"),
        ...(state.tokens[id] === undefined ? {} : { "X-Market-Token": state.tokens[id] })
      },
      body: archive
    });
    if (typeof payload.token === "string" && payload.token !== "") {
      writeState({ ...readState(), tokens: { ...readState().tokens, [id]: payload.token } });
    }
    // This publish just changed what "latest" means, so the memo is stale by
    // definition: drop it and the next update check sees the new version.
    catalog = { at: 0, versions: new Map() };
    const previous = typeof payload.previousVersion === "string" ? payload.previousVersion : "";
    const noun = isSkill ? "技能" : "插件";
    return {
      id: payload.id,
      name: payload.name,
      version: payload.version,
      previousVersion: previous,
      dir,
      bytes: archive.length,
      url: `${base}${payload.url ?? `/plugin/${payload.id}`}`,
      created: payload.created === true,
      message: payload.created === true
        ? `已发布${noun} ${payload.name}${isSkill ? "" : `@${payload.version}`} 到插件市场。`
        : `已更新${noun} ${payload.name} ${previous === "" ? "" : `${previous} → `}${payload.version}。`
    };
  };

  return {
    baseUrl,
    installedList,
    install,
    uninstall,
    publish,
    probe,
    findPackage,
    patchTargets,
    statePath,
    /** Row ids the live loader holds, for the surfaces' mounted/not-mounted hint. */
    loaderRowIds: () => (loaderRows() === undefined ? null : [...loaderRows()])
  };
}

/** Register the bridge service and its HTTP routes. */
function apply(ctx) {
  const bridge = createBridge(ctx);
  ctx.provide(SERVICE_KEY, bridge);
  // The publish offer rides the session-projection seam when that composition
  // supplies it; without it the strip simply never appears and the prompt
  // driven publish flow keeps working as before.
  ctx.inject(["sessionProjections"], (projectionCtx) => {
    projectionCtx.sessionProjections.register(publishHintProjection);
  });

  const routeDisposers = [];
  const sync = () => {
    for (const dispose of routeDisposers) dispose();
    routeDisposers.length = 0;
    const webServer = ctx.get("webServer", false);
    if (webServer === undefined) return;
    const readBody = (req) =>
      new Promise((done, fail) => {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => done(Buffer.concat(chunks).toString("utf8")));
        req.on("error", fail);
      });
    const send = (res, status, payload) => {
      const body = Buffer.from(JSON.stringify(payload), "utf8");
      res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Content-Length": body.length, "Cache-Control": "no-store" });
      res.end(body);
    };
    const json = (handler) => async (req, res) => {
      try {
        const raw = req.method === "POST" ? await readBody(req) : "";
        const body = raw === "" ? {} : JSON.parse(raw);
        send(res, 200, { ok: true, ...(await handler(body, req)) });
      } catch (error) {
        send(res, 200, { ok: false, error: error instanceof Error ? error.message : String(error) });
      }
    };
    const route = (path, handler) => {
      routeDisposers.push(ctx.effect(() => webServer.register({
        kind: "exact",
        path,
        handler: async (req, res) => {
          // Exact routes outrank the /api prefix, so the shared Host/Origin
          // fence and browser authentication must be applied by hand.
          const connection = ctx.get("connection", false);
          const rejection = connection === undefined ? undefined : connection.requestRejection(req);
          if (rejection !== undefined) {
            res.writeHead(rejection);
            res.end(rejection === 401 ? "unauthorized" : "forbidden");
            return;
          }
          await handler(req, res);
        }
      }), `plugin-market: ${path} route`));
    };

    route("/api/market/state", json(async () => ({
      baseUrl: bridge.baseUrl(),
      installed: await bridge.installedList(),
      market: await bridge.probe(),
      patchPaths: bridge.patchTargets().map((target) => target.file),
      statePath: bridge.statePath(),
      // Diagnostic: the row ids the live loader actually holds, so a surface can
      // tell "installed" from "mounted".
      rows: bridge.loaderRowIds()
    })));

    route("/api/market/install", json(async (body) => {
      const result = await bridge.install(body.id, body.version);
      return result;
    }));

    route("/api/market/uninstall", json(async (body) => {
      const result = await bridge.uninstall(body.id);
      return result;
    }));

    route("/api/market/publish", json(async (body) => {
      const result = await bridge.publish({
        path: body.path,
        title: body.title,
        summary: body.summary,
        category: body.category,
        author: body.author,
        tags: body.tags,
        note: body.note,
        readme: body.readme,
        kind: body.kind,
        version: body.version
      });
      return result;
    }));
  };
  sync();
  ctx.on("internal/service", () => {
    // The same event fires while the tree unloads, when this fiber is already
    // beyond state 2 and `ctx.effect` would throw INACTIVE_EFFECT.
    if (ctx.fiber.state !== 2) return;
    sync();
  });
}

export { apply, inject, name };

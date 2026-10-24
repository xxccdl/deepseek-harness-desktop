// DeepSeek Harness desktop app — preload bridge.
// 1) Injects the custom title bar (drag region + minimize/maximize/close)
//    into the harness SPA — the window is frameless (frame: false).
//    The bar participates in the document flow: body becomes a flex column
//    and the app's #root (html,body,#root{height:100%}) flexes into the
//    remaining space, so the SPA is never covered.
// 2) Exposes a small, safe `dshDesktop` API through the context bridge
//    (contextIsolation + sandbox on).
const { contextBridge, ipcRenderer } = require("electron");

const TITLE_BAR_HEIGHT = 36;

// The bar is a child of <body>, so the harness theme tokens applied there
// resolve here too: the fill, text, and hover shades follow the active light or
// dark palette instead of the dark-only literals this used to hardcode.
const TITLE_BAR_CSS = `
#dsh-titlebar {
  position: relative;
  z-index: 10;
  flex: none;
  width: 100%;
  height: ${TITLE_BAR_HEIGHT}px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding-left: 6px;
  background: var(--dsw-alias-bg-base, #0d0f13);
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(20, 24, 35, 0.08));
  color: var(--dsw-alias-label-secondary, rgba(20, 24, 35, 0.7));
  font: 12px/1 system-ui, "Segoe UI", sans-serif;
  -webkit-app-region: drag;
  user-select: none;
}
/* The menu bar is the bar's only content on the left: a first-run window shows
   the app menu where Windows users expect 应用/编辑, and the wordmark that used
   to sit here only repeated what the sidebar already says. */
#dsh-titlebar .dsh-menubar {
  display: flex;
  align-items: center;
  height: 100%;
  -webkit-app-region: no-drag;
}
#dsh-titlebar .dsh-menu-root {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
}
#dsh-titlebar .dsh-menu-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 24px;
  margin: 0;
  padding: 0 10px;
  box-sizing: border-box;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, rgba(20, 24, 35, 0.7));
  font: 12.5px/1 system-ui, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  white-space: nowrap;
  cursor: default;
  transition: background-color .12s ease, color .12s ease;
}
#dsh-titlebar .dsh-menu-btn:hover,
#dsh-titlebar .dsh-menu-root[data-open="true"] .dsh-menu-btn {
  background: var(--dsw-alias-interactive-bg-hover, rgba(20, 24, 35, 0.06));
  color: var(--dsw-alias-label-primary, rgba(20, 24, 35, 0.9));
}
#dsh-titlebar .dsh-menu-btn svg {
  display: block;
  flex: none;
  width: 13px;
  height: 13px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.2;
  stroke-linejoin: round;
}
#dsh-titlebar .dsh-menu-list {
  position: absolute;
  top: calc(50% + 15px);
  left: 0;
  z-index: 30;
  min-width: 232px;
  margin: 0;
  padding: 5px;
  box-sizing: border-box;
  border: 1px solid var(--dsw-alias-border-l1, rgba(20, 24, 35, 0.08));
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-2, #fff);
  box-shadow: 0 18px 44px -14px rgba(8, 10, 16, .42), 0 2px 8px rgba(8, 10, 16, .12);
  color: var(--dsw-alias-label-primary, rgba(20, 24, 35, 0.9));
}
#dsh-titlebar .dsh-menu-list[hidden] {
  display: none;
}
#dsh-titlebar .dsh-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 26px;
  width: 100%;
  height: 30px;
  margin: 0;
  padding: 0 9px;
  box-sizing: border-box;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: inherit;
  font: 12.5px/1 system-ui, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  text-align: left;
  white-space: nowrap;
  cursor: default;
}
#dsh-titlebar .dsh-menu-item:hover,
#dsh-titlebar .dsh-menu-item:focus-visible {
  background: var(--dsw-alias-interactive-bg-hover, rgba(20, 24, 35, 0.06));
  outline: none;
}
#dsh-titlebar .dsh-menu-item kbd {
  flex: none;
  color: var(--dsw-alias-label-tertiary, rgba(20, 24, 35, 0.45));
  font: 11px/1 ui-monospace, "Cascadia Mono", Consolas, monospace;
  letter-spacing: .02em;
}
#dsh-titlebar .dsh-menu-sep {
  height: 1px;
  margin: 4px 7px;
  background: var(--dsw-alias-border-l1, rgba(20, 24, 35, 0.08));
}
#dsh-titlebar .dsh-controls {
  margin-left: auto;
  display: flex;
  align-items: center;
  height: 100%;
  -webkit-app-region: no-drag;
}
#dsh-titlebar .dsh-btn {
  all: initial;
  width: 46px !important;
  height: 100% !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
  color: inherit !important;
  padding: 0 !important;
  margin: 0 !important;
  cursor: default;
  outline: none;
  box-shadow: none !important;
  -webkit-app-region: no-drag;
}
#dsh-titlebar .dsh-btn:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(20, 24, 35, 0.06)) !important;
}
#dsh-titlebar .dsh-btn:active {
  background: var(--dsw-alias-interactive-bg-hover-solid, rgba(20, 24, 35, 0.1)) !important;
}
#dsh-titlebar .dsh-btn.dsh-close:hover {
  background: #e81123 !important;
  color: #fff !important;
}
#dsh-titlebar .dsh-btn svg {
  display: block;
  width: 12px;
  height: 12px;
  fill: none !important;
  stroke: currentColor !important;
  stroke-width: 1.1 !important;
  stroke-linecap: round;
  stroke-linejoin: round;
}
#dsh-titlebar .dsh-btn svg rect,
#dsh-titlebar .dsh-btn svg path {
  fill: none !important;
  stroke: currentColor !important;
}
#dsh-titlebar .dsh-max-restore {
  display: none !important;
}
#dsh-titlebar.dsh-maximized .dsh-max-restore {
  display: block !important;
}
#dsh-titlebar.dsh-maximized .dsh-max-full {
  display: none !important;
}
`;

const ICONS = {
  app:
    '<svg viewBox="0 0 16 16"><rect x="2.4" y="2.4" width="4.8" height="4.8" rx="1.3"/><rect x="8.8" y="2.4" width="4.8" height="4.8" rx="1.3"/><rect x="2.4" y="8.8" width="4.8" height="4.8" rx="1.3"/><rect x="8.8" y="8.8" width="4.8" height="4.8" rx="1.3"/></svg>',
  minimize:
    '<svg viewBox="0 0 12 12"><path d="M1 6h10"/></svg>',
  maximize:
    '<svg class="dsh-max-full" viewBox="0 0 12 12"><rect x="1.4" y="1.4" width="9.2" height="9.2" rx="0.8"/></svg>' +
    '<svg class="dsh-max-restore" viewBox="0 0 12 12">' +
    '<path d="M4.4 4.4V2.6a1.2 1.2 0 0 1 1.2-1.2h3.8a1.2 1.2 0 0 1 1.2 1.2v3.8a1.2 1.2 0 0 1-1.2 1.2H7.6"/>' +
    '<rect x="1.4" y="4.4" width="5.8" height="5.8" rx="0.8"/></svg>',
  close:
    '<svg viewBox="0 0 12 12"><path d="M1.6 1.6l8.8 8.8M10.4 1.6L1.6 10.4"/></svg>'
};

/** Menu definitions: `command` names an action `runCommand` answers. */
const MENUS = {
  app: [
    { command: "new-session", label: "新建会话", keys: "Ctrl+Alt+N" },
    { command: "market", label: "插件市场", keys: "" },
    { separator: true },
    { command: "settings", label: "设置", keys: "Ctrl+Alt+," },
    { command: "update", label: "检查更新", keys: "" },
    { separator: true },
    { command: "close", label: "退出 DeepSeek Harness", keys: "Alt+F4" }
  ],
  edit: [
    { command: "undo", label: "撤销", keys: "Ctrl+Z" },
    { command: "redo", label: "重做", keys: "Ctrl+Y" },
    { separator: true },
    { command: "cut", label: "剪切", keys: "Ctrl+X" },
    { command: "copy", label: "复制", keys: "Ctrl+C" },
    { command: "paste", label: "粘贴", keys: "Ctrl+V" },
    { separator: true },
    { command: "select-all", label: "全选", keys: "Ctrl+A" }
  ]
};

/** First element matching a CSS-module fragment, clicked — class hashes are
 *  version-owned, so callers pass the readable half only. */
function clickClass(fragment) {
  const el = document.querySelector('[class*="' + fragment + '"]');
  if (el instanceof HTMLElement) {
    el.click();
    return true;
  }
  return false;
}

/** The settings dialog. The harness binds a shortcut to it; a synthetic keydown
 *  travels the same listeners, and the account menu is the fallback when the
 *  binding is not installed. */
function openSettings() {
  if (document.querySelector('[data-shortcut-modal="settings"]') !== null) return;
  window.dispatchEvent(new KeyboardEvent("keydown", {
    key: ",",
    code: "Comma",
    ctrlKey: true,
    altKey: true,
    bubbles: true,
    cancelable: true
  }));
  setTimeout(() => {
    if (document.querySelector('[data-shortcut-modal="settings"]') !== null) return;
    const trigger = [...document.querySelectorAll("button")].find((btn) => {
      const label = btn.getAttribute("aria-label") ?? btn.title;
      return label === "账号菜单";
    });
    if (trigger === undefined) return;
    trigger.click();
    // The entry lands after the menu's own paint, so poll instead of guessing
    // one delay. This bar's own items are excluded — they also start with 设置
    // and would otherwise be the first match, invisibly.
    const pick = (attempt = 0) => {
      const item = [...document.querySelectorAll('[role="menuitem"], button')].find((el) => {
        if (el.classList.contains("dsh-menu-item")) return false;
        return (el instanceof HTMLElement ? el.innerText : "").trim().startsWith("设置");
      });
      if (item instanceof HTMLElement) {
        item.click();
        return;
      }
      if (attempt < 8) setTimeout(() => pick(attempt + 1), 100);
    };
    pick();
  }, 160);
}

/** Open settings and land on one section, by its nav label. */
function openSettingsSection(label) {
  const pick = (attempt = 0) => {
    const cell = [...document.querySelectorAll('[class*="navCell"]')].find(
      (el) => (el instanceof HTMLElement ? el.innerText : "").trim() === label
    );
    if (cell instanceof HTMLElement) {
      cell.click();
      return;
    }
    if (attempt >= 10) return;
    setTimeout(() => pick(attempt + 1), 100);
  };
  openSettings();
  setTimeout(() => pick(), 260);
}

/** Insert clipboard text at the caret of whatever is focused. */
function pasteAtCaret() {
  if (typeof navigator.clipboard?.readText !== "function") return;
  navigator.clipboard.readText().then((text) => {
    if (text !== "") document.execCommand("insertText", false, text);
  }).catch(() => { /* permission denied: nothing to paste */ });
}

/** Run one menu command. Every entry answers without leaving the title bar. */
function runCommand(command) {
  switch (command) {
    case "new-session":
      if (!clickClass("newSession")) {
        const fallback = [...document.querySelectorAll("button")].find((btn) => btn.title === "新建会话");
        if (fallback !== undefined) fallback.click();
      }
      return;
    case "market":
      window.dispatchEvent(new CustomEvent("dsh:open-market"));
      return;
    case "settings":
      openSettings();
      return;
    case "update":
      openSettingsSection("更新");
      return;
    case "close":
      ipcRenderer.send("dsh:window-control", "close");
      return;
    case "paste":
      pasteAtCaret();
      return;
    case "select-all":
      document.execCommand("selectAll");
      return;
    case "cut":
    case "copy":
    case "undo":
    case "redo":
      document.execCommand(command);
      return;
    default:
      return;
  }
}

function injectTitleBar() {
  if (document.getElementById("dsh-titlebar")) return;

  const style = document.createElement("style");
  style.textContent = TITLE_BAR_CSS;
  document.head.appendChild(style);

  const bar = document.createElement("div");
  bar.id = "dsh-titlebar";

  const menubar = document.createElement("div");
  menubar.className = "dsh-menubar";
  menubar.setAttribute("role", "menubar");

  const roots = [];
  const buttons = [];
  const lists = [];
  const openMenu = (index) => {
    lists.forEach((list, i) => {
      const open = i === index;
      list.hidden = !open;
      roots[i].dataset.open = String(open);
      buttons[i].setAttribute("aria-expanded", String(open));
    });
  };
  const closeMenus = (restoreFocus = false) => {
    const open = menuIndex();
    if (open === -1) return;
    openMenu(-1);
    // Return the caret to the button that owned the menu, so a keyboard user is
    // not dropped back into the page after Escape.
    if (restoreFocus) buttons[open]?.focus();
  };
  const menuIndex = () => roots.findIndex((root) => root.dataset.open === "true");

  Object.entries(MENUS).forEach(([id, items], index) => {
    const root = document.createElement("div");
    root.className = "dsh-menu-root";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "dsh-menu-btn";
    button.setAttribute("role", "menuitem");
    button.setAttribute("aria-haspopup", "menu");
    button.setAttribute("aria-expanded", "false");
    button.dataset.menu = id;
    button.innerHTML = (id === "app" ? ICONS.app : "") + "<span>" + (id === "app" ? "应用" : "编辑") + "</span>";

    const list = document.createElement("div");
    list.className = "dsh-menu-list";
    list.setAttribute("role", "menu");
    list.setAttribute("aria-label", id === "app" ? "应用" : "编辑");
    list.hidden = true;

    for (const entry of items) {
      if (entry.separator === true) {
        const rule = document.createElement("div");
        rule.className = "dsh-menu-sep";
        rule.setAttribute("role", "separator");
        list.appendChild(rule);
        continue;
      }
      const item = document.createElement("button");
      item.type = "button";
      item.className = "dsh-menu-item";
      item.setAttribute("role", "menuitem");
      item.dataset.command = entry.command;
      const label = document.createElement("span");
      label.textContent = entry.label;
      item.appendChild(label);
      if (entry.keys !== "") {
        const keys = document.createElement("kbd");
        keys.textContent = entry.keys;
        item.appendChild(keys);
      }
      item.addEventListener("click", () => {
        closeMenus();
        runCommand(entry.command);
      });
      list.appendChild(item);
    }

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openMenu(lists[index].hidden ? index : -1);
    });
    // Windows menu bars switch on hover once one is open; without this every
    // switch costs an extra click.
    button.addEventListener("pointerenter", () => {
      if (menuIndex() !== -1 && lists[index].hidden) openMenu(index);
    });
    root.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenus(true);
      } else if (event.key === "ArrowDown" || event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const next = event.key === "ArrowLeft" ? (index + roots.length - 1) % roots.length
          : event.key === "ArrowRight" ? (index + 1) % roots.length : index;
        openMenu(next);
        buttons[next].focus();
        if (event.key === "ArrowDown") lists[next].querySelector(".dsh-menu-item")?.focus();
      }
    });

    root.appendChild(button);
    root.appendChild(list);
    menubar.appendChild(root);
    roots.push(root);
    buttons.push(button);
    lists.push(list);
  });

  const controls = document.createElement("div");
  controls.className = "dsh-controls";
  controls.innerHTML =
    '<button class="dsh-btn" data-action="minimize" title="最小化" aria-label="最小化">' + ICONS.minimize + "</button>" +
    '<button class="dsh-btn" data-action="toggle-maximize" title="最大化" aria-label="最大化">' + ICONS.maximize + "</button>" +
    '<button class="dsh-btn dsh-close" data-action="close" title="关闭" aria-label="关闭">' + ICONS.close + "</button>";

  bar.appendChild(menubar);
  bar.appendChild(controls);
  document.body.prepend(bar);

  // Any press outside the bar closes the open menu, and so does leaving the
  // window: a menu left open over the app would swallow the next click.
  document.addEventListener("pointerdown", (event) => {
    if (event.target instanceof Node && bar.contains(event.target)) return;
    if (menuIndex() !== -1) closeMenus();
  }, true);
  window.addEventListener("blur", () => {
    if (menuIndex() !== -1) closeMenus();
  });

  // Make room for the bar without covering the SPA: body becomes a flex
  // column and the app root flexes into the remaining viewport height.
  const root = document.getElementById("root");
  if (root) {
    const body = document.body;
    body.style.display = "flex";
    body.style.flexDirection = "column";
    body.style.overflow = "hidden";
    root.style.flex = "1 1 0";
    root.style.minHeight = "0";
    root.style.height = "auto";
  }

  for (const btn of bar.querySelectorAll(".dsh-btn")) {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      ipcRenderer.send("dsh:window-control", btn.dataset.action);
    });
  }
  // Double-click the drag region toggles maximize, like the native title bar.
  bar.addEventListener("dblclick", (event) => {
    if (event.target instanceof Element && event.target.closest(".dsh-btn, .dsh-menubar") !== null) return;
    ipcRenderer.send("dsh:window-control", "toggle-maximize");
  });

  ipcRenderer.on("dsh:window-maximized", (_event, maximized) => {
    bar.classList.toggle("dsh-maximized", maximized);
  });
}

// The SPA is served over http, and its `#root` is created by the app's own
// bootstrap — which may land AFTER DOMContentLoaded. Sampling once and giving up
// there left the window with no title bar at all (and no drag region, and no
// market entry), depending on which side won the race. Poll briefly instead.
const ROOT_WAIT_MS = 100;
const ROOT_WAIT_TRIES = 60;

/** Inject the bar as soon as the SPA root exists, or give up after ~6s. */
function installWhenRootReady(attempt = 0) {
  if (document.getElementById("root") !== null) {
    injectTitleBar();
    return;
  }
  if (attempt >= ROOT_WAIT_TRIES) return;
  setTimeout(() => installWhenRootReady(attempt + 1), ROOT_WAIT_MS);
}

installWhenRootReady();

contextBridge.exposeInMainWorld("dshDesktop", {
  /** Platform facts and versions, resolved on demand from the main process. */
  getAppInfo: () => ipcRenderer.invoke("dsh:app-info"),

  /** Open an http(s) URL in the system browser. */
  openExternal: (url) => ipcRenderer.invoke("dsh:open-external", url),

  /** Reveal a file in the platform file manager. */
  showItemInFolder: (path) => ipcRenderer.invoke("dsh:show-item", path),

  /** Open a file/folder with the default application. */
  openPath: (path) => ipcRenderer.invoke("dsh:open-path", path),

  /** Resolve the canonical GUI URL once the harness server is up. */
  getServerUrl: () => ipcRenderer.invoke("dsh:server-url"),

  /** Read the persisted desktop settings (tray / auto-launch / hotkey). */
  getDesktopSettings: () => ipcRenderer.invoke("dsh:desktop-get"),

  /** Apply a partial desktop-settings patch and return the new state. */
  setDesktopSettings: (patch) => ipcRenderer.invoke("dsh:desktop-set", patch),

  /** Check GitHub for the latest release → { ok, current, latest, hasUpdate, changelog, assets }. */
  checkUpdate: () => ipcRenderer.invoke("dsh:update-check"),

  /** Download the installer (50-thread parallel); progress via onProgress. */
  downloadUpdate: (payload, onProgress) => {
    if (typeof onProgress === "function") {
      const listener = (_event, progress) => onProgress(progress);
      ipcRenderer.on("dsh:update-progress", listener);
      return ipcRenderer.invoke("dsh:update-download", payload).finally(() => {
        ipcRenderer.removeListener("dsh:update-progress", listener);
      });
    }
    return ipcRenderer.invoke("dsh:update-download", payload);
  },

  /** Launch the downloaded installer and quit this instance. */
  installUpdate: (filePath) => ipcRenderer.invoke("dsh:update-install", filePath),

  /** Read the mirror-source list → { mirrors, customized }. */
  getUpdateMirrors: () => ipcRenderer.invoke("dsh:update-mirrors-get"),

  /** Persist the mirror-source list. */
  setUpdateMirrors: (mirrors) => ipcRenderer.invoke("dsh:update-mirrors-set", mirrors),

  /** Clear the custom list, falling back to the built-in defaults. */
  resetUpdateMirrors: () => ipcRenderer.invoke("dsh:update-mirrors-reset"),

  /** Read the clipboard history (last 50 text copies) → [{id, text, at}]. */
  getClipboardHistory: () => ipcRenderer.invoke("dsh:clipboard-history-get")
});

// FixerMode bridge: the repair page is a plain file:// document with no #root
// and no harness behind it, so the main process is its only source of state.
contextBridge.exposeInMainWorld("dshFixer", {
  /** Subscribe to the repair state pushes → { stage, progress, detail }. */
  onState: (callback) => {
    ipcRenderer.on("dsh:fixer-state", (_event, state) => callback(state));
  },
  /** Store the API key the user typed → { ok } or { ok: false, error }. */
  submitKey: (key) => ipcRenderer.invoke("dsh:fixer-key", key),
  /** Open the DeepSeek platform's key page in the system browser. */
  openKeyPage: () => ipcRenderer.invoke("dsh:open-external", "https://platform.deepseek.com/api_keys"),
  /** Frameless window controls for the page's own close/minimize buttons. */
  windowControl: (action) => ipcRenderer.send("dsh:window-control", action)
});

// Quick-input bridge: the main process forwards the Ctrl+D+S global shortcut
// to the pill window (a standalone HTML file with no #root).
const IS_MINI = typeof document !== "undefined" && document.getElementById("root") === null;
contextBridge.exposeInMainWorld("dshQuickChat", {
  /** True when this window is the detached pill. */
  isMini: IS_MINI,
  /** Ask the main process to show and focus the pill window. */
  show: () => ipcRenderer.send("dsh:quickchat-show"),
  /** Ask the main process to hide the pill window (main window untouched). */
  hide: () => ipcRenderer.send("dsh:quickchat-hide"),
  /** Ask the main process to close the pill window. */
  close: () => ipcRenderer.send("dsh:quickchat-close"),
  /** Reset the 60s idle auto-hide timer (called while typing). */
  wake: () => ipcRenderer.send("dsh:quickchat-wake"),
  /** Resolve the dsh dark/light preference → { dark, preference }. */
  getTheme: () => ipcRenderer.invoke("dsh:quickchat-theme"),
  /** Proxy an RPC call through the main process (file:// pages can't fetch the
   *  loopback harness directly — CORS). Returns the parsed response envelope. */
  rpc: (method, payload) => ipcRenderer.invoke("dsh:quickchat-rpc", { method, payload }),
  /** Send a session + expand the pill into the main dsh conversation page. */
  expand: (payload) => ipcRenderer.send("dsh:quickchat-expand", payload)
});

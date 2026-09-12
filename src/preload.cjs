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
  flex: none;
  width: 100%;
  height: ${TITLE_BAR_HEIGHT}px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding-left: 12px;
  background: var(--dsw-alias-bg-layer-2, #f7f8fa);
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(20, 24, 35, 0.08));
  color: var(--dsw-alias-label-secondary, rgba(20, 24, 35, 0.7));
  font: 12px/1 system-ui, "Segoe UI", sans-serif;
  -webkit-app-region: drag;
  user-select: none;
}
#dsh-titlebar .dsh-title {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  overflow: hidden;
  pointer-events: none;
}
#dsh-titlebar .dsh-title img {
  width: 16px;
  height: 16px;
  display: block;
}
#dsh-titlebar .dsh-controls {
  margin-left: auto;
  display: flex;
  align-items: center;
  height: 100%;
  -webkit-app-region: no-drag;
}
/* The market entry rides in the window-controls strip at the far right: the title
   bar is the one piece of chrome that is always on screen, so it is where a
   surface a person has to be able to find belongs. It deliberately does NOT wear
   the dsh-btn class — that rule resets its box for the square window controls and
   would fight this one. The press travels to the SPA as a document event (the
   harness plugin owns the window, this file only announces the click). */
#dsh-titlebar .dsh-market {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: none;
  align-self: center;
  height: 24px;
  margin: 0 8px 0 0;
  padding: 0 10px;
  box-sizing: border-box;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, rgba(20, 24, 35, 0.7));
  font: 12px/1 system-ui, "Segoe UI", sans-serif;
  white-space: nowrap;
  cursor: pointer;
  -webkit-app-region: no-drag;
}
#dsh-titlebar .dsh-market:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(20, 24, 35, 0.06));
  color: var(--dsw-alias-label-primary, rgba(20, 24, 35, 0.9));
}
#dsh-titlebar .dsh-market:active {
  background: var(--dsw-alias-interactive-bg-hover-solid, rgba(20, 24, 35, 0.1));
}
#dsh-titlebar .dsh-market svg {
  display: block;
  flex: none;
  width: 13px;
  height: 13px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.1;
  stroke-linecap: round;
  stroke-linejoin: round;
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
  minimize:
    '<svg viewBox="0 0 12 12"><path d="M1 6h10"/></svg>',
  market:
    '<svg viewBox="0 0 12 12"><path d="M1.6 4.5h8.8"/><path d="M2.3 4.5 3.2 1.8h5.6l.9 2.7"/><path d="M2.5 4.5v5.7h7V4.5"/><path d="M4.7 10.2V7.5h2.6v2.7"/></svg>',
  maximize:
    '<svg class="dsh-max-full" viewBox="0 0 12 12"><rect x="1.4" y="1.4" width="9.2" height="9.2" rx="0.8"/></svg>' +
    '<svg class="dsh-max-restore" viewBox="0 0 12 12">' +
    '<path d="M4.4 4.4V2.6a1.2 1.2 0 0 1 1.2-1.2h3.8a1.2 1.2 0 0 1 1.2 1.2v3.8a1.2 1.2 0 0 1-1.2 1.2H7.6"/>' +
    '<rect x="1.4" y="4.4" width="5.8" height="5.8" rx="0.8"/></svg>',
  close:
    '<svg viewBox="0 0 12 12"><path d="M1.6 1.6l8.8 8.8M10.4 1.6L1.6 10.4"/></svg>'
};

function injectTitleBar() {
  if (document.getElementById("dsh-titlebar")) return;

  const style = document.createElement("style");
  style.textContent = TITLE_BAR_CSS;
  document.head.appendChild(style);

  const bar = document.createElement("div");
  bar.id = "dsh-titlebar";
  bar.innerHTML = `
    <span class="dsh-title">
      <img src="/favicon.svg" alt="" />
      <span>DeepSeek Harness</span>
    </span>
    <div class="dsh-controls">
      <button class="dsh-market" data-action="market" title="打开插件市场" aria-label="插件市场">${ICONS.market}<span>插件市场</span></button>
      <button class="dsh-btn" data-action="minimize" title="最小化" aria-label="最小化">${ICONS.minimize}</button>
      <button class="dsh-btn" data-action="toggle-maximize" title="最大化" aria-label="最大化">${ICONS.maximize}</button>
      <button class="dsh-btn dsh-close" data-action="close" title="关闭" aria-label="关闭">${ICONS.close}</button>
    </div>`;
  document.body.prepend(bar);

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
  // The market button is an app action, not a window control: announce it in the
  // page so the harness plugin that owns the market window can answer it.
  bar.querySelector(".dsh-market")?.addEventListener("click", (event) => {
    event.stopPropagation();
    window.dispatchEvent(new CustomEvent("dsh:open-market"));
  });
  // Double-click the drag region toggles maximize, like the native title bar.
  bar.addEventListener("dblclick", (event) => {
    if (event.target.closest(".dsh-btn, .dsh-market")) return;
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

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

// ── quick-chat mini mode ─────────────────────────────────────────────────────
// The detached Ctrl+D+S panel is the same SPA loaded with ?dsh-mini=1. In that
// mode we hide the whole harness UI (the sidebar / chat / settings) and let the
// quick-chat plugin render full-window: visibility is inherited and can be
// overridden by the panel, so #root stays hidden while the panel shows.
const IS_MINI = new URLSearchParams(typeof location !== "undefined" ? location.search : "").has("dsh-mini");

const MINI_CSS = `
html.dsh-mini-ready { background: transparent !important; }
body.dsh-mini { background: transparent !important; }
body.dsh-mini #root { visibility: hidden !important; }
body.dsh-mini .qck-panel {
  position: fixed !important;
  inset: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  max-height: none !important;
  border-radius: 0 !important;
  border: 0 !important;
  box-shadow: none !important;
}
body.dsh-mini .qck-mask { display: none !important; }
body.dsh-mini .qck-head { -webkit-app-region: drag; }
body.dsh-mini .qck-head button,
body.dsh-mini .qck-head .qck-sub,
body.dsh-mini .qck-modes,
body.dsh-mini .qck-tabs,
body.dsh-mini .qck-body,
body.dsh-mini .qck-inputbar { -webkit-app-region: no-drag; }
`;

if (IS_MINI) {
  const style = document.createElement("style");
  style.textContent = MINI_CSS;
  document.head.appendChild(style);
  // The class must be set on <body> before the SPA paints; the SPA may replace
  // body children but not the body element itself.
  document.documentElement.classList.add("dsh-mini-ready");
  document.body.classList.add("dsh-mini");
}

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
  background: rgba(15, 17, 23, 0.98);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.72);
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
  color: rgba(255, 255, 255, 0.82) !important;
  padding: 0 !important;
  margin: 0 !important;
  cursor: default;
  outline: none;
  box-shadow: none !important;
  -webkit-app-region: no-drag;
}
#dsh-titlebar .dsh-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}
#dsh-titlebar .dsh-btn:active {
  background: rgba(255, 255, 255, 0.16) !important;
}
#dsh-titlebar .dsh-btn.dsh-close:hover {
  background: #e81123 !important;
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
  // Double-click the drag region toggles maximize, like the native title bar.
  bar.addEventListener("dblclick", (event) => {
    if (event.target.closest(".dsh-btn")) return;
    ipcRenderer.send("dsh:window-control", "toggle-maximize");
  });

  ipcRenderer.on("dsh:window-maximized", (_event, maximized) => {
    bar.classList.toggle("dsh-maximized", maximized);
  });
}

// The SPA is served over http; inject once its document is interactive.
if (!IS_MINI) {
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", injectTitleBar, { once: true });
  } else {
    injectTitleBar();
  }
}

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
  setDesktopSettings: (patch) => ipcRenderer.invoke("dsh:desktop-set", patch)
});

// Quick-chat bridge: the main process forwards the Ctrl+D+S global shortcut
// to the renderer, where the quick-chat plugin toggles its glass panel. In the
// detached mini window the plugin can also hide/close the window itself.
contextBridge.exposeInMainWorld("dshQuickChat", {
  /** True when this window is the detached mini panel (?dsh-mini=1). */
  isMini: IS_MINI,
  /** Subscribe to the global quick-chat toggle (Ctrl+D+S). Returns an unsubscribe. */
  onToggle: (callback) => {
    const listener = () => callback();
    ipcRenderer.on("dsh:quickchat-toggle", listener);
    return () => ipcRenderer.removeListener("dsh:quickchat-toggle", listener);
  },
  /** Ask the main process to show and focus the mini window. */
  show: () => ipcRenderer.send("dsh:quickchat-show"),
  /** Ask the main process to hide the mini window (main window untouched). */
  hide: () => ipcRenderer.send("dsh:quickchat-hide"),
  /** Ask the main process to close the mini window. */
  close: () => ipcRenderer.send("dsh:quickchat-close")
});

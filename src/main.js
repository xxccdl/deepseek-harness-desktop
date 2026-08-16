// DeepSeek Harness desktop app — Electron main process.
//
// Boots the `web` profile IN-PROCESS (the same cordis composition `dsh web`
// mounts, driven through the stable @deepseek-ai/dsh-app-boot API) and hosts
// the served SPA in a native BrowserWindow. No browser and no separate CLI
// process are needed: the harness server, the WebSocket transport and the
// frontend all run inside this process on a loopback-only port the OS
// assigns.
import { app, BrowserWindow, Menu, Notification, Tray, dialog, globalShortcut, ipcMain, nativeImage, nativeTheme, net, screen, session, shell } from "electron";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import {
  PROFILE_PATCH_FILENAME,
  boot,
  composeEntries,
  healProfilesModuleFallback,
  installFailLoud,
  loadLayeredEnv,
  loadOptionalPatches,
  loadProfile
} from "@deepseek-ai/dsh-app-boot";
import { resolveDshHome } from "@deepseek-ai/dsh-home-paths";
import { provideCmdline } from "@deepseek-ai/dsh-cmdline";
import { DSH_LAUNCH_ENVIRONMENT_KEY } from "@deepseek-ai/dsh-launch-environment";

const BIN_NAME = "dsh";
const PROFILE_NAME = "web";
const PROFILE_ROOT_FILENAME = "cordis.yml";
const PROFILE_ROOT_CONFIG = `# dsh profile root — an empty entry list. The tree is composed as patches:
# each bundle in package.json's dsh.profile.bundles, then cordis.patch.yml, then any
# --patch overlays. Edit cordis.patch.yml, not this file.
[]
`;
/** The session-telemetry row id the DSH_TELEMETRY_DISABLED switch targets. */
const TELEMETRY_ROW_ID = "session-telemetry-otel";

/**
 * Absolute anchor: the @deepseek-ai/dsh package.json.
 * When packaged, node_modules lives UNPACKED (app.asar.unpacked) so that the
 * module fallback junctions the harness heals into $DSH_HOME/profiles/node_modules
 * point at real directories — native resolution (the Loader's bare-specifier
 * helper, createRequire realpath) cannot traverse junctions into the virtual
 * asar filesystem.
 */
function dshAnchor() {
  const unpacked = process.resourcesPath !== undefined
    ? join(process.resourcesPath, "app.asar.unpacked", "node_modules", "@deepseek-ai", "dsh", "package.json")
    : undefined;
  if (unpacked !== undefined && existsSync(unpacked)) return unpacked;
  return fileURLToPath(new URL("../node_modules/@deepseek-ai/dsh/package.json", import.meta.url));
}

/** Shipped agent-preset root, beside the dsh install's own config (real path when packaged). */
function shippedPresetRoot() {
  const unpacked = process.resourcesPath !== undefined
    ? join(process.resourcesPath, "app.asar.unpacked", "node_modules", "@deepseek-ai", "dsh", "config", "agent-presets")
    : undefined;
  if (unpacked !== undefined && existsSync(unpacked)) return unpacked;
  return fileURLToPath(new URL("../node_modules/@deepseek-ai/dsh/config/agent-presets/", import.meta.url));
}

const LOOPBACK = "127.0.0.1";

// ── harness boot state ───────────────────────────────────────────────────────
let ctx = undefined; // settled root context
let serverUrl = undefined; // canonical GUI URL, set after boot
let disposed = false;
let quitting = false;
/** Monotonic id for the pill's proxied RPC envelopes. */
let rpcSeq = 0;

/** Dispose the harness tree exactly once. */
async function disposeHarness() {
  if (disposed) return;
  disposed = true;
  try {
    await ctx?.fiber.dispose();
  } catch (error) {
    console.error("dsh-desktop: harness dispose failed", error);
  }
}

/**
 * Compose the web profile's effective patch stack — the same layers `dsh web`
 * applies: bundle layers in `dsh.profile.bundles` order, the profile's own
 * user layer, the home-level user layer, the shipped agent-presets root, and
 * the telemetry switch.
 */
function composeWebProfile() {
  const DSH_ANCHOR = dshAnchor();
  const SHIPPED_PRESET_ROOT = shippedPresetRoot();
  healProfilesModuleFallback(DSH_ANCHOR);
  const profile = loadProfile(BIN_NAME, PROFILE_NAME, DSH_ANCHOR);
  // Rewrite the empty root config: the Loader's tree write-back can bake
  // composed rows into it, which would duplicate bundle inserts on next boot.
  writeFileSync(join(profile.dir, PROFILE_ROOT_FILENAME), PROFILE_ROOT_CONFIG);
  const homePatches = loadOptionalPatches(BIN_NAME, join(resolveDshHome(), PROFILE_PATCH_FILENAME)) ?? [];
  const bundlePatches = profile.layers.flatMap((layer) => layer.patches);
  const rows = new Map();
  for (const row of composeEntries([bundlePatches, profile.patches, homePatches])) {
    if (typeof row.id === "string") rows.set(row.id, row);
  }
  const overlays = [];
  if (rows.has("agent-presets")) {
    overlays.push({
      id: "agent-presets",
      config: {
        ...rows.get("agent-presets")?.config ?? {},
        roots: [{ path: SHIPPED_PRESET_ROOT, trust: "system" }]
      }
    });
  }
  const telemetryDisabled = (process.env.DSH_TELEMETRY_DISABLED ?? "") !== "";
  if (telemetryDisabled && rows.has(TELEMETRY_ROW_ID)) overlays.push({ id: TELEMETRY_ROW_ID, disabled: true });
  return {
    profile,
    patches: [...bundlePatches, ...profile.patches, ...homePatches, ...overlays]
  };
}

/**
 * Boot the web profile. Passes `--port 0` so the OS assigns a free loopback
 * port; the actual port is read back from the bound webserver service.
 * @returns the canonical local URL of the GUI.
 */
async function bootHarness() {
  const { profile, patches } = composeWebProfile();
  const rootConfig = join(profile.dir, PROFILE_ROOT_FILENAME);
  ctx = await boot(BIN_NAME, rootConfig, patches, (hostCtx) => {
    hostCtx.provide(DSH_LAUNCH_ENVIRONMENT_KEY, loadLayeredEnv(BIN_NAME));
    provideCmdline(hostCtx, {
      args: ["--port", "0"],
      exit: (code) => {
        void disposeHarness().finally(() => app.exit(code));
      }
    });
  });
  const port = ctx.get("webServer")?.port;
  if (port === undefined) throw new Error("dsh-desktop: webServer service did not bind a port");
  return `http://${LOOPBACK}:${String(port)}/`;
}

// ── window state persistence ─────────────────────────────────────────────────
function stateFile() {
  return join(app.getPath("userData"), "window-state.json");
}

/**
 * The detached quick-input pill window (Ctrl+D+S). A tiny frosted-glass input
 * bar pinned to the bottom-middle of the screen; it is NOT draggable. Created
 * lazily on demand and shown only while the hotkey summons it.
 */
let quickChatWindow = undefined;
/** 60s auto-hide timer handle for the pill. */
let pillHideTimer = undefined;

/** The pill's screen size — a short, wide bar. */
const PILL_W = 520;
const PILL_H = 60;
/** Idle timeout before the pill hides itself. */
const PILL_IDLE_MS = 60_000;

/** Clear the pill's auto-hide timer (call on every interaction/show). */
function clearPillTimer() {
  if (pillHideTimer !== undefined) {
    clearTimeout(pillHideTimer);
    pillHideTimer = undefined;
  }
}

/** Hide the pill window (if any) and drop its idle timer. */
function hidePillWindow() {
  clearPillTimer();
  if (quickChatWindow !== undefined && !quickChatWindow.isDestroyed()) quickChatWindow.hide();
}

/** Show the pill window and (re)arm its 60s auto-hide timer. */
function showPillWindow() {
  if (quickChatWindow === undefined || quickChatWindow.isDestroyed() || serverUrl === undefined) return;
  clearPillTimer();
  if (quickChatWindow.isMinimized()) quickChatWindow.restore();
  quickChatWindow.show();
  quickChatWindow.focus();
  // Hide after 60s of inactivity; interacting (wake) resets this.
  pillHideTimer = setTimeout(hidePillWindow, PILL_IDLE_MS);
}

/** Resolve the dsh dark/light preference from the harness settings service. */
function resolvePillTheme() {
  try {
    const settings = ctx?.get("settings");
    const section = settings?.get?.("ui-theme");
    const pref = section?.preference ?? "system";
    if (pref === "dark") return { dark: true, preference: pref };
    if (pref === "light") return { dark: false, preference: pref };
  } catch { /* fall through to system */ }
  return { dark: nativeTheme.shouldUseDarkColors, preference: "system" };
}

/** Ease-out cubic: 0 → 1 over t∈[0,1]. */
function easeOutCubic(t) {
  const u = 1 - t;
  return 1 - u * u * u;
}

/**
 * Animate a window's bounds from `from` to `to` with a smooth ease-out curve.
 * @param win - the BrowserWindow to move.
 * @param from - start bounds {x, y, width, height}.
 * @param to - end bounds {x, y, width, height}.
 * @param duration - animation length in ms.
 * @returns a promise resolved when the animation finishes.
 */
function animateBounds(win, from, to, duration = 520) {
  return new Promise((resolve) => {
    if (win.isDestroyed()) return resolve();
    const start = performance.now();
    const step = () => {
      if (win.isDestroyed()) return resolve();
      const t = Math.min(1, (performance.now() - start) / duration);
      const e = easeOutCubic(t);
      const bounds = {
        x: Math.round(from.x + (to.x - from.x) * e),
        y: Math.round(from.y + (to.y - from.y) * e),
        width: Math.round(from.width + (to.width - from.width) * e),
        height: Math.round(from.height + (to.height - from.height) * e)
      };
      try { win.setBounds(bounds); } catch { return resolve(); }
      if (t < 1) setTimeout(step, 16);
      else resolve();
    };
    step();
  });
}

/**
 * Toggle the detached quick-input pill (Ctrl+D+S). Showing the pill never
 * touches the main window.
 */
function toggleQuickChatPanel() {
  if (quickChatWindow !== undefined && !quickChatWindow.isDestroyed()) {
    if (quickChatWindow.isVisible()) {
      hidePillWindow();
    } else {
      showPillWindow();
    }
    return;
  }
  if (serverUrl === undefined) return;
  const display = screen.getPrimaryDisplay();
  const x = Math.round(display.workArea.x + (display.workArea.width - PILL_W) / 2);
  const y = Math.round(display.workArea.y + display.workArea.height - PILL_H - 36);
  quickChatWindow = new BrowserWindow({
    width: PILL_W,
    height: PILL_H,
    x, y,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    resizable: false,
    movable: false,
    maximizable: false,
    fullscreenable: false,
    minimizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    icon: fileURLToPath(new URL("../resources/icon.png", import.meta.url)),
    webPreferences: {
      preload: fileURLToPath(new URL("./preload.cjs", import.meta.url)),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });
  quickChatWindow.loadURL(pathToFileURL(fileURLToPath(new URL("./quickchat.html", import.meta.url))).href);
  // Clicking outside the pill hides it — but only if the blur is real (not a
  // transient focus loss during the initial show+focus). We defer the blur
  // listener so the first show doesn't race the blur and kill the window
  // before the user can click anything.
  quickChatWindow.once("ready-to-show", () => {
    showPillWindow();
    // Arm the blur-to-hide only after the pill is visibly on-screen.
    setTimeout(() => {
      if (quickChatWindow !== undefined && !quickChatWindow.isDestroyed()) {
        quickChatWindow.on("blur", hidePillWindow);
      }
    }, 600);
  });
  quickChatWindow.on("closed", () => {
    clearPillTimer();
    quickChatWindow = undefined;
  });
}

/**
 * Expand the pill into the main dsh conversation page showing `sessionId`.
 * Sends the request to the harness SPA (which loads the persisted session
 * selection), then animates the main window growing from the pill's spot to
 * its normal bounds — a smooth, elegant "the pill unfolds into the app".
 * @param sessionId - the session whose conversation the main window should show.
 */
async function expandPillToSession(sessionId) {
  // The pill goes away; the main window takes over the space.
  hidePillWindow();
  const main = BrowserWindow.getAllWindows().find((w) => w !== quickChatWindow && !w.isDestroyed());
  if (main === undefined || main.isDestroyed()) return;
  const start = quickChatWindow !== undefined && !quickChatWindow.isDestroyed()
    ? quickChatWindow.getBounds()
    : undefined;
  const target = main.getNormalBounds();

  // Persist the target session so the SPA restores it on boot. If the page is
  // still loading, apply the selection right after it finishes (then reload).
  const applySession = () => {
    const script =
      `localStorage.setItem("dsh.sessions.current", ${JSON.stringify(JSON.stringify({ sessionId }))}); ` +
      `if (!location.pathname.startsWith("/")) location.href = "/"; "ok"`;
    return main.webContents.executeJavaScript(script).catch(() => {});
  };
  if (main.webContents.isLoading()) {
    main.webContents.once("did-finish-load", () => { void applySession(); void main.webContents.reload(); });
  } else {
    await applySession();
    main.webContents.reload();
  }

  // Seed the window at the pill's location/size so the growth animation reads.
  const from = start ?? {
    x: target.x + (target.width - PILL_W) / 2,
    y: target.y + target.height - PILL_H,
    width: PILL_W,
    height: PILL_H
  };
  try { main.setBounds(from); } catch { /* ignore */ }
  if (main.isMinimized()) main.restore();
  main.show();
  main.focus();
  void animateBounds(main, from, target, 520);
}

async function loadWindowState() {
  try {
    return JSON.parse(await readFile(stateFile(), "utf8"));
  } catch {
    return undefined;
  }
}

async function saveWindowState(win) {
  try {
    const bounds = win.getNormalBounds();
    await mkdir(dirname(stateFile()), { recursive: true });
    await writeFile(stateFile(), JSON.stringify({ ...bounds, maximized: win.isMaximized() }), "utf8");
  } catch {
    /* non-fatal */
  }
}

// ── window creation ──────────────────────────────────────────────────────────
function createMainWindow(serverUrl) {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    show: false,
    // Frameless: the preload draws a custom title bar with window controls.
    frame: false,
    autoHideMenuBar: true,
    icon: fileURLToPath(new URL("../resources/icon.png", import.meta.url)),
    title: "DeepSeek Harness",
    backgroundColor: "#0f1117",
    webPreferences: {
      preload: fileURLToPath(new URL("./preload.cjs", import.meta.url)),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });

  // Restore persisted bounds (validated against the current displays).
  void loadWindowState().then((state) => {
    if (!state || quitting || win.isDestroyed()) return;
    const bounds = {
      x: Math.round(state.x),
      y: Math.round(state.y),
      width: Math.max(state.width, 960),
      height: Math.max(state.height, 640)
    };
    const visible = screenIsVisible(bounds);
    if (visible) win.setBounds(bounds);
    if (state.maximized) win.maximize();
  });

  win.once("ready-to-show", () => win.show());
  win.on("close", () => void saveWindowState(win));

  // Push maximize state to the custom title bar.
  win.on("maximize", () => win.webContents.send("dsh:window-maximized", true));
  win.on("unmaximize", () => win.webContents.send("dsh:window-maximized", false));

  // External navigation: links with target=_blank etc. go to the system browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) void shell.openExternal(url);
    return { action: "deny" };
  });
  // Guard the SPA origin: anything else opens externally.
  win.webContents.on("will-navigate", (event, url) => {
    if (url.startsWith(serverUrl)) return;
    event.preventDefault();
    if (url.startsWith("http://") || url.startsWith("https://")) void shell.openExternal(url);
  });

  void win.loadURL(serverUrl);
  return win;
}

/** True when the given bounds intersect any display's work area. */
function screenIsVisible(bounds) {
  return screen.getAllDisplays().some((display) => {
    const area = display.workArea;
    return (
      bounds.x < area.x + area.width &&
      bounds.x + bounds.width > area.x &&
      bounds.y < area.y + area.height &&
      bounds.y + bounds.height > area.y
    );
  });
}

// ── application menu ─────────────────────────────────────────────────────────
function buildMenu(win) {
  const isMac = process.platform === "darwin";
  const template = [
    ...(isMac ? [{ role: "appMenu" }] : []),
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" }
      ]
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Open Harness Home Folder",
          click: () => void shell.openPath(resolveDshHome())
        },
        {
          label: "Open Web Profile Folder",
          click: () => void shell.openPath(join(resolveDshHome(), "profiles", PROFILE_NAME))
        },
        { type: "separator" },
        {
          label: "About DeepSeek Harness",
          click: () => {
            void dialog.showMessageBox(win, {
              type: "info",
              title: "About DeepSeek Harness",
              message: "DeepSeek Harness — Desktop",
              detail: [
                `Harness version: ${harnessVersion()}`,
                `Electron: ${process.versions.electron}`,
                `Chromium: ${process.versions.chrome}`,
                `Node: ${process.versions.node}`,
                "",
                "The web surface of the DeepSeek Harness, running in a native desktop shell.",
                `Harness home: ${resolveDshHome()}`
              ].join("\n")
            });
          }
        }
      ]
    }
  ];
  return Menu.buildFromTemplate(template);
}

/** The installed @deepseek-ai/dsh version, read from the anchor package. */
function harnessVersion() {
  try {
    return JSON.parse(readFileSync(dshAnchor(), "utf8")).version ?? "unknown";
  } catch {
    return "unknown";
  }
}

// ── desktop settings (tray / auto-launch / global hotkey) ───────────────────
// Small user-facing desktop behaviors persisted as desktop-settings.json under
// the app's userData. The settings page (ui-desktop) reads/writes them through
// the IPC surface below.
function desktopSettingsFile() {
  return join(app.getPath("userData"), "desktop-settings.json");
}

async function readDesktopSettings() {
  try {
    return JSON.parse(await readFile(desktopSettingsFile(), "utf8"));
  } catch {
    return {};
  }
}

async function writeDesktopSettings(patch) {
  const current = await readDesktopSettings();
  const next = { ...current, ...patch };
  await mkdir(dirname(desktopSettingsFile()), { recursive: true });
  await writeFile(desktopSettingsFile(), JSON.stringify(next, null, 2), "utf8");
  return next;
}

const APP_ICON_PATH = fileURLToPath(new URL("../resources/icon.png", import.meta.url));
let tray = undefined;
let currentHotkey = undefined;
let hideToTrayHandler = undefined;

/**
 * Apply the desktop settings to the running app: create/destroy the system
 * tray (which also enables hide-to-tray on close), toggle launch-at-login, and
 * (re)register the global hotkey that summons the main window.
 * @param win - the main BrowserWindow (may be undefined before creation).
 * @param settings - partial desktop settings object.
 */
function applyDesktopSettings(win, settings) {
  if (settings.tray === true && tray === undefined && win !== undefined) {
    const icon = nativeImage.createFromPath(APP_ICON_PATH).resize({ width: 16, height: 16 });
    tray = new Tray(icon);
    tray.setToolTip("DeepSeek Harness");
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: "显示主窗口", click: () => { win.show(); win.focus(); } },
      { type: "separator" },
      { label: "退出 DeepSeek Harness", click: () => app.quit() }
    ]));
    tray.on("click", () => { win.show(); win.focus(); });
    hideToTrayHandler = (event) => {
      if (quitting || tray === undefined) return;
      event.preventDefault();
      win.hide();
    };
    win.on("close", hideToTrayHandler);
  } else if (settings.tray !== true && tray !== undefined) {
    if (win !== undefined && hideToTrayHandler !== undefined) win.removeListener("close", hideToTrayHandler);
    hideToTrayHandler = undefined;
    tray.destroy();
    tray = undefined;
  }

  app.setLoginItemSettings({ openAtLogin: settings.autoLaunch === true });

  const hotkey = typeof settings.hotkey === "string" && settings.hotkey !== "" ? settings.hotkey : undefined;
  if (hotkey !== currentHotkey) {
    if (currentHotkey !== undefined) globalShortcut.unregister(currentHotkey);
    currentHotkey = undefined;
    if (hotkey !== undefined && win !== undefined) {
      if (globalShortcut.register(hotkey, () => { win.show(); win.focus(); })) currentHotkey = hotkey;
      else console.warn(`dsh-desktop: failed to register global hotkey "${hotkey}"`);
    }
  }
}

// ── updater (GitHub releases + multi-threaded download) ────────────────────
// Detects the latest release on GitHub, surfaces the changelog, downloads the
// installer with N concurrent HTTP range requests, then launches it.
const UPDATE_OWNER = "xxccdl";
const UPDATE_REPO = "deepseek-harness-desktop";
/** Concurrent range-request threads for the installer download. */
const UPDATE_THREADS = 50;
/** Progress is pushed to the renderer roughly every 256 KiB. */
const PROGRESS_TICK_BYTES = 256 * 1024;

/** Parse a semver string ("v1.2.3", "1.2.3-beta.1") into comparable parts. */
function parseVersion(value) {
  const m = String(value ?? "").replace(/^v/, "").match(/^(\d+)\.(\d+)\.(\d+)(?:[-.+](.+))?$/);
  if (!m) return undefined;
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]), pre: m[4] ?? "" };
}
/** True when version `a` is strictly newer than version `b` (release > prerelease). */
function isNewerVersion(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (pa === undefined || pb === undefined) return false;
  if (pa.major !== pb.major) return pa.major > pb.major;
  if (pa.minor !== pb.minor) return pa.minor > pb.minor;
  if (pa.patch !== pb.patch) return pa.patch > pb.patch;
  if (pa.pre === pb.pre) return false;
  if (pa.pre === "") return true;
  if (pb.pre === "") return false;
  return pa.pre > pb.pre;
}

/** Fetch the latest GitHub release payload for this repository. Uses Electron's
 *  `net.fetch` so system proxy settings are honored (Node's global fetch would
 *  bypass them and fail on networks that require a proxy). */
async function fetchLatestRelease() {
  const res = await net.fetch(`https://api.github.com/repos/${UPDATE_OWNER}/${UPDATE_REPO}/releases/latest`, {
    headers: { "Accept": "application/vnd.github+json", "User-Agent": "dsh-desktop-updater" },
    signal: AbortSignal.timeout(15000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Shared fetch helper honoring system proxy, with a per-request timeout. */
function proxyFetch(url, init = {}) {
  return net.fetch(url, { ...init, signal: init.signal ?? AbortSignal.timeout(30000) });
}

/**
 * Download a file using `threads` concurrent HTTP range requests, writing each
 * segment at its byte offset into a shared file. Requires the server to accept
 * byte ranges (GitHub release assets do). Reports `{ received, total }` ticks.
 * @param url - absolute asset URL.
 * @param destPath - destination file path.
 * @param threads - concurrent range-request count.
 * @param onProgress - periodic progress callback.
 * @returns the destination path once fully written and verified.
 */
async function downloadWithThreads(url, destPath, threads, onProgress) {
  const { open: fspOpen, stat } = await import("node:fs/promises");
  const head = await proxyFetch(url, { method: "HEAD", redirect: "follow" });
  const total = Number(head.headers.get("content-length"));
  const ranges = head.headers.get("accept-ranges");
  if (!(total > 0) || ranges !== "bytes") throw new Error("源服务器不支持多线程下载");
  const count = Math.min(threads, Math.max(1, Math.floor(total / 262144)));
  const chunk = Math.ceil(total / count);

  const out = await fspOpen(destPath, "w");
  await out.truncate(total);
  await out.close();

  const segments = [];
  for (let start = 0; start < total; start += chunk) {
    segments.push({ start, end: Math.min(total - 1, start + chunk - 1) });
  }
  let received = 0;
  let lastEmit = 0;
  const emit = () => onProgress?.({ received, total });
  await Promise.all(segments.map(async (seg) => {
    const fd = await fspOpen(destPath, "r+");
    try {
      const res = await proxyFetch(url, { headers: { Range: `bytes=${seg.start}-${seg.end}` }, redirect: "follow" });
      if (!res.ok && res.status !== 206) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error("empty response body");
      const reader = res.body.getReader();
      let offset = seg.start;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        await fd.write(value, 0, value.length, offset);
        offset += value.length;
        received += value.length;
        if (received - lastEmit >= PROGRESS_TICK_BYTES) {
          lastEmit = received;
          emit();
        }
      }
    } finally {
      await fd.close();
    }
  }));
  const final = await stat(destPath);
  if (final.size !== total) throw new Error(`下载不完整：${final.size}/${total}`);
  emit();
  return destPath;
}

// ── IPC surface exposed through the preload ──────────────────────────────────
function registerIpc() {
  ipcMain.handle("dsh:open-external", (_event, url) => {
    if (typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"))) {
      return shell.openExternal(url);
    }
    return undefined;
  });
  ipcMain.handle("dsh:show-item", (_event, path) => {
    if (typeof path === "string" && existsSync(path)) return shell.showItemInFolder(path);
    return undefined;
  });
  ipcMain.handle("dsh:open-path", (_event, path) => {
    if (typeof path === "string" && existsSync(path)) return shell.openPath(path);
    return undefined;
  });
  ipcMain.handle("dsh:app-info", () => ({
    platform: process.platform,
    versions: {
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node
    },
    appVersion: app.getVersion(),
    harnessVersion: harnessVersion(),
    dshHome: resolveDshHome(),
    profileDir: join(resolveDshHome(), "profiles", PROFILE_NAME),
    isPackaged: app.isPackaged
  }));
  // The canonical GUI URL; resolved lazily so a listener can never race the boot.
  ipcMain.handle("dsh:server-url", () => serverUrl);
  // Custom title-bar window controls.
  ipcMain.on("dsh:window-control", (event, action) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    if (action === "minimize") win.minimize();
    else if (action === "toggle-maximize") {
      if (win.isMaximized()) win.unmaximize();
      else win.maximize();
    } else if (action === "close") win.close();
  });
  // Desktop behaviors (tray / auto-launch / global hotkey) for the ui-desktop settings page.
  ipcMain.handle("dsh:desktop-get", async () => {
    const settings = await readDesktopSettings();
    return { ...settings, trayActive: tray !== undefined, hotkeyActive: currentHotkey !== undefined };
  });
  ipcMain.handle("dsh:desktop-set", async (_event, patch) => {
    if (typeof patch !== "object" || patch === null || Array.isArray(patch)) return readDesktopSettings();
    const next = await writeDesktopSettings(patch);
    applyDesktopSettings(BrowserWindow.getAllWindows()[0], next);
    return { ...next, trayActive: tray !== undefined, hotkeyActive: currentHotkey !== undefined };
  });
  // Updater: check the latest GitHub release (version + changelog + assets).
  ipcMain.handle("dsh:update-check", async () => {
    const current = app.getVersion();
    try {
      const release = await fetchLatestRelease();
      const tag = String(release.tag_name ?? "");
      const latest = tag.replace(/^v/, "");
      const assets = (release.assets ?? [])
        .filter((a) => typeof a.name === "string" && /\.exe$/i.test(a.name))
        .map((a) => ({ name: a.name, url: a.browser_download_url, size: a.size ?? 0 }));
      return {
        ok: true,
        current,
        latest,
        tag,
        hasUpdate: isNewerVersion(latest, current),
        changelog: typeof release.body === "string" ? release.body : "",
        url: release.html_url ?? "",
        assets,
        publishedAt: release.published_at ?? ""
      };
    } catch (error) {
      const raw = error instanceof Error ? error.message : String(error);
      const message = /fetch failed|ENOTFOUND|ECONNREFUSED|EHOSTUNREACH|timed out|timeout/i.test(raw)
        ? "无法连接 GitHub，请检查网络或代理后重试"
        : raw;
      return { ok: false, current, error: message };
    }
  });
  // Updater: download the installer with UPDATE_THREADS concurrent range requests.
  ipcMain.handle("dsh:update-download", async (event, payload) => {
    const dir = join(app.getPath("userData"), "updates");
    await mkdir(dir, { recursive: true });
    const rawName = payload && typeof payload.name === "string" ? payload.name : "";
    const safeName = /^[\w .-]+\.exe$/i.test(rawName) ? rawName : "deepseek-harness-desktop-setup.exe";
    const dest = join(dir, safeName);
    const report = (p) => { if (!event.sender.isDestroyed()) event.sender.send("dsh:update-progress", p); };
    try {
      if (!payload || typeof payload.url !== "string") throw new Error("缺少下载地址");
      await downloadWithThreads(payload.url, dest, UPDATE_THREADS, report);
      return { ok: true, filePath: dest };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
  // Updater: launch the downloaded installer and quit this instance.
  ipcMain.handle("dsh:update-install", async (_event, filePath) => {
    if (typeof filePath !== "string" || !existsSync(filePath)) return { ok: false, error: "安装包不存在" };
    try {
      await shell.openPath(filePath);
      setTimeout(() => app.quit(), 1500);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
  // The quick-input pill window asks the main process to show/hide/close
  // itself (visibility drives the window) without touching the main window.
  ipcMain.on("dsh:quickchat-show", () => showPillWindow());
  ipcMain.on("dsh:quickchat-hide", () => hidePillWindow());
  ipcMain.on("dsh:quickchat-close", () => {
    if (quickChatWindow !== undefined && !quickChatWindow.isDestroyed()) quickChatWindow.close();
  });
  // Typing in the pill resets its 60s idle auto-hide.
  ipcMain.on("dsh:quickchat-wake", () => {
    if (quickChatWindow !== undefined && !quickChatWindow.isDestroyed() && quickChatWindow.isVisible()) {
      clearPillTimer();
      pillHideTimer = setTimeout(hidePillWindow, PILL_IDLE_MS);
    }
  });
  // The pill reads the dsh dark/light preference to match the app theme.
  ipcMain.handle("dsh:quickchat-theme", () => resolvePillTheme());
  // RPC proxy: the pill is a file:// page, so a browser fetch to the loopback
  // harness is CORS-blocked. Node fetch has no such restriction.
  ipcMain.handle("dsh:quickchat-rpc", async (_event, req) => {
    const method = req && typeof req.method === "string" ? req.method : undefined;
    if (method === undefined || serverUrl === undefined) throw new Error("rpc unavailable");
    const res = await fetch(serverUrl + "api/" + method, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "client-request", rpcId: "pill-" + String(++rpcSeq), method, payload: req.payload || {} })
    });
    if (!res.ok) throw new Error("HTTP " + String(res.status));
    return res.json();
  });
  // Sending from the pill expands it into the main dsh conversation page.
  ipcMain.on("dsh:quickchat-expand", (_event, payload) => {
    const sessionId = payload && typeof payload.sessionId === "string" ? payload.sessionId : undefined;
    if (sessionId !== undefined) void expandPillToSession(sessionId);
  });
}

// ── app lifecycle ────────────────────────────────────────────────────────────
// A second launch focuses the existing window instead of booting another tree.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const [win] = BrowserWindow.getAllWindows();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.setAppUserModelId("ai.deepseek.harness.desktop");
  registerIpc();

  // Renderer permissions: notifications and clipboard for the served GUI.
  app.whenReady().then(async () => {
    session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
      callback(["notifications", "clipboard-sanitized-write", "clipboard-read", "fullscreen"].includes(permission));
    });

    let win;
    try {
      // Install the same fail-loud guard the CLI installs: a late unhandled
      // rejection becomes one labelled diagnostic, tree dispose, and exit(1).
      installFailLoud(BIN_NAME, process, () => disposeHarness());
      serverUrl = await bootHarness();
      win = createMainWindow(serverUrl);
    } catch (error) {
      console.error("dsh-desktop: boot failed", error);
      await disposeHarness();
      dialog.showErrorBox(
        "DeepSeek Harness failed to start",
        `${error instanceof Error ? error.stack ?? error.message : String(error)}\n\nHarness home: ${resolveDshHome()}`
      );
      app.exit(1);
      return;
    }
    Menu.setApplicationMenu(buildMenu(win));
    // Apply persisted desktop settings (tray / auto-launch / global hotkey).
    applyDesktopSettings(win, await readDesktopSettings());
    // Quick chat: the true three-key chord Ctrl+D+S toggles the detached mini
    // panel — the main window is left untouched (never shown/focused).
    // globalShortcut can't express this (Windows RegisterHotKey accepts only
    // one plain key), so a low-level keyboard hook does the matching — and it
    // makes sure Ctrl+S alone does NOT trigger.
    const require = createRequire(import.meta.url);
    const quickchatHotkey = require("./quickchat-hotkey.cjs");
    try {
      if (!quickchatHotkey.install(() => toggleQuickChatPanel())) {
        console.warn("dsh-desktop: failed to install quick-chat hotkey (Ctrl+D+S)");
      }
    } catch (error) {
      console.warn("dsh-desktop: failed to install quick-chat hotkey", error);
    }
    // Bridge the harness "dsh/notify" events (task start/done, scheduler) to
    // native Windows notifications.
    if (ctx !== undefined) {
      ctx.on("dsh/notify", (payload) => {
        if (!Notification.isSupported()) return;
        const title = typeof payload?.title === "string" ? payload.title : "DeepSeek Harness";
        const body = typeof payload?.body === "string" ? payload.body : "";
        try {
          new Notification({ title, body, silent: false }).show();
        } catch (error) {
          console.warn("dsh-desktop: failed to show notification", error);
        }
      });
    }
  });

  app.on("will-quit", () => {
    globalShortcut.unregisterAll();
    try {
      const require = createRequire(import.meta.url);
      require("./quickchat-hotkey.cjs").uninstall();
    } catch { /* not installed */ }
  });

  app.on("before-quit", (event) => {
    if (disposed) return;
    event.preventDefault();
    quitting = true;
    void disposeHarness().finally(() => app.quit());
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0 && ctx !== undefined) {
      const port = ctx.get("webServer")?.port;
      if (port !== undefined) createMainWindow(`http://${LOOPBACK}:${String(port)}/`);
    }
  });
}

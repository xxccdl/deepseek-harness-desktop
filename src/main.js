// DeepSeek Harness desktop app — Electron main process.
//
// Boots the `web` profile IN-PROCESS (the same cordis composition `dsh web`
// mounts, driven through the stable @deepseek-ai/dsh-app-boot API) and hosts
// the served SPA in a native BrowserWindow. No browser and no separate CLI
// process are needed: the harness server, the WebSocket transport and the
// frontend all run inside this process on a loopback-only port the OS
// assigns.
import { app, BrowserWindow, Menu, Notification, Tray, dialog, globalShortcut, ipcMain, nativeImage, screen, session, shell } from "electron";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
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
    // Quick chat: Ctrl+D+S shows/focuses the main window and toggles the
    // glass quick-chat panel in the renderer.
    try {
      globalShortcut.register("CommandOrControl+D+S", () => {
        const [target] = BrowserWindow.getAllWindows();
        if (!target) return;
        if (target.isMinimized()) target.restore();
        target.show();
        target.focus();
        target.webContents.send("dsh:quickchat-toggle");
      });
    } catch (error) {
      console.warn("dsh-desktop: failed to register quick-chat shortcut", error);
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

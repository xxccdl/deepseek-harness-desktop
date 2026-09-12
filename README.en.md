# DeepSeek Harness — Desktop

[简体中文](README.md) · **English**

Packages the [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) web
surface (`dsh web`) as a native Electron desktop app.

> **Open-source notice (copyright)**: the upstream deepseek-harness was released by
> DeepSeek in 2026 under the MIT license. This repository is a desktop fork; the
> desktop shell and the added desktop plugins (memory, computer use, desktop
> settings, scheduled tasks, quick chat, budget bar) were contributed by xxccdl in
> 2026, also under MIT. See [LICENSE](LICENSE) and
> [LICENSE-THIRD-PARTY](LICENSE-THIRD-PARTY).

The very same harness runs **inside the app process** (no browser, no separate CLI
process):

- the main process mounts the `web` profile's cordis composition through the stable
  `@deepseek-ai/dsh-app-boot` API (identical bundle layer + user patch layer as
  `dsh web`)
- the harness server binds an OS-assigned random loopback port (reachable only from
  this machine)
- a `BrowserWindow` loads the SPA on that port; `window.__DSH_BOOT__` is still
  injected by the server-side index tap, so the front end needs zero changes
- quitting disposes the harness tree and flushes session state cleanly

## Repository layout

This repository does **not** include `node_modules` (~671 MB, produced by
`npm install`). The source falls into three parts:

- `src/`, `scripts/`, `resources/`, `package.json` — the desktop shell and packaging
  configuration (the bulk of this repository)
- `plugins/@deepseek-ai/<package>/` — the dsh plugins added or modified by this fork
  (see below)
- `plugin-market/` — the plugin market server (catalogue API + store front end,
  deployed separately, not part of the packaged app)

The plugins added by this fork live in `plugins/@deepseek-ai/`, mirroring the
same-named upstream npm packages:

| Plugin | Purpose |
|--------|---------|
| `dsh-client-ui-memory` | Browse AI memory (text / KV / mind map) in Settings |
| `dsh-client-ui-computer-use` | Computer-use settings page |
| `dsh-client-ui-desktop` | Desktop settings page (tray / autostart / shortcuts) |
| `dsh-client-ui-scheduler` | Scheduled-task settings page (date / repeat / time) |
| `dsh-client-ui-quickchat` | `Ctrl+D+S` glassmorphic quick chat + task list |
| `dsh-client-ui-usage` | Sidebar spend/balance bar |
| `dsh-tool-memory` | Memory tool + `/api/memory` HTTP |
| `dsh-tool-computer-use` | Windows-MCP computer control |
| `dsh-tool-notify` | Notifications + scheduled-task dispatch |
| `dsh-tool-usage` | Token spend estimate + live DeepSeek balance |
| `dsh-client-ui-world-clock` | Persistent sidebar clock + world-clock panel (multi-timezone comparison, day-rollover markers, countdown) |
| `dsh-client-ui-market` | Plugin market UI (the store window opened inside the app) |
| `dsh-host-plugin-market` | Market host bridge: install/uninstall/publish persistence and live mounting |
| `dsh-tool-plugin-market` | Publish tools: `plugin_publish` / `ask-publish-plugin` |

Two differences in how they start:

- `dsh-client-ui-world-clock` currently ships through the **plugin market** (install and
  it is live) rather than the default composition; to keep it resident, add it to the
  `dsh-web-app` patch layer
- `dsh-tool-plugin-market` is only mounted by the creation-mode agent preset, so the
  publish tools are available in that mode alone

Modified upstream packages (also shipped as full copies under
`plugins/@deepseek-ai/`): `dsh-client-ui-sidebar` (added the `footer.status` slot),
`dsh-client-ui-settings-general` (section icons), `dsh-client-ui-settings-models`,
`dsh-client-ui-agent-preset`, `dsh-web-app` (plugin registration), `dsh-base`
(backend plugin registration).

## Plugin market

A self-hosted plugin/skill store: browse, install and uninstall from the store window
inside the app, or have the AI publish a plugin/skill it just wrote. Four parts:

| Part | Path | Responsibility |
|------|------|----------------|
| Server | `plugin-market/` | Catalogue API + store page (port 9009 by default), deployed separately |
| Store UI | `plugins/@deepseek-ai/dsh-client-ui-market` | The in-app market window (an iframe hosting the store page) |
| Host bridge | `plugins/@deepseek-ai/dsh-host-plugin-market` | Validation, persistence, live mounting; the four `/api/market/*` routes |
| AI tools | `plugins/@deepseek-ai/dsh-tool-plugin-market` | `plugin_publish` (publish) and `ask-publish-plugin` (publish after asking the user) |

**Install**: the package is downloaded and written into the profile's patch layer
(`$DSH_HOME/profiles/<profile>/cordis.patch.yml`) and mounted live through the loader,
so the UI half shows up on refresh. Any validation failure rolls the whole attempt
back and leaves the running app untouched.

**Uninstall**: both the detail drawer and the manage dialog in the store offer
uninstall, with a two-step confirm (the first click turns into “Confirm uninstall?”;
a second click within 2.6 s actually performs it). The host bridge drops the patch
row, unmounts the runtime entry and deletes the directory.

**Publish**: in creation mode have the AI write a plugin (with `package.json`) or a
skill (with `SKILL.md`), and the AI calls `plugin_publish` to package and upload it.
You can also call the API directly:

```bash
curl -X POST http://<market>/api/plugins \
  -H "X-Market-Meta: $(echo -n '{"title":"My plugin","category":"Dev tools"}' | base64 -w0)" \
  --data-binary @my-plugin.tgz
```

Publishing accepts an explicit **version** and **release note**, plus an explicit
**kind** (`plugin` / `skill`, or left empty to auto-detect). The repository also ships
a packaging/publishing script:

```bash
node plugin-market/tools/publish.mjs <plugin-dir> --market http://<market> [--token <t>]
```

**Deploying the server**:

```bash
node plugin-market/server.js   # env: MARKET_PORT(9009) / MARKET_DATA(./data) / MARKET_ADMIN_TOKEN
```

## Reproduce / build

```bash
npm install
# Copy plugins/@deepseek-ai/* over node_modules/@deepseek-ai/ (replaces/adds the packages)
node scripts/install-plugins.mjs   # or copy plugins/@deepseek-ai/* into node_modules/@deepseek-ai/ by hand
npm start
```

> **computer-use runtime**: computer control needs a `uv` executable (read at package
> time only). Download `uv-x86_64-pc-windows-msvc.zip` from
> https://github.com/astral-sh/uv/releases and put `uv.exe` at
> `resources/runtime/uv/uv.exe` (that directory is git-ignored).

Build the Windows installer:

```bash
npm run dist          # NSIS installer + portable single exe (written to dist/)
npm run dist:portable # portable exe only
```

> On mainland-China networks set the mirrors first:
> ```powershell
> $env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
> $env:ELECTRON_BUILDER_BINARIES_MIRROR = "https://npmmirror.com/mirrors/electron-builder-binaries/"
> ```

## Running

Launching opens the “DeepSeek Harness” window. Sessions, settings and credentials are
shared with the web version (`%USERPROFILE%\.dsh`, i.e. `$DSH_HOME`).

## Desktop integration

- **Frameless window + custom title bar**: no native frame; the title bar is injected by
  the preload (title/drag area on the left, custom minimize, maximize/restore and close
  on the right). Double-clicking the title bar toggles maximize, and the button icons
  follow the maximized state. The title bar participates in document flow (`body`
  becomes a flex column), so the SPA is automatically inset into the remaining height
  and content is never covered
- **Menu**: Edit (clipboard roles, so web inputs work), View (zoom / DevTools /
  fullscreen), Help (open `$DSH_HOME`, about); press `Alt` to reveal the menu bar
  temporarily
- **External links**: `target=_blank` and off-site navigation go to the system browser
- **Notifications**: harness notifications use native system notifications (already
  authorized)
- **Window state**: position/size/maximized are restored after a restart; a
  single-instance lock focuses the existing window on a second launch
- **Quick chat**: `Ctrl+D+S` opens a glassmorphic mini chat box (4 modes: standard /
  PTC / minimal / creation) with quick chat and task list pages
- **Budget bar**: bottom-left of the sidebar (above Settings) shows the token spend
  estimate and the live DeepSeek balance
- **Sidebar clock**: persistent second-resolution time at the sidebar foot (next to
  Settings); clicking expands the world-clock panel (multi-timezone comparison,
  day-rollover markers, countdown)
- **preload bridge**: the SPA can call `getAppInfo()` / `getServerUrl()` /
  `openExternal()` / `showItemInFolder()` / `openPath()` through `window.dshDesktop`

## Structure

```
src/main.js        Electron main process: in-process harness boot + window/menu/lifecycle
src/preload.cjs    contextBridge bridge (sandboxed, whitelisted APIs only)
resources/icon.svg App icon source (DeepSeek whale)
scripts/make-icon.mjs Renders the PNG icon from the SVG
plugins/@deepseek-ai/<pkg>/ This fork's plugin sources (copied into node_modules for use)
plugin-market/     Plugin market server (deployed separately, not packaged)
```

## How it works (why the front end needs no changes)

`dsh web` is essentially: mount the patch layers of the `@deepseek-ai/dsh-base` and
`@deepseek-ai/dsh-web-app` bundles, have `dsh-host-webserver` listen on `127.0.0.1`,
and have `dsh-host-frontend-static` serve
`@deepseek-ai/dsh-web-frontend/dist` while injecting `window.__DSH_BOOT__` (the client
plugin manifest) into every index response. The desktop build reuses the same
composition, only differing in that it:

- mounts inside the Electron main process with `boot()` + `provideCmdline()`, passing
  `--port 0` to let the OS assign a port and reading the real port back from
  `ctx.webServer.port`
- native modules (sharp/koffi/node-pty and friends) are all N-API, so they need no
  rebuild on Electron's Node
- `node:sqlite` (session search) is available in the Node 24 bundled with Electron 43+
- packaging unpacks all of `node_modules` (`asarUnpack`): the harness module fallback
  resolves `$DSH_HOME/profiles/node_modules` junctions to real directories, and a
  junction pointing into the asar virtual filesystem cannot be resolved by native
  modules (which would yield an empty `__DSH_BOOT__` manifest and a UI error,
  “Failed to load plugins”)

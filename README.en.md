# DeepSeek Harness — Desktop

[简体中文](README.md) · **English**

Packages the [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) web
surface (`dsh web`) as a native Electron desktop app, and extends it with a full set of
desktop-oriented capabilities: computer control, browser automation, long-term memory,
scheduled tasks, quick chat, a plugin market, a desktop pet and more.

> **Open-source notice (copyright)**: the upstream deepseek-harness was released by
> DeepSeek in 2026 under the MIT license. This is a desktop fork; the desktop shell and
> the added desktop plugins were contributed by xxccdl in 2026, also under MIT. See
> [LICENSE](LICENSE) and [LICENSE-THIRD-PARTY](LICENSE-THIRD-PARTY).

---

## Contents

- [How it runs](#how-it-runs)
- [Feature overview](#feature-overview)
- [Desktop shell](#desktop-shell)
- [Quick chat (Ctrl+D+S)](#quick-chat-ctrlds)
- [AI conversation & tools](#ai-conversation--tools)
- [Computer control](#computer-control)
- [Browser automation](#browser-automation)
- [Long-term memory](#long-term-memory)
- [Notifications & scheduled tasks](#notifications--scheduled-tasks)
- [Usage & spend](#usage--spend)
- [UI enhancements](#ui-enhancements)
- [Quick snippets (Ctrl+/)](#quick-snippets-ctrl)
- [World clock](#world-clock)
- [Desktop pet](#desktop-pet)
- [Plugin market](#plugin-market)
- [Updater](#updater)
- [Settings sections](#settings-sections)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Where data lives](#where-data-lives)
- [Reproduce / build](#reproduce--build)
- [Repository layout](#repository-layout)
- [How it works (why the front end needs no changes)](#how-it-works-why-the-front-end-needs-no-changes)

---

## How it runs

The very same harness runs **inside the app process** (no browser, no separate CLI
process):

- the main process mounts the `web` profile's cordis composition through the stable
  `@deepseek-ai/dsh-app-boot` API (the identical bundle layer + user patch layer as
  `dsh web`)
- the harness server binds an OS-assigned random loopback port (reachable only from
  this machine)
- a `BrowserWindow` loads the SPA on that port; `window.__DSH_BOOT__` is still injected
  by the server-side index tap, so the front end needs zero changes
- quitting disposes the harness tree and flushes session state cleanly

Sessions, settings and credentials are shared with the web version, all under
`%USERPROFILE%\.dsh` (i.e. `$DSH_HOME`).

---

## Feature overview

| Area | Capabilities |
|------|--------------|
| Desktop shell | Frameless window, custom title bar, tray, launch at login, boss key, global show hotkey, single instance, window-state restore |
| Quick chat | `Ctrl+D+S` global glassmorphic mini dialog, 4 agent modes + a task list |
| AI tools | Computer control, browser, memory, notify/scheduler, clipboard, file search, web fetch, vision, snippets, artifact delivery, more |
| Computer control | Let the AI see the screen, click and type via Windows-MCP; ships uv and an isolated Python runtime |
| Browser automation | Drives Edge/Chrome over CDP: navigate, click, type, screenshot, evaluate JS |
| Long-term memory | remember/recall tools plus a text / KV / mind-map viewer in Settings |
| Notify & schedule | System notifications on task start/done, repeating scheduled tasks, `remind`, `/btw` |
| Usage & spend | Token spend estimate + live DeepSeek balance bar, token-composition strip |
| UI enhancements | `Ctrl+K` session search, `F1` shortcut help, clipboard history, Markdown export, code-block toolbar, Mermaid |
| Plugin market | Browse/install/uninstall plugins and skills in-app; one-click publish from creation mode |
| Other | World clock, desktop pet, bottom control panel + shared PowerShell, GitHub auto-update, session-log export |

---

## Desktop shell

- **Frameless window + custom title bar**: no native frame; the title bar is injected by
  the preload (title/drag area on the left, custom minimize, maximize/restore and close
  on the right). Double-click toggles maximize and the button icons follow the state; the
  title bar participates in document flow (`body` is a flex column), so the SPA is inset
  into the remaining height and content is never covered
- **System tray**: minimize to the tray instead of quitting; the tray menu offers
  “Show main window / Quit”
- **Launch at login**: one toggle in Settings (writes the system login item)
- **Boss key `Ctrl+Alt+B`**: instantly hides the whole app; press again to restore (can be
  disabled in Settings)
- **Global show hotkey**: a customizable global shortcut that brings the main window to
  the foreground from any app
- **Quick-chat chord `Ctrl+D+S`**: implemented with a low-level keyboard hook
  (`globalShortcut` cannot express a three-key chord), and it guarantees that pressing
  `Ctrl+S` alone never triggers it
- **Single-instance lock**: a second launch focuses the existing window
- **Window-state restore**: position, size and maximized state are restored after restart
- **Menu**: Edit (undo/clipboard, so web inputs work), View (reload/DevTools/zoom/
  fullscreen), Help (open `$DSH_HOME`, open the web profile folder, about); press `Alt` to
  reveal the menu bar temporarily
- **External links**: `target=_blank` and off-site navigation go to the system browser
- **Native notifications**: harness `dsh/notify` events raise Windows system
  notifications and can play a UI sound per event
- **Clipboard watcher**: monitors the clipboard in the background to feed the
  `Ctrl+Shift+V` history picker
- **Zoom**: `Ctrl + / - / 0` zoom in, zoom out, reset
- **preload bridge**: the SPA calls whitelisted APIs via `window.dshDesktop` —
  `getAppInfo()` / `getServerUrl()` / `openExternal()` / `showItemInFolder()` /
  `openPath()` (sandbox enabled)

---

## Quick chat (Ctrl+D+S)

`Ctrl+D+S` opens a detached glassmorphic mini dialog from **anywhere** (even when the main
window is not focused), leaving the main window completely untouched:

- **4 agent modes**: Standard / PTC / Minimal / Creator
- messages go to the current session; dismiss it at any time
- a **task list** page for background jobs, with a per-session mini conversation

---

## AI conversation & tools

Beyond the harness's built-in file read/write, command execution and subagent abilities,
this fork registers a set of additional model-facing tools:

| Tool (package) | Purpose |
|----------------|---------|
| Computer control (`dsh-tool-computer-use`) | Operates the whole Windows PC via Windows-MCP |
| Browser (`dsh-tool-browser`) | Automates Edge/Chrome over CDP |
| Memory (`dsh-tool-memory`) | `remember` / `recall` / `list` / `forget` long-term memory |
| Notify/scheduler (`dsh-tool-notify`) | Task start/done notifications, repeating scheduled tasks |
| Reminder (`dsh-tool-remind`) | `remind`: raise a desktop notification in N minutes |
| Clipboard (`dsh-tool-clipboard`) | `clipboard_read` / `clipboard_write` over the OS clipboard |
| File search (`dsh-tool-filesearch`) | `file_name_search`: fast recursive filename search under a directory (ignores node_modules/.git) |
| Web fetch (`dsh-tool-webfetch`) | `web_fetch`: readable text of a URL (scripts/styles stripped, whitespace collapsed, length-capped) |
| Vision (`dsh-tool-vision`) | Analyze images or screen captures with DeepSeek vision models |
| Persistent PowerShell (`dsh-tool-pwsh-persistent`) | Owner-scoped persistent PowerShell sharing one PTY with the bottom panel |
| Snippets (`dsh-tool-snippets`) | `snippet_save/list/get/delete`, one store shared with the UI picker |
| Artifact delivery (`dsh-tool-deliver`) | `send_file` stages a file and notifies; the UI shows a “delivered” tag with one-tap save |
| Market publish (`dsh-tool-plugin-market`) | `plugin_publish` / `ask-publish-plugin` (creation mode only) |
| Phone control (`dsh-tool-phone`) | Mobile: read the screen, tap/swipe/type/press/scroll/open apps |

Other conversation abilities:

- **`/btw` side question**: ask the running agent a side question without interrupting its
  current task (queued as next-step context)
- **Multimodal images**: screenshots/images can be sent directly to vision models; a
  model's “image input” capability can be toggled or corrected in Settings → Models
- **Session-log export**: export the whole conversation from the session toolbar overflow
  menu
- **Bottom control panel**: a drawer showing the agent's live actions (background jobs,
  subagents) and the shared PowerShell terminal; a right-aligned session header toolbar;
  includes a DeepSeek peak/off-peak pricing hint

---

## Computer control

Lets the AI operate this Windows PC like a person (built on Windows-MCP):

- the AI can **see the screen, read UI elements, click, type, scroll and press keys**
- **self-contained runtime, works out of the box**: the bundled `uv` builds an isolated
  Python environment (`windows-mcp-venv`) under `$DSH_HOME/runtime`, leaving the system
  Python untouched
- **“Computer control” settings page**: enable the feature, choose the Python
  version/package, configure the prompt reminder, view live status and rebuild the runtime
- the AI-facing tool lives in `dsh-tool-computer-use`

---

## Browser automation

Drives local Edge / Chrome over the Chrome DevTools Protocol:

- the AI can **navigate, click, fill forms, take screenshots and evaluate JS**
- **“Browser control” settings page**: choose the browser and port, headless mode, and
  start/stop/test the controlled browser
- status is exposed over `/api/browser`

---

## Long-term memory

The AI has cross-session long-term memory:

- model tools: `remember` / `recall` / `list` / `forget`
- persisted at `$DSH_HOME/memory/memory.jsonl`, with a memory skill that teaches the model
  when to use it
- the **“Memory” settings page** browses memories in three views — **text, key-value (KV)
  and mind map** — served by `dsh-tool-memory` over `/api/memory`

---

## Notifications & scheduled tasks

- **Task notifications**: a Windows system notification when the AI starts/finishes a long
  task (with an optional sound), so you don't have to watch the window
- **Scheduled tasks**: the “Scheduled tasks” settings page manages task start/done
  notifications and user-defined **repeating** scheduled tasks (optionally with a command
  to run)
- **Delayed reminder**: the AI schedules “remind me in N minutes” with the `remind` tool
- on mobile, `dsh-mobile-bridge` additionally forwards notifications to the Android system
  notifications (delivered even in the background)

---

## Usage & spend

- **Sidebar budget bar**: a compact “spent / balance” bar at the bottom-left (above
  Settings)
  - spent: replays session events and estimates CNY spend from DeepSeek pricing
    (deepseek-chat, etc.)
  - balance: queries the live DeepSeek `/user/balance`
  - a balance-query failure is explained in the tooltip; when a provider has no balance
    endpoint it shows spend alone, and never prints an unreported balance as ¥0.00
- **Token-composition strip**: the strip above the composer is colored by token mix —
  **cached read (green) / fresh input (blue) / cache write (amber) / output (neutral)** —
  with widths proportional to real usage; hover for full statistics
- **“Stats” settings page**: spend and balance, session counts (total/running/today) and
  the current session's message/tool counts

---

## UI enhancements

`dsh-client-ui-enhance` adds a set of pure front-end enhancements:

- **`Ctrl+K` session search**: fuzzy search and quick jump to a session (arrow keys to
  pick, Enter to jump)
- **`F1` shortcut help**: all shortcuts and code-block actions at a glance
- **`Ctrl+Shift+V` clipboard history**: open the history inside the input and insert a
  recently copied item
- **`Ctrl+E` Markdown export**: export the current conversation to a Markdown file
- **Code-block toolbar**: hover a code block for “copy / save as file / collapse”
- **Mermaid rendering**: `mermaid` code blocks render as flowcharts/diagrams, with a
  source toggle
- overlays follow the system dark/light theme

---

## Quick snippets (Ctrl+/)

`dsh-client-ui-snippets`:

- `Ctrl+/` opens the **quick-snippet picker** to insert a saved prompt/code snippet into
  the input
- save the current draft as a snippet and delete old ones
- **shares one snippet library** with the AI's `snippet_*` tools (`/api/snippets`) — both
  the user and the model can read and write it

---

## World clock

`dsh-client-ui-world-clock` (installable from the plugin market; pure front end, zero
dependencies):

- a persistent **second-resolution local clock** at the sidebar foot (next to Settings),
  with a compact rail version
- click to open the world-clock panel: **live multi-city comparison, real IANA zones and
  UTC offsets, automatic yesterday/tomorrow markers**, plus a **5 / 15 / 25 minute
  countdown**

---

## Desktop pet

`dsh-client-ui-desktop-pet`: a draggable little blue whale at the bottom-right that floats,
blinks, talks to you and changes expression by mood; configurable in the “Desktop pet”
settings page.

---

## Plugin market

A self-hosted plugin/skill store: browse, install and uninstall in-app, or have the AI
publish a plugin/skill it just wrote.

| Part | Path | Responsibility |
|------|------|----------------|
| Server | `plugin-market/` | Catalogue API + store page (port 9009 by default), deployed separately |
| Store UI | `dsh-client-ui-market` | The in-app market window (an iframe hosting the store page) |
| Host bridge | `dsh-host-plugin-market` | Validation, persistence, live mounting; the four `/api/market/*` routes |
| AI tools | `dsh-tool-plugin-market` | `plugin_publish` and `ask-publish-plugin` (creation mode only) |

**Two kinds**:

- **plugin**: a `package.json` plus a JS entry; code is loaded after install
- **skill**: just a `SKILL.md` (YAML frontmatter with name/description), no code loaded;
  installing copies the directory into `$DSH_HOME/skills` and it appears in the skill list
  (visible via `/`)

**Install**: download → server-side validation of every item (package name, entry, each
`.js` through `node --check`, no npm dependencies allowed) → write into the profile's
patch layer (`$DSH_HOME/profiles/<profile>/cordis.patch.yml`) and **live-mount** through
the loader, so the UI half shows up on refresh. Any failure **rolls the whole attempt
back**, leaving the running app untouched.

**Uninstall**: offered both in the detail drawer and the manage dialog, behind a
**two-step confirm** (the first click turns into “Confirm uninstall?”; a second click
within 2.6 s performs it); the host bridge drops the patch row, unmounts the live entry and
deletes the directory.

**Publish**: in creation mode, after the AI writes a plugin/skill it calls
`ask-publish-plugin`; a publish strip appears above the composer where you pick the
**version and kind (plugin/skill/auto-detect)** and add a release note; only after you
confirm does the AI call `plugin_publish`. You can also hit the API or use the script:

```bash
curl -X POST http://<market>/api/plugins \
  -H "X-Market-Meta: $(echo -n '{"title":"My plugin","category":"Dev tools"}' | base64 -w0)" \
  --data-binary @my-plugin.tgz

# or
node plugin-market/tools/publish.mjs <plugin-dir> --market http://<market> [--token <t>]
```

**Deploying the server**:

```bash
node plugin-market/server.js   # env: MARKET_PORT(9009) / MARKET_DATA(./data) / MARKET_ADMIN_TOKEN
```

> Mounting note: `dsh-client-ui-world-clock` currently ships through the market (not the
> default composition; it is live after install). To make it resident out of the box, add
> it to the `dsh-web-app` patch layer.

---

## Updater

`dsh-client-ui-updater` (Electron desktop only):

- the “Update” settings page checks GitHub Releases and reads the changelog
- downloads the installer with **50-thread parallel acceleration** and installs it (no
  silent background update — confirmation is manual)

---

## Settings sections

| Section | Contents |
|---------|----------|
| General | Shell, version notices, general preferences |
| Models | Credentials and model management, the model “image input” toggle |
| Stats | Spend/balance, session counts, current-session message/tool statistics |
| Memory | Text / KV / mind-map memory views |
| Computer use | Windows-MCP toggle, Python runtime, rebuild |
| Browser control | Controlled browser choice, port, headless, start/stop/test |
| Desktop | Tray, launch at login, global show/hide hotkey |
| Scheduled tasks | Task notifications and repeating scheduled tasks |
| Desktop pet | Pet toggle and configuration |
| Update | Check for updates, changelog, download & install |
| Plugins (upstream) | Installed-plugin inventory and management |

The first launch also runs a **welcome wizard** (live API-key check, feature tour, shortcut
cheatsheet) whose completion is persisted; the “Usage tutorial” settings section can rerun
it at any time.

---

## Keyboard shortcuts

| Shortcut | Action | Scope |
|----------|--------|-------|
| `Ctrl` `D` `S` | Toggle the quick-chat mini panel | Global (low-level keyboard hook) |
| `Ctrl` `Alt` `B` | Boss key: instantly hide/restore the app | Global (can be disabled) |
| `Ctrl` `K` | Quick search and jump to a session | In-app |
| `F1` | Shortcut help | In-app |
| `Ctrl` `Shift` `V` | Clipboard history (insert into the input) | In-app |
| `Ctrl` `E` | Export the current session to Markdown | In-app |
| `Ctrl` `/` | Quick-snippet picker | In-app |
| `Ctrl` `+ / - / 0` | Zoom in / out / reset | In-app |
| Double-click title bar | Maximize/restore | Window |
| `Alt` | Reveal the menu bar temporarily | Window |
| Hover a code block | Copy / save as file / collapse | Conversation |

---

## Where data lives

All user data lives under `$DSH_HOME` (`%USERPROFILE%\.dsh` on Windows):

| Path | Contents |
|------|----------|
| `$DSH_HOME/memory/memory.jsonl` | Long-term memory |
| `$DSH_HOME/skills/<id>/` | Skills installed from the market (`SKILL.md`) |
| `$DSH_HOME/profiles/<profile>/cordis.patch.yml` | User patch layer (market-installed plugins are registered here) |
| `$DSH_HOME/plugin-market.json` | Plugin-market state (installed list, tokens, market URL) |
| `$DSH_HOME/runtime/` | The uv binary and isolated Python runtime for computer control |
| `$DSH_HOME/plugin-market-backup/` | Backups taken during install/update |
| Attachment storage | Content-addressed local attachment directory (`dsh-attachment-local`) |
| Artifact delivery | `<files>/deliver/` (where `send_file` lands; one-tap save in the UI) |

---

## Reproduce / build

```bash
npm install
# Copy plugins/@deepseek-ai/* over node_modules/@deepseek-ai/ (replaces/adds packages)
# and create junctions under $DSH_HOME/profiles/node_modules
node scripts/install-plugins.mjs
npm start
```

> **computer-use runtime**: computer control needs a `uv` executable (read at package time
> only). Download `uv-x86_64-pc-windows-msvc.zip` from
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
> Add `--publish never` if you do not want electron-builder to attempt publishing to GitHub.

---

## Repository layout

This repository does **not** include `node_modules` (~671 MB, produced by `npm install`).

```
src/main.js               Electron main process: in-process harness boot + window/menu/tray/hotkeys/lifecycle
src/preload.cjs           contextBridge bridge (sandboxed, whitelisted APIs only)
src/quickchat-hotkey.cjs  Low-level keyboard hook for the Ctrl+D+S chord
src/quickchat.html        The quick-chat mini panel page
src/splash.html           The startup splash screen
src/update-downloader.mjs Parallel accelerated installer downloader
resources/icon.svg        App icon source (DeepSeek whale)
scripts/                  Icon rendering, plugin sync/install, release and verification scripts
plugins/@deepseek-ai/     This fork's dsh plugins (copied into node_modules for use)
plugin-market/            The plugin market server (deployed separately, not packaged)
```

`plugins/@deepseek-ai/` contains both plugins new to this fork and full copies of modified
upstream packages (e.g. `dsh-client-ui-sidebar`, `dsh-client-ui-settings-general`,
`dsh-web-app`, `dsh-base`).

---

## How it works (why the front end needs no changes)

`dsh web` is essentially: mount the patch layers of the `@deepseek-ai/dsh-base` and
`@deepseek-ai/dsh-web-app` bundles, have `dsh-host-webserver` listen on `127.0.0.1`, and
have `dsh-host-frontend-static` serve `@deepseek-ai/dsh-web-frontend/dist` while injecting
`window.__DSH_BOOT__` (the client plugin manifest) into every index response. The desktop
build reuses the same composition, only differing in that it:

- mounts inside the Electron main process with `boot()` + `provideCmdline()`, passing
  `--port 0` to let the OS assign a port and reading the real port back from
  `ctx.webServer.port`
- native modules (sharp/koffi/node-pty and friends) are all N-API, so they need no
  rebuild on Electron's Node
- `node:sqlite` (session search) is available in the Node 24 bundled with Electron 43+
- packaging unpacks all of `node_modules` (`asarUnpack`): the harness module fallback
  resolves `$DSH_HOME/profiles/node_modules` junctions to real directories, and a junction
  pointing into the asar virtual filesystem cannot be resolved by native modules (which
  would yield an empty `__DSH_BOOT__` manifest and a UI error, “Failed to load plugins”)

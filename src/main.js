// DeepSeek Harness desktop app — Electron main process.
//
// Boots the `web` profile IN-PROCESS (the same cordis composition `dsh web`
// mounts, driven through the stable @deepseek-ai/dsh-app-boot API) and hosts
// the served SPA in a native BrowserWindow. No browser and no separate CLI
// process are needed: the harness server, the WebSocket transport and the
// frontend all run inside this process on a loopback-only port the OS
// assigns.
import { app, BrowserWindow, Menu, Notification, Tray, dialog, globalShortcut, ipcMain, clipboard, nativeImage, nativeTheme, net, screen, session, shell } from "electron";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import tls from "node:tls";
import {
  PROFILE_PATCH_FILENAME,
  PluginPackages,
  boot,
  composeEntries,
  createRuntimeResolution,
  installFailLoud,
  loadLayeredEnv,
  loadOptionalPatches,
  loadProfile
} from "@deepseek-ai/dsh-app-boot";
import { resolveDshHome } from "@deepseek-ai/dsh-home-paths";
import { provideCmdline } from "@deepseek-ai/dsh-cmdline";
import { DSH_LAUNCH_ENVIRONMENT_KEY } from "@deepseek-ai/dsh-launch-environment";
import { downloadWithThreads } from "./update-downloader.mjs";

// Trust what the operating system trusts, not just Node's bundled store.
//
// Networks that inspect TLS (a captive gateway, an antivirus proxy, a corporate
// root) re-sign HTTPS with an issuer installed in the OS store, and the bundled
// Mozilla list has no reason to know it. Every Node-side request to such a host
// then fails first with UNABLE_TO_VERIFY_LEAF_SIGNATURE — seen here on
// huggingface.co and github.com, which is what the voice model download and the
// plugin market report as a "certificate" failure — while the same hosts load
// fine in the Chromium side of this app, because Chromium reads the OS store.
// Node 24 exposes the two calls below; a runtime without them keeps the bundled
// store, and a failure inside them must not stop the boot.
if (typeof tls.getCACertificates === "function" && typeof tls.setDefaultCACertificates === "function") {
  try {
    tls.setDefaultCACertificates([...tls.getCACertificates("bundled"), ...tls.getCACertificates("system")]);
  } catch {
    // Leave Node's default store in force.
  }
}
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
/** Id prefix the plugin market gives the rows it owns in the patch layers. */
const MARKET_ROW_PREFIX = "market-";
/**
 * The Harness-home file listing plugins this deployment could not load.
 *
 * A plugin that fails to import is a warning at boot, not a fatal error: the
 * tree comes up without it. What the record adds is what a warning cannot give —
 * the broken entry is skipped on the next boot instead of failing again, it
 * carries the original failure so the reason survives the process, and it is
 * what turns the failure into a repair the agent can run. It is deliberately a
 * plain JSON file in `$DSH_HOME` beside `plugin-market.json`: a person can read
 * what this deployment turned off on their behalf, and clearing one entry is the
 * whole re-enable procedure.
 *
 * Both halves of a boot report here, keyed by row id for a host row that failed
 * to activate and by package name for a client entry that never registered —
 * the page's roster is published from the host's activated entries, so the
 * second kind leaves the host tree looking perfectly healthy.
 */
const QUARANTINE_FILENAME = "plugin-quarantine.json";
/** Repair sessions opened per quarantined plugin before the fallback is the only remedy left. */
const REPAIR_ATTEMPT_LIMIT = 2;
/** How much of a plugin's failure travels into the record and the repair prompt. */
const FAILURE_DETAIL_LIMIT = 600;

/**
 * The two plugin trees THIS deployment resolves out of, matching the roots the
 * market itself installs into: `node_modules/@deepseek-ai` for a packaged app,
 * plus the source tree beside it for a checkout.
 */
function deploymentPluginDirs() {
  const scope = dirname(dshAnchor()); // <root>/node_modules/@deepseek-ai
  return [scope, join(dirname(scope), "..", "plugins", "@deepseek-ai")];
}

/**
 * Whether a market row names a package this deployment can actually import.
 *
 * `$DSH_HOME` is shared: a source checkout and the packaged app compose the
 * same profile patch layers, while a market install only lands in the
 * `node_modules` of the app that ran it. A row left by the other deployment —
 * or by the previous version, after an upgrade replaced `resources/app` —
 * names a package that cannot be imported here, and the Loader aborts the whole
 * composition on it, which leaves the app unstartable with no way back except
 * hand-editing the patch file. The row is dropped instead: the plugin stays
 * listed as installed in the market, which can reinstall it in one click.
 */
function marketRowUsable(row, dirs) {
  const name = typeof row.name === "string" ? row.name : "";
  if (name === "") return false;
  const leaf = name.startsWith("@deepseek-ai/") ? name.slice("@deepseek-ai/".length) : name;
  return dirs.some((dir) => existsSync(join(dir, leaf)));
}

/**
 * Drop unusable market rows from a patch list, in place.
 *
 * The market's rows arrive as `{ insert: [{ id, name }] }` patches; anything
 * whose package this deployment cannot import is removed so the Loader never
 * sees it. Rows from other sources (bundles, presets, the user's own edits)
 * pass through untouched.
 */
function sanitizeMarketRows(patches, dirs) {
  for (const patch of patches) {
    if (patch === null || typeof patch !== "object" || !Array.isArray(patch.insert)) continue;
    patch.insert = patch.insert.filter((row) =>
      !(typeof row?.id === "string" && row.id.startsWith(MARKET_ROW_PREFIX)) || marketRowUsable(row, dirs));
  }
  return patches;
}

/**
 * The Harness-home quarantine file's absolute path.
 * @returns the path the record is read from and written to.
 */
function quarantinePath() {
  return join(resolveDshHome(), QUARANTINE_FILENAME);
}

/**
 * Read the plugin quarantine.
 *
 * An absent, unreadable, or malformed file means "nothing is quarantined". The
 * record only ever adds to a boot that already tolerates the failure it
 * describes, so losing it must never cost the app its start.
 * @returns map of row id or package name to `{ name, detail, quarantinedAt, attempts, sessionId, dir? }`.
 */
function readQuarantine() {
  try {
    const parsed = JSON.parse(readFileSync(quarantinePath(), "utf8"));
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Persist the plugin quarantine.
 * @param record - the map {@link readQuarantine} returned, after editing.
 */
function writeQuarantine(record) {
  try {
    writeFileSync(quarantinePath(), JSON.stringify(record, null, 2), "utf8");
  } catch (error) {
    console.error("dsh-desktop: could not record the plugin quarantine", error);
  }
}

/**
 * Render a plugin's failure as the single line the record and the prompt carry.
 * @param error - the rejection a Loader entry settled with.
 * @returns its first non-blank message line, bounded by {@link FAILURE_DETAIL_LIMIT}.
 */
function failureDetail(error) {
  const text = error instanceof Error ? error.message : String(error);
  const first = text.split("\n").find((line) => line.trim() !== "") ?? text;
  return first.trim().slice(0, FAILURE_DETAIL_LIMIT);
}

/**
 * Plugin entries the settled tree could not activate.
 *
 * Read through the Loader's public `entries()` rather than its diagnostics: an
 * entry with no fiber failed to import, a fiber in the failed state carries the
 * original rejection, and an entry whose `disabled` expression throws is a
 * failure rather than a disabled entry. Pending entries are deliberately left
 * alone — a service that never arrived is a tree-shape problem, and disabling
 * the plugin that waited for it would hide the cause instead of reporting it.
 * @param root - the booted context.
 * @returns `{ id, name, detail }` per failed entry, in Loader order.
 */
async function inactivePlugins(root) {
  const loader = root.get("loader");
  if (loader === undefined) return [];
  const inactive = [];
  for (const entry of loader.entries()) {
    let disabled = false;
    try {
      disabled = entry.disabled;
    } catch (error) {
      inactive.push({ id: entry.options.id, name: entry.options.name, detail: `disabled expression failed: ${failureDetail(error)}` });
      continue;
    }
    if (disabled) continue;
    const fiber = entry.fiber;
    if (fiber === undefined) {
      inactive.push({ id: entry.options.id, name: entry.options.name, detail: "failed to import" });
      continue;
    }
    // Fiber states, mirroring the Loader: 2 is active, 3 is failed.
    if (fiber.state !== 3) continue;
    let detail = "activation failed";
    try {
      await fiber.await();
    } catch (error) {
      detail = failureDetail(error);
    }
    inactive.push({ id: entry.options.id, name: entry.options.name, detail });
  }
  return inactive;
}

/**
 * Call a harness Remote method over the loopback origin.
 *
 * The same authenticated path the quick-chat pill uses: `net.fetch` runs in the
 * default session, which carries the cookie the app page minted from its
 * launch-token URL, so the bare origin authenticates where a Node fetch could not.
 * @param method - the `<namespace>/<method>` Remote name.
 * @param args - the method's wire arguments.
 * @returns the Remote call's value.
 */
async function harnessRpc(method, args) {
  if (serverOrigin === undefined) throw new Error("the harness origin is unknown");
  const response = await net.fetch(serverOrigin + "api/" + method, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "client-request", rpcId: "plugin-repair-" + String(++rpcSeq), method, payload: { args } })
  });
  if (!response.ok) throw new Error(`HTTP ${String(response.status)}`);
  const envelope = await response.json();
  if (envelope?.result?.ok !== true) throw new Error(envelope?.result?.error?.message ?? `${method} failed`);
  return envelope.result.value;
}

/**
 * The client entries a renderer boot report names, as failure rows.
 *
 * The page runs its own audit over the roster it was served and throws one
 * report naming every entry that did not activate — `web boot: N entries did
 * not activate`, then one `name: reason` line per entry — which the boot kernel
 * logs before it draws its failure page. That report is the only statement of a
 * client-side failure that exists anywhere: the roster is published from the
 * host's activated entries, so a bundle that loads without registering its own
 * id leaves the host tree completely healthy and its Loader silent.
 * @param report - the renderer console message.
 * @returns `{ name, detail }` per named entry, in report order.
 */
function clientBootFailures(report) {
  const lines = String(report).split("\n");
  const header = lines.findIndex((line) => /web boot: .*\bdid not activate\b/.test(line));
  if (header === -1) return [];
  const failures = [];
  for (const line of lines.slice(header + 1)) {
    const named = /^([^\s:]+): (.+)$/.exec(line);
    if (named !== null) failures.push({ name: named[1], detail: named[2] });
  }
  return failures;
}

/**
 * Attribute client-side failures to the bundles the roster published.
 *
 * A client entry is named by its package, not by the row that mounts it, so the
 * record keeps the package as its key and the composition resolves it back to
 * rows. The bundle's own path comes from the roster: it is the file a repair has
 * to open, and for a plugin the market installed into this deployment's
 * `node_modules` nothing else in the shell can name it. A name the roster never
 * published is dropped — the report's trailing stack frames and any other
 * console noise parse the same way, and only the roster tells them apart.
 * @param root - the booted context.
 * @param failures - `{ name, detail }` rows from {@link clientBootFailures}.
 * @returns failure rows carrying the bundle's directory, roster-known entries only.
 */
function attributeClientFailures(root, failures) {
  const client = root.get("clientModules", false);
  if (client === undefined) return [];
  const ids = new Set(client.graph().entries.map((row) => row.id));
  const attached = [];
  for (const failure of failures) {
    const parts = failure.name.split("/");
    const owner = parts[0].startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
    if (!ids.has(failure.name) && !ids.has(owner)) continue;
    const bundle = client.clientPath(owner);
    attached.push({
      name: failure.name,
      detail: failure.detail,
      ...(bundle === undefined ? {} : { dir: dirname(bundle) })
    });
  }
  return attached;
}

/**
 * The repair brief the agent receives in FixerMode.
 *
 * A client-side failure is already attributed to a bundle, so it states the
 * package and the directory the file lives in; a host failure states the row
 * the composition mounts it through. The turn is the only thing the person
 * sees — the app restarts the moment it ends — so the brief asks for a fix that
 * holds on the next boot rather than a description of the failure.
 * @param plugins - the inactive entries being repaired.
 * @returns the prompt text.
 */
function fixerPrompt(plugins) {
  return [
    "你是应用内置的插件修复器。以下插件在启动时加载失败，应用已自动进入修复模式，用户正等待重启后进入应用。请直接修复它们。",
    "",
    ...plugins.flatMap((plugin) => [
      ...(plugin.id === undefined || plugin.id === plugin.name
        ? [`- 包名：${plugin.name}`]
        : [`- 插件行 id：${plugin.id}`, `  包名：${plugin.name}`]),
      ...(plugin.dir === undefined ? [] : [`  包目录：${plugin.dir}`]),
      `  失败信息：${plugin.detail}`
    ]),
    "",
    "请按这个顺序做：",
    "1. 定位每个插件的包目录：profile 的 package.json 里指向它的 `link:`/路径依赖，或 $DSH_HOME/profiles/node_modules 下的同名目录。",
    "2. 复现并修掉加载失败的原因（缺依赖、语法/导出错误、引用了不存在的包等）。只改这些插件自己的文件，不要改 dsh 本体或别的插件。",
    "3. 修好后不要改动停用记录，也不要尝试重启应用：应用在这一轮对话结束后会自动重启并重新加载这些插件。",
    "4. 判断修不了就说明原因并结束这一轮；不要为了绕过报错去改动无关的东西。"
  ].join("\n");
}

/**
 * Turn this boot's plugin failures into a quarantine plus one repair attempt.
 *
 * The fallback is unconditional and comes first: every failed entry is recorded,
 * and {@link composeWebProfile} switches them off on the next boot, so a
 * broken plugin costs one warning once instead of failing at every start. The
 * repair is the second half and is deliberately bounded — at most
 * {@link REPAIR_ATTEMPT_LIMIT} conversations per plugin, recorded in the same
 * file — because a repair that cannot start (no account, no model, a tree still
 * settling) must degrade to the fallback rather than retry in a loop.
 *
 * Both halves of the boot arrive here, and they are mutually exclusive: a row
 * that does not activate never publishes a client bundle, so a plugin is either
 * missing from the host tree or broken inside it, never both. What differs is
 * what the person is left with — a host failure costs the plugin, a client
 * failure costs the window, which keeps its failure page until the next start.
 * @param root - the booted context.
 * @param failures - this boot's failed entries, from either half.
 * @param clientSide - whether the failures came from the page rather than the host tree.
 * @param repair - run FixerMode; a silent (auto-launched) start only records.
 */
async function quarantineAndRepair(root, failures, clientSide = false, repair = true) {
  if (failures.length === 0) return;
  const record = readQuarantine();
  const repairable = [];
  for (const plugin of failures) {
    // A host row is keyed by its row id, a client entry by its package name;
    // `composeWebProfile` accepts either and resolves it back to rows.
    const key = plugin.id ?? plugin.name;
    const previous = record[key];
    const entry = {
      name: plugin.name,
      detail: plugin.detail,
      quarantinedAt: typeof previous?.quarantinedAt === "string" ? previous.quarantinedAt : new Date().toISOString(),
      attempts: typeof previous?.attempts === "number" ? previous.attempts : 0
    };
    if (typeof previous?.sessionId === "string") entry.sessionId = previous.sessionId;
    if (typeof plugin.dir === "string") entry.dir = plugin.dir;
    record[key] = entry;
    if (entry.attempts < REPAIR_ATTEMPT_LIMIT) repairable.push(plugin);
  }
  writeQuarantine(record);
  // One line naming the file: clearing an entry there is the whole re-enable.
  console.warn(`dsh-desktop: ${String(failures.length)} plugin(s) failed to load and are now disabled; ${quarantinePath()} records why`);
  if (repairable.length === 0 || !repair) return;
  for (const plugin of repairable) record[plugin.id ?? plugin.name].attempts += 1;
  writeQuarantine(record);
  const main = appWindow();
  if (main === undefined) return;
  // FixerMode owns the window from here: it collects the key if there is none,
  // runs the repair on deepseek-flash, and restarts into the app when done.
  await runFixerMode(main, repairable, clientSide);
}

// ── FixerMode ────────────────────────────────────────────────────────────────
// The repair page: a Win11 first-boot style screen the app switches to whenever
// a plugin fails to load. It replaces the old "open a chat session and hope"
// recovery with one the person can watch — the model runs the repair while the
// page shows what is happening, the key form appears if there is nothing to
// authenticate with, and a restart drops straight back into the app.
/** Model the repair conversation runs on. */
const FIXER_MODEL = "deepseek-flash";
/** How long a repair may run before the app falls back to its usable state. */
const FIXER_TIMEOUT_MS = 15 * 60 * 1000;
/** Progress ceiling while the agent works — only the finish may reach 100. */
const FIXER_CREEP_CEILING = 92;
/** How long the agent may stay silent before the repair is given up on. */
const FIXER_START_GRACE_MS = 90 * 1000;
/** Idle window that ends the repair: a follow-up turn would start before it. */
const FIXER_SETTLE_MS = 4000;
/** Resolver of the key the page submitted; set only while a repair waits for one. */
let fixerKeyWaiter;

/**
 * Push one state to the repair page.
 * @param win - the window showing FixerMode.
 * @param state - `{ stage, progress?, detail? }`.
 */
function fixerState(win, state) {
  if (win === undefined || win.isDestroyed()) return;
  try {
    win.webContents.send("dsh:fixer-state", state);
  } catch {
    /* the page is gone */
  }
}

/**
 * Whether a DeepSeek API key is stored, asked of the running harness first.
 *
 * The credentials service is authoritative — it is what the repair conversation
 * resolves — but it answers over the loopback RPC, and a boot that fell over
 * before that path was ready still has the file to read.
 * @returns true when a key is configured.
 */
async function deepseekKeyConfigured() {
  try {
    const described = await harnessRpc("credentials/describe", { refs: ["DEEPSEEK_API_KEY"] });
    const info = described?.DEEPSEEK_API_KEY;
    if (info !== undefined) return info.configured === true;
  } catch {
    /* fall through to the credentials document */
  }
  try {
    const text = readFileSync(join(resolveDshHome(), ".credentials.yaml"), "utf8");
    return /^\s*DEEPSEEK_API_KEY\s*:\s*\S/m.test(text);
  } catch {
    return false;
  }
}

/**
 * Write the key into `$DSH_HOME/.credentials.yaml` when the RPC cannot.
 * @param key - the secret to store under `DEEPSEEK_API_KEY`.
 */
function writeDeepseekKeyFile(key) {
  const file = join(resolveDshHome(), ".credentials.yaml");
  let text = "";
  try {
    text = readFileSync(file, "utf8");
  } catch {
    /* absent: the whole document is written below */
  }
  const quoted = JSON.stringify(key);
  const lines = text.trim() === ""
    ? ["version: 1", "records:", "refs:"]
    : text.replace(/\r\n/g, "\n").replace(/\s+$/, "").split("\n");
  const refsAt = lines.findIndex((line) => /^refs:\s*$/.test(line));
  if (refsAt === -1) {
    lines.push("refs:", `  DEEPSEEK_API_KEY: ${quoted}`);
  } else {
    let at = refsAt + 1;
    let replaced = false;
    while (at < lines.length && (lines[at].startsWith(" ") || lines[at].trim() === "")) {
      if (/^\s+DEEPSEEK_API_KEY\s*:/.test(lines[at])) {
        lines[at] = `  DEEPSEEK_API_KEY: ${quoted}`;
        replaced = true;
      }
      at += 1;
    }
    if (!replaced) lines.splice(refsAt + 1, 0, `  DEEPSEEK_API_KEY: ${quoted}`);
  }
  writeFileSync(file, `${lines.join("\n")}\n`, "utf8");
}

/**
 * Store the key the repair page collected.
 * @param key - the secret as typed.
 * @returns `{ ok: true }` or `{ ok: false, error }`.
 */
async function storeFixerKey(key) {
  const value = key.trim();
  if (value.length < 8) return { ok: false, error: "API Key 太短，看起来不像有效的密钥" };
  try {
    await harnessRpc("credentials/set", { ref: "DEEPSEEK_API_KEY", value });
    return { ok: true };
  } catch (error) {
    // The RPC is the clean path (it takes the file lock and updates the live
    // service), but the document is watched, so writing it is still a valid
    // way in when the loopback is not answering yet.
    try {
      writeDeepseekKeyFile(value);
      console.warn("dsh-desktop: stored the fixer API key in the credentials document", error);
      return { ok: true };
    } catch (writeError) {
      return { ok: false, error: writeError instanceof Error ? writeError.message : String(writeError) };
    }
  }
}

/** Wait for the page to submit a key, or for its window to go away. */
function awaitFixerKey(win) {
  return new Promise((done) => {
    fixerKeyWaiter = done;
    win.once("closed", () => {
      if (fixerKeyWaiter !== done) return;
      fixerKeyWaiter = undefined;
      done(false);
    });
  });
}

/**
 * Mint the harness session cookie without loading the app page.
 *
 * Every Remote call rides the cookie the launch-token URL sets, and on the boot
 * path that page has not been loaded yet. A plain GET of the token URL is the
 * same exchange the page performs — `Set-Cookie` lands in the default session,
 * which `net.fetch` then carries — so the repair can start on the splash.
 */
async function mintHarnessCookie() {
  if (serverUrl === undefined) return;
  try {
    // Default redirect handling: the token URL answers 302 with the session
    // cookie and a redirect to the clean origin. `manual` is rejected by
    // Electron's net stack ("Redirect was cancelled").
    await net.fetch(serverUrl);
  } catch (error) {
    console.warn("dsh-desktop: could not mint the harness cookie for the repair", error);
  }
}

/**
 * Resolve the provider that serves {@link FIXER_MODEL}.
 * @returns `{ provider, model }`, or undefined when no provider lists it.
 */
async function fixerSelection() {
  try {
    const catalog = await harnessRpc("session/modelCatalog", {});
    for (const group of Array.isArray(catalog?.groups) ? catalog.groups : []) {
      const models = Array.isArray(group?.models) ? group.models : [];
      if (models.some((model) => model?.id === FIXER_MODEL)) {
        return { provider: group.id, model: FIXER_MODEL };
      }
    }
  } catch (error) {
    console.warn("dsh-desktop: could not read the model catalog for the repair", error);
  }
  return undefined;
}

/**
 * The agent driving a session, when the host tree has one.
 * @param sessionId - the session to look up.
 * @returns its agent, or undefined while it has not been created yet.
 */
function agentOf(sessionId) {
  const agents = ctx?.get("agents", false);
  return typeof agents?.get === "function" ? agents.get(sessionId) : undefined;
}

/**
 * Wait for one repair turn to settle.
 *
 * The loop exposes a live `status` on each agent — running while it works
 * across tool calls, idle when the turn is over — and that is what is polled
 * here. The event route (`agent/status` on the root context) is not usable: the
 * payload is published by the loop's own dispatch, so the root only sees
 * `{ status }` and cannot tell which session it belongs to. The settle window
 * keeps a follow-up turn from being read as the end; the start grace keeps a
 * prompt that never woke the agent from holding the window.
 * @param sessionId - the repair session.
 * @param onProgress - receives the creep value while the turn runs.
 * @returns true when the turn finished, false on timeout or no start.
 */
function waitForRepairTurn(sessionId, onProgress) {
  return new Promise((done) => {
    let running = false;
    let idleSince = 0;
    let finished = false;
    const startedAt = Date.now();
    const poll = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      onProgress(Math.min(FIXER_CREEP_CEILING, 30 + Math.round((elapsed / FIXER_TIMEOUT_MS) * 60)));
      if (finished) return;
      let status;
      try {
        status = agentOf(sessionId)?.status;
      } catch {
        status = undefined;
      }
      if (status === "running") {
        running = true;
        idleSince = 0;
      } else if (running) {
        idleSince ||= Date.now();
        if (Date.now() - idleSince >= FIXER_SETTLE_MS) finish(true);
      } else if (elapsed > FIXER_START_GRACE_MS) {
        finish(false);
      }
      if (elapsed > FIXER_TIMEOUT_MS) finish(false);
    }, 1500);
    function finish(ok) {
      if (finished) return;
      finished = true;
      clearInterval(poll);
      done(ok);
    }
  });
}

/**
 * Run the repair for this boot's failed plugins, then restart into the app.
 *
 * Everything the person sees comes from here: the page is told which stage it
 * is in and how far along it is, the key form interrupts the flow only when
 * there is no credential to repair with, and a completed repair hands the
 * quarantine entries back to the next boot (marked `retry`) and restarts the
 * app. A repair that cannot run or does not finish leaves the app usable
 * instead — the failure is already recorded, so nothing is lost.
 * @param win - the window to host the page.
 * @param plugins - the failed entries to repair.
 * @param clientSide - whether the failure was the page's own.
 */
async function runFixerMode(win, plugins, clientSide) {
  console.warn(`dsh-desktop: plugin failure detected — entering FixerMode for ${String(plugins.length)} plugin(s)`);
  try {
    // The page registers its listener as it loads, so the first push has to
    // wait for it — a state sent before that is simply dropped.
    await win.loadURL(fixerUrl());
  } catch (error) {
    console.warn("dsh-desktop: could not show the FixerMode page", error);
    return;
  }
  fixerState(win, { stage: "checking", progress: 6, detail: "正在读取插件错误信息" });
  await mintHarnessCookie();
  fixerState(win, { stage: "checking", progress: 10, detail: "正在检查 DeepSeek API Key" });
  if (!await deepseekKeyConfigured()) {
    fixerState(win, { stage: "apikey" });
    const submitted = await awaitFixerKey(win);
    if (submitted !== true) {
      // The window went away: nothing left to repair into.
      return;
    }
  }
  fixerState(win, { stage: "preparing", progress: 20, detail: "正在准备修复会话" });
  let sessionId;
  try {
    const selection = await fixerSelection();
    const created = await harnessRpc("session/create", { request: {} });
    sessionId = created?.sessionId;
    if (typeof sessionId !== "string") throw new Error("session/create returned no session");
    if (selection !== undefined) {
      await harnessRpc("session/selectModel", {
        request: { sessionId, provider: selection.provider, model: selection.model }
      });
    } else {
      console.warn(`dsh-desktop: no provider lists ${FIXER_MODEL}; the repair runs on the default model`);
    }
    await harnessRpc("session/prompt", {
      request: {
        requestId: randomUUID(),
        sessionId,
        mode: "queue",
        content: [{ type: "text", text: fixerPrompt(plugins) }]
      }
    });
    console.warn(`dsh-desktop: fixer prompt accepted on session ${sessionId}`);
  } catch (error) {
    console.warn("dsh-desktop: could not start the FixerMode repair", error);
    fixerState(win, { stage: "repairing", progress: 0, detail: `无法启动修复：${error instanceof Error ? error.message : String(error)}` });
    // The entry is already recorded, so the app is what is left to hand over.
    fallbackToApp(win);
    return;
  }
  fixerState(win, { stage: "repairing", progress: 30, detail: "DeepSeek Flash 正在分析并修复受损的插件" });
  const ok = await waitForRepairTurn(sessionId, (progress) => {
    fixerState(win, { stage: "repairing", progress, detail: "DeepSeek Flash 正在分析并修复受损的插件" });
  });
  const record = readQuarantine();
  for (const plugin of plugins) {
    const entry = record[plugin.id ?? plugin.name];
    // `retry` keeps the attempts count but lets the row load on the next boot,
    // so the restart is what actually proves the repair.
    if (entry !== undefined && ok) entry.retry = true;
  }
  writeQuarantine(record);
  console.warn(`dsh-desktop: FixerMode repair ${ok ? "finished" : "timed out"}${clientSide ? " (client side)" : ""}`);
  fixerState(win, { stage: "restarting", progress: 100, detail: ok ? "修复完成，正在重启并进入" : "正在重启应用" });
  await new Promise((done) => setTimeout(done, 900));
  restartIntoApp();
}

/**
 * Hand the window back to the app when the repair cannot run.
 * @param win - the window that showed FixerMode.
 */
function fallbackToApp(win) {
  if (win === undefined || win.isDestroyed() || serverUrl === undefined) return;
  void win.loadURL(serverUrl);
}

/** Relaunch the app, dropping this process and its half-repaired tree. */
function restartIntoApp() {
  if (quitting) return;
  quitting = true;
  try {
    app.relaunch();
  } catch (error) {
    console.warn("dsh-desktop: could not schedule the restart", error);
  }
  void disposeHarness().finally(() => app.exit(0));
}

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

/**
 * The launcher-owned readiness signal, the same shape `dsh`'s own launch
 * passes to `provideCmdline`. Profile HMR refuses to mount without it (it
 * wants reloads to start only after the app is actually up), and the stdio
 * entry points read it too.
 * @returns the service plus its one-shot commit.
 */
function createAppReady() {
  let ready = false;
  const listeners = new Set();
  return {
    service: {
      onReady(listener) {
        if (ready) {
          listener();
          return () => {};
        }
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      }
    },
    commit() {
      if (ready) return;
      ready = true;
      for (const listener of [...listeners]) listener();
      listeners.clear();
    }
  };
}

// ── harness boot state ───────────────────────────────────────────────────────
let ctx = undefined; // settled root context
let serverUrl = undefined; // canonical GUI URL (carries the launch token), set after boot
let serverOrigin = undefined; // bare loopback origin for in-process calls; auth rides the session cookie
let disposed = false;
let quitting = false;
/** Stops the account-state watch installed after boot. */
let stopAccountSignInWatch = () => {};
/** Monotonic id for the pill's proxied RPC envelopes. */
let rpcSeq = 0;

/**
 * Grace the harness tree gets to dispose before the app exits anyway.
 *
 * Some mounted surfaces (watchers, schedulers, the plugin market's reload
 * bridge) keep a handle alive past their disposer, so the tree can settle
 * without ever resolving. The CLI bounds the same wait and force-exits; a
 * desktop shell that did not would show a window that never closes.
 */
const DISPOSE_GRACE_MS = 5000;

/** Dispose the harness tree exactly once, with a bounded wait. */
async function disposeHarness() {
  if (disposed) return;
  disposed = true;
  stopAccountSignInWatch();
  if (ctx === undefined) return;
  try {
    const settled = await Promise.race([
      ctx.fiber.dispose().then(() => true),
      new Promise((done) => setTimeout(() => done(false), DISPOSE_GRACE_MS))
    ]);
    if (!settled) console.warn("dsh-desktop: harness dispose did not settle; exiting anyway");
  } catch (error) {
    console.error("dsh-desktop: harness dispose failed", error);
  }
}

/**
 * Compose the web profile's effective patch stack — the same layers `dsh web`
 * applies: bundle layers in `dsh.profile.bundles` order, the profile's own
 * user layer, the home-level user layer, the shipped agent-presets root, and
 * the telemetry switch.
 *
 * The 0.1.7 line resolves plugin packages at RUNTIME instead of projecting
 * junctions into the profile's `node_modules`, so the composition also carries
 * the resolution table the boot mounts (`PluginPackages`).
 */
async function composeWebProfile() {
  const DSH_ANCHOR = dshAnchor();
  const SHIPPED_PRESET_ROOT = shippedPresetRoot();
  const profile = loadProfile(BIN_NAME, PROFILE_NAME, DSH_ANCHOR);
  const resolution = await createRuntimeResolution({ installAnchor: DSH_ANCHOR, profile });
  // Rewrite the empty root config: the Loader's tree write-back can bake
  // composed rows into it, which would duplicate bundle inserts on next boot.
  writeFileSync(join(profile.dir, PROFILE_ROOT_FILENAME), PROFILE_ROOT_CONFIG);
  const homePatches = loadOptionalPatches(BIN_NAME, join(resolveDshHome(), PROFILE_PATCH_FILENAME)) ?? [];
  const bundlePatches = profile.layers.flatMap((layer) => layer.patches);
  const pluginDirs = deploymentPluginDirs();
  sanitizeMarketRows(bundlePatches, pluginDirs);
  sanitizeMarketRows(profile.patches, pluginDirs);
  sanitizeMarketRows(homePatches, pluginDirs);
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
  // Quarantined plugins are switched off by an id-targeted overlay rather than
  // edited out of the profile: the market keeps owning its row, the record stays
  // the single source of truth for why the plugin is off, and re-enabling one is
  // clearing a line in that record instead of repairing a patch layer. A record
  // key is a row id when the host tree reported the failure and a package name
  // when the page did, so both are resolved here; matching on the composed rows
  // keeps a key for a plugin this deployment no longer mounts from emitting an
  // overlay of its own.
  for (const [key, entry] of Object.entries(readQuarantine())) {
    // A `retry` entry is one FixerMode handed back after a repair: the next boot
    // has to load it to prove the fix, so it is deliberately not switched off.
    if (entry?.retry === true) continue;
    for (const row of rows.values()) {
      if (row.id !== key && row.name !== key && !String(row.name).startsWith(`${key}/`)) continue;
      overlays.push({ id: row.id, disabled: true });
    }
  }
  // Launcher-owned profile locations, the same shape the CLI provides: the
  // plugin manager writes bundle rows through it, and rows that differ by
  // surface read it (the built-in sidebar browser is a Web-vs-Electron switch).
  const profileContext = {
    name: PROFILE_NAME,
    dir: profile.dir,
    patchPath: profile.patchPath,
    installAnchor: DSH_ANCHOR,
    startedBundles: profile.layers.map((layer) => layer.packageName),
    cwd: process.cwd(),
    home: resolveDshHome(),
    overlays,
    telemetryDisabledEnv: process.env.DSH_TELEMETRY_DISABLED
  };
  return {
    profile,
    profileContext,
    resolution,
    patches: [...bundlePatches, ...profile.patches, ...homePatches, ...overlays]
  };
}

/**
 * Boot the web profile. Passes `--port 0` so the OS assigns a free loopback
 * port; the actual port is read back from the bound webserver service.
 * @returns the canonical local URL of the GUI.
 */
async function bootHarness() {
  const { profile, profileContext, resolution, patches } = await composeWebProfile();
  const rootConfig = join(profile.dir, PROFILE_ROOT_FILENAME);
  const appReady = createAppReady();
  ctx = await boot(BIN_NAME, rootConfig, patches, async (hostCtx) => {
    hostCtx.provide("profileContext", profileContext);
    hostCtx.provide(DSH_LAUNCH_ENVIRONMENT_KEY, loadLayeredEnv(BIN_NAME));
    // Install the runtime package resolution BEFORE the Loader mounts a row:
    // it is what makes the profile's bare specifiers resolve without the
    // junction projections the 0.1.5 line used to write into the profile.
    await hostCtx.plugin(PluginPackages, { resolution });
    provideCmdline(hostCtx, {
      args: ["--port", "0", "--no-open"],
      exit: (code) => {
        void disposeHarness().finally(() => app.exit(code));
      },
      ready: appReady.service
    });
  });
  // The tree settled: profile HMR's reload watcher may now start.
  if (ctx.fiber.state === 2 && ctx.get("loader") !== undefined) appReady.commit();
  const port = ctx.get("webServer")?.port;
  if (port === undefined) throw new Error("dsh-desktop: webServer service did not bind a port");
  const localUrl = `http://${LOOPBACK}:${String(port)}/`;
  // The web surface requires its process-token URL; hand the shell the same
  // authenticated form `dsh web` prints instead of the bare loopback origin.
  const connection = ctx.get("connection");
  serverOrigin = localUrl;
  return connection === undefined ? localUrl : connection.authenticatedUrl(localUrl);
}

/**
 * Hand every new sign-in URL to the system browser.
 *
 * The account provider registers its loopback callback and waits: it publishes
 * the authorize URL on the attempt and lets the hosting surface open it — the
 * sign-in dialog's copy ("Page did not open automatically?") names that
 * expectation. Inside this shell nothing else can: a `window.open` from the
 * served GUI counts as foreign navigation and is denied, so the watch lives
 * here and opens each attempt once.
 * @returns the disposer ending the watch.
 */
function watchAccountSignIn() {
  const account = ctx?.get("deepseekAccount", false);
  if (account === undefined || typeof account.watch !== "function") return () => {};
  const lifetime = new AbortController();
  void (async () => {
    let opened;
    try {
      for await (const state of account.watch(lifetime.signal)) {
        const attempt = state?.attempt;
        if (attempt?.phase !== "waiting-browser") continue;
        if (typeof attempt.authorizeUrl !== "string" || opened === attempt.id) continue;
        opened = attempt.id;
        try {
          await shell.openExternal(attempt.authorizeUrl);
        } catch (error) {
          console.warn("dsh-desktop: failed to open the sign-in page", error);
        }
      }
    } catch {
      /* an aborted or closed attempt stream is the normal end of the watch */
    }
  })();
  return () => {
    lifetime.abort();
  };
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

/** The window that hosts the served app — never the quick-chat pill. */
function appWindow() {
  return BrowserWindow.getAllWindows().find((window) => !window.isDestroyed() && window !== quickChatWindow);
}

/**
 * Point a window at one session.
 *
 * The SPA restores its selection from this localStorage key on load, so the key
 * has to be written before the page that reads it — a write into an already
 * loaded page would only take effect at its next load, which is why this reloads.
 * @param win - the window to move.
 * @param sessionId - the session it should show.
 */
async function selectSession(win, sessionId) {
  const script =
    `localStorage.setItem("dsh.sessions.current", ${JSON.stringify(JSON.stringify({ sessionId }))}); ` +
    `if (!location.pathname.startsWith("/")) location.href = "/"; "ok"`;
  if (win.webContents.isLoading()) {
    win.webContents.once("did-finish-load", () => {
      void win.webContents.executeJavaScript(script).catch(() => {});
      win.webContents.reload();
    });
    return;
  }
  await win.webContents.executeJavaScript(script).catch(() => {});
  win.webContents.reload();
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
  const main = appWindow();
  if (main === undefined || main.isDestroyed()) return;
  const start = quickChatWindow !== undefined && !quickChatWindow.isDestroyed()
    ? quickChatWindow.getBounds()
    : undefined;
  const target = main.getNormalBounds();

  // Persist the target session so the SPA restores it on boot. If the page is
  // still loading, apply the selection right after it finishes (then reload).
  await selectSession(main, sessionId);

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
/** Minimum airing for the launch splash. It goes up before the harness boots, so
 *  this is a floor rather than a delay: a slow boot keeps it on screen past this. */
const SPLASH_MIN_MS = 2600;
let splashStartedAt = 0;

function splashUrl() {
  return pathToFileURL(fileURLToPath(new URL("./splash.html", import.meta.url))).href;
}

function commuteUrl() {
  return pathToFileURL(fileURLToPath(new URL("./commute.html", import.meta.url))).href;
}

/** The repair page: a standalone file:// document, like the splash. */
function fixerUrl() {
  return pathToFileURL(fileURLToPath(new URL("./fixer.html", import.meta.url))).href;
}

/**
 * Swap the splash for the served app. The splash is already on screen, so this
 * only waits out whatever is left of its minimum airing — the harness boot it
 * ran alongside has usually covered that in full.
 * @param win - the main window currently showing the splash.
 * @param url - canonical GUI URL.
 */
function revealApp(win, url) {
  const remaining = Math.max(0, SPLASH_MIN_MS - (Date.now() - splashStartedAt));
  const swap = () => {
    if (win.isDestroyed()) return;
    void win.loadURL(url);
  };
  if (remaining === 0) swap();
  else setTimeout(swap, remaining);
}

/**
 * Resolve once the window's first frame has been handed to the compositor. The
 * harness boot below runs on this same process and blocks its event loop for
 * seconds, so the show request has to be dealt with first — otherwise the splash
 * only reaches the screen once the boot has already finished. Capped so a
 * renderer that never paints cannot hold the launch hostage.
 * @param win - the window whose first paint to wait for.
 * @param timeoutMs - upper bound on the wait.
 * @returns a promise settling with the paint or the timeout, whichever is first.
 */
function firstPaint(win, timeoutMs = 4000) {
  return new Promise((done) => {
    const finish = () => {
      clearTimeout(timer);
      done();
    };
    const timer = setTimeout(finish, timeoutMs);
    if (win.isDestroyed()) finish();
    else win.once("ready-to-show", finish);
  });
}

/**
 * @param url - app URL to load straight away (the harness is already up);
 *   omitted on launch, where the splash goes first and revealApp() swaps it out.
 * @param startHidden - auto-launch instance: the window is never shown.
 */
function createMainWindow({ url, startHidden = false } = {}) {
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
    backgroundColor: "#0a0c10",
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

  if (url !== undefined) {
    // Re-activation with the tree already up: nothing to wait for.
    void win.loadURL(url);
    win.once("ready-to-show", () => win.show());
  } else if (!startHidden) {
    // The splash goes up NOW, before the harness boots. Booting the cordis tree
    // is the slow part of launch, and holding the wordmark back until it settled
    // left the user looking at nothing for the whole of it. `revealApp` swaps the
    // app in once the tree is up.
    splashStartedAt = Date.now();
    void win.loadURL(splashUrl());
    win.once("ready-to-show", () => win.show());
  }

  // Re-apply persisted UI state every time the app page (re)loads: the zoom
  // level, and one migration — the window pin is gone, so an installation that
  // had it on is released once instead of staying pinned with no way back.
  win.webContents.on("did-finish-load", () => {
    if (win.isDestroyed() || !win.webContents.getURL().startsWith(serverOrigin ?? serverUrl)) return;
    void readDesktopSettings().then((settings) => {
      if (win.isDestroyed()) return;
      const zoom = typeof settings.zoomFactor === "number" ? settings.zoomFactor : 1;
      if (zoom !== 1) {
        try { win.webContents.setZoomFactor(Math.min(1.8, Math.max(0.6, zoom))); } catch { /* non-fatal */ }
      }
      if (settings.alwaysOnTop === true) win.setAlwaysOnTop(false);
    });
  });

  // The one statement a client-side plugin failure ever makes: the page's own
  // boot audit logs its report just before it draws the failure page, and the
  // host tree never hears about it — a bundle that loads without registering its
  // own id leaves every host entry healthy. Reading it here is what puts that
  // failure on the same footing as a host one: recorded, switched off for the
  // next boot, and handed to the agent. The roster is fixed for the page's
  // lifetime, so the first report is the whole story for this process and the
  // reload that follows a repair cannot ask for a second one.
  let clientReported = false;
  win.webContents.on("console-message", (details) => {
    if (clientReported || ctx === undefined) return;
    const failures = attributeClientFailures(ctx, clientBootFailures(details?.message ?? ""));
    if (failures.length === 0) return;
    clientReported = true;
    void quarantineAndRepair(ctx, failures, true);
  });

  // In-app shortcuts: Ctrl+= / Ctrl+- / Ctrl+0 zoom.
  win.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown") return;
    const key = (input.key ?? "").toLowerCase();
    const mod = input.control || input.meta;
    if (!mod) return;
    if (key === "=" || key === "+") {
      event.preventDefault();
      void applyZoom(win, 0.1);
    } else if (key === "-") {
      event.preventDefault();
      void applyZoom(win, -0.1);
    } else if (key === "0" && !input.alt && !input.shift) {
      event.preventDefault();
      void applyZoom(win, "reset");
    }
  });

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
    if (url.startsWith(serverOrigin ?? serverUrl)) return;
    event.preventDefault();
    if (url.startsWith("http://") || url.startsWith("https://")) void shell.openExternal(url);
  });

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
/** Cached desktop settings so event handlers (sounds, boss key) read them sync. */
let desktopCache = {};

// ── UI zoom (Ctrl+= / Ctrl+- / Ctrl+0, persisted) ────────────────────────────
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 1.8;

/** Apply a zoom step (+/-0.1) or "reset", persist it, and set it on the window. */
async function applyZoom(win, delta) {
  if (win === undefined || win.isDestroyed()) return;
  const settings = await readDesktopSettings();
  const current = typeof settings.zoomFactor === "number" ? settings.zoomFactor : 1;
  const next = delta === "reset"
    ? 1
    : Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round((current + delta) * 100) / 100));
  if (next !== current) await writeDesktopSettings({ zoomFactor: next });
  try { win.webContents.setZoomFactor(next); } catch { /* non-fatal */ }
}

// ── boss key (Ctrl+Alt+B: instantly hide everything) ─────────────────────────
/** Toggle the boss-key hide: with tray → hide to tray; without → minimize. */
function bossKeyToggle() {
  const win = BrowserWindow.getAllWindows().find((w) => w !== quickChatWindow && !w.isDestroyed());
  hidePillWindow();
  if (win === undefined) return;
  if (!win.isVisible() && !win.isMinimized()) {
    win.show();
    win.focus();
    return;
  }
  if (tray !== undefined) win.hide();
  else win.minimize();
}

// ── UI sounds (task done / error / message), generated with WebAudio ─────────
/** Tiny WebAudio snippets played inside the main window — no asset files. */
const UI_SOUNDS = {
  done:
    "(function(){var c=new (window.AudioContext||window.webkitAudioContext)();var t=c.currentTime;" +
    "[[880,0,.1],[1318.5,.12,.18]].forEach(function(p){var f=p[0],o=p[1],d=p[2];var s=c.createOscillator(),g=c.createGain();" +
    "s.type='sine';s.frequency.value=f;g.gain.setValueAtTime(0.0001,t+o);g.gain.exponentialRampToValueAtTime(0.16,t+o+0.015);" +
    "g.gain.exponentialRampToValueAtTime(0.0001,t+o+d);s.connect(g);g.connect(c.destination);s.start(t+o);s.stop(t+o+d+0.05);});" +
    "setTimeout(function(){c.close();},700);})()",
  error:
    "(function(){var c=new (window.AudioContext||window.webkitAudioContext)();var t=c.currentTime;" +
    "var s=c.createOscillator(),g=c.createGain();s.type='square';s.frequency.setValueAtTime(330,t);s.frequency.exponentialRampToValueAtTime(165,t+0.22);" +
    "g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.08,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+0.26);" +
    "s.connect(g);g.connect(c.destination);s.start(t);s.stop(t+0.3);setTimeout(function(){c.close();},600);})()",
  message:
    "(function(){var c=new (window.AudioContext||window.webkitAudioContext)();var t=c.currentTime;" +
    "var s=c.createOscillator(),g=c.createGain();s.type='sine';s.frequency.setValueAtTime(659,t);s.frequency.setValueAtTime(880,t+0.09);" +
    "g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.12,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+0.2);" +
    "s.connect(g);g.connect(c.destination);s.start(t);s.stop(t+0.24);setTimeout(function(){c.close();},500);})()"
};

/** Play a UI sound in the main window (no-op when sounds are disabled). */
function playUiSound(kind) {
  if (desktopCache.sounds === false) return;
  const code = UI_SOUNDS[kind];
  if (code === undefined) return;
  const win = BrowserWindow.getAllWindows().find((w) => w !== quickChatWindow && !w.isDestroyed());
  if (win === undefined || win.webContents.isLoading()) return;
  win.webContents.executeJavaScript(code, true).catch(() => { /* audio may be unavailable */ });
}

/** Map a notify payload to a sound kind, or undefined for silence. */
function soundForNotify(payload) {
  if (typeof payload?.sound === "string" && UI_SOUNDS[payload.sound] !== undefined) return payload.sound;
  const title = String(payload?.title ?? "");
  if (/失败|错误|error|failed/i.test(title)) return "error";
  if (/完成|成功|done|complete|success/i.test(title)) return "done";
  if (/消息|回复|message|reply/i.test(title)) return "message";
  return undefined;
}

// ── clipboard history (polling watcher, last 50 text entries) ────────────────
let clipboardHistory = [];
let lastClipboardText = "";

/** Start the clipboard watcher; records text copies into a 50-entry history. */
function startClipboardWatcher() {
  setInterval(() => {
    let text;
    try {
      text = clipboard.readText();
    } catch {
      return;
    }
    if (!text || text === lastClipboardText || text.length > 8000) return;
    lastClipboardText = text;
    clipboardHistory = [
      { id: randomUUID(), text, at: Date.now() },
      ...clipboardHistory.filter((entry) => entry.text !== text)
    ].slice(0, 50);
  }, 1500);
}

/**
 * Apply the desktop settings to the running app: create/destroy the system
 * tray (which also enables hide-to-tray on close), toggle launch-at-login, and
 * (re)register the global hotkey that summons the main window.
 * @param win - the main BrowserWindow (may be undefined before creation).
 * @param settings - partial desktop settings object.
 */
function applyDesktopSettings(win, settings) {
  desktopCache = { ...desktopCache, ...settings };
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

  app.setLoginItemSettings({
    openAtLogin: settings.autoLaunch === true,
    // Silent start passes --hidden so the auto-launched instance stays in tray.
    args: settings.silentStart === true ? ["--hidden"] : []
  });

  // Boss key Ctrl+Alt+B: instantly hide the app (toggle). Default on.
  if (settings.bossKey !== false && !globalShortcut.isRegistered("Control+Alt+B")) {
    globalShortcut.register("Control+Alt+B", bossKeyToggle);
  } else if (settings.bossKey === false && globalShortcut.isRegistered("Control+Alt+B")) {
    globalShortcut.unregister("Control+Alt+B");
  }

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
/** Concurrent range-request threads for the installer download (adaptive, soft cap). */
const UPDATE_THREADS = 16;

/**
 * Default GitHub acceleration mirrors (URL-prefix proxies). The official
 * release CDN is throttled to tens of KB/s from many regions; these mirrors
 * prefix the original `https://github.com/...` asset URL and can reach several
 * MB/s. The download engine probes every candidate and picks the fastest. They
 * are third-party proxies — only used for public installer downloads. Users can
 * override this list from the updater settings (persisted to mirrors.json).
 */
const DEFAULT_UPDATE_MIRRORS = [
  "https://ghproxy.net/",
  "https://gh-proxy.com/",
  "https://ghfast.top/",
  "https://github.moeyy.xyz/",
  "https://ghproxy.cn/",
  "https://gh.llkk.cc/"
];

/** Persisted mirror configuration lives beside the downloaded installers. */
function mirrorsConfigPath() {
  return join(app.getPath("userData"), "updates", "mirrors.json");
}

/**
 * Read the user's mirror list. Returns `undefined` when the user never
 * customized it (callers fall back to DEFAULT_UPDATE_MIRRORS).
 */
async function readMirrorConfig() {
  try {
    const raw = await readFile(mirrorsConfigPath(), "utf8");
    const data = JSON.parse(raw);
    if (Array.isArray(data.mirrors)) {
      const list = data.mirrors.filter((m) => typeof m === "string" && m.trim() !== "").map((m) => m.trim());
      if (list.length > 0) return list;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Build the candidate URL list for an official github.com asset URL: the
 * official link first, then the user-configured (or default) mirrors.
 */
async function buildSources(original) {
  if (typeof original !== "string" || !original.startsWith("https://github.com/")) return [original];
  const user = await readMirrorConfig();
  const mirrors = user ?? DEFAULT_UPDATE_MIRRORS;
  const candidates = [original];
  for (const mirror of mirrors) {
    const base = mirror.replace(/\/+$/, "") + "/";
    candidates.push(base + original.replace(/^\/+/, ""));
  }
  return candidates;
}

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
  // FixerMode's key form: store the secret, then release the repair that is
  // waiting on it. The value never leaves this process again.
  ipcMain.handle("dsh:fixer-key", async (_event, key) => {
    if (typeof key !== "string") return { ok: false, error: "API Key 格式不正确" };
    const result = await storeFixerKey(key);
    if (result.ok === true) {
      const release = fixerKeyWaiter;
      fixerKeyWaiter = undefined;
      if (typeof release === "function") release(true);
    }
    return result;
  });
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
  // Clipboard history (last 50 text copies) for the Ctrl+Shift+V picker.
  ipcMain.handle("dsh:clipboard-history-get", () => clipboardHistory);
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
      const sources = await buildSources(payload.url);
      await downloadWithThreads(payload.url, dest, UPDATE_THREADS, report, proxyFetch, { sources });
      return { ok: true, filePath: dest };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
  // Updater: read the user's mirror-source list (customized or defaults).
  ipcMain.handle("dsh:update-mirrors-get", async () => {
    const user = await readMirrorConfig();
    return { mirrors: user ?? DEFAULT_UPDATE_MIRRORS, customized: user !== undefined };
  });
  // Updater: persist the user's mirror-source list.
  ipcMain.handle("dsh:update-mirrors-set", async (_event, list) => {
    const mirrors = Array.isArray(list)
      ? list.filter((m) => typeof m === "string" && m.trim() !== "").map((m) => m.trim())
      : [];
    const dir = join(app.getPath("userData"), "updates");
    await mkdir(dir, { recursive: true });
    await writeFile(mirrorsConfigPath(), JSON.stringify({ mirrors }, null, 2), "utf8");
    return { mirrors, customized: true };
  });
  // Updater: clear the custom list and fall back to the built-in defaults.
  ipcMain.handle("dsh:update-mirrors-reset", async () => {
    try {
      await unlink(mirrorsConfigPath());
    } catch { /* not customized yet */ }
    return { mirrors: DEFAULT_UPDATE_MIRRORS, customized: false };
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
  // harness is CORS-blocked. Chromium's `net.fetch` runs in the default session,
  // which carries the cookie the app page minted from its launch-token URL — so
  // the bare origin authenticates where a Node fetch could not.
  ipcMain.handle("dsh:quickchat-rpc", async (_event, req) => {
    const method = req && typeof req.method === "string" ? req.method : undefined;
    if (method === undefined || serverOrigin === undefined) throw new Error("rpc unavailable");
    const res = await net.fetch(serverOrigin + "api/" + method, {
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

  // Renderer permissions: notifications and clipboard for the served GUI, plus
  // the microphone the voice input records from.
  //
  // Chromium asks this handler before it opens any capture device, so a
  // permission missing from the list is refused outright and the renderer only
  // ever sees NotAllowedError — which is what the voice input reports as
  // "Microphone access is disabled. Allow it in browser and system settings."
  // The microphone carries that recording; the camera has no use here, so video
  // requests stay denied.
  app.whenReady().then(async () => {
    session.defaultSession.setPermissionRequestHandler((_wc, permission, callback, details) => {
      if (permission === "media") {
        const types = details?.mediaTypes ?? [];
        callback(types.length > 0 && types.every((type) => type === "audio"));
        return;
      }
      callback(["notifications", "clipboard-sanitized-write", "clipboard-read", "fullscreen"].includes(permission));
    });

    let win;
    try {
      // Install the same fail-loud guard the CLI installs: a late unhandled
      // rejection becomes one labelled diagnostic, tree dispose, and exit(1).
      installFailLoud(BIN_NAME, process, () => disposeHarness());
      // Silent start: the auto-launched instance boots straight into the app
      // without a window (the tray, forced on below, is the way back in).
      const startHidden = process.argv.includes("--hidden");
      // The window — and with it the splash — comes up first: booting the tree
      // below is the slow half of launch, and it used to run with a blank screen.
      win = createMainWindow({ startHidden });
      // …and it has to be on screen before that boot takes the event loop, or the
      // paint request waits behind it and the splash arrives only at the end.
      if (!startHidden) await firstPaint(win);
      serverUrl = await bootHarness();
      stopAccountSignInWatch = watchAccountSignIn();
      // A plugin that failed to load is a warning, not a stop — the app is up and
      // usable without it. The failure is recorded first, so the broken entry is
      // switched off on the next boot whatever happens below, and then FixerMode
      // takes the window over: it collects the API key when there is none, lets
      // deepseek-flash repair the plugin, and restarts straight into the app.
      // A silent start has no window to show, so it only records.
      const hostFailures = ctx === undefined ? [] : await inactivePlugins(ctx);
      if (hostFailures.length !== 0) await quarantineAndRepair(ctx, hostFailures, false, !startHidden);
      if (startHidden) void win.loadURL(serverUrl);
      else revealApp(win, serverUrl);
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
    // Apply persisted desktop settings (tray / auto-launch / global hotkey /
    // boss key / zoom / sounds). A silent start implies the tray.
    const initialSettings = await readDesktopSettings();
    if (process.argv.includes("--hidden") && initialSettings.tray !== true) initialSettings.tray = true;
    applyDesktopSettings(win, initialSettings);
    // Clipboard history watcher (Ctrl+Shift+V picker reads it).
    startClipboardWatcher();
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
    // native Windows notifications, plus a matching UI sound when enabled.
    if (ctx !== undefined) {
      ctx.on("dsh/notify", (payload) => {
        const title = typeof payload?.title === "string" ? payload.title : "DeepSeek Harness";
        const body = typeof payload?.body === "string" ? payload.body : "";
        if (Notification.isSupported()) {
          try {
            new Notification({ title, body, silent: false }).show();
          } catch (error) {
            console.warn("dsh-desktop: failed to show notification", error);
          }
        }
        const sound = soundForNotify(payload);
        if (sound !== undefined) playUiSound(sound);
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
      if (port !== undefined) createMainWindow({ url: `http://${LOOPBACK}:${String(port)}/` });
    }
  });
}

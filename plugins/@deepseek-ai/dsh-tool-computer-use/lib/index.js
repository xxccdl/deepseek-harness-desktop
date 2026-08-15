// DeepSeek Harness computer-use plugin.
//
// Gives the model the ability to control the Windows desktop through
// Windows-MCP (mouse, keyboard, apps, screenshots, files, clipboard, ...).
// The runtime is self-contained: a `uv` binary shipped inside the app
// provisions an ISOLATED Python runtime under `$DSH_HOME/runtime` (never the
// system Python), rebuilds the Windows-MCP venv only when missing or when the
// provisioning recipe changed, and then mounts an `@deepseek-ai/dsh-mcp-client`
// instance whose tools surface as `mcp__windows__*`. No user Python/uv
// installation is required.
//
// Configuration is driven by the `computer-use` settings namespace (enabled /
// pythonVersion / package / autoRemind), so the desktop settings surface can
// edit it live; the same settings change rebuilds the venv when the recipe
// changes. A small `/api/computer-use` route reports runtime status and can
// force a rebuild.
//
// @module @deepseek-ai/dsh-tool-computer-use
import { existsSync, readFileSync } from "node:fs";
import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import z from "@deepseek-ai/schemastery";
import { settingsNamespace } from "@deepseek-ai/dsh-settings";

/** Cordis plugin name. */
const name = "tool-computer-use";
/** Required services: the loader (to mount the MCP client), the settings registry. */
const inject = ["loader", "settings"];

/** Default Python managed by uv for the Windows-MCP venv. */
const DEFAULT_PYTHON_VERSION = "3.13";
/** Default PyPI package providing the `windows-mcp` CLI. */
const DEFAULT_PACKAGE = "windows-mcp";
/** MCP server name (tools appear as `mcp__windows__<tool>`). */
const MCP_SERVER_NAME = "windows";
/** Loader entry id for the dynamically mounted MCP client. */
const MCP_ENTRY_ID = "mcp-windows";
/** venv directory name under $DSH_HOME/runtime. */
const VENV_DIR_NAME = "windows-mcp-venv";
/** Marker file inside the venv recording which provisioning recipe built it. */
const MARKER_FILENAME = ".dsh-provisioned";
/**
 * Provisioning recipe prefix. The full recipe is
 * `${PROVISION_RECIPE}|${pythonVersion}|${package}`, so a settings change to
 * either value rebuilds the venv exactly once; bump the prefix whenever the
 * install recipe itself changes.
 */
const PROVISION_RECIPE = "windows-mcp";
/** Settings namespace owned by the computer-use plugin. */
const COMPUTER_USE_SETTINGS_NS = settingsNamespace("computer-use");
/** Durable computer-use settings; the harness Settings document edits it. */
const ComputerUseSettingsSchema = z.object({
  /** Master switch: when false, no MCP runtime, skill, or reminder is mounted. */
  enabled: z.boolean().default(true),
  /** Python version managed by uv for the Windows-MCP venv. */
  pythonVersion: z.string().default(DEFAULT_PYTHON_VERSION),
  /** PyPI package providing the `windows-mcp` CLI. */
  package: z.string().default(DEFAULT_PACKAGE),
  /** Mount the persistent `computer-use:capability` system-prompt reminder. */
  autoRemind: z.boolean().default(true)
});

/**
 * Locate the bundled `uv` binary. Dev runs resolve it from the repo's
 * resources directory; packaged runs from `process.resourcesPath` (the
 * `resources/runtime/**` files are unpacked beside the asar).
 * @returns the absolute uv executable path, or undefined when absent.
 */
function bundledUvPath() {
  // Packaged: resources/runtime/** is asarUnpack'ed, so it lives under
  // resources/app.asar.unpacked/resources/runtime/... (same layout as node_modules).
  const packaged = process.resourcesPath !== undefined
    ? join(process.resourcesPath, "app.asar.unpacked", "resources", "runtime", "uv", "uv.exe")
    : undefined;
  if (packaged !== undefined && existsSync(packaged)) return packaged;
  // Dev: repo resources directory beside node_modules.
  const dev = fileURLToPath(new URL("../../../../resources/runtime/uv/uv.exe", import.meta.url));
  return existsSync(dev) ? dev : undefined;
}

/** Run uv to completion; stdout/stderr go to the harness console. */
function runUv(uv, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(uv, args, {
      env,
      windowsHide: true,
      stdio: ["ignore", "inherit", "inherit"]
    });
    child.on("error", (error) => reject(error));
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`uv ${args[0]} exited with code ${code}`));
    });
  });
}

/**
 * Provision the isolated Windows-MCP runtime. The venv is REBUILT only when it
 * is missing, corrupt, or built by a different provisioning recipe (which
 * includes a pythonVersion/package settings change) — and is then reused on
 * every later boot (no per-start rebuild). All state lives under
 * $DSH_HOME/runtime, never touching system Python.
 * @param ctx - cordis context (for `dshHomePath` and logging).
 * @param uv - bundled uv executable path.
 * @param config - provisioning config (python version / package).
 * @returns the venv directory, ready to serve.
 */
async function provisionWindowsMcp(ctx, uv, config) {
  const recipe = `${PROVISION_RECIPE}|${config.pythonVersion}|${config.package}`;
  const runtime = ctx.dshHomePath("runtime");
  const pythonDir = join(runtime, "python");
  const cacheDir = join(runtime, "uv-cache");
  const venvDir = join(runtime, VENV_DIR_NAME);
  const serverExe = join(venvDir, "Scripts", "windows-mcp.exe");
  const markerPath = join(venvDir, MARKER_FILENAME);
  const env = {
    ...process.env,
    UV_PYTHON_INSTALL_DIR: pythonDir,
    UV_CACHE_DIR: cacheDir,
    UV_NO_PROGRESS: "1",
    UV_NO_WRAP: "1",
    UV_LINK_MODE: "copy"
  };
  // Reuse a valid venv: the server binary exists and the recipe marker matches.
  let ready = existsSync(serverExe);
  if (ready) {
    try {
      ready = readFileSync(markerPath, "utf8") === recipe;
    } catch {
      ready = false;
    }
  }
  if (ready) return { venvDir, env };
  ctx.logger.info(`computer-use: (re)building Windows-MCP venv (recipe ${recipe})`);
  await runUv(uv, ["python", "install", config.pythonVersion], env);
  await rm(venvDir, { recursive: true, force: true });
  await runUv(uv, ["venv", "--python", config.pythonVersion, venvDir], env);
  await runUv(uv, ["pip", "install", "--python", join(venvDir, "Scripts", "python.exe"), config.package], env);
  await writeFile(markerPath, recipe, "utf8");
  return { venvDir, env };
}

// ── skill ─────────────────────────────────────────────────────────────────────
const computerUseSkill = {
  name: "computer-use",
  description: "Control the Windows desktop directly: mouse, keyboard, shortcuts, open/manage apps and windows, screenshots, file and clipboard operations, processes.",
  whenToUse: "Use when the user asks you to operate the computer itself — click, type, press shortcuts, open an app, take a screenshot, inspect the screen, manage windows or processes.",
  source: "custom",
  content: [
    "# Computer Use",
    "",
    "You can control this Windows machine through Windows-MCP. Its tools are exposed under the `mcp__windows__` namespace (e.g. `mcp__windows__click`, `mcp__windows__type`, `mcp__windows__screenshot`, `mcp__windows__app`, `mcp__windows__shortcut`, `mcp__windows__powershell`, `mcp__windows__file`, `mcp__windows__clipboard`, `mcp__windows__process`, `mcp__windows__snapshot`).",
    "",
    "## Workflow",
    "- Before acting on a screen you have not seen, capture context first: `mcp__windows__screenshot` (visual) and/or `mcp__windows__snapshot` (structured UI elements with coordinates).",
    "- Click by element label when available; otherwise use coordinates from the screenshot/snapshot.",
    "- Type text with `mcp__windows__type`; press shortcuts with `mcp__windows__shortcut` (e.g. `ctrl`, `s`).",
    "- Launch or switch apps with `mcp__windows__app`; manage windows with its resize/switch modes.",
    "- Use `mcp__windows__powershell` for shell/system operations, `mcp__windows__process` for processes, `mcp__windows__file` for filesystem actions, `mcp__windows__clipboard` for clipboard read/write.",
    "- After an action, verify with a screenshot or snapshot before reporting success.",
    "",
    "## Safety",
    "- These tools act as the current Windows user with full permissions — operate only what the user asked for.",
    "- Never type secrets or credentials into prompts or dialogs unless explicitly requested.",
    "- Prefer non-destructive operations; confirm before deleting, overwriting, or terminating processes."
  ].join("\n")
};

const COMPUTER_USE_PROMPT_SECTION = {
  name: "computer-use:capability",
  order: -88,
  text: "【电脑控制】你已可控制本机 Windows 桌面（Windows-MCP，工具前缀 mcp__windows__）：点击、输入、快捷键、打开/管理应用与窗口、截图、文件与剪贴板、进程。操作前先截图/snapshot 确认屏幕，操作后截图核验；只做用户要求的操作。"
};

// ── HTTP status (settings viewer) ────────────────────────────────────────────
// A read-only status endpoint for the desktop settings surface, plus a POST
// that forces a rebuild of the isolated runtime (the next mount runs on the
// current settings). Registered on the optional `webServer` service.
const COMPUTER_USE_HTTP_PATH = "/api/computer-use";

// ── plugin ────────────────────────────────────────────────────────────────────
/**
 * Mount / unmount the computer-use runtime from the `computer-use` settings
 * namespace, reactively. Changing `enabled`, `pythonVersion`, or `package`
 * tears down the old MCP client and reprovisions (recipe change rebuilds the
 * venv exactly once); `autoRemind` toggles the prompt reminder. A generation
 * counter keeps a slower earlier configuration from clobbering a newer one.
 * @param ctx - registrant context carrying the loader, skill, and prompt registries.
 */
function apply(ctx) {
  let currentConfig = {};
  let mountGen = 0;
  let mounted = null;
  let chain = Promise.resolve();
  // Ring buffer of runtime events, served to the settings viewer via
  // /api/computer-use/logs.
  const MAX_LOG = 200;
  const logBuffer = [];
  const log = (level, message) => {
    const entry = { time: new Date().toISOString(), level, message };
    logBuffer.push(entry);
    if (logBuffer.length > MAX_LOG) logBuffer.shift();
  };
  const runSerial = (fn) => {
    chain = chain.then(fn, fn);
    return chain;
  };

  const teardown = async () => {
    mountGen += 1;
    const current = mounted;
    mounted = null;
    if (current === undefined || current === null) return;
    log("info", "computer-use: runtime torn down");
    for (const dispose of current.cleanup) {
      try { dispose(); } catch { /* best-effort */ }
    }
    if (current.mcpEntryId !== undefined) await ctx.loader.remove(current.mcpEntryId).catch(() => {});
  };

  const start = async (config) => {
    const gen = ++mountGen;
    const cleanup = [];
    const record = { cleanup, config, status: "provisioning", startedAt: new Date().toISOString() };
    mounted = record;
    try {
      const uv = bundledUvPath();
      if (uv === undefined) {
        ctx.logger.warn("computer-use: bundled uv not found; computer-use is unavailable");
        log("error", "bundled uv not found; computer-use is unavailable");
        if (gen === mountGen) { record.status = "error"; record.error = "bundled uv not found"; }
        return;
      }
      log("info", `provisioning Windows-MCP venv (python ${config.pythonVersion}, package ${config.package})`);
      const { venvDir } = await provisionWindowsMcp(ctx, uv, {
        pythonVersion: config.pythonVersion,
        package: config.package
      });
      if (gen !== mountGen) return;
      log("info", `venv ready at ${venvDir}`);
      const command = join(venvDir, "Scripts", "windows-mcp.exe");
      const mcpEntryId = await ctx.loader.create({
        id: MCP_ENTRY_ID,
        name: "@deepseek-ai/dsh-mcp-client",
        config: {
          serverName: MCP_SERVER_NAME,
          transport: "stdio",
          command,
          args: ["serve"],
          env: {
            // The venv python is selected by the entry-point shebang; clear any
            // stray Python environment that could point at a system interpreter.
            PYTHONNOUSERSITE: "1",
            ...(process.env.PYTHONHOME !== undefined ? { PYTHONHOME: "" } : {}),
            ...(process.env.PYTHONPATH !== undefined ? { PYTHONPATH: "" } : {})
          },
          failOnStartupError: false,
          reconnect: { enabled: true, initialDelayMs: 2000, maxDelayMs: 30000, maxAttempts: 20 }
        }
      });
      if (gen !== mountGen) { await ctx.loader.remove(mcpEntryId).catch(() => {}); return; }
      const skills = ctx.get("skills");
      const systemPrompt = ctx.get("systemPrompt");
      cleanup.push(skills.register(computerUseSkill));
      if (config.autoRemind) cleanup.push(systemPrompt.section(COMPUTER_USE_PROMPT_SECTION));
      record.mcpEntryId = mcpEntryId;
      record.venvDir = venvDir;
      record.status = "ready";
      log("info", `Windows-MCP ready — tools appear as ${MCP_SERVER_NAME}__*`);
      ctx.logger.info(`computer-use: Windows-MCP ready (${command}) — tools appear as ${MCP_SERVER_NAME}__*`);
    } catch (error) {
      ctx.logger.error(`computer-use: provisioning failed: ${error instanceof Error ? error.stack ?? error.message : String(error)}`);
      log("error", `provisioning failed: ${error instanceof Error ? error.message : String(error)}`);
      if (gen === mountGen) { record.status = "error"; record.error = error instanceof Error ? error.message : String(error); }
    }
  };

  const applyConfig = (config) => {
    void runSerial(async () => {
      await teardown();
      if (config.enabled) await start(config);
    });
  };

  // Reactive registration of the status route (webServer is optional).
  const httpDisposers = [];
  const syncHttp = () => {
    for (const dispose of httpDisposers) dispose();
    httpDisposers.length = 0;
    const webServer = ctx.get("webServer", false);
    if (webServer === undefined) return;
    httpDisposers.push(ctx.effect(() => webServer.register({
      kind: "exact",
      path: COMPUTER_USE_HTTP_PATH,
      handler: async (req, res) => {
        if (req.method === "POST") {
          // Force a rebuild: drop the venv so the next mount reprovisions, then
          // re-run the current configuration.
          const runtime = ctx.dshHomePath("runtime");
          await rm(join(runtime, VENV_DIR_NAME), { recursive: true, force: true });
          const config = currentConfig;
          void runSerial(async () => {
            await teardown();
            if (config.enabled) await start(config);
          });
          res.writeHead(202, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ ok: true, status: "provisioning" }));
          return;
        }
        const config = currentConfig;
        const snapshot = {
          config: {
            enabled: config.enabled ?? true,
            pythonVersion: config.pythonVersion ?? DEFAULT_PYTHON_VERSION,
            package: config.package ?? DEFAULT_PACKAGE,
            autoRemind: config.autoRemind ?? true
          },
          mounted: mounted === null ? null : {
            status: mounted.status,
            venvDir: mounted.venvDir ?? null,
            error: mounted.error ?? null,
            startedAt: mounted.startedAt
          }
        };
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store"
        });
        res.end(JSON.stringify(snapshot));
      }
    }), `tool-computer-use: ${COMPUTER_USE_HTTP_PATH} route`));
    httpDisposers.push(ctx.effect(() => webServer.register({
      kind: "exact",
      path: `${COMPUTER_USE_HTTP_PATH}/logs`,
      handler: async (_req, res) => {
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store"
        });
        res.end(JSON.stringify({ logs: logBuffer.slice() }));
      }
    }), `tool-computer-use: ${COMPUTER_USE_HTTP_PATH}/logs route`));
  };
  ctx.on("internal/service", syncHttp);
  syncHttp();

  ctx.effect(() => () => {
    void runSerial(teardown);
  }, "tool-computer-use: teardown");

  ctx.inject(["settings"], (settingsCtx) => {
    const scope = settingsCtx.settings.register(COMPUTER_USE_SETTINGS_NS, ComputerUseSettingsSchema);
    scope.watch((next) => {
      currentConfig = next;
      applyConfig(next);
    });
    currentConfig = scope.get();
    applyConfig(currentConfig);
  });
}

export { apply, inject, name };

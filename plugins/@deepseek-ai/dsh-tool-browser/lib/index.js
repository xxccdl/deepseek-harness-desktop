// DeepSeek Harness browser-control plugin.
//
// Gives the model the ability to automate the web through a real Edge/Chrome
// window driven over the Chrome DevTools Protocol (CDP). The plugin locates an
// installed Edge/Chrome, launches a dedicated instance with a private profile
// and `--remote-debugging-port`, and exposes a single `browser_control` tool
// the AI chains together (open → snapshot → click/type/press → snapshot …).
// Complex automation is just many small CDP calls.
//
// Configuration lives in the `browser-control` settings namespace (enabled /
// browser / port / headless / autoRemind), edited live from the desktop
// settings surface. A small `/api/browser` route reports status and lets the
// settings page start/stop/test the browser.
//
// @module @deepseek-ai/dsh-tool-browser
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { execFileSync, spawn } from "node:child_process";
import { defineTool } from "@deepseek-ai/dsh-tools";
import z from "@deepseek-ai/schemastery";
import { settingsNamespace } from "@deepseek-ai/dsh-settings";

/** Cordis plugin name. */
const name = "tool-browser";
/** Required services: the tool registry, skill registry, system prompt, and settings. */
const inject = ["tools", "skills", "systemPrompt"];

/** Default remote-debugging port for the controlled browser. */
const DEFAULT_PORT = 9222;

/** Settings namespace owned by the browser-control plugin. */
const BROWSER_SETTINGS_NS = settingsNamespace("browser-control");
/** Durable browser-control settings; the harness Settings document edits it. */
const BrowserSettingsSchema = z.object({
  /** Master switch: when false, no browser runtime, tool, or reminder is mounted. */
  enabled: z.boolean().default(true),
  /** Browser to drive: auto-detect, Edge, or Chrome. */
  browser: z.string().default("auto"),
  /** Remote-debugging port. */
  port: z.number().default(DEFAULT_PORT),
  /** Launch headless (no visible window). */
  headless: z.boolean().default(false),
  /** Mount the persistent `browser-control:capability` system-prompt reminder. */
  autoRemind: z.boolean().default(true)
});

// ── browser discovery ─────────────────────────────────────────────────────────
/** Candidate executable paths for Edge, newest common install roots first. */
function edgeCandidates() {
  const pf = process.env["ProgramFiles"] ?? "C:\\Program Files";
  const pf86 = process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)";
  const local = process.env["LOCALAPPDATA"] ?? "";
  const roots = [join(pf86, "Microsoft", "Edge", "Application", "msedge.exe"), join(pf, "Microsoft", "Edge", "Application", "msedge.exe")];
  if (local) roots.push(join(local, "Microsoft", "Edge", "Application", "msedge.exe"));
  return roots;
}
/** Candidate executable paths for Chrome. */
function chromeCandidates() {
  const pf = process.env["ProgramFiles"] ?? "C:\\Program Files";
  const pf86 = process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)";
  const local = process.env["LOCALAPPDATA"] ?? "";
  const roots = [join(pf, "Google", "Chrome", "Application", "chrome.exe"), join(pf86, "Google", "Chrome", "Application", "chrome.exe")];
  if (local) roots.push(join(local, "Google", "Chrome", "Application", "chrome.exe"));
  return roots;
}

/** Resolve the browser executable path for a preference ("auto"|"edge"|"chrome"). */
function resolveBrowserPath(preference) {
  const wantEdge = preference === "edge";
  const wantChrome = preference === "chrome";
  const ordered = [];
  if (!wantChrome) ordered.push(...edgeCandidates().map((p) => [p, "Edge"]));
  if (!wantEdge) ordered.push(...chromeCandidates().map((p) => [p, "Chrome"]));
  for (const [path, label] of ordered) {
    if (existsSync(path)) return { path, label };
  }
  return undefined;
}

// ── CDP client (minimal) ──────────────────────────────────────────────────────
/** One CDP WebSocket session: id-prefixed JSON-RPC requests with a timeout. */
class CdpSession {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = undefined;
    this.seq = 0;
    this.pending = new Map();
    this.opened = undefined;
  }
  connect() {
    if (this.opened !== undefined) return this.opened;
    this.opened = new Promise((resolve, reject) => {
      let ws;
      try {
        ws = new WebSocket(this.wsUrl);
      } catch (error) {
        reject(error);
        return;
      }
      this.ws = ws;
      const fail = (error) => reject(error instanceof Error ? error : new Error(String(error)));
      ws.onerror = () => fail(new Error("CDP WebSocket connection failed"));
      ws.onclose = () => fail(new Error("CDP WebSocket closed"));
      ws.onopen = () => resolve();
      ws.onmessage = (event) => {
        let message;
        try {
          message = JSON.parse(typeof event.data === "string" ? event.data : String(event.data));
        } catch {
          return;
        }
        if (message.id === undefined) return;
        const slot = this.pending.get(message.id);
        if (slot === undefined) return;
        this.pending.delete(message.id);
        clearTimeout(slot.timer);
        if (message.error !== undefined) slot.reject(new Error(message.error.message ?? "CDP error"));
        else slot.resolve(message.result);
      };
    });
    return this.opened;
  }
  send(method, params = {}, timeoutMs = 30000) {
    return this.connect().then(() => {
      const id = ++this.seq;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          if (this.pending.has(id)) {
            this.pending.delete(id);
            reject(new Error(`CDP ${method} timed out`));
          }
        }, timeoutMs);
        this.pending.set(id, { resolve, reject, timer });
        try {
          this.ws.send(JSON.stringify({ id, method, params }));
        } catch (error) {
          this.pending.delete(id);
          clearTimeout(timer);
          reject(error);
        }
      });
    });
  }
  close() {
    this.opened = undefined;
    for (const slot of this.pending.values()) {
      clearTimeout(slot.timer);
      slot.reject(new Error("CDP session closed"));
    }
    this.pending.clear();
    try { this.ws?.close(); } catch { /* best-effort */ }
  }
}

// ── runtime state ─────────────────────────────────────────────────────────────
let browserProcess = undefined; // spawned browser child
let cdpSession = undefined; // page-level CDP session (drives the active tab)
let browserCdpSession = undefined; // browser-level CDP session (Target.* commands)
let runtimeStatus = "stopped"; // stopped | starting | running | error
let runtimeError = undefined;

/** Query the browser's debug HTTP endpoints on the loopback port. */
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Wait until the remote-debugging endpoint answers. */
async function waitForEndpoint(port, timeoutMs = 25000) {
  const start = Date.now();
  let lastError = "timeout";
  while (Date.now() - start < timeoutMs) {
    try {
      const version = await fetchJson(`http://127.0.0.1:${port}/json/version`);
      if (version !== undefined) return version;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  throw new Error(`浏览器调试端口 ${port} 启动超时（${lastError}）`);
}

/** Pick a page target and return its CDP WebSocket URL. */
async function pageTargetWsUrl(port) {
  const list = await fetchJson(`http://127.0.0.1:${port}/json/list`);
  const pages = (Array.isArray(list) ? list : []).filter((target) => target.type === "page");
  const page = pages.find((target) => !target.url.startsWith("chrome://")) ?? pages[0];
  if (page === undefined || typeof page.webSocketDebuggerUrl !== "string") {
    throw new Error("浏览器没有可用的页面");
  }
  return page.webSocketDebuggerUrl;
}

/** Resolve a page target's WebSocket URL by its target id. */
async function wsUrlForTarget(port, targetId) {
  const list = await fetchJson(`http://127.0.0.1:${port}/json/list`);
  const target = (Array.isArray(list) ? list : []).find((item) => item.id === targetId);
  if (target === undefined || typeof target.webSocketDebuggerUrl !== "string") return undefined;
  return target.webSocketDebuggerUrl;
}

/** List open page tabs via the browser-level session. */
async function listTabs() {
  if (browserCdpSession === undefined) throw new Error("浏览器会话不可用");
  const result = await browserCdpSession.send("Target.getTargets");
  const targets = result?.targetInfos ?? [];
  return targets
    .filter((target) => target.type === "page")
    .map((target, index) => ({
      index,
      id: target.targetId,
      title: target.title || "",
      url: target.url || "",
      current: target.attached === true
    }));
}

/** Attach the page session to the given target id (make it the driven tab). */
async function attachToTarget(port, targetId) {
  const wsUrl = await wsUrlForTarget(port, targetId);
  if (wsUrl === undefined) throw new Error("目标标签页不可用");
  if (cdpSession !== undefined) { cdpSession.close(); cdpSession = undefined; }
  cdpSession = new CdpSession(wsUrl);
  await cdpSession.connect();
  return cdpSession;
}

/** Ensure a browser is running and return its CDP session (page-level). */
async function ensureSession(ctx, config) {
  const port = config.port ?? DEFAULT_PORT;
  if (browserProcess === undefined) {
    const resolved = resolveBrowserPath(config.browser ?? "auto");
    if (resolved === undefined) throw new Error("未找到 Edge 或 Chrome，请先在设置中选择浏览器");
    const profileDir = join(ctx.dshHomePath("runtime"), "browser-profile");
    await mkdir(profileDir, { recursive: true });
    const args = [
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profileDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--remote-allow-origins=*",
      ...(config.headless === true ? ["--headless=new"] : []),
      "about:blank"
    ];
    ctx.logger.info(`browser-control: launching ${resolved.label} (port ${port})`);
    const child = spawn(resolved.path, args, { stdio: "ignore", windowsHide: true });
    browserProcess = child;
    child.on("error", (error) => {
      runtimeError = error instanceof Error ? error.message : String(error);
      runtimeStatus = "error";
    });
    child.on("exit", () => {
      if (browserProcess === child) {
        browserProcess = undefined;
        if (cdpSession !== undefined) { cdpSession.close(); cdpSession = undefined; }
        if (browserCdpSession !== undefined) { browserCdpSession.close(); browserCdpSession = undefined; }
        runtimeStatus = "stopped";
      }
    });
    await waitForEndpoint(port);
  }
  if (browserCdpSession === undefined) {
    const version = await fetchJson(`http://127.0.0.1:${port}/json/version`);
    if (typeof version?.webSocketDebuggerUrl !== "string") throw new Error("浏览器调试地址不可用");
    browserCdpSession = new CdpSession(version.webSocketDebuggerUrl);
    await browserCdpSession.connect();
  }
  if (cdpSession === undefined) {
    cdpSession = new CdpSession(await pageTargetWsUrl(port));
    await cdpSession.connect();
  }
  return cdpSession;
}

/** Kill the controlled browser (and its children) and drop the CDP sessions. */
async function stopBrowser() {
  runtimeStatus = "stopped";
  runtimeError = undefined;
  if (cdpSession !== undefined) { cdpSession.close(); cdpSession = undefined; }
  if (browserCdpSession !== undefined) { browserCdpSession.close(); browserCdpSession = undefined; }
  const child = browserProcess;
  browserProcess = undefined;
  if (child === undefined) return;
  const pid = child.pid;
  try { child.kill(); } catch { /* already gone */ }
  if (pid !== undefined) {
    try {
      execFileSync("taskkill", ["/pid", String(pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
    } catch { /* best-effort */ }
  }
}

// ── CDP actions ───────────────────────────────────────────────────────────────
/** Read the current page's title + URL + truncated text via one evaluate. */
async function pageSnapshot(session) {
  const result = await session.send("Runtime.evaluate", {
    expression: `(() => { const t = document.title || ""; const u = location.href || ""; const body = document.body ? document.body.innerText : ""; return JSON.stringify({ title: t, url: u, text: body.slice(0, 8000) }); })()`,
    returnByValue: true
  });
  let snapshot = { title: "", url: "", text: "" };
  try { snapshot = JSON.parse(result?.result?.value ?? "{}"); } catch { /* ignore */ }
  return snapshot;
}

/** Capture a PNG screenshot as a data URI (viewPortOnly). */
async function captureScreenshot(session) {
  const result = await session.send("Page.captureScreenshot", { format: "png" });
  if (typeof result?.data !== "string") throw new Error("截图失败");
  return `data:image/png;base64,${result.data}`;
}

/** Small delay helper. */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Real mouse interaction at CSS-pixel coordinates via CDP.
 * `button` is "left"|"right"; `clickCount` 1 = click, 2 = double-click;
 * `hover` only moves the pointer.
 */
async function mouseAction(session, x, y, { button = "left", clickCount = 1, hover = false } = {}) {
  const px = Math.round(x);
  const py = Math.round(y);
  const pressedButtons = hover ? 0 : button === "right" ? 2 : 1;
  await session.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: px, y: py, buttons: 0, button: hover ? "none" : button });
  await sleep(50);
  if (hover) {
    await sleep(100);
    return;
  }
  for (let i = 0; i < clickCount; i += 1) {
    await session.send("Input.dispatchMouseEvent", { type: "mousePressed", x: px, y: py, button, buttons: pressedButtons, clickCount: i + 1 });
    await sleep(70);
    await session.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: px, y: py, button, buttons: 0, clickCount: i + 1 });
    await sleep(70);
  }
}

/** Special-key table with correct Windows virtual-key codes. */
const SPECIAL_KEYS = {
  enter: { key: "Enter", vk: 13, text: "\r" },
  tab: { key: "Tab", vk: 9, text: "\t" },
  escape: { key: "Escape", vk: 27 },
  backspace: { key: "Backspace", vk: 8 },
  delete: { key: "Delete", vk: 46 },
  arrowup: { key: "ArrowUp", vk: 38 },
  arrowdown: { key: "ArrowDown", vk: 40 },
  arrowleft: { key: "ArrowLeft", vk: 37 },
  arrowright: { key: "ArrowRight", vk: 39 },
  home: { key: "Home", vk: 36 },
  end: { key: "End", vk: 35 },
  pageup: { key: "PageUp", vk: 33 },
  pagedown: { key: "PageDown", vk: 34 }
};

/** Dispatch a key via CDP (special key name, or plain text inserted into focus). */
async function pressKey(session, key) {
  const normalized = String(key ?? "").trim().toLowerCase();
  const special = SPECIAL_KEYS[normalized];
  if (special === undefined) {
    await session.send("Input.insertText", { text: String(key) });
    return { kind: "insert", key: String(key) };
  }
  const { key: keyName, vk, text } = special;
  await session.send("Input.dispatchKeyEvent", {
    type: "rawKeyDown",
    key: keyName,
    code: keyName,
    windowsVirtualKeyCode: vk,
    nativeVirtualKeyCode: vk,
    text: text ?? ""
  });
  await session.send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: keyName,
    code: keyName,
    windowsVirtualKeyCode: vk,
    nativeVirtualKeyCode: vk
  });
  return { kind: "key", key: keyName };
}

/**
 * Locate a target element and return its center coordinates (CSS pixels).
 * Matches by CSS `selector`, or by visible text when `text` is given (picks the
 * smallest matching element, e.g. a button by its label). Scrolls into view.
 */
async function locateElement(session, { selector, text }) {
  const selectorJs = typeof selector === "string" && selector !== "" ? JSON.stringify(selector) : "null";
  const textJs = typeof text === "string" && text !== "" ? JSON.stringify(text) : "null";
  const expression = `(() => {
    let el = null;
    if (${selectorJs} !== null) el = document.querySelector(${selectorJs});
    if (!el && ${textJs} !== null) {
      const q = ${textJs}.toLowerCase();
      let best = null, bestArea = Infinity;
      for (const c of document.querySelectorAll("a,button,input,textarea,select,label,span,div,[role=button],[role=link],[role=menuitem],[role=checkbox],[role=tab],[role=option]")) {
        const txt = (c.innerText || c.value || c.getAttribute("aria-label") || c.getAttribute("placeholder") || "").trim();
        if (!txt) continue;
        if (txt.toLowerCase().includes(q)) {
          const r = c.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) continue;
          const area = r.width * r.height;
          if (area < bestArea) { bestArea = area; best = c; }
        }
      }
      el = best;
    }
    if (!el) return JSON.stringify({ ok: false, err: "not found" });
    el.scrollIntoView({ block: "center", inline: "center" });
    const r = el.getBoundingClientRect();
    return JSON.stringify({ ok: true, x: r.left + r.width / 2, y: r.top + r.height / 2, tag: el.tagName.toLowerCase(), text: String(el.innerText || el.value || "").slice(0, 120) });
  })()`;
  const result = await session.send("Runtime.evaluate", { expression, returnByValue: true });
  let parsed = { ok: false, err: "evaluate failed" };
  try { parsed = JSON.parse(result?.result?.value ?? "{}"); } catch { /* ignore */ }
  return parsed;
}

/** Focus a selector so subsequent typing lands there. */
async function focusSelector(session, selector) {
  await session.send("Runtime.evaluate", {
    expression: `(() => { const el = document.querySelector(${JSON.stringify(String(selector))}); if (!el) return false; el.focus(); el.scrollIntoView({ block: "center" }); return true; })()`,
    returnByValue: true
  });
}

/** Navigate and wait until the document is ready (bounded). */
async function navigateAndWait(session, url) {
  await session.send("Page.navigate", { url });
  const start = Date.now();
  while (Date.now() - start < 15000) {
    try {
      const state = await session.send("Runtime.evaluate", { expression: "document.readyState", returnByValue: true });
      if (state?.result?.value === "complete") break;
    } catch { /* page may be mid-transition */ }
    await sleep(250);
  }
  await sleep(300);
}

/** Current page URL (lightweight). */
async function pageUrl(session) {
  const result = await session.send("Runtime.evaluate", { expression: "location.href", returnByValue: true });
  return String(result?.result?.value ?? "");
}

/**
 * Submit a form reliably. Prefers the focused element's form; when the focus
 * has drifted (sites grab focus, e.g. a chat widget), falls back to the first
 * form whose text fields carry a non-empty value (the likely search box).
 */
async function submitFocusedForm(session) {
  const result = await session.send("Runtime.evaluate", {
    expression: `(() => {
      const el = document.activeElement;
      let f = el && el.form ? el.form : null;
      if (!f) {
        for (const form of document.forms) {
          const hasValue = Array.from(form.elements).some((e) => (e.tagName === "INPUT" || e.tagName === "TEXTAREA") && typeof e.value === "string" && e.value.trim() !== "");
          if (hasValue) { f = form; break; }
        }
      }
      if (!f) return false;
      try { f.requestSubmit(); return true; } catch (e) { try { f.submit(); return true; } catch { return false; } }
    })()`,
    returnByValue: true
  });
  return result?.result?.value === true;
}

// ── the model-facing tool ─────────────────────────────────────────────────────
const browserControl = defineTool({
  name: "browser_control",
  description:
    "Control a real Edge/Chrome window through the browser-control feature: navigate pages, manage tabs (list / switch / open / close), inspect the current page, and interact with real mouse/keyboard input — click / double-click / right-click / hover elements (by CSS selector, visible text, or pixel coordinates), type text, press keys, scroll, evaluate JavaScript, and go back/forward. " +
    "Chain calls to complete multi-step web tasks: open(url) → snapshot() to read the page (title/URL/text/screenshot) → click/type/press → snapshot() to verify.",
  parameters: {
    action: {
      type: "string",
      required: true,
      description: "open | snapshot | tabs | switchtab | newtab | closetab | click | dblclick | rightclick | hover | type | press | scroll | eval | back | forward | reload | wait | close"
    },
    url: { type: "string", description: "Target URL for action=open / action=newtab." },
    target: { type: "string", description: "Tab index (as a number string, e.g. \"2\") or title/URL keyword for action=switchtab." },
    selector: { type: "string", description: "CSS selector for click/type targeting (e.g. '#search', 'button[type=submit]')." },
    text: { type: "string", description: "Visible text used to locate the element for click/dblclick/rightclick/hover, or text to type with action=type." },
    expression: { type: "string", description: "JavaScript expression for action=eval (returnByValue)." },
    key: { type: "string", description: "Key name for action=press (Enter, Tab, Escape, ArrowDown, ...) or text to insert." },
    x: { type: "number", description: "X coordinate (page CSS pixels) for coordinate-based mouse actions." },
    y: { type: "number", description: "Y coordinate (page CSS pixels) for coordinate-based mouse actions." },
    deltaY: { type: "number", description: "Vertical scroll amount (px) for action=scroll; positive scrolls down." },
    ms: { type: "number", description: "Milliseconds to wait for action=wait." },
    screenshot: { type: "boolean", description: "Include a screenshot data URI in snapshot results (default true)." }
  },
  output: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        ok: { type: "boolean", required: true },
        action: { type: "string", required: true },
        title: { type: "string", required: true },
        url: { type: "string", required: true },
        text: { type: "string", required: true },
        result: { type: "string", required: true },
        screenshot: { type: "string", required: true }
      }
    },
    render: (_args, value) => {
      const blocks = [{ type: "text", text: `[browser] ${value.action}${value.ok ? " ok" : " failed"}\n${value.title || ""}\n${value.url || ""}\n${value.result || ""}` }];
      if (value.screenshot !== "") blocks.push({ type: "text", text: `![page](${value.screenshot})` });
      return blocks;
    }
  },
  async execute(args, _exec) {
    const action = String(args.action ?? "").trim();
    if (action === "") throw new Error("browser_control: `action` is required");
    const cfg = currentConfig;
    const session = await ensureSession(currentCtx, cfg);
    const base = { ok: true, action, title: "", url: "", text: "", result: "", screenshot: "" };
    try {
      switch (action) {
        case "open": {
          const url = String(args.url ?? "").trim();
          if (url === "") throw new Error("browser_control: `url` is required for open");
          await navigateAndWait(session, url);
          const snap = await pageSnapshot(session);
          const wantShot = args.screenshot !== false;
          return { ...base, ...snap, screenshot: wantShot ? await captureScreenshot(session) : "" };
        }
        case "snapshot": {
          const snap = await pageSnapshot(session);
          const wantShot = args.screenshot !== false;
          return { ...base, ...snap, screenshot: wantShot ? await captureScreenshot(session) : "" };
        }
        case "tabs": {
          const tabs = await listTabs();
          const summary = tabs.length === 0
            ? "（没有打开的标签页）"
            : tabs.map((tab) => `#${tab.index}${tab.current ? " [当前]" : ""} ${tab.title || "(无标题)"} ${tab.url}`).join("\n");
          return { ...base, result: summary };
        }
        case "switchtab": {
          const tabs = await listTabs();
          const target = args.target;
          let tab;
          if (typeof target === "number") {
            tab = tabs.find((t) => t.index === target);
          } else if (typeof target === "string" && target.trim() !== "") {
            const raw = target.trim();
            const byIndex = Number(raw);
            const q = raw.toLowerCase();
            tab = tabs.find((t) => String(t.index) === raw)
              ?? tabs.find((t) => t.title.toLowerCase().includes(q) || t.url.toLowerCase().includes(q))
              ?? (Number.isInteger(byIndex) ? tabs[byIndex] : undefined);
          } else {
            throw new Error("browser_control: switchtab 需要 `target`（标签页序号或标题/网址关键字）");
          }
          if (tab === undefined) return { ...base, ok: false, result: `未找到匹配的标签页：${target}` };
          await browserCdpSession.send("Target.activateTarget", { targetId: tab.id });
          await attachToTarget(currentConfig.port ?? DEFAULT_PORT, tab.id);
          await sleep(400);
          return { ...base, ...(await pageSnapshot(cdpSession)), result: `切换到标签页 #${tab.index}：${tab.title || tab.url}` };
        }
        case "newtab": {
          const url = String(args.url ?? "").trim();
          const result = await browserCdpSession.send("Target.createTarget", { url: "about:blank" });
          const targetId = result?.targetId;
          if (targetId === undefined) throw new Error("创建标签页失败");
          await browserCdpSession.send("Target.activateTarget", { targetId });
          await attachToTarget(currentConfig.port ?? DEFAULT_PORT, targetId);
          if (url !== "") await navigateAndWait(cdpSession, url);
          await sleep(300);
          return { ...base, ...(await pageSnapshot(cdpSession)), result: `已打开新标签页${url !== "" ? `：${url}` : ""}` };
        }
        case "closetab": {
          const tabs = await listTabs();
          const current = tabs.find((tab) => tab.current) ?? tabs[0];
          if (current === undefined) return { ...base, result: "没有可关闭的标签页" };
          if (tabs.length <= 1) return { ...base, ok: false, result: "仅剩一个标签页，无法关闭（可用 stop 停止浏览器）" };
          await browserCdpSession.send("Target.closeTarget", { targetId: current.id });
          await sleep(400);
          const remaining = (await listTabs())[0];
          if (remaining !== undefined) {
            await browserCdpSession.send("Target.activateTarget", { targetId: remaining.id });
            await attachToTarget(currentConfig.port ?? DEFAULT_PORT, remaining.id);
            await sleep(400);
            return { ...base, ...(await pageSnapshot(cdpSession)), result: `已关闭标签页：${current.title || current.url}` };
          }
          return { ...base, result: `已关闭标签页：${current.title || current.url}` };
        }
        case "click":
        case "dblclick":
        case "rightclick":
        case "hover": {
          const kind = action;
          const hasCoords = typeof args.x === "number" && typeof args.y === "number";
          const hasTarget = (typeof args.selector === "string" && args.selector !== "") || (typeof args.text === "string" && args.text !== "");
          if (!hasCoords && !hasTarget) {
            throw new Error("browser_control: 该动作需要 `x`/`y` 坐标，或 `selector`/`text` 目标");
          }
          if (hasCoords && !hasTarget) {
            await mouseAction(session, args.x, args.y, { button: kind === "rightclick" ? "right" : "left", clickCount: kind === "dblclick" ? 2 : 1, hover: kind === "hover" });
            return { ...base, result: `${kind} at (${Math.round(args.x)}, ${Math.round(args.y)})` };
          }
          const center = await locateElement(session, { selector: args.selector, text: args.text });
          if (center.ok !== true) return { ...base, ok: false, result: `元素未找到：${args.selector || args.text}（${center.err ?? ""}）` };
          await mouseAction(session, center.x, center.y, { button: kind === "rightclick" ? "right" : "left", clickCount: kind === "dblclick" ? 2 : 1, hover: kind === "hover" });
          const target = args.selector ? `"${args.selector}"` : `文本“${args.text}”`;
          return { ...base, result: `${kind} ${target}${center.text ? `（${center.text}）` : ""}` };
        }
        case "type": {
          if (typeof args.selector === "string" && args.selector !== "") await focusSelector(session, args.selector);
          await session.send("Input.insertText", { text: String(args.text ?? "") });
          return { ...base, result: `typed ${String(args.text ?? "").length} 个字符` };
        }
        case "press": {
          const urlBefore = await pageUrl(session);
          const pressed = await pressKey(session, args.key);
          // Enter: some sites (e.g. search engines) do not react to CDP key
          // events. If the page did not navigate and the focus is in a form,
          // submit the form as a reliable fallback.
          if (pressed.kind === "key" && pressed.key === "Enter") {
            await sleep(700);
            if (await pageUrl(session) === urlBefore) {
              const submitted = await submitFocusedForm(session);
              if (submitted) return { ...base, result: "pressed Enter（已提交表单）" };
            }
          }
          return { ...base, result: `pressed ${pressed.key}` };
        }
        case "scroll": {
          const dy = Number(args.deltaY ?? args.y ?? 400);
          await session.send("Runtime.evaluate", { expression: `window.scrollBy({ top: ${dy}, behavior: "instant" })`, returnByValue: true });
          return { ...base, result: `scrolled ${dy}px` };
        }
        case "eval": {
          const expression = String(args.expression ?? "");
          if (expression.trim() === "") throw new Error("browser_control: `expression` is required for eval");
          const result = await session.send("Runtime.evaluate", { expression, returnByValue: true });
          let value = result?.result?.value;
          if (value === undefined && result?.result?.type !== "undefined") {
            const rv = result?.result?.result;
            value = rv !== undefined && typeof rv.value !== "undefined" ? rv.value : undefined;
          }
          if (typeof value === "object") {
            try { value = JSON.stringify(value); } catch { /* keep */ }
          }
          return { ...base, result: String(value ?? "undefined") };
        }
        case "wait": {
          await sleep(Math.max(0, Number(args.ms) || 1000));
          return { ...base, result: `waited ${Number(args.ms) || 1000}ms` };
        }
        case "back":
          await session.send("Page.goBack");
          await sleep(700);
          return { ...base, ...(await pageSnapshot(session)) };
        case "forward":
          await session.send("Page.goForward");
          await sleep(700);
          return { ...base, ...(await pageSnapshot(session)) };
        case "reload":
          await session.send("Page.reload");
          await sleep(900);
          return { ...base, ...(await pageSnapshot(session)) };
        case "close":
          try { await session.send("Page.close"); } catch { /* page may already be gone */ }
          return { ...base, result: "页面已关闭" };
        default:
          throw new Error(`browser_control: 未知动作 "${action}"`);
      }
    } catch (error) {
      return { ...base, ok: false, result: error instanceof Error ? error.message : String(error) };
    }
  },
  presentCall: (args) => ({ card: "generic", title: "浏览器", kind: "other", rawInput: `browser_control: ${String(args?.action ?? "")}${args?.url ? ` ${args.url}` : ""}` })
});

// ── skill / prompt ────────────────────────────────────────────────────────────
const browserSkill = {
  name: "browser-control",
  description: "Automate a real Edge/Chrome window: navigate, read the page, click/type/press, scroll, evaluate JavaScript, screenshots.",
  whenToUse: "Use when the user asks you to browse a website, log in, fill forms, scrape or verify web content, or perform any multi-step task inside a browser.",
  source: "custom",
  content: [
    "# Browser Control",
    "",
    "You can drive a real Edge/Chrome window through the `browser_control` tool. The browser is opened automatically on first use (start it earlier in the 浏览器控制 settings page for a visible window).",
    "",
    "## Workflow",
    "- Start by capturing context: `browser_control` action `snapshot` returns the page title, URL, visible text, and a screenshot so you can see the page.",
    "- Navigate with action `open` (`url`). After navigation, always `snapshot` to see the result.",
    "- Manage tabs: `tabs` lists every open tab; `switchtab` (`target`: index or title/URL keyword) activates one; `newtab` (`url`) opens and drives a new tab; `closetab` closes the current one. Check `tabs` after opening links that may create new tabs.",
    "- Click / double-click / right-click / hover with action `click` / `dblclick` / `rightclick` / `hover`. Target an element by CSS `selector`, by its visible `text` (e.g. `text: \"登录\"` for a button labeled 登录), or by pixel `x`/`y` from the screenshot.",
    "- Type with action `type` (`selector` to focus first, then `text`). Use `press` with `key` for Enter/Tab/Escape/ArrowDown etc.",
    "- Read or manipulate the DOM with `eval` (`expression` is plain JavaScript). Scroll with `scroll` (`deltaY`). Wait for slow pages with `wait` (`ms`).",
    "- After every action, `snapshot` to verify the result before reporting success.",
    "",
    "## Safety",
    "- Only operate what the user asked for; do not submit forms or make purchases without explicit confirmation.",
    "- Never type passwords into untrusted sites; ask the user first.",
    "- Use a dedicated browser profile, so your actions do not disturb the user's normal browsing."
  ].join("\n")
};

const BROWSER_PROMPT_SECTION = {
  name: "browser-control:capability",
  order: -87,
  text: "【浏览器控制】你已可驱动本机 Edge/Chrome 浏览器（工具 browser_control）：打开网页、标签页管理（列出/切换/新建/关闭）、读取页面文本与截图、点击/双击/右键/悬停（选择器或可见文本定位）、输入、按键、滚动、执行 JS、前进后退、等待。做复杂网页操作时按 打开→快照→操作→快照核验 的流程进行；只做用户要求的操作。"
};

// ── HTTP status / control (settings viewer) ───────────────────────────────────
const BROWSER_HTTP_PATH = "/api/browser";

// ── plugin ────────────────────────────────────────────────────────────────────
let currentConfig = {};
let currentCtx = undefined;

function apply(ctx) {
  currentCtx = ctx;
  const disposers = [];
  const sync = (config) => {
    for (const dispose of disposers) dispose();
    disposers.length = 0;
    if (!config.enabled) {
      runtimeStatus = "stopped";
      runtimeError = undefined;
      if (browserProcess !== undefined || cdpSession !== undefined) void stopBrowser();
      return;
    }
    disposers.push(ctx.tools.register(browserControl));
    disposers.push(ctx.skills.register(browserSkill));
    if (config.autoRemind) disposers.push(ctx.systemPrompt.section(BROWSER_PROMPT_SECTION));
  };

  // HTTP surface: GET status, POST control actions.
  const httpDisposers = [];
  const syncHttp = () => {
    for (const dispose of httpDisposers) dispose();
    httpDisposers.length = 0;
    const webServer = ctx.get("webServer", false);
    if (webServer === undefined) return;
    const sendJson = (res, code, value) => {
      res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      res.end(JSON.stringify(value));
    };
    httpDisposers.push(ctx.effect(() => webServer.register({
      kind: "exact",
      path: BROWSER_HTTP_PATH,
      handler: async (req, res) => {
        const config = currentConfig;
        if (req.method === "POST") {
          let body = {};
          try {
            body = JSON.parse(await readBody(req) || "{}");
          } catch {
            sendJson(res, 400, { error: "invalid JSON body" });
            return;
          }
          const action = body.action;
          try {
            if (action === "start") {
              runtimeStatus = "starting";
              runtimeError = undefined;
              const resolved = resolveBrowserPath(config.browser ?? "auto");
              if (resolved === undefined) throw new Error("未找到 Edge 或 Chrome，请先在设置中选择浏览器");
              await ensureSession(ctx, config);
              const version = await waitForEndpoint(config.port ?? DEFAULT_PORT);
              runtimeStatus = "running";
              sendJson(res, 200, { ok: true, status: "running", browser: resolved.label, path: resolved.path, port: config.port ?? DEFAULT_PORT, version: version.Browser ?? "" });
              return;
            }
            if (action === "stop") {
              await stopBrowser();
              sendJson(res, 200, { ok: true, status: "stopped" });
              return;
            }
            if (action === "test") {
              const session = await ensureSession(ctx, config);
              await session.send("Page.navigate", { url: String(body.url ?? "https://www.example.com") });
              await new Promise((resolve) => setTimeout(resolve, 900));
              sendJson(res, 200, { ok: true, status: "running", ...(await pageSnapshot(session)) });
              return;
            }
            sendJson(res, 400, { error: `unknown action: ${action}` });
          } catch (error) {
            runtimeStatus = "error";
            runtimeError = error instanceof Error ? error.message : String(error);
            sendJson(res, 200, { ok: false, error: runtimeError });
          }
          return;
        }
        const resolved = resolveBrowserPath(config.browser ?? "auto");
        sendJson(res, 200, {
          config: {
            enabled: config.enabled ?? true,
            browser: config.browser ?? "auto",
            port: config.port ?? DEFAULT_PORT,
            headless: config.headless ?? false,
            autoRemind: config.autoRemind ?? true
          },
          browser: resolved === undefined ? null : { label: resolved.label, path: resolved.path },
          runtime: { status: runtimeStatus, error: runtimeError ?? null }
        });
      }
    }), `tool-browser: ${BROWSER_HTTP_PATH} route`));
  };
  ctx.on("internal/service", syncHttp);
  syncHttp();

  ctx.effect(() => () => {
    void stopBrowser();
    for (const dispose of disposers) dispose();
    for (const dispose of httpDisposers) dispose();
  }, "tool-browser: teardown");

  ctx.inject(["settings"], (settingsCtx) => {
    const scope = settingsCtx.settings.register(BROWSER_SETTINGS_NS, BrowserSettingsSchema);
    scope.watch((next) => {
      currentConfig = next;
      sync(next);
    });
    currentConfig = scope.get();
    sync(currentConfig);
  });
}

/** Read a request body as UTF-8 text. */
function readBody(req) {
  return new Promise((resolveBody, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolveBody(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export { apply, inject, name };

// Shared terminal bridge for the desktop bottom panel.
//
// The agent's persistent `pwsh` tool and this bridge drive ONE owner-scoped PTY
// session per session id, so a person typing in the bottom panel and the model
// run in the same PowerShell process: same working directory, same environment,
// same scrollback. The panel talks plain HTTP because a browser page cannot hold
// the Agent authority the terminal registry authorizes against.
//
// The FIRST shell is published under the owner-local name `panel`; the persistent
// pwsh tool adopts exactly that session when it exists (see the fork's
// `dsh-tool-pwsh-persistent`), which is what makes the two halves one shell.
// The person may open further shells of their own (`panel-2`, `panel-3`, …)
// through /api/shellpanel/new; those belong to the panel alone and are never
// adopted by the tool, so a second terminal cannot hijack the model's shell.
//
// @module @deepseek-ai/dsh-host-shellpanel

/** Cordis plugin name. */
const name = "host-shellpanel";
/** Optional services: both `terminals` and `webServer` are resolved with `ctx.get`. */
const inject = [];

/** Exact route per action; this fork's HTTP surfaces use exact routes. */
const STATE_PATH = "/api/shellpanel/state";
const INPUT_PATH = "/api/shellpanel/input";
const SIGNAL_PATH = "/api/shellpanel/signal";
const RESET_PATH = "/api/shellpanel/reset";
const NEW_PATH = "/api/shellpanel/new";
const CLOSE_PATH = "/api/shellpanel/close";

/** Owner-local name that marks the shared panel shell (the tool adopts this one). */
const PANEL_SESSION_NAME = "panel";
/** Extra shells are `panel-2`, `panel-3`, …: one numbering scheme, one prefix test. */
const EXTRA_SEPARATOR = "-";
/** Retained lines handed to the panel per poll. */
const READ_LINES = 500;
/** Terminal backend type the shell backend registers. */
const BACKEND_TYPE = "shell";
/** How long one panel keystroke waits before the reply is allowed to trail off. */
const INPUT_SETTLE_MS = 1200;

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

/** One JSON reply per routed request, with errors flattened for the panel. */
function jsonRoute(handler) {
  return async (req, res) => {
    try {
      const body = req.method === "POST" ? JSON.parse((await readBody(req)) || "{}") : {};
      sendJson(res, 200, await handler(body, req));
    } catch (error) {
      sendJson(res, 200, { ok: false, reason: error instanceof Error ? error.message : String(error) });
    }
  };
}

/** Whether one terminal session belongs to the panel family. */
function isPanelName(sessionName) {
  return sessionName === PANEL_SESSION_NAME || sessionName.startsWith(PANEL_SESSION_NAME + EXTRA_SEPARATOR);
}

/** Creation index of one panel shell name; the shared shell is always first. */
function shellOrder(sessionName) {
  if (sessionName === PANEL_SESSION_NAME) return 1;
  const parsed = Number.parseInt(sessionName.slice(PANEL_SESSION_NAME.length + EXTRA_SEPARATOR.length), 10);
  return Number.isFinite(parsed) && parsed > 1 ? parsed : Number.MAX_SAFE_INTEGER;
}

function apply(ctx) {
  /** Every panel-owned session for one agent, shared shell first. */
  const panelSessions = (terminals, agent) => terminals.list(agent).filter((session) => isPanelName(session.name)).sort((left, right) => shellOrder(left.name) - shellOrder(right.name));

  /** One panel shell by name; absent when the name is unknown to this agent. */
  const sessionNamed = (terminals, agent, shellName) => panelSessions(terminals, agent).find((session) => session.name === shellName);

  /** The running one of a named shell, or undefined while it is absent or dead. */
  const runningShell = (terminals, agent, shellName) => {
    const session = sessionNamed(terminals, agent, shellName);
    return session !== undefined && session.status.kind === "running" ? session : undefined;
  };

  /** Resolve the addressing services, or throw the panel-visible failure. */
  const services = () => {
    const terminals = ctx.get("terminals", false);
    if (terminals === undefined) throw new Error("终端服务未加载（dsh-terminal 未挂载）");
    return terminals;
  };

  /** Resolve the addressed agent, or throw the panel-visible failure. */
  const agentOf = (sessionId) => {
    if (typeof sessionId !== "string" || sessionId.length === 0) throw new Error("缺少会话 ID");
    const agents = ctx.get("agents", false);
    const agent = agents?.get(sessionId);
    if (agent === undefined) throw new Error("当前会话还没有活动的 agent（先发一条消息）");
    return agent;
  };

  /** Requested shell name, defaulting to the shared one. */
  const shellNameOf = (value) => typeof value === "string" && isPanelName(value) ? value : PANEL_SESSION_NAME;

  /** The panel-facing shape of one shell. */
  const describeShell = (session) => ({
    name: session.name,
    sessionId: session.sessionId,
    pid: session.pid ?? null,
    status: session.status.kind,
    shared: session.name === PANEL_SESSION_NAME
  });

  /** The full roster, so one poll can draw the tab strip as well as the pane. */
  const rosterOf = (terminals, agent) => panelSessions(terminals, agent).map(describeShell);

  /** Spawns in flight per agent and shell, so two polls racing cannot both claim one name. */
  const opening = new WeakMap();

  /** The per-agent in-flight map, created on first use. */
  const inflightOf = (agent) => {
    let map = opening.get(agent);
    if (map === undefined) {
      map = new Map();
      opening.set(agent, map);
    }
    return map;
  };

  /**
   * Start a named shell on demand. Opening the shared one here is what makes the
   * model's next `pwsh` call adopt this very process.
   */
  const ensureShell = (terminals, agent, shellName) => {
    if (runningShell(terminals, agent, shellName) !== undefined) return Promise.resolve(false);
    const inflight = inflightOf(agent);
    const pending = inflight.get(shellName);
    if (pending !== undefined) return pending;
    const cwd = agent.session?.header?.cwd;
    const task = terminals.spawn(agent, {
      type: BACKEND_TYPE,
      name: shellName,
      ...cwd === undefined ? {} : { cwd }
    }).then(() => false, (error) => {
      inflight.delete(shellName);
      throw error;
    }).finally(() => {
      inflight.delete(shellName);
    });
    inflight.set(shellName, task);
    return task;
  };

  /** The next free `panel-N` name for one agent. */
  const nextShellName = (terminals, agent) => {
    const taken = new Set(panelSessions(terminals, agent).map((session) => session.name));
    for (let index = 2; index < 100; index += 1) {
      const candidate = `${PANEL_SESSION_NAME}${EXTRA_SEPARATOR}${String(index)}`;
      if (!taken.has(candidate)) return candidate;
    }
    throw new Error("终端数量已达上限");
  };

  /** Panel state: the addressed shell (opened on demand), its tail, and the roster. */
  const stateOf = async (agent, shellName, open) => {
    const terminals = services();
    const cwd = agent.session?.header?.cwd ?? null;
    if (runningShell(terminals, agent, shellName) === undefined) {
      if (!open) return { ok: true, cwd, shell: null, shells: rosterOf(terminals, agent), text: "", totalLines: 0, truncated: false };
      await ensureShell(terminals, agent, shellName);
    }
    const session = runningShell(terminals, agent, shellName);
    if (session === undefined) throw new Error("shell 启动失败");
    const page = terminals.read(agent, session.sessionId, { offset: 0, count: READ_LINES });
    return {
      ok: true,
      cwd,
      shell: describeShell(session),
      shells: rosterOf(terminals, agent),
      text: page.text,
      totalLines: page.totalLines,
      truncated: page.truncated
    };
  };

  /** Type one line into a shell; the panel polls instead of awaiting a foreground command. */
  const inputOf = async (agent, shellName, text, submit) => {
    const terminals = services();
    if (text.length === 0) return { ok: true };
    if (runningShell(terminals, agent, shellName) === undefined) await ensureShell(terminals, agent, shellName);
    const session = runningShell(terminals, agent, shellName);
    if (session === undefined) throw new Error("shell 启动失败");
    let operation;
    try {
      operation = terminals.startSend(agent, session.sessionId, { text, submit });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(message.includes("SEND_ACTIVE") ? "AI 正在这个终端里执行命令，等它跑完再输入" : message);
    }
    // Interactive replies trail off while a command keeps running, so the panel
    // lets the operation settle on its own and reads the scrollback instead.
    await Promise.race([operation.done.catch(() => undefined), new Promise((resolve) => setTimeout(resolve, INPUT_SETTLE_MS))]);
    return { ok: true };
  };

  /** Open one additional shell and hand the panel its descriptor. */
  const newShell = async (agent) => {
    const terminals = services();
    const shellName = nextShellName(terminals, agent);
    await ensureShell(terminals, agent, shellName);
    const session = runningShell(terminals, agent, shellName);
    if (session === undefined) throw new Error("shell 启动失败");
    return { ok: true, shell: describeShell(session), shells: rosterOf(terminals, agent) };
  };

  /** Close one additional shell; the shared shell is the model's and stays. */
  const closeShell = async (agent, shellName) => {
    const terminals = services();
    if (shellName === PANEL_SESSION_NAME) throw new Error("共享终端不能关闭，请用重启");
    const session = sessionNamed(terminals, agent, shellName);
    if (session === undefined) return { ok: true, shells: rosterOf(terminals, agent) };
    await terminals.kill(agent, session.sessionId, "关闭面板终端");
    return { ok: true, shells: rosterOf(terminals, agent) };
  };

  /** Register the exact routes, following `webServer` as it appears. */
  const registerRoutes = () => {
    const disposers = [];
    const sync = () => {
      for (const dispose of disposers) dispose();
      disposers.length = 0;
      const webServer = ctx.get("webServer", false);
      if (webServer === undefined) return;
      const route = (path, handler) => disposers.push(ctx.effect(() => webServer.register({
        kind: "exact",
        path,
        handler: async (req, res) => {
          // `requestRejection` is the same Host/Origin fence plus browser
          // authentication the shared /api channel applies; an exact route
          // otherwise outranks that prefix and would skip both.
          const connection = ctx.get("connection", false);
          const rejection = connection === undefined ? undefined : connection.requestRejection(req);
          if (rejection !== undefined) {
            res.writeHead(rejection);
            res.end(rejection === 401 ? "unauthorized" : "forbidden");
            return;
          }
          await handler(req, res);
        }
      }), `host-shellpanel: ${path} route`));

      route(STATE_PATH, jsonRoute(async (_body, req) => {
        const url = new URL(req.url ?? "/", "http://dsh.internal");
        const agent = agentOf(url.searchParams.get("sessionId"));
        return stateOf(agent, shellNameOf(url.searchParams.get("shell")), url.searchParams.get("open") === "1");
      }));

      route(INPUT_PATH, jsonRoute(async (body) => {
        const agent = agentOf(body.sessionId);
        return inputOf(agent, shellNameOf(body.shell), typeof body.text === "string" ? body.text : "", body.submit !== false);
      }));

      route(SIGNAL_PATH, jsonRoute(async (body) => {
        const terminals = services();
        const agent = agentOf(body.sessionId);
        const session = runningShell(terminals, agent, shellNameOf(body.shell));
        if (session === undefined) throw new Error("shell 尚未启动");
        await terminals.signal(agent, session.sessionId, typeof body.signal === "string" ? body.signal : "SIGINT");
        return { ok: true };
      }));

      route(RESET_PATH, jsonRoute(async (body) => {
        const terminals = services();
        const agent = agentOf(body.sessionId);
        const session = sessionNamed(terminals, agent, shellNameOf(body.shell));
        if (session === undefined) return { ok: true };
        await terminals.kill(agent, session.sessionId, "关闭面板终端");
        return { ok: true };
      }));

      route(NEW_PATH, jsonRoute(async (body) => {
        const agent = agentOf(body.sessionId);
        return newShell(agent);
      }));

      route(CLOSE_PATH, jsonRoute(async (body) => {
        const agent = agentOf(body.sessionId);
        return closeShell(agent, shellNameOf(body.shell));
      }));
    };
    sync();
    ctx.on("internal/service", () => {
      // The same event fires while the tree unloads, when this fiber is already
      // beyond state 2 and `ctx.effect` would throw INACTIVE_EFFECT.
      if (ctx.fiber.state !== 2) return;
      sync();
    });
  };

  registerRoutes();
}

export { apply, inject, name };

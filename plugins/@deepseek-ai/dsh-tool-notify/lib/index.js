// DeepSeek Harness GUI task-notification and scheduler plugin.
//
// Two features, both surfaced to the desktop app through the `dsh/notify`
// context event (the Electron shell subscribes and shows a Windows
// notification):
//
//  1. Task notifications — watches session events and emits a notification when
//     the AI starts handling a user message ("AI 开始执行任务") and when it
//     finishes with a full reply ("AI 已完成任务").
//  2. Repeating scheduled tasks — user-defined tasks (name, interval in
//     minutes, optional command) persisted at `$DSH_HOME/scheduler.json` and
//     served over `/api/scheduler`. Every enabled task fires a notification
//     (and runs its command) on its interval.
//
// Whether each surface fires is controlled by the `notify` settings namespace
// (enabled / notifyStart / notifyDone / notifySchedule), editable from the
// desktop settings surface.
//
// @module @deepseek-ai/dsh-tool-notify
import { exec } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import z from "@deepseek-ai/schemastery";
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import { dshHomePath } from "@deepseek-ai/dsh-home-paths";
import { createUserMessage } from "@deepseek-ai/dsh-llm";
import { SessionId } from "@deepseek-ai/dsh-session";
import { installModelSelection } from "@deepseek-ai/dsh-agent";

/** Cordis plugin name. */
const name = "task-notify";
/** Required services: the settings registry (configuration) and the session bus. */
const inject = ["settings"];

/** Settings namespace owned by the notify plugin. */
const NOTIFY_SETTINGS_NS = settingsNamespace("notify");
/** Durable notify settings; the harness Settings document edits it. */
const NotifySettingsSchema = z.object({
  /** Master switch: when false, no notifications are emitted at all. */
  enabled: z.boolean().default(true),
  /** Notify when the AI starts handling a task. */
  notifyStart: z.boolean().default(true),
  /** Notify when the AI finishes a task. */
  notifyDone: z.boolean().default(true),
  /** Notify when a scheduled task fires. */
  notifySchedule: z.boolean().default(true)
});

/** Scheduled-task store under the harness home. */
const SCHEDULER_STORE = () => dshHomePath("scheduler.json");
/** Smallest allowed repeat interval, so a task cannot thrash the machine. */
const MIN_INTERVAL_MINUTES = 5;
/** HTTP surface for the scheduler (settings viewer). */
const SCHEDULER_HTTP_PATH = "/api/scheduler";

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function readTasks() {
  try {
    const data = JSON.parse(await readFile(SCHEDULER_STORE(), "utf8"));
    return Array.isArray(data.tasks) ? data.tasks : [];
  } catch {
    return [];
  }
}

async function writeTasks(tasks) {
  await mkdir(dirname(SCHEDULER_STORE()), { recursive: true });
  const tmp = `${SCHEDULER_STORE()}.tmp`;
  await writeFile(tmp, JSON.stringify({ tasks }, null, 2), "utf8");
  await rename(tmp, SCHEDULER_STORE());
}

/** Join text blocks into a single-line preview (notification body). */
function summarize(blocks, max = 80) {
  const text = (Array.isArray(blocks) ? blocks : [])
    .filter((block) => block && block.type === "text" && typeof block.text === "string")
    .map((block) => block.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/**
 * Run one AI task headlessly: spawn a fresh agent session, feed the prompt as a
 * user message, and wait for the agent to finish. Mirrors the headless runner
 * so a scheduled task is executed BY THE AI, not just announced.
 * @param ctx - registrant context.
 * @param prompt - the task instruction for the AI.
 */
async function runAiTask(ctx, prompt) {
  const agents = ctx.get("agents");
  const defaultModel = ctx.get("agentDefaultModel");
  const sessions = ctx.get("sessions");
  if (agents === undefined || defaultModel === undefined || sessions === undefined) {
    ctx.logger.warn("task-notify: agent services unavailable; skipping AI task");
    return;
  }
  const selection = defaultModel.currentSelection();
  const { agent } = await agents.create({
    sessionId: SessionId(`schedule-${randomUUID()}`),
    meta: { cwd: process.cwd() },
    agentOptions: { provider: selection.provider, model: selection.model },
    setup: (agentCtx) => {
      installModelSelection(agentCtx, { current: selection, assembled: undefined });
    }
  });
  await agent.whenIdle();
  agent.followup(createUserMessage({
    content: [{ type: "text", text: prompt }],
    source: { kind: "user" }
  }));
  await agent.whenIdle();
  await sessions.flush(agent.session);
}

/**
 * Register the notify surface on the calling context: session-event watchers,
 * the scheduler (persistence + timers + HTTP), and the settings-driven gates.
 * @param ctx - registrant context carrying the settings registry and session bus.
 */
function apply(ctx) {
  let notifyConfig = { enabled: true, notifyStart: true, notifyDone: true, notifySchedule: true };
  const notify = (title, body) => {
    try {
      ctx.emit("dsh/notify", { title, body });
    } catch { /* ignore broadcast failures */ }
  };
  const maybeNotify = (kind, title, body) => {
    if (!notifyConfig.enabled) return;
    if (kind === "start" && !notifyConfig.notifyStart) return;
    if (kind === "done" && !notifyConfig.notifyDone) return;
    if (kind === "schedule" && !notifyConfig.notifySchedule) return;
    notify(title, body);
  };

  // ── task lifecycle notifications ──
  ctx.on("session/event", (_session, event) => {
    try {
      if (event?.type === "user/message" && event.data?.source?.kind === "user") {
        const text = summarize(event.data.content);
        maybeNotify("start", "AI 开始执行任务", text || "用户提交了新任务");
      } else if (event?.type === "assistant/message") {
        const text = summarize(event.data?.message?.content);
        maybeNotify("done", "AI 已完成任务", text || "回复已完成");
      }
    } catch (error) {
      ctx.logger.warn(`task-notify: session event handling failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  // ── scheduler timers ──
  // A task fires on: a specific date+time (one-shot or repeating every day /
  // weekday / weekend), a daily time, or a minute interval — first match wins.
  const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  /** True when the YYYY-MM-DD string is a real calendar date (rejects 2026-13-40). */
  const validDate = (value) => {
    if (!DATE_RE.test(value)) return false;
    const [y, mo, d] = value.split("-").map(Number);
    const dt = new Date(y, mo - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
  };
  const REPEATS = new Set(["none", "daily", "weekday", "weekend"]);
  /** setTimeout's 32-bit cap (~24.8 days): cap long waits and re-arm on fire. */
  const MAX_TIMEOUT_MS = 0x7fffffff;
  const timers = new Map();
  const fireTask = (task) => {
    const taskName = task.name || "未命名任务";
    const prompt = typeof task.prompt === "string" ? task.prompt.trim() : "";
    maybeNotify("schedule", "定时任务", prompt !== "" ? `${taskName}：AI 正在执行` : taskName);
    if (prompt !== "") {
      void runAiTask(ctx, prompt).catch((error) => {
        ctx.logger.warn(`task-notify: AI task failed: ${error instanceof Error ? error.message : String(error)}`);
      });
    }
    const command = typeof task.command === "string" ? task.command.trim() : "";
    if (command !== "") {
      exec(command, { windowsHide: true }, (error) => {
        if (error) ctx.logger.warn(`task-notify: scheduled command failed: ${error.message}`);
      });
    }
  };
  /** Next fire date for a date-time task, or undefined when it's in the past (one-shot). */
  const nextDateFire = (task, from) => {
    if (task.date === undefined || task.time === undefined) return undefined;
    const [y, mo, d] = task.date.split("-").map(Number);
    const [h, mi] = task.time.split(":").map(Number);
    const base = new Date(y, mo - 1, d, h, mi, 0, 0);
    const repeat = REPEATS.has(task.repeat) ? task.repeat : "none";
    if (repeat === "none") return base.getTime() > from.getTime() ? base : undefined;
    const matches = (dt) => {
      const dow = dt.getDay();
      if (repeat === "daily") return true;
      if (repeat === "weekday") return dow >= 1 && dow <= 5;
      return dow === 0 || dow === 6;
    };
    const candidate = new Date(base);
    if (candidate.getTime() <= from.getTime()) candidate.setDate(candidate.getDate() + 1);
    let guard = 0;
    while (!matches(candidate) && guard < 400) {
      candidate.setDate(candidate.getDate() + 1);
      guard += 1;
    }
    return candidate.getTime() > from.getTime() ? candidate : undefined;
  };
  /** Arm one task: date-time > daily time > minute interval. */
  const armTask = (task) => {
    const now = new Date();
    if (task.date !== undefined && DATE_RE.test(String(task.date)) && task.time !== undefined && TIME_RE.test(String(task.time))) {
      const fireAt = nextDateFire(task, now);
      if (fireAt === undefined) return; // one-shot in the past: nothing to arm
      const repeat = REPEATS.has(task.repeat) ? task.repeat : "none";
      const arm = () => {
        const fireAtNow = nextDateFire(task, new Date());
        if (fireAtNow === undefined) return;
        const delay = Math.min(Math.max(1000, fireAtNow.getTime() - Date.now()), MAX_TIMEOUT_MS);
        const timer = setTimeout(() => {
          if (timers.get(task.id) !== timer) return;
          if (delay === MAX_TIMEOUT_MS) { arm(); return; } // still far in the future: keep waiting
          fireTask(task);
          if (repeat !== "none") arm(); // re-arm for the next matching day
        }, delay);
        timers.set(task.id, timer);
      };
      arm();
      return;
    }
    const daily = typeof task.time === "string" && TIME_RE.test(task.time.trim());
    if (daily) {
      const [h, m] = task.time.trim().split(":").map(Number);
      const arm = () => {
        const now2 = new Date();
        const next = new Date(now2);
        next.setHours(h, m, 0, 0);
        if (next.getTime() <= now2.getTime()) next.setDate(next.getDate() + 1);
        const delay = Math.min(Math.max(1000, next.getTime() - now2.getTime()), MAX_TIMEOUT_MS);
        const timer = setTimeout(() => {
          if (timers.get(task.id) !== timer) return;
          if (delay === MAX_TIMEOUT_MS) { arm(); return; } // re-arm if still >24.8 days out
          fireTask(task);
          arm(); // re-arm for the next day
        }, delay);
        timers.set(task.id, timer);
      };
      arm();
      return;
    }
    const intervalMs = (Number(task.intervalMinutes) || MIN_INTERVAL_MINUTES) * 60 * 1000;
    const timer = setInterval(() => fireTask(task), intervalMs);
    timers.set(task.id, timer);
  };
  const rebuildTimers = (tasks) => {
    // clearTimeout also clears interval timers in Node.
    for (const timer of timers.values()) clearTimeout(timer);
    timers.clear();
    for (const task of tasks) {
      if (task?.enabled !== true) continue;
      try {
        armTask(task);
      } catch (error) {
        ctx.logger.warn(`task-notify: failed to arm scheduled task: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };
  ctx.effect(() => () => {
    for (const timer of timers.values()) clearInterval(timer);
    timers.clear();
  }, "task-notify: clear timers");
  void readTasks().then(rebuildTimers).catch((error) => {
    ctx.logger.warn(`task-notify: failed to load scheduler store: ${error instanceof Error ? error.message : String(error)}`);
  });

  // ── scheduler HTTP (settings viewer) ──
  const httpDisposers = [];
  const syncHttp = () => {
    for (const dispose of httpDisposers) dispose();
    httpDisposers.length = 0;
    const webServer = ctx.get("webServer", false);
    if (webServer === undefined) return;
    httpDisposers.push(ctx.effect(() => webServer.register({
      kind: "exact",
      path: SCHEDULER_HTTP_PATH,
      handler: async (req, res) => {
        const respond = (status, value) => {
          res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
          res.end(JSON.stringify(value));
        };
        try {
          if (req.method === "GET") {
            respond(200, { tasks: await readTasks() });
            return;
          }
          let body;
          try {
            body = JSON.parse(await readBody(req) || "{}");
          } catch {
            respond(400, { error: "invalid JSON body" });
            return;
          }
          const tasks = await readTasks();
          const op = body.op;
          if (op === "add") {
            const taskName = String(body.name ?? "").trim();
            if (taskName === "") { respond(400, { error: "task name required" }); return; }
            const time = typeof body.time === "string" ? body.time.trim() : "";
            if (time !== "" && !TIME_RE.test(time)) { respond(400, { error: "time must be HH:MM" }); return; }
            const date = typeof body.date === "string" ? body.date.trim() : "";
            if (date !== "" && !validDate(date)) { respond(400, { error: "date must be a valid YYYY-MM-DD" }); return; }
            const repeat = typeof body.repeat === "string" && REPEATS.has(body.repeat) ? body.repeat : "none";
            const id = `s${Date.now().toString(36)}`;
            tasks.push({
              id,
              name: taskName,
              prompt: typeof body.prompt === "string" ? body.prompt : "",
              time: time !== "" ? time : undefined,
              date: date !== "" ? date : undefined,
              repeat: repeat !== "none" ? repeat : undefined,
              intervalMinutes: Math.max(MIN_INTERVAL_MINUTES, Math.round(Number(body.intervalMinutes) || MIN_INTERVAL_MINUTES)),
              command: typeof body.command === "string" ? body.command : "",
              enabled: true
            });
            await writeTasks(tasks);
            rebuildTimers(tasks);
            respond(200, { tasks });
          } else if (op === "update" && typeof body.id === "string") {
            const task = tasks.find((t) => t.id === body.id);
            if (task === undefined) { respond(404, { error: "task not found" }); return; }
            const patch = body.patch;
            if (patch && typeof patch === "object" && !Array.isArray(patch)) {
              if (typeof patch.time === "string") {
                const time = patch.time.trim();
                if (time !== "" && !TIME_RE.test(time)) { respond(400, { error: "time must be HH:MM" }); return; }
                task.time = time !== "" ? time : undefined;
              }
              if (typeof patch.date === "string") {
                const date = patch.date.trim();
                if (date !== "" && !validDate(date)) { respond(400, { error: "date must be a valid YYYY-MM-DD" }); return; }
                task.date = date !== "" ? date : undefined;
              }
              if (typeof patch.repeat === "string") {
                task.repeat = REPEATS.has(patch.repeat) && patch.repeat !== "none" ? patch.repeat : undefined;
              }
              if (typeof patch.name === "string" && patch.name.trim() !== "") task.name = patch.name.trim();
              if (typeof patch.prompt === "string") task.prompt = patch.prompt;
              if (patch.intervalMinutes !== undefined) {
                task.intervalMinutes = Math.max(MIN_INTERVAL_MINUTES, Math.round(Number(patch.intervalMinutes) || MIN_INTERVAL_MINUTES));
              }
              if (typeof patch.command === "string") task.command = patch.command;
              if (typeof patch.enabled === "boolean") task.enabled = patch.enabled;
            }
            await writeTasks(tasks);
            rebuildTimers(tasks);
            respond(200, { tasks });
          } else if (op === "remove" && typeof body.id === "string") {
            const next = tasks.filter((t) => t.id !== body.id);
            await writeTasks(next);
            rebuildTimers(next);
            respond(200, { tasks: next });
          } else if (op === "toggle" && typeof body.id === "string") {
            const task = tasks.find((t) => t.id === body.id);
            if (task === undefined) { respond(404, { error: "task not found" }); return; }
            task.enabled = !task.enabled;
            await writeTasks(tasks);
            rebuildTimers(tasks);
            respond(200, { tasks });
          } else {
            respond(400, { error: "unsupported operation" });
          }
        } catch (error) {
          respond(500, { error: error instanceof Error ? error.message : String(error) });
        }
      }
    }), `task-notify: ${SCHEDULER_HTTP_PATH} route`));
  };
  ctx.on("internal/service", syncHttp);
  syncHttp();

  // ── settings gates ──
  ctx.inject(["settings"], (settingsCtx) => {
    const scope = settingsCtx.settings.register(NOTIFY_SETTINGS_NS, NotifySettingsSchema);
    scope.watch((next) => {
      notifyConfig = next;
    });
    notifyConfig = scope.get();
  });
}

export { apply, inject, name };

// DeepSeek Harness delayed-reminder plugin.
//
// One model-facing tool:
//
//   remind(delayMinutes, title, body?) — schedule a desktop notification X
//   minutes from now. The reminder fires as a `dsh/notify` context event,
//   which the Electron shell turns into a Windows notification (and a sound).
//
// Timers live in the plugin context and are cleaned up on dispose; reminders
// do not survive a restart (they are short-lived by design — minutes, not
// days; scheduled/repeating jobs belong to the scheduler plugin).
//
// @module @deepseek-ai/dsh-tool-remind
import { defineTool } from "@deepseek-ai/dsh-tools";

/** Cordis plugin name. */
const name = "tool-remind";
/** Required services: the tool registry. */
const inject = ["tools"];

/** Bounds on the delay (minutes). */
const MIN_DELAY = 0.1;
const MAX_DELAY = 24 * 60;
/** Live reminder count so a runaway model cannot spawn timers forever. */
const MAX_PENDING = 50;
let pending = 0;

const remindTool = defineTool({
  name: "remind",
  description:
    "Schedule a delayed desktop notification for the user: 'remind me in 30 minutes to check the build'. " +
    "Fires a Windows notification (with sound) after the delay. Use it whenever the user asks to be reminded " +
    "about something later. Delays are minutes (0.1 = 6 seconds, 1440 = 1 day); reminders do not survive an app restart, " +
    "so for long-term or repeating schedules prefer the scheduler tasks instead.",
  parameters: {
    delayMinutes: {
      type: "number",
      required: true,
      description: "Minutes from now until the notification fires (0.1–1440)."
    },
    title: {
      type: "string",
      required: true,
      description: "Notification title, e.g. '提醒：检查构建结果'."
    },
    body: {
      type: "string",
      description: "Optional notification body with the details."
    }
  },
  output: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        scheduled: { type: "boolean", required: true },
        fireAt: { type: "string", required: true },
        title: { type: "string", required: true }
      }
    },
    render: (_args, value) => [
      { type: "text", text: value.scheduled ? `已设定提醒：${value.fireAt}「${value.title}」` : "提醒设定失败（数量已达上限）" }
    ]
  },
  async execute(args, _exec, ctx) {
    const delay = Number(args.delayMinutes);
    if (!Number.isFinite(delay) || delay < MIN_DELAY || delay > MAX_DELAY) {
      throw new Error(`remind: delayMinutes 必须在 ${MIN_DELAY}–${MAX_DELAY} 之间`);
    }
    const title = String(args.title ?? "").trim();
    if (title === "") throw new Error("remind: title 不能为空");
    const body = String(args.body ?? "");
    if (pending >= MAX_PENDING) return { scheduled: false, fireAt: "", title };
    const fireAt = new Date(Date.now() + delay * 60000);
    pending += 1;
    // Timer ownership on the registrant context (passed as the third argument
    // by the tools registry): disposing the plugin clears every pending timer.
    const owner = ctx ?? pluginCtx;
    owner?.effect?.(() => {
      const timer = setTimeout(() => {
        pending -= 1;
        try {
          owner.emit("dsh/notify", { title, body, sound: "message" });
        } catch { /* shell may be gone */ }
      }, Math.max(1000, Math.round(delay * 60000)));
      return () => {
        clearTimeout(timer);
      };
    });
    return { scheduled: true, fireAt: fireAt.toLocaleString(), title };
  },
  presentCall: (args) => ({ card: "generic", title: "定时提醒", kind: "other", rawInput: `${args.delayMinutes} 分钟后：${args.title}` })
});

/** Captured plugin context for timer ownership when the registry passes none. */
let pluginCtx = undefined;

/**
 * Register the remind tool.
 * @param ctx - registrant context carrying the tool registry.
 */
function apply(ctx) {
  pluginCtx = ctx;
  ctx.tools.register(remindTool);
}

export { apply, inject, name };

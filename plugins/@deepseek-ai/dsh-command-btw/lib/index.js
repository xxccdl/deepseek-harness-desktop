// DeepSeek Harness /btw command.
//
// Ask the running agent a SIDE question without interrupting its current task:
//
//   /btw 你在干嘛，还剩什么文件没有生成？
//
// Delivery follows the agent's lifecycle:
//   - agent is RUNNING → `agent.inject(message)`: queued as non-waking
//     `next-step` context. The in-flight LLM request / tool run is never
//     interrupted; the agent claims the question at the nearest later step
//     boundary (typically right after it finishes the current step) and
//     answers briefly before continuing.
//   - agent is IDLE → `agent.followup(message)`: starts a fresh turn so the
//     question is answered instead of sitting in the inbox forever.
//
// The message is wrapped in a short framing line so the model understands it
// is a low-priority side question (answer in one sentence, do not pivot the
// task), and carries a `plugin` source so it is clearly tagged as injected
// context rather than a normal user prompt.
//
// @module @deepseek-ai/dsh-command-btw
import { createUserMessage } from "@deepseek-ai/dsh-llm";

/** Cordis plugin name. */
const name = "command-btw";
/** Required services: the command registry. */
const inject = ["commands"];

/** Frame the question so the model treats it as a low-priority side note. */
const BTW_PREFIX =
  "[旁路问题] 请在不打断你当前任务的前提下，简短回答这个问题（一两句话即可，回答完继续手头的工作）。问题：";

/**
 * Register the /btw command.
 * @param ctx - registrant context carrying the command registry.
 */
function apply(ctx) {
  ctx.commands.register({
    name: "btw",
    description: "旁路提问：不打断 agent 当前任务，插入一个它会稍后简短回答的问题",
    input: { hint: "<问题内容>" },
    handler: (invocation) => {
      const question = invocation.rawInput.trim();
      if (question.length === 0) {
        return { kind: "error", text: "用法：/btw <问题内容>，例如“/btw 还剩什么文件没生成？”" };
      }
      const message = createUserMessage({
        content: [{ type: "text", text: BTW_PREFIX + question }],
        source: { kind: "plugin", plugin: "command-btw" }
      });
      const agent = invocation.agent;
      // Running → inject (non-waking next-step context, nothing is aborted);
      // idle → followup so the question is actually answered.
      if (agent.status === "idle") agent.followup(message);
      else agent.inject(message);
      return { kind: "success", text: `已插入旁路问题（${agent.status === "idle" ? "agent 空闲，将立即回答" : "不打断当前任务，agent 会在合适的时机回答"}）：${question}` };
    }
  });
}

export { apply, inject, name };

// DeepSeek Harness mobile bridge.
//
// Subscribes to the harness-wide `dsh/notify` context event — emitted by
// dsh-tool-notify (AI task start/done, scheduled tasks) and dsh-tool-remind
// (delayed reminders) — and writes each payload as a tiny JSON file under the
// app files' `notify/` directory. The Android native layer watches that
// directory with a FileObserver and posts a system notification, so
// notifications fire even when the UI is backgrounded or closed (entirely
// independent of the React Native JS thread).
//
// It also mirrors the tool the AI is currently running (`tools/execute` /
// `tools/post-execute`) into <files>/status/current-tool.json, which the
// native floating ball polls to show "AI is using tool X" on the ball.
import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

/** Cordis plugin name. */
const name = "mobile-bridge";
/** Requires the tool registry so `tools/execute` events are observable. */
const inject = ["tools"];

/** Notify queue dir: <files>/notify — DSH_BUNDLE env points at <files>/dsh. */
function notifyDir() {
  const bundle = process.env.DSH_BUNDLE ?? "";
  return join(dirname(bundle), "notify");
}

/** Current-tool status dir: <files>/status. */
function statusDir() {
  const bundle = process.env.DSH_BUNDLE ?? "";
  return join(dirname(bundle), "status");
}

/** 原子写入一个 JSON 状态文件（tmp + rename），并串行化保证最终落盘为最后一次写入。 */
let writeChain = Promise.resolve();
function writeJsonFile(dir, fileName, payload) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const tmp = join(dir, `${id}.tmp`);
  const file = join(dir, fileName);
  writeChain = writeChain
    .then(() => mkdir(dir, { recursive: true }))
    .then(() => writeFile(tmp, JSON.stringify(payload), "utf8"))
    .then(() => rename(tmp, file))
    .catch((error) => {
      try {
        ctx?.logger?.warn?.(
          `mobile-bridge: failed to write ${fileName}: ${error instanceof Error ? error.message : String(error)}`,
        );
      } catch {}
    });
  return writeChain;
}

let ctx = null;

function apply(pluginCtx) {
  ctx = pluginCtx;
  pluginCtx.on("dsh/notify", (payload) => {
    const title = typeof payload?.title === "string" ? payload.title : "DeepSeek Harness";
    const body = typeof payload?.body === "string" ? payload.body : "";
    // deliver 产物：透传 kind/path/name，原生层据此弹「点击保存」通知
    const kind = typeof payload?.kind === "string" ? payload.kind : undefined;
    const path = typeof payload?.path === "string" ? payload.path : undefined;
    const name = typeof payload?.name === "string" ? payload.name : undefined;
    writeJsonFile(notifyDir(), `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.json`, {
      title,
      body,
      ...(kind !== undefined ? { kind } : {}),
      ...(path !== undefined ? { path } : {}),
      ...(name !== undefined ? { name } : {}),
    });
  });

  // ── AI 当前工具：工具开始写入名称，全部结束后清空（悬浮球标签用） ──
  // 并发工具用计数跟踪：只显示「最后一个开始」的工具，全部结束才归零。
  let activeCount = 0;
  let currentTool = null;
  const writeTool = (tool) => {
    if (tool === currentTool) return;
    currentTool = tool;
    writeJsonFile(statusDir(), "current-tool.json", { tool });
  };
  pluginCtx.on("tools/execute", async (exec, next) => {
    activeCount++;
    writeTool(typeof exec?.name === "string" && exec.name ? exec.name : "tool");
    return next();
  });
  pluginCtx.on("tools/post-execute", async (exec, result, next) => {
    if (activeCount > 0) activeCount--;
    if (activeCount === 0) writeTool(null);
    return next();
  });
}

export { apply, inject, name };

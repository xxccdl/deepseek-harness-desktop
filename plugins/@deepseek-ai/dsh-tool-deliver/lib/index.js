// DeepSeek Harness artifact-delivery plugin.
//
// The model-facing `send_file` tool lets the AI hand a produced artifact (image,
// document, code, archive, report, …) to the user. It copies the file into
// <files>/deliver/<name> and emits a `dsh/notify` event with `kind: "deliver"`.
//
// `presentCall` publishes `kind: "deliver"` + `locations` so the web client
// plugin (dsh-client-ui-deliver) can render a "产物" tag with a one-tap "保存"
// button below it (the button posts back to the React Native WebView bridge).
//
// The staging path is deterministic (no timestamp): <files>/deliver/<safeName>,
// so `presentCall` and `execute` agree without sharing mutable state.
//
// @module @deepseek-ai/dsh-tool-deliver
import { resolve, basename, join, dirname } from "node:path";
import { access, copyFile, mkdir, stat } from "node:fs/promises";
import { defineTool } from "@deepseek-ai/dsh-tools";

/** Cordis plugin name. */
const name = "tool-deliver";
/** Required services: the tool registry. */
const inject = ["tools"];

/** Delivery staging dir: <files>/deliver (DSH_BUNDLE points at <files>/dsh). */
function deliverDir() {
  const bundle = process.env.DSH_BUNDLE ?? "";
  return join(dirname(bundle), "deliver");
}

/** Strip path separators and problem characters from a display name. */
function safeName(value) {
  const base = basename(String(value)).trim();
  return base.replace(/[\\/:*?"<>|]/g, "_") || "artifact";
}

/** Deterministic staging path for a call's arguments. */
function stagingPath(args) {
  const srcPath = resolve(process.cwd(), String(args?.path ?? ""));
  const display = typeof args?.name === "string" && args.name.trim() !== "" ? args.name.trim() : basename(srcPath);
  return join(deliverDir(), safeName(display));
}

function apply(ctx) {
  const sendFile = defineTool({
    name: "send_file",
    description:
      "Deliver a finished artifact file to the user. On mobile the user can tap a notification or the artifact's save button to store it in Download/DeepSeekHarness. " +
      "Use this for produced outputs (images, documents, code, archives, reports). Provide an absolute path or a path relative to the workspace.",
    parameters: {
      path: { type: "string", required: true, description: "Path to the artifact file (absolute or relative to the workspace)." },
      name: { type: "string", description: "Optional display name; defaults to the file name." }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          ok: { type: "boolean", required: true },
          name: { type: "string", required: true },
          size: { type: "integer", required: true },
          path: { type: "string", required: true }
        }
      },
      render: (_args, value) => [{ type: "text", text: `已交付产物「${value.name}」（${value.size} 字节），用户可在产物标签下方一键保存。` }]
    },
    async execute(args) {
      const srcPath = resolve(process.cwd(), String(args.path ?? ""));
      await access(srcPath);
      const info = await stat(srcPath);
      if (!info.isFile()) throw new Error(`send_file: 不是文件: ${srcPath}`);
      const dest = stagingPath(args);
      await mkdir(deliverDir(), { recursive: true });
      await copyFile(srcPath, dest);
      ctx.emit("dsh/notify", {
        kind: "deliver",
        title: "AI 产物已生成",
        body: `${safeName(basename(dest))}（${info.size} 字节）· 点击保存到 Download/DeepSeekHarness`,
        path: dest,
        name: safeName(basename(dest))
      });
      return { ok: true, name: safeName(basename(dest)), size: info.size, path: dest };
    },
    presentCall: (args) => ({
      card: "generic",
      title: "交付产物",
      kind: "deliver",
      locations: [{ path: stagingPath(args) }]
    })
  });

  ctx.tools.register(sendFile);
}

export { apply, inject, name };
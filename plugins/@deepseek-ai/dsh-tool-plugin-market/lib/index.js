// Publish a plugin to the DSH plugin market — the tool behind the
// 「插件发布」button in creation mode.
//
// The bridge does the work (packaging, upload, token bookkeeping); this row only
// exists so the model can drive it: after a session has written a plugin, one
// tool call puts it on the shelf and reports the link back.
//
// @module @deepseek-ai/dsh-tool-plugin-market
import { defineTool } from "@deepseek-ai/dsh-tools";

/** Cordis plugin name. */
const name = "tool-plugin-market";
/** Required services: the tool registry and the market bridge. */
const inject = ["tools", "pluginMarket"];

/**
 * Register the publish tool.
 * @param ctx - registrant context carrying the tool registry and the bridge.
 */
function apply(ctx) {
  ctx.tools.register(defineTool({
    name: "plugin_publish",
    description:
      "把工作区里的插件发布到 DeepSeek Harness 插件市场（plugin market）。" +
      "用户点「插件发布」按钮后调用它：参数 path 指向插件包目录（含 package.json 的那一层）；" +
      "不确定路径时留空，会自动在工作区里找到最近修改的插件包。" +
      "同时把 title / summary / category / tags / author 填上，让插件在市场里能被搜到。" +
      "返回里带市场链接，请把链接回报给用户。",
    parameters: {
      path: { type: "string", description: "插件包目录（相对工作目录；留空自动查找）" },
      title: { type: "string", description: "展示名（中文，例如「会话时钟」）" },
      summary: { type: "string", description: "一句话简介（40 字以内，会显示在列表里）" },
      category: { type: "string", description: "分类，例如 开发工具 / 效率提升 / 内容创作 / 数据分析 / 界面美化 / 其他" },
      tags: { type: "array", items: { type: "string" }, description: "搜索用标签，2-5 个" },
      author: { type: "string", description: "作者名（留空则记为匿名作者）" },
      note: { type: "string", description: "本次版本的更新说明（可选）" },
      readme: { type: "string", description: "Markdown 说明（可选；包内 README.md 优先）" },
      kind: { type: "string", description: "plugin（默认）或 skill" }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          published: { type: "boolean", required: true },
          id: { type: "string", required: true },
          name: { type: "string", required: true },
          version: { type: "string", required: true },
          url: { type: "string", required: true },
          created: { type: "boolean", required: true },
          bytes: { type: "integer", required: true },
          message: { type: "string", required: true }
        }
      },
      render: (_args, value) => [{ type: "text", text: `${value.message}\n市场链接：${value.url}` }]
    },
    async execute(args, exec) {
      exec.signal?.throwIfAborted?.();
      const result = await ctx.pluginMarket.publish({
        path: args.path,
        title: args.title,
        summary: args.summary,
        category: args.category,
        tags: Array.isArray(args.tags) ? args.tags : undefined,
        author: args.author,
        note: args.note,
        readme: args.readme,
        kind: args.kind
      });
      return {
        published: true,
        id: result.id,
        name: result.name,
        version: result.version,
        url: result.url,
        created: result.created,
        bytes: result.bytes,
        message: result.message
      };
    },
    presentCall: (args) => ({ card: "generic", title: "发布插件到插件市场", kind: "other", rawInput: String(args?.path ?? "") })
  }));
}

export { apply, inject, name };

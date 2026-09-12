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
 * Register the publish tools.
 *
 * `plugin_publish` does the work; `ask-publish-plugin` is only a signal: after
 * the session has written a plugin or skill, the model calls it to light up the
 * 「插件发布」strip above the composer, where the user picks the version and
 * confirms. The call is recorded as an ordinary tool/call log event, which the
 * host's `publishHint` projection folds into the strip's visibility — so this
 * tool needs no side effects of its own.
 * @param ctx - registrant context carrying the tool registry and the bridge.
 */
function apply(ctx) {
  ctx.tools.register(defineTool({
    name: "ask-publish-plugin",
    description:
      "写完一个插件或技能后调用本工具，向用户展示发布选项（输入框上方会出现发布条，用户可在那里选择版本号并确认发布）。" +
      "参数都可选：path 传刚写好的包目录（含 package.json 或 SKILL.md 的那一层），kind 传 plugin 或 skill，" +
      "title 传建议的中文展示名，summary 传一句话简介。" +
      "调用后等用户操作：用户确认后你再调用 plugin_publish；用户没有确认就不要发布，也不要重复调用本工具。",
    parameters: {
      path: { type: "string", description: "刚写好的插件或技能目录（相对工作目录；留空自动查找）" },
      kind: { type: "string", description: "plugin 或 skill（留空自动判断）" },
      title: { type: "string", description: "建议的中文展示名" },
      summary: { type: "string", description: "一句话简介" }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          offered: { type: "boolean", required: true },
          path: { type: "string", required: true },
          kind: { type: "string", required: true },
          message: { type: "string", required: true }
        }
      },
      render: (_args, value) => [{ type: "text", text: value.message }]
    },
    async execute(args, exec) {
      exec.signal?.throwIfAborted?.();
      return {
        offered: true,
        path: typeof args.path === "string" ? args.path : "",
        kind: args.kind === "skill" ? "skill" : "plugin",
        message: "已在输入框上方展示发布条，用户可在那里选择版本号并确认发布。等用户操作即可；若用户直接要求发布，再调用 plugin_publish。"
      };
    },
    presentCall: (args) => ({ card: "generic", title: args?.kind === "skill" ? "提供发布技能" : "提供发布插件", kind: "other", rawInput: String(args?.path ?? "") })
  }));

  ctx.tools.register(defineTool({
    name: "plugin_publish",
    description:
      "把工作区里的插件或技能发布到 DeepSeek Harness 插件市场（plugin market）。" +
      "发布插件：path 指向含 package.json 的目录，同时填 title / summary / category / tags / author。" +
      "发布技能：kind 传 skill，path 指向含 SKILL.md 的目录（技能不需要 package.json），" +
      "SKILL.md 的 frontmatter 必须有 name（小写字母/数字/连字符）和 description；" +
      "技能没有自己的版本号，重复发布会自动递增 patch 版本，也可用 version 显式指定。" +
      "不确定路径时留空，会自动在工作区里找到最近修改的包。" +
      "返回里带市场链接，请把链接回报给用户。",
    parameters: {
      path: { type: "string", description: "插件或技能目录（相对工作目录；留空自动查找）" },
      kind: { type: "string", description: "plugin（默认）或 skill" },
      title: { type: "string", description: "展示名（中文，例如「会话时钟」）" },
      summary: { type: "string", description: "一句话简介（40 字以内，会显示在列表里）" },
      category: { type: "string", description: "分类，例如 开发工具 / 效率提升 / 内容创作 / 数据分析 / 界面美化 / 其他" },
      tags: { type: "array", items: { type: "string" }, description: "搜索用标签，2-5 个" },
      author: { type: "string", description: "作者名（留空则记为匿名作者）" },
      version: { type: "string", description: "版本号 x.y.z（可选；技能留空自动递增）" },
      note: { type: "string", description: "本次版本的更新说明（可选）" },
      readme: { type: "string", description: "Markdown 说明（可选；包内 README.md 优先）" }
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
        kind: args.kind,
        title: args.title,
        summary: args.summary,
        category: args.category,
        tags: Array.isArray(args.tags) ? args.tags : undefined,
        author: args.author,
        version: args.version,
        note: args.note,
        readme: args.readme
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
    presentCall: (args) => ({ card: "generic", title: args?.kind === "skill" ? "发布技能到插件市场" : "发布插件到插件市场", kind: "other", rawInput: String(args?.path ?? "") })
  }));
}

export { apply, inject, name };

// Create a GitHub release (no assets) for the current tag using the token
// resolved from git's credential store (same credential the push used).
import { execSync } from "node:child_process";

const owner = "xxccdl";
const repo = "deepseek-harness-desktop";
const tag = process.argv[2] ?? "v1.4.0";

// Resolve the token from git credential manager without printing it.
const cred = execSync(`git credential fill`, {
  input: "protocol=https\nhost=github.com\n\n",
  encoding: "utf8"
});
const tokenLine = cred.split(/\r?\n/).find((l) => l.startsWith("password="));
if (!tokenLine) {
  console.error("no github credential found");
  process.exit(1);
}
const token = tokenLine.slice("password=".length);

const body = [
  "## 1.4.0",
  "",
  "- 新增**首次使用向导与使用教程**：首次启动引导配置 DeepSeek，附完整使用教程，图标全部使用 SVG、按钮克制不花哨",
  "- 新增 **17 项界面增强**：Ctrl+K 会话搜索、F1 快捷键帮助、Ctrl+Shift+V 剪贴板历史、Ctrl+E Markdown 导出、代码块工具栏（复制/保存/折叠）、Mermaid 图表渲染等",
  "- 新增**统计面板**：用量花费与余额、会话统计（总数/运行中/今日）、当前会话消息与工具统计",
  "- 新增**代码片段面板**与代码片段管理工具（保存/列出/获取/删除）",
  "- 新增 **/btw 旁路命令**：不打断 agent 当前任务的前提下插入问题，例如“/btw 你在干嘛，还剩什么文件没有生成？”",
  "- 新增模型侧工具：网页抓取 web_fetch、定时提醒 remind、文件名搜索 filesearch、剪贴板读写 clipboard",
  "- 支持**静默启动**（--hidden，随系统自启），启动后驻留托盘",
  "- 细节打磨：窗口缩放/置顶状态持久化等",
  "",
  "安装包与便携版见本地 dist/ 目录（本 release 不附安装包）。"
].join("\n");

const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "dsh-desktop-release-script"
  },
  body: JSON.stringify({
    tag_name: tag,
    target_commitish: "main",
    name: `DeepSeek Harness Desktop ${tag.replace(/^v/, "")}`,
    body,
    draft: false,
    prerelease: false
  })
});

if (!res.ok) {
  const text = await res.text();
  console.error(`release create failed: HTTP ${res.status}`, text);
  process.exit(1);
}
const data = await res.json();
console.log("release created:", data.html_url);

// Create a GitHub release (no assets) for the current tag using the token
// resolved from git's credential store (same credential the push used).
import { execSync } from "node:child_process";

const owner = "xxccdl";
const repo = "deepseek-harness-desktop";
const tag = process.argv[2] ?? "v1.2.6";

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
  "## 1.2.6",
  "",
  "- 新增「检查更新」：设置中检测 GitHub 最新版本，查看更新日志，一键下载安装（50 线程多线程加速下载）",
  "- 新增「置顶会话」：侧边栏会话列表悬停出现图钉，置顶会话固定在列表顶部",
  "- 重设计「定时任务」设置界面：任务卡片展示计划与下次执行时间，编辑区折叠，新建表单更清晰",
  "- 移除文件管理器（右侧抽屉）",
  "- 既有快捷输入（Ctrl+D+S）、通知、记忆等功能继续可用",
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

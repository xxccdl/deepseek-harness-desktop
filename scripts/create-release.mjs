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
  "## 1.2.7",
  "",
  "- 新增「浏览器控制」：设置页可启用/配置 Edge/Chrome（浏览器、调试端口、无头模式、自动提醒），AI 通过 `browser_control` 工具执行复杂网页自动化——打开网页、标签页管理（列出/切换/新建/关闭）、点击/双击/右键/悬停（CSS 选择器、可见文本或坐标定位）、输入文字、按键（含回车表单提交兜底）、滚动、执行 JS、截图、前进/后退/刷新、等待",
  "- 修复：设置页「浏览器控制」的启用开关点不动（`browser-control` 设置命名空间未对配置客户端暴露，现已在 dsh-apiproxy 白名单放行，读写均生效）",
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

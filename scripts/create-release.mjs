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
  "## 1.5.2",
  "",
  "- **视觉模型集成**：新增 `vision_analyze` 工具，支持本地图片分析与屏幕画面理解（需使用支持视觉的多模态模型）",
  "- **模型类型自动识别**：修复自定义提供方多模态模型被误判为纯文本的问题——自动解析 `/models` 接口的 `input_modalities`，视觉模型自动标注「图像输入」能力",
  "- **模型「图像输入」开关**：设置 → 模型 每个模型行的展开区新增「图像输入」开关，可手动标记/修正模型是否支持图片",
  "- **欢迎向导不再重复弹出**：首次使用向导的完成状态持久化保存，不再受端口变化影响而每次启动都弹出；已配置模型密钥的老用户自动跳过",
  "- **read_image 修复**：多模态模型现在可以正常读取图片文件（此前因能力标注缺失被拒绝）",
  "",
  "安装包（NSIS）与便携版见下方 Assets。",
  "",
  "## 1.5.0",
  "",
  "- 新增多款插件与工具（交付、悬浮球、检查更新、手机控制基础等）",
  "- 内部引擎与插件同步更新"
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

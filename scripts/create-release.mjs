// Create a GitHub release (no assets) for the current tag using the token
// resolved from git's credential store (same credential the push used).
import { execSync } from "node:child_process";

const owner = "xxccdl";
const repo = "deepseek-harness-desktop";
const tag = process.argv[2] ?? "v1.2.9";

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
  "## 1.2.9",
  "",
  "- 全新高速多线程下载引擎：官方源 + 加速镜像**并行测速择优**（直连被限速时自动走镜像，速度可达数 MB/s）；AIMD 拥塞控制自动调节并发，段级拆分重试应对慢速/超时",
  "- 新增**自定义镜像源**设置：设置 → 更新 → 加速镜像源，可增删镜像、恢复默认，持久化保存",
  "- 修复：下载慢速时 30s 段超时导致 'The operation was aborted'（段超时放宽 + 失败自动拆段重试）",
  "- 下载进度显示实时速度、剩余时间、活跃线程数与当前源（直连/加速镜像）",
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

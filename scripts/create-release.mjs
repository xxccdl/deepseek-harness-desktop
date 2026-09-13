// Create a GitHub release (no assets) for the current tag using the token
// resolved from git's credential store (same credential the push used).
import { execSync } from "node:child_process";

const owner = "xxccdl";
const repo = "deepseek-harness-desktop";
const tag = process.argv[2] ?? "v1.6.4";

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
  "## 1.6.4",
  "",
  "- **修复插件市场无法安装**：打包版里 `plugins/` 与 `node_modules/` 折叠成同一个目录，而安装流程无条件把包从前者复制到后者——源和目标是同一路径，直接报 `写入插件目录失败: src and dest cannot be the same`。现在两个根指向同一目录时跳过这步镜像复制，安装、更新、卸载都已在打包布局下实测通过",
  "- **1.6.3 的启动修复一并包含**：`node_modules` 以真实目录发布（关闭 asar），打包版不再出现「plugin tree failed to load」",
  "- **修复「选择文件夹」报错**：目录选择器与内置浏览器打开改用子进程级 `ELECTRON_RUN_AS_NODE`，不再因单实例锁报 `win32 folder dialog worker exited before reporting a result`",
  "- **插件市场接入 CDN**：市场域名 `https://dsh-plugin-market.xxccdl.cn`，商店外壳走边缘缓存（`max-age=60`），目录/状态/下载接口保持 `no-store`",
  "",
  "安装包（NSIS）与便携版见下方 Assets。"
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

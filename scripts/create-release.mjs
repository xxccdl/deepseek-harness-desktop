// Create a GitHub release (no assets) for the current tag using the token
// resolved from git's credential store (same credential the push used).
import { execSync } from "node:child_process";

const owner = "xxccdl";
const repo = "deepseek-harness-desktop";
const tag = process.argv[2] ?? "v1.6.2";

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
  "## 1.6.2",
  "",
  "- **插件市场接入 CDN**：市场域名换成 `https://dsh-plugin-market.xxccdl.cn`（边缘节点 + TLS），应用内的市场窗口、安装下载、`plugin_publish` 发布全部走这个域名，不再直连裸 IP。仍可用环境变量 `DSH_MARKET_URL` 或 `$DSH_HOME/plugin-market.json` 的 `baseUrl` 覆盖",
  "- **源站缓存头修正**：商店外壳（`index.html` / `app.js`）由 `no-cache` 改为 `public, max-age=60`，边缘现在会真正缓存它（同一 URL 第二次请求即 `EO-Cache-Status: HIT`）；目录与状态接口保持 `no-store`。下载接口刻意保持 `no-store`——前置 CDN 的缓存键不含查询串，`?version=` 会被折叠成同一个键，可能把别的版本发出去，且 `X-Market-Sha256` 也来自同一份缓存，客户端的完整性校验会照过",
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

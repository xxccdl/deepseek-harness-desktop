// Create a GitHub release (no assets) for the current tag using the token
// resolved from git's credential store (same credential the push used).
import { execSync } from "node:child_process";

const owner = "xxccdl";
const repo = "deepseek-harness-desktop";
const tag = process.argv[2] ?? "v1.6.3";

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
  "## 1.6.3",
  "",
  "- **修复安装后无法启动**：上一版只把漏掉的 48 个 `@deepseek-ai` 包补进 `app.asar.unpacked`，而这些文件在 asar 索引里并不存在，真实运行的 app 又是通过 asar 虚拟路径解析模块的——等于没补，装上依然报「plugin tree failed to load」。现在关闭 asar 打包，`node_modules` 全部以真实目录发布，启动不再找不到包（`node_modules` 本来就是解包的，体积只多几 MB）",
  "- **修复「选择文件夹」报错**：原生目录选择器（以及内置浏览器打开、插件语法自检）用 `process.execPath` 起 Node 子进程，打包后这个路径就是 app 本身，新进程会被单实例锁立刻结束，于是报 `win32 folder dialog worker exited before reporting a result`。现在这些辅助子进程统一带上 `ELECTRON_RUN_AS_NODE`，以 Node 身份运行",
  "- **插件市场接入 CDN**：市场域名换成 `https://dsh-plugin-market.xxccdl.cn`（边缘节点 + TLS），市场窗口、安装下载、`plugin_publish` 发布全部走这个域名，不再直连裸 IP。仍可用环境变量 `DSH_MARKET_URL` 或 `$DSH_HOME/plugin-market.json` 的 `baseUrl` 覆盖",
  "- **源站缓存头修正**：商店外壳（`index.html` / `app.js`）改为 `public, max-age=60`，边缘实测命中（同一 TTL 窗口内 HIT，不再逐次回源）；目录与状态接口保持 `no-store`；下载接口保持 `no-store`——边缘缓存键不含查询串，`?version=` 会被折叠成同一个键，可能把别的版本发出去，且 `X-Market-Sha256` 也来自同一份缓存，客户端的完整性校验会照过",
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

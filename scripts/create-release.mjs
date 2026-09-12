// Create a GitHub release (no assets) for the current tag using the token
// resolved from git's credential store (same credential the push used).
import { execSync } from "node:child_process";

const owner = "xxccdl";
const repo = "deepseek-harness-desktop";
const tag = process.argv[2] ?? "v1.6.1";

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
  "## 1.6.1",
  "",
  "- **修复启动失败（1.6.0 装不上）**：打包时只收集 `package.json` 的依赖闭包，安装包漏掉了 48 个 `@deepseek-ai` 包（`dsh-jobs`、`dsh-settings`，以及整个桌面插件层），启动即报 `plugin tree failed to load` / 「DeepSeek Harness failed to start」。现在构建会把缺失的包补齐，安装包里的插件集与开发树逐一对应",
  "- **修复干净机器上的插件解析**：fork 挂载的 26 个行包（记忆、用量、视觉、插件市场、世界时钟等）不在任何 `package.json` 的依赖里，此前只有跑过 `scripts/install-plugins.mjs` 的开发机才解析得到。新增构建钩子 `scripts/after-pack.cjs`，把随包发布的插件集合写进打包后的 dsh 清单，启动时的 module fallback 会为所有 profile 行建立链接",
  "- **修复发布条拥挤**：创造模式的「插件发布」条改为两行布局，提示文案可换行，版本号 / 类型 / 更新说明不再被截断",
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

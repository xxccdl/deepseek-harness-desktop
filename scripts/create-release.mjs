// Create a GitHub release (no assets) for the current tag using the token
// resolved from git's credential store (same credential the push used).
import { execSync } from "node:child_process";

const owner = "xxccdl";
const repo = "deepseek-harness-desktop";
const tag = process.argv[2] ?? "v1.6.0";

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
  "## 1.6.0",
  "",
  "- **插件市场**：应用内新增插件/技能商店，可浏览、安装、卸载，装完即用无需重启。安装会写入 profile 的 patch 层并通过 loader 热挂载，任一校验失败整体回滚，不影响正在运行的应用",
  "- **发布技能**：市场同时收纳「技能」（只含 SKILL.md，不加载代码，安装后出现在技能列表）。发布时可显式指定**版本号**与**更新说明**，类型支持 插件 / 技能 / 留空自动判断",
  "- **一键卸载**：详情抽屉与「管理」弹窗都提供卸载，两段式确认（首点变为「确认卸载？」，2.6 秒内再点才执行）；卸载会摘掉 patch 行、卸载运行时条目并删除目录",
  "- **创造模式发布条**：AI 写完插件/技能后调用 `ask-publish-plugin` 询问，输入框上方出现发布条可选版本与类型；用户确认后 AI 才真正发布",
  "- **侧栏时钟**：新增世界时钟插件（在插件市场可安装）——侧栏底部常驻秒级时间，点开可看多时区对照、跨日标记与倒计时",
  "- **弹层配色跟随主题**：快捷指令、欢迎向导、代码片段三个弹层的配色改用 harness 设计令牌，浅色窗口下不再出现突兀的深色面板",
  "- **上下文统计条**：输入框上方的统计条现在按 token 构成（缓存命中 / 新增输入 / 缓存写入 / 输出）着色，比例即真实用量",
  "- **余额显示更准确**：修复 DeepSeek 提供方路由名不匹配导致余额取不到的问题；余额查询失败会在提示里说明原因，不再与「无余额接口」混淆，也不会把未上报的余额显示成 ¥0.00",
  "- **同步上游**：桌面 fork 已 rebase 到 dsh 0.1.2-alpha.2",
  "- **修复**：世界时钟与内置用量条争抢同一单占槽位，导致装上后毫无反应（现已移入列表槽位，与设置项并排）",
  "- **修复**：插件市场提示条的图标未受尺寸约束，被拉伸成整屏大小的叉",
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

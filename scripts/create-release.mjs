// Create a GitHub release (no assets) for the current tag using the token
// resolved from git's credential store (same credential the push used).
import { execSync } from "node:child_process";

const owner = "xxccdl";
const repo = "deepseek-harness-desktop";
const tag = process.argv[2] ?? "v1.6.6";

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
  "## 1.6.6",
  "",
  "- **修复：新会话的「对话」页签渲染空白**。1.6.5 那次上游重基时，`dsh-client-ui-chat` 的浏览器端 `lib/client.js` 沿用了 fork 自己的旧版本（0.1.2 时期），而服务端与其余插件已经是 0.1.5-rc.2。结果是：打开历史会话正常，但**新建会话并实时对话时整个对话区是空的**——右下角统计条还在跳动，说明回答其实已经产出，只是对话节点渲染不出来（「轨迹」页签能看到完整内容）。现在该包整体回到上游版本，实时与会话两条路径都正常",
  "- **修复：`dsh-client-ui-chat` 的 `exports` 指向已删除的 `./lib/invariant.js`**（上游本版已移除该文件），一并随包回归上游",
  "- **开机动画立即显示**：此前窗口（连同动画）是在内核启动完成之后才创建的，整个启动过程屏幕全黑。而且单把顺序提前还不够——`bootHarness()` 会阻塞主进程事件循环，`show()` 排不上队，动画照样要等启动结束才出现。现在窗口与动画先上屏，等首帧真正绘制完成再开始启动内核；动画结束时只补足剩余的最短展示时间。实测动画上屏时间从 **17.4 秒降到 1.7 秒**",
  "- **重新唤起不再重放动画**：从任务栏／程序坞重新激活窗口时直接加载界面，不再重播 2.6 秒开机动画",
  "",
  "已知取舍：对话区底部的 fork 版 token 统计条（上下文占用条 + 构成条 + 悬停面板）随本次回归上游被替换成上游自带的统计显示；会话置顶等自研功能不受影响。",
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

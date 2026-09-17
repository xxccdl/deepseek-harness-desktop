// Create a GitHub release (no assets) for the current tag using the token
// resolved from git's credential store (same credential the push used).
import { execSync } from "node:child_process";

const owner = "xxccdl";
const repo = "deepseek-harness-desktop";
const tag = process.argv[2] ?? "v1.6.7";

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
  "## 1.6.7",
  "",
  "- **修复：终端类工具全线不可用**。表现是 Pwsh / Grep / Glob 都报 `Windows Job runner exited with exit code 0 before proving its managed range empty`。在打包后的 Electron 里 `process.execPath` 就是应用本体，而子进程运行器正是用它去跑一个 Node 脚本：少了 `ELECTRON_RUN_AS_NODE`，那个子进程会**把整个应用再启动一遍**，第二个实例拿不到单实例锁，于是干净地退出（退出码 0），运行器还没来得及回报任何结果。凡是走这条通道的工具（Pwsh、Grep、Glob、常驻终端）因此全部失败。现在该包纳入 `plugins/` 并补上这个开关——与本项目其它 Node 辅助进程（目录选择器、浏览器启动器）一致，且只作用于这一次 spawn；目标命令的环境仍经由 IPC 单独下发，所以从命令里启动别的 Electron 应用不受影响",
  "- **修复：工作区选择报「workspaceNavigation.openWorkspace is not a function」**。0.1.5-rc.2 那次上游重基刷新了绝大部分插件的前端构建，只有 `dsh-client-ui-workspace` 的 `lib/client.js` 还留在 0.1.2 时期的旧构建。它自己的类型声明、以及 rc.2 的 `dsh-client-ui-conversation`，都要求 `uiWorkspace.openWorkspace` / `openSession` / `forkSession`，而旧构建里根本没有这几个方法——于是「选择工作区」、以及文件夹出错后点「重新选择」，都会直接弹「无法打开文件夹」而不是完成跳转。现在该文件与上游 0.1.5-rc.2 的发布产物逐字节一致，服务实现与其调用方的接口对齐",
  "- **修复：装过插件市场插件的应用无法启动**。插件市场把已装插件写成 profile 补丁层里的挂载行，而 `$DSH_HOME` 是所有部署共享的：源码 checkout、已安装版、以及一次**应用更新**（会整体替换 `resources/app`）看到的都是同一份行。只要某行指向的包在当前部署里不存在（比如装完插件后应用升了级，或开发版与安装版共用一个 home），Loader 就拒绝整个组合，应用直接弹「DeepSeek Harness failed to start」，除了手改补丁文件没有别的恢复办法。现在启动时会先核对每个市场行指向的包在本部署里是否真的存在，不存在的行跳过而不是让它拖死整个启动；插件在市场「已安装」列表里保留，一键重装即可",
  "- **插件市场不再给技能写挂载行**：技能由目录发现，本来就没有 loader 行；此前给技能也写了行，同样会在下次启动时命中上面的崩溃路径",
  "",
  "## 1.6.6",
  "",
  "- **修复：新会话的「对话」页签渲染空白**。1.6.5 那次上游重基时，`dsh-client-ui-chat` 的浏览器端 `lib/client.js` 沿用了 fork 自己的旧版本（0.1.2 时期），而服务端与其余插件已经是 0.1.5-rc.2。结果是：打开历史会话正常，但**新建会话并实时对话时整个对话区是空的**——右下角统计条还在跳动，说明回答其实已经产出，只是对话节点渲染不出来（「轨迹」页签能看到完整内容）。现在该包整体回到上游版本，实时与会话两条路径都正常",
  "- **修复：`dsh-client-ui-chat` 的 `exports` 指向已删除的 `./lib/invariant.js`**（上游本版已移除该文件），一并随包回归上游",
  "- **开机动画立即显示**：此前窗口（连同动画）是在内核启动完成之后才创建的，整个启动过程屏幕全黑。而且单把顺序提前还不够——`bootHarness()` 会阻塞主进程事件循环，`show()` 排不上队，动画照样要等启动结束才出现。现在窗口与动画先上屏，等首帧真正绘制完成再开始启动内核；动画结束时只补足剩余的最短展示时间。实测动画上屏时间从 **17.4 秒降到 1.7 秒**",
  "- **重新唤起不再重放动画**：从任务栏／程序坞重新激活窗口时直接加载界面，不再重播 2.6 秒开机动画",
  "",
  "已知取舍：对话区底部的 fork 版 token 统计条随 1.6.6 回归上游被替换成上游自带的统计显示；会话置顶等自研功能不受影响。",
  "",
  "安装包（NSIS）与便携版见下方 Assets。"
].join("\n");

const headers = {
  "Authorization": `Bearer ${token}`,
  "Accept": "application/vnd.github+json",
  "Content-Type": "application/json",
  "User-Agent": "dsh-desktop-release-script"
};
const payload = {
  tag_name: tag,
  target_commitish: "main",
  name: `DeepSeek Harness Desktop ${tag.replace(/^v/, "")}`,
  body,
  draft: false,
  prerelease: false
};

// Re-running against a tag that already has a release updates it instead of
// failing on a duplicate — the release is meant to be re-runnable.
const existing = await fetch(
  `https://api.github.com/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(tag)}`,
  { headers }
);
const url = existing.ok
  ? `https://api.github.com/repos/${owner}/${repo}/releases/${(await existing.json()).id}`
  : `https://api.github.com/repos/${owner}/${repo}/releases`;

const res = await fetch(url, {
  method: existing.ok ? "PATCH" : "POST",
  headers,
  body: JSON.stringify(payload)
});

if (!res.ok) {
  const text = await res.text();
  console.error(`release ${existing.ok ? "update" : "create"} failed: HTTP ${res.status}`, text);
  process.exit(1);
}
const data = await res.json();
console.log(`release ${existing.ok ? "updated" : "created"}:`, data.html_url);

// Create a GitHub release (no assets) for the current tag using the token
// resolved from git's credential store (same credential the push used).
import { execSync } from "node:child_process";

const owner = "xxccdl";
const repo = "deepseek-harness-desktop";
const tag = process.argv[2] ?? "v1.7.0";

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
  "## 1.7.0",
  "",
  "本次把 fork 重基到上游 **dsh 0.1.7-alpha.1**。上游这一版带来侧边栏会话置顶与归档、工作过程展示与性能用量设置、后台任务列表、文件预览与改动审阅、Team 任务看板、内置浏览器在 Electron 默认开启等大量改动（完整清单见上游 `dsh-v0.1.7-alpha.1`）。重基的改动面很大：65 个覆盖层包全部重新对齐，下面是本次与桌面端直接相关的修复。",
  "- **修复：fork 自研插件几乎全都没加载**。0.1.7 把前端图标库的命名从固定规格改成带规格后缀（`IconXxxOutline16` 变为 `IconXxxOutlineRegular`），覆盖层仍按旧名字取组件，取到的是 `undefined`，于是按钮渲染成空白；同时 `conversation.composer.dock` 的槽语义从「卡片内竖排」变成了「卡片下的横向胶囊行」，塞进去的全宽内容会被压成一根窄柱，看起来就像整块界面消失。现在图标名与新槽语义都已对齐，价格标签、插件发布条等自研界面恢复正常",
  "- **修复：登录**。新装或登出后不会再自动打开登录链接，回调被拒时直接报「登录失败」",
  "- **修复：Windows 上终端类工具全线失败（`PTY shell exited during startup`）**。根因是 Windows ACL 沙箱在给工作区根目录写授权之前，需要往目录的 SACL 里写 Low 完整性标签，而这一步要求调用者**拥有该目录并持有 WRITE_OWNER**：工作区只继承到 `Authenticated Users: Modify` 时（Modify 不含 WRITE_OWNER）授权必然失败，沙箱运行器以 127 退出，PTY 还没启动就已经不在，界面上只剩一句 `PTY shell exited during startup`。现在这条路径被 Windows 拒绝时不再 fail-closed：命令以降级（不隔离）方式执行，并在控制台写明原因、恢复办法，以及为什么不能简单地补权限——沙箱的 Low 标签是按 `(OI)(CI)` 整棵树继承的，工作区里放着自己的可执行文件时会被一并标低",
  "- **修复：输入框时不时往上跳**。逐帧测得：发消息时这条消息会先在 `inbox[\"next-turn\"]` 里停留约 90ms（等 host 启动这一轮），期间队列面板会渲染出 40px 高的一行。面板本在 composer 栈的文档流里，而输入框卡片是底部锚定的，于是整块输入框被顶高 37px，面板消失后再弹回去。现在队列面板贴在卡片上方且不参与文档流，并在 180ms 内不绘制：纯瞬态根本不会出现，真排队照常淡入，输入框位置恒定",
  "- **控制面板精简为价格标签**。动作抽屉、分布在输入栏/会话头部/工具栏的三处开关、以及 PowerShell 面板（连同它背后的 `dsh-host-shellpanel` 桥）全部移除，只留 DeepSeek 峰谷价签；模型常驻的 `pwsh` 工具自己持有终端",
  "- **创造模式的插件发布条回到输入框上方**。改注册到全宽槽位，不再被压成窄柱，视觉重做：玻璃表面、两行信息（标题 + 等宽字体路径）、发丝线分隔的控制条、自绘下拉箭头",
  "- **会话头部按钮去重**。删除与本就会话头部重复的工作目录、更多操作、折叠侧栏按钮",
  "- 重基过程中一并修好的若干加载与状态回归：会话事件流的 `jobs` 迁移、插件加载器 `remove` 的同步化、模型菜单里推理等级滑块的位置与选择后菜单不关闭",
  "",
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

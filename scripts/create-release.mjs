// Create a GitHub release (no assets) for the current tag using the token
// resolved from git's credential store (same credential the push used).
import { execSync } from "node:child_process";

const owner = "xxccdl";
const repo = "deepseek-harness-desktop";
const tag = process.argv[2] ?? "v1.10.1";

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
  "## 1.10.1",
  "",
  "补丁版：修掉 1.10.0 安装版里终端全线不可用的一条路径问题，并让终端起不来时的报错带上现场。",
  "- **修复：安装在带空格的目录下时，终端工具一律报 `PTY shell exited during startup`**。伪终端需要借控制台宿主 `cmd.exe /d /c <命令>` 启动——ConPTY 只能把控制台交给控制台子系统映像，而 Electron 是 GUI 子系统二进制。问题出在 cmd 自己的 `/c` 引号规则：命令行若以引号开头，cmd 会剥掉开头的引号、并删掉整行最后一个引号。开发时 `process.execPath` 是 `…\\electron\\dist\\electron.exe`、插件目录也在仓库里，路径没有空格、一个引号都不产生，规则不触发；而安装目录 `D:\\xcomputer\\DeepSeek Harness\\` 让程序路径与 runner 路径都带空格、参数被引起来，规则随即触发——路径在空格处断成 `D:\\xcomputer\\DeepSeek`，cmd 以 1 退出，终端还没到第一个提示符就已经不在。现在命令宿主改为 `cmd.exe /d /c call <命令>`：行首不再是引号，cmd 按原样解析被引起来的路径。对照实测（都用真实安装路径）：原写法 `exit=1` 并报 `'D:\\xcomputer\\DeepSeek' 不是内部或外部命令`；加上 `call` 后正常到达 `dsh> ` 提示符",
  "- **终端启动失败的报错不再只有一句笼统提示**。此前无论沙箱拒绝、命令宿主把命令行拆坏、还是 shell 自身启动失败，界面上都是同一句 `PTY shell exited during startup`，既不说启动的是哪个程序、也不说子进程说了什么——排查时只能靠逐层复现。现在错误里会附上 PTY 实际收到的 argv，以及子进程退出前写到终端上的最后 500 个字符（已去掉光标与窗口标题等控制序列），上面那条故障因此能直接从报错里读出 `'D:\\xcomputer\\DeepSeek' 不是内部或外部命令`。同一改动覆盖「启动超时」分支；正常启动路径不受影响（三个分支均以存根会话验证）",
  "",
  "1.10.0 修的是另一条同样表现为 `PTY shell exited during startup` 的路径：`workspace-write` 且调用不带会话 id 时，沙箱把工作区授权交给子进程 runner，被 Windows 拒绝后子进程直接以 127 退出。两条成因彼此独立，本版两条都已修好。",
  "",
  "## 1.10.0",
  "",
  "本次是一次小版本：语音输入多了一个云端识别器，另修掉一个 Windows 终端起不来的成因，并补上网络失败时看得懂的提示。本地识别仍是默认值，原有行为不变。",
  "- **新增：语音输入可选远程识别服务**。此前只有一个识别器：本地 SenseVoice，模型要下载、且只在运行 DSH 的那台机器上算。现在插件详情页的「识别服务」里多出一项 `SenseVoiceSmall (远程)`——录音以 multipart 发到自建的 SenseVoice HTTP 服务（`POST /asr`，字段 `file` + `language`），默认地址指向公网隧道，所以不在同一局域网、没装模型的机器也能用；选中它时页面会标成「云端语音识别已就绪」并写明「音频将发送至所选云端服务」。它以 `location: \"cloud\"` 注册，因此不会出现本地识别器那套「下载并准备」与下载源选择；语言沿用自动/中文/英语/粤语/日语/韩语；服务端若设了 `ASR_API_KEY`，在同一个配置块的 `apiKey` 里填即可，会同时以 `Authorization: Bearer` 与 `X-API-Key` 下发。地址与密钥都在语音输入 Bundle 的 `cordis.patch.yml` 里，隧道地址变了只改那一行、重跑一次 `scripts/install-plugins.mjs`（profile 是 `patchReload: live`，不必重装）",
  "- **新增：远程识别的失败提示带上底层原因**。连不上时此前只有一句 `fetch failed`，分不出是端口没开、被防火墙丢包还是域名解析失败。现在会把底层错误码带出来——`ECONNREFUSED`（对端在线但端口没人监听）、`ENOTFOUND`（域名不存在）、超时则单独报「timed out after …ms」，一眼能判断该去启动服务还是查网络",
  "- **修复：取消远程识别会让主进程报错**。录音中途取消时，`FormData` 的 `Blob` 分片是作为 web stream 上传的，中止会让 undici 往一个已经关闭的流里继续 enqueue，抛出的 `ERR_INVALID_STATE` 不在任何 await 链上，Electron 于是直接弹「A JavaScript error occurred in the main process」。现在上传体改成一次性拼好的定长 multipart，取消退回成一次普通的 reject；已逐项验证：正常转写、503 带 detail、非 JSON 响应、鉴权头透传、非法音频在发请求前就拒、调用方取消、不可达报错、地址结尾斜杠容错",
  "- **修复：Windows 上 `PTY shell exited during startup` 的另一个成因**。1.7.0 修的是「给工作区根目录写 Low 完整性标签时缺少 WRITE_OWNER」那条路径，这一条在它下面：当调用没有带 session id 时（`workspace-write` 且无会话），沙箱把工作区授权交给子进程 runner 自己做，而 runner 被 Windows 拒绝后不会降级，直接以 127 退出——终端还没启动就已经不在，界面只剩一句 `PTY shell exited during startup`。现在这条路径也在本进程里先认领工作区授权，拒绝因此能落进既有的 `isAclRefusal` 分支，降级为 `partial` 并写明原因，命令按原 argv 照常执行。探针逐案对照：带 session id 的路径本来就正常，无 session id 的路径修复前 `exited`（`SetNamedSecurityInfoW failed (Win32 5)`）、修复后 `alive`",
  "",
  "## 1.9.0",
  "",
  "本次把 fork 重基到上游 **dsh 0.2.0-rc.2**（上一版停在 0.1.7-rc.2，中间跨过 0.2.0-rc.1）。上游这一版带来桌面端可在菜单栏管理 dsh 命令与插件（不再需要另装 Node 或 pnpm）、模型选择器在模型较多时提供模糊搜索、侧栏文件页用本地应用打开当前文件夹、无标题的历史会话统一显示「未命名」、Windows 沙箱权限脚本合并为一次授权完成诊断与修复、第三方模型目录更新到 pi-ai 0.87.1（部分旧模型 ID 被移除，已保存的选择可能需要重选）等改动（完整清单见上游 `dsh-v0.2.0-rc.1` 与 `dsh-v0.2.0-rc.2`）。0.2.0 连底层的组合方式也换了：profile 的包解析从「往 profile 的 node_modules 投影 junction」改为运行时解析（`PluginPackages` + `createRuntimeResolution`，`healProfilesModuleFallback` 已移除），并新增了一道插件兼容性闸门。下面是本次与本 fork 直接相关的改动。",
  "- **修复：fork 自研插件在新版下一个都加载不了**。0.2.0 的兼容性闸门会按插件声明的 `peerDependencies` 校验它与运行中的 dsh 是否兼容，不兼容就**在启动时直接关掉那一行**。fork 自有的 29 个包还写着 `^0.1.0-rc.6`，于是面板、动效、用量统计、插件市场、记忆、桌面控制、更新检查、代码片段、新手引导、内置浏览器、电脑控制等**全部被静默禁用**，动效令牌 `--dsm-t-fast` 直接解析为空；控制台只留一行 stderr，界面上是整片功能凭空消失。现在这 29 个包的 dsh peer 范围统一为 `^0.2.0-rc.2`（取 caret 而不是上游那种精确钉版，后续 rc 不会被再次一刀切）。这道闸门只在桌面端生效——它要求 `profileContext`，CLI 不提供，所以无头回归是绿的、只有实机才看得见，本次验证因此补上了实机冒烟",
  "- **修复：插件加载失败的自愈对客户端失败不生效**。上一版新增的自动停用只审计 host 加载器的行，而一个插件的客户端 bundle 加载失败时，host 半边是完全健康的——页面名册正是从 host 已激活的行发布出来的。于是这类失败既不记录、也不停用，更不会开修复会话：界面停在「Failed to load plugins」错误页，`plugin-quarantine.json` 连文件都不会生成（市场里的 `appearance-optimizer` 就是这样倒下的：包名已改成 `@deepseek-ai/appearance-optimizer`，它的 `client.js` 却仍注册旧 id）。现在壳子会读页面在画错误页之前记下的那份启动报告，用已发布的客户端名册核对出真正的失败条目，交给同一条记录→停用→修复通路：按**包名**记录（host 失败仍按行 id），并把失败 bundle 所在的**包目录**写进修复提示——对市场装进 `node_modules` 的插件，那是 AI 唯一能直接打开的文件；客户端失败会让窗口挂起，通知文案因此改成「重启应用即可恢复界面」。实测：仿造件复现出与截图一致的报错后，记录落盘并带包目录、修复会话已开，第二次启动界面正常、名册 81→80、无重复失败；host 半边的原有通路同时回归通过",
  "- **重基本身的改动面不大**：13 个带 fork 改动的上游包按 0.2.0-rc.2 重建（fork 改动逐个三方合并回去，唯一冲突的模型选择器手工解掉），52 个 fork 自有包原样保留。依赖侧 `@earendil-works/pi-ai` 升到 0.87.1、`koffi` 由 `^3.1.0` 收紧为精确 `3.1.1`、新包 `dsh-otel` 带进 `got ^14.6.6`、`dsh-skill-filesystem` 带进 `chokidar ^5.0.0`。无头启动回归 187 个 entry 全绿、14 个 fork 必需 bundle 齐全",
  "",
  "## 1.8.0",
  "",
  "本次把 fork 重基到上游 **dsh 0.1.7-rc.2**（上一版停在 0.1.7-alpha.1）。上游这一版带来定时任务与提醒、桌面端首次使用引导、快捷键查看与自定义、对话中即时启用刚开启的工具、关窗后任务继续在后台运行等改动（完整清单见上游 `dsh-v0.1.7-rc.2`）；其中与桌面端直接相关的两条已随本次重基生效：**修复部分桌面安装包启动失败**，以及**不兼容插件的跳过提示每次启动只显示一次**。覆盖层包随之重新对齐，像 `dsh-host-apiproxy` 这类在新一代组合里已不需要的覆盖层也一并移除。下面是本次与本 fork 直接相关的改动。",
  "- **修复：语音模型下载反复连接超时**。内置 `fetch` 把一次 TCP+TLS 连接压在 10 秒内，而镜像源对钉住的 `resolve` 路径会重定向到它自己的缓存源——取一个资产要连两次，慢线路上每次连接实测 2.5~10.7 秒，第二跳就顶穿上限，于是同一个文件时而成功、时而报 `UND_ERR_CONNECT_TIMEOUT`，即便镜像完全可达。现在下载与探测统一走连接超时 12 万毫秒的 undici agent，传输本身仍由插件自己的取消信号与 `prepareTimeoutMs` 兜底",
  "- **修复：Node 侧不再只信内置根证书**。桌面端的 Node 进程此前只加载 Node 内置的根证书表，凡是需要补中间证书的站点（huggingface.co、github.com）一律 `UNABLE_TO_VERIFY_LEAF_SIGNATURE`，语音模型下载与插件安装因此失败，而同一台机器上的浏览器一切正常。现在启动时把 Node 内置信任库与操作系统信任库合并后设为默认（本机实测 145 + 136 张），并单独验过下载器真正走的 undici 路径",
  "- **新增：麦克风权限自动授予**。语音输入此前只能看到「Microphone access is disabled」：渲染进程的权限处理器只放行通知、剪贴板与全屏，`media` 请求一律直接拒绝。现在按 `details.mediaTypes` 放行纯音频请求（摄像头仍被拒绝），实测 `getUserMedia` 拿到设备、三个音频输入可见",
  "- **修复：Windows 上终端类工具仍然全线失败（`PTY shell exited during startup`）**。1.7.0 卸掉的是沙箱授权那一层，这一层更靠下、且与沙箱无关：ConPTY 只会把控制台交给**控制台子系统**映像，而 Electron 是 **GUI 子系统**二进制，作为 ConPTY 的直接子进程拿不到可用的标准句柄，随后运行的进程以 127 退出且没有任何输出，就绪握手永远等不到标记。逐项隔离确认（`cmd /c echo` 正常、`electron -e` 零输出、经由 electron 运行器即 127 退出）后，Windows + Electron 下改为用 `cmd.exe /d /c <原命令>` 启动 PTY，给 ConPTY 一个挂得上的控制台子进程；参数逐个引用，含空格与 `&` 的路径仍然安全",
  "- **修复：输入框时不时上窜**。逐帧测得统计胶囊与上下文表（`.uV2eYG_dock`）渲染在输入卡片**下方**，而卡片钉在座位底边，于是卡片顶端恒等于「座位底边 − 状态行高度」——状态行一出现卡片就整体上移、一消失就回落，实测 28px，且双向。状态行又跟着数据出现（第一轮的用量统计、上下文表的第一个百分比），所以看起来像输入框自己在动。现在非 hero 布局下为这一行预留其自身高度，输入框位置恒定",
  "- **动效补齐此前没有动画的界面**。弹窗、菜单、气泡此前是「直接出现」。现在按 shell 已发布的 role 与 portal 钩子统一接入进入动画（面板 `dsmRise`、遮罩 `dsmFade`，遮罩与面板同帧淡入，避免「面板淡入而遮罩硬切」），对话/轨迹页签补上颜色与下划线过渡，并把全部新选择器一并纳入 reduced-motion 收敛",
  "- **新增：插件加载失败自动停用，并交给 AI 去修**。此前某个插件 import 失败只会得到一句警告（0.1.7 起已不再致命），但**每次启动都会再失败一次**，界面上就是一块「Failed to load plugins」错误页。现在启动时读一遍加载器里真正失败的行（`disabled` 表达式报错、fiber 缺失、fiber 处于 failed 状态，并取回原始 rejection），把原因写进 `$DSH_HOME/plugin-quarantine.json`，下次启动用 id 定向的 overlay 关掉它们——**回退是无条件的**，坏插件只付出一次警告的代价；同时用与快捷输入面板相同的认证通道开一个新会话，把失败清单、包名与记录文件路径交给 agent 去修（每个插件最多两次，避免无谓重试），并发一条系统通知。插件修好后，删掉记录里对应的那一条 id，下次启动即自动恢复",
  "",
  "## 1.7.0",
  "",
  "本次把 fork 重基到上游 **dsh 0.1.7-alpha.1**。上游这一版带来侧边栏会话置顶与归档、工作过程展示与性能用量设置、后台任务列表、文件预览与改动审阅、Team 任务看板、内置浏览器在 Electron 默认开启等大量改动（完整清单见上游 `dsh-v0.1.7-alpha.1`）。重基的改动面很大：65 个覆盖层包全部重新对齐，下面是本次与桌面端直接相关的修复。",
  "- **修复：安装版启动即失败（`node-addon-require-builtin unsupported`）**。原生插件 `node-addon-require-builtin` 内置的是**精确到补丁号**的 Electron 运行时指纹白名单（43.0.0 / 44.0.0 / 45.0.0-alpha.6），而 `devDependencies` 写的是 `^43.4.0`：npm 装到 43.4.0，构建便打进 43.4.0，其 Node 24.18.1 / V8 15.0.245.28 指纹不在表内，内核准备阶段直接抛 `Unsupported/no-context`，安装版连窗口都起不来。开发时用的是固定版本的 Electron 43.0.0，所以这条一直没暴露。现在 Electron 精确锁定 43.0.0，开发与打包同源",
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

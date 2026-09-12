# DeepSeek Harness — Desktop

**简体中文** · [English](README.en.md)

把 [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) 的 Web 界面
(`dsh web`) 打包成原生 Electron 桌面应用，并在其基础上扩展了一整套桌面向能力：
电脑控制、浏览器自动化、长期记忆、定时任务、快捷对话、插件市场、桌宠等。

> **开源说明（版权）**：上游 deepseek-harness 由 DeepSeek 于 2026 年以 MIT 许可发布。
> 本仓库为桌面 fork，桌面壳层与新增桌面插件由 xxccdl 于 2026 年补充，沿用 MIT。
> 详见 [LICENSE](LICENSE) 与 [LICENSE-THIRD-PARTY](LICENSE-THIRD-PARTY)。

---

## 目录

- [它是怎么运行的](#它是怎么运行的)
- [功能总览](#功能总览)
- [桌面壳层](#桌面壳层)
- [快捷对话（Ctrl+D+S）](#快捷对话ctrlds)
- [AI 对话与工具](#ai-对话与工具)
- [电脑控制](#电脑控制)
- [浏览器自动化](#浏览器自动化)
- [长期记忆](#长期记忆)
- [通知与定时任务](#通知与定时任务)
- [用量与花费](#用量与花费)
- [界面增强](#界面增强)
- [快捷片段（Ctrl+/）](#快捷片段ctrl)
- [世界时钟](#世界时钟)
- [桌宠](#桌宠)
- [插件市场](#插件市场)
- [更新器](#更新器)
- [设置页一览](#设置页一览)
- [快捷键一览](#快捷键一览)
- [数据存放位置](#数据存放位置)
- [复现 / 构建](#复现--构建)
- [仓库结构](#仓库结构)
- [工作原理](#工作原理为什么不需要改前端)

---

## 它是怎么运行的

与网页版完全相同的 harness 在**应用进程内部**启动（无需浏览器、无需单独的 CLI 进程）：

- 主进程通过 `@deepseek-ai/dsh-app-boot` 的稳定 API 挂载 `web` profile 的 cordis 组合
  （与 `dsh web` 完全相同的 bundle 层 + 用户 patch 层）
- harness 服务器绑定在操作系统分配的随机 loopback 端口（仅本机可访问）
- `BrowserWindow` 直接加载该端口上的 SPA；`window.__DSH_BOOT__` 仍由服务端 index-tap
  注入，前端代码零改动
- 退出时自动 dispose harness 树，干净落盘会话状态

会话、设置、凭据与网页版完全共享，都在 `%USERPROFILE%\.dsh`（即 `$DSH_HOME`）。

---

## 功能总览

| 领域 | 能力 |
|------|------|
| 桌面壳 | 无边框窗口、自定义标题栏、托盘、开机自启、老板键、全局呼出、单实例、窗口状态恢复 |
| 快捷对话 | `Ctrl+D+S` 全局呼出玻璃拟态 mini 对话，4 种智能体模式 + 任务列表 |
| AI 工具 | 电脑控制、浏览器、记忆、通知/定时、剪贴板、文件搜索、网页抓取、视觉、片段、产物交付等 |
| 电脑控制 | 经 Windows-MCP 让 AI 看屏幕、点按、输入；自带 uv 与隔离 Python 运行时 |
| 浏览器自动化 | 经 CDP 驱动 Edge/Chrome：导航、点击、输入、截图、执行 JS |
| 长期记忆 | remember/recall 等工具 + 设置里的文字/KV/思维导图查看器 |
| 通知与定时 | 任务开始/完成系统通知、可重复定时任务、`remind` 延时提醒、`/btw` 插话 |
| 用量花费 | token 花费估算 + DeepSeek 实时余额血条、token 构成统计条 |
| 界面增强 | `Ctrl+K` 会话搜索、`F1` 快捷键帮助、剪贴板历史、Markdown 导出、代码块工具栏、Mermaid |
| 插件市场 | 应用内浏览/安装/卸载插件与技能，创造模式一键发布 |
| 其它 | 世界时钟、桌宠、底部控制面板 + 共享 PowerShell、GitHub 自动更新、会话日志导出 |

---

## 桌面壳层

- **无边框窗口 + 自定义标题栏**：无原生边框；标题栏由 preload 注入（左侧标题/拖拽区，
  右侧自定义最小化、最大化/还原、关闭按钮）。双击标题栏切换最大化，按钮图标随状态切换；
  标题栏参与文档流（`body` 为 flex 列），SPA 自动缩进剩余高度，内容永不被遮挡
- **系统托盘**：可最小化到托盘而不退出；托盘菜单含「显示主窗口 / 退出」
- **开机自启**：设置里一键开关（写入系统登录项）
- **老板键 `Ctrl+Alt+B`**：立即隐藏整个应用，再按恢复（可在设置里关闭）
- **全局呼出热键**：可自定义的全局快捷键，任何界面下都能把主窗口唤到前台
- **快捷对话三键和弦 `Ctrl+D+S`**：由底层键盘钩子实现（`globalShortcut` 无法表达三键），
  且保证单独按 `Ctrl+S` 不会误触发
- **单实例锁**：二次启动自动聚焦已有窗口
- **窗口状态恢复**：位置、尺寸、最大化状态在重启后还原
- **菜单**：Edit（撤销/剪贴板，Web 输入框可用）、View（重载/DevTools/缩放/全屏）、
  Help（打开 `$DSH_HOME`、打开 web profile 目录、关于）；按 `Alt` 临时唤出菜单栏
- **外部链接**：`target=_blank` 与站外导航自动交给系统浏览器
- **原生通知**：harness 的 `dsh/notify` 事件走 Windows 系统通知，并可按事件播放提示音
- **剪贴板监听**：后台监听剪贴板，为 `Ctrl+Shift+V` 历史面板提供数据
- **缩放**：`Ctrl + / - / 0` 放大、缩小、重置界面
- **preload bridge**：SPA 通过 `window.dshDesktop` 调用 `getAppInfo()` / `getServerUrl()` /
  `openExternal()` / `showItemInFolder()` / `openPath()` 等白名单 API（沙箱开启）

---

## 快捷对话（Ctrl+D+S）

`Ctrl+D+S` 在**任何界面**（即使主窗口未聚焦）呼出一个脱离主窗口的玻璃拟态 mini 对话面板，
主窗口完全不受打扰：

- **4 种智能体模式**：标准（Standard）/ PTC / 极简（Minimal）/ 创造（Creator）
- 消息发送到当前会话，可随时收起
- **任务列表**页：查看后台任务，每个会话都有独立的迷你对话

---

## AI 对话与工具

除了 harness 自带的读写文件、跑命令、子智能体等能力，本 fork 额外注册了一批模型可调用的工具：

| 工具（包） | 作用 |
|------------|------|
| 电脑控制（`dsh-tool-computer-use`） | 经 Windows-MCP 操控整台 Windows PC |
| 浏览器（`dsh-tool-browser`） | 经 CDP 自动化 Edge/Chrome |
| 记忆（`dsh-tool-memory`） | `remember` / `recall` / `list` / `forget` 长期记忆 |
| 通知/定时（`dsh-tool-notify`） | 任务开始/完成通知、可重复定时任务 |
| 提醒（`dsh-tool-remind`） | `remind`：N 分钟后弹一条桌面通知 |
| 剪贴板（`dsh-tool-clipboard`） | `clipboard_read` / `clipboard_write` 读写系统剪贴板 |
| 文件搜索（`dsh-tool-filesearch`） | `file_name_search`：目录内递归文件名快速搜索（忽略 node_modules/.git） |
| 网页抓取（`dsh-tool-webfetch`） | `web_fetch`：取 URL 正文纯文本（去脚本样式、折叠空白、限长） |
| 视觉（`dsh-tool-vision`） | 用 DeepSeek 视觉模型分析图片或屏幕截图 |
| 持久 PowerShell（`dsh-tool-pwsh-persistent`） | 按会话归属的常驻 PowerShell，与底部面板共用同一个 PTY |
| 片段（`dsh-tool-snippets`） | `snippet_save/list/get/delete`，与 UI 选择器共用一个库 |
| 产物交付（`dsh-tool-deliver`） | `send_file` 把文件放进交付目录并通知，界面出现「产物」标签可一键保存 |
| 市场发布（`dsh-tool-plugin-market`） | `plugin_publish` / `ask-publish-plugin`（仅创造模式） |
| 手机控制（`dsh-tool-phone`） | 移动端：读屏、点击/滑动/输入/按键/滚动/打开 App |

其它对话能力：

- **`/btw` 插话**：在 AI 正在干活时问一个附带问题，不打断当前任务（作为下一步上下文排队）
- **多模态图片**：截图/图片可直接作为图片发给视觉模型；模型「图像输入」能力可在
  设置 → 模型里手动开关或修正
- **会话日志导出**：会话工具栏溢出菜单里可把整段会话导出下载
- **底部控制面板**：抽屉式面板展示智能体实时动作（后台任务、子智能体）与共享 PowerShell
  终端；会话头部右侧工具条；含 DeepSeek 高峰/低谷电价提示

---

## 电脑控制

让 AI 能像人一样操作这台 Windows 电脑（基于 Windows-MCP）：

- AI 可以**看屏幕、读取界面元素、点击、输入、滚动、按键**等
- **自带运行时，开箱即用**：用打包的 `uv` 在 `$DSH_HOME/runtime` 下建立隔离的 Python 环境
  （`windows-mcp-venv`），不污染系统 Python
- **设置页「电脑控制」**：开关功能、选择 Python 版本/包、配置提示词提醒、查看实时状态、
  一键重建运行时
- 对应 AI 工具在 `dsh-tool-computer-use`

---

## 浏览器自动化

经 Chrome DevTools Protocol 驱动本机 Edge / Chrome：

- AI 可执行**导航、点击、填写、截图、执行 JS** 等网页操作
- **设置页「浏览器控制」**：选择浏览器与端口、是否无头（headless）、启动/停止/测试被控浏览器
- 状态通过 `/api/browser` 暴露

---

## 长期记忆

AI 拥有跨会话的长期记忆：

- 模型工具：`remember`（记住）/ `recall`（回想）/ `list` / `forget`
- 持久化在 `$DSH_HOME/memory/memory.jsonl`，并附带一个记忆技能引导模型何时使用
- **设置页「记忆」**：以**文字、键值（KV）、思维导图**三种视图浏览记忆，数据来自
  `dsh-tool-memory` 的 `/api/memory`

---

## 通知与定时任务

- **任务通知**：AI 开始 / 完成长任务时弹 Windows 系统通知（可带提示音），不必盯着窗口
- **定时任务**：设置页「定时任务」管理 AI 开始/完成通知与用户自定义的**可重复**计划任务
  （可附带要执行的命令）
- **延时提醒**：AI 用 `remind` 工具安排「N 分钟后提醒我」
- 移动端另有 `dsh-mobile-bridge` 把通知转发到 Android 系统通知（后台也能收到）

---

## 用量与花费

- **侧栏预算血条**：左下角（设置上方）一条紧凑的「已用 / 余额」条
  - 已用：回放会话事件，按 DeepSeek（deepseek-chat 等）价格估算人民币花费
  - 余额：实时查询 DeepSeek `/user/balance`
  - 余额查询失败会在 tooltip 说明原因；提供方无余额接口时只显示花费，不会把未上报的余额显示成 ¥0.00
- **token 构成统计条**：输入框上方的统计条按 token 构成着色——**缓存命中（绿）/ 新增输入（蓝）/
  缓存写入（琥珀）/ 输出（中性）**，宽度比例即真实用量；悬停面板给出完整统计
- **设置页「统计」**：花费与余额、会话数（总计/进行中/今日）、当前会话的消息数与工具调用数

---

## 界面增强

`dsh-client-ui-enhance` 提供一组纯前端增强：

- **`Ctrl+K` 会话搜索**：模糊搜索并快速跳转会话（键盘上下选、回车跳）
- **`F1` 快捷键帮助**：所有快捷键与代码块操作一览
- **`Ctrl+Shift+V` 剪贴板历史**：在输入框里呼出历史，选一条最近复制的内容插入
- **`Ctrl+E` Markdown 导出**：把当前会话导出为 Markdown 文件
- **代码块工具栏**：悬停代码块显示「复制 / 保存为文件 / 折叠长代码」
- **Mermaid 渲染**：`mermaid` 代码块自动渲染成流程图/图表，可切回源码
- 所有弹层配色跟随系统的深/浅主题

---

## 快捷片段（Ctrl+/）

`dsh-client-ui-snippets`：

- `Ctrl+/` 呼出**快捷片段选择器**，把保存好的提示词/代码片段插入输入框
- 可把当前草稿存成片段，也可删除旧片段
- 与 AI 的 `snippet_*` 工具**共用同一个片段库**（`/api/snippets`），人和模型都能读写

---

## 世界时钟

`dsh-client-ui-world-clock`（在插件市场可安装，纯前端零依赖）：

- 侧栏底部（设置旁）常驻**秒级本机时间**，窄栏显示简版
- 点击展开世界时钟面板：**多城市实时对照、真实 IANA 时区与 UTC 偏移、跨日自动标注
  昨天/明天**，外加 **5 / 15 / 25 分钟倒计时**

---

## 桌宠

`dsh-client-ui-desktop-pet`：界面右下角一只可拖拽的蓝色小鲸鱼，会漂浮眨眼、跟你说话、
按心情切换表情；设置页「桌宠」可配置。

---

## 插件市场

一个自托管的插件/技能商店：在应用内浏览、安装、卸载，或让 AI 把刚写好的插件/技能一键发布。

| 部分 | 路径 | 职责 |
|------|------|------|
| 服务端 | `plugin-market/` | 目录 API + 商店页面（默认 9009 端口），独立部署 |
| 商店界面 | `dsh-client-ui-market` | 应用内市场窗口（iframe 承载商店页面） |
| 宿主桥 | `dsh-host-plugin-market` | 校验/落盘/热挂载，`/api/market/*` 四条路由 |
| AI 工具 | `dsh-tool-plugin-market` | `plugin_publish` 与 `ask-publish-plugin`（仅创造模式） |

**两种类型**：

- **插件（plugin）**：含 `package.json` 与 JS 入口，安装后加载代码
- **技能（skill）**：只含 `SKILL.md`（YAML frontmatter 描述 name/description），不加载代码；
  安装即把目录放进 `$DSH_HOME/skills`，出现在技能列表（`/` 可查看）

**安装**：下载 → 服务端逐项校验（包名、入口、每个 `.js` 过 `node --check`、禁止 npm 依赖）→
写入 profile 的 patch 层（`$DSH_HOME/profiles/<profile>/cordis.patch.yml`）并经 loader **热挂载**，
界面部分刷新即可见。任一步失败都**整体回滚**，不影响正在运行的应用。

**卸载**：详情抽屉与「管理」弹窗都提供卸载，**两段式确认**（首点变为「确认卸载？」，
2.6 秒内再点才执行）；宿主桥摘掉 patch 行、卸载运行时条目并删除目录。

**发布**：创造模式里 AI 写完插件/技能后调用 `ask-publish-plugin` 询问，输入框上方出现发布条，
可选**版本号、类型（插件/技能/自动判断）**并填更新说明；用户确认后 AI 才调用
`plugin_publish` 真正发布。也可以直接调接口或用脚本：

```bash
curl -X POST http://<market>/api/plugins \
  -H "X-Market-Meta: $(echo -n '{"title":"我的插件","category":"开发工具"}' | base64 -w0)" \
  --data-binary @my-plugin.tgz

# 或
node plugin-market/tools/publish.mjs <插件目录> --market http://<market> [--token <t>]
```

**部署服务端**：

```bash
node plugin-market/server.js   # env: MARKET_PORT(9009) / MARKET_DATA(./data) / MARKET_ADMIN_TOKEN
```

> 挂载说明：`dsh-client-ui-world-clock` 目前经市场分发（未写进默认组合，装完即用）；
> 想让它开箱常驻，可把它加进 `dsh-web-app` 的 patch 层。

---

## 更新器

`dsh-client-ui-updater`（仅 Electron 桌面端）：

- 设置页「更新」检查 GitHub Releases、阅读更新日志
- **50 线程并行加速**下载安装器并安装（不自动后台更新，需手动确认）

---

## 设置页一览

| 设置分区 | 内容 |
|----------|------|
| 通用（general） | 外壳、版本公告、通用偏好 |
| 模型（models） | 凭据与模型管理、模型「图像输入」开关 |
| 统计（stats） | 花费/余额、会话数、当前会话消息与工具统计 |
| 记忆（memory） | 文字 / KV / 思维导图三种记忆视图 |
| 电脑控制（computer-use） | Windows-MCP 开关、Python 运行时、重建 |
| 浏览器控制（browser） | 被控浏览器选择、端口、无头、启停/测试 |
| 桌面（desktop） | 托盘、开机自启、全局显示/隐藏热键 |
| 定时任务（scheduler） | 任务通知与可重复计划任务 |
| 桌宠（desktop-pet） | 桌宠开关与配置 |
| 更新（updater） | 检查更新、更新日志、下载安装 |
| 插件（上游） | 已装插件清单与管理 |

首次启动还有**欢迎向导**（API Key 实时校验、功能导览、快捷键速查），完成状态持久化；
设置里的「使用教程」可随时重跑向导。

---

## 快捷键一览

| 快捷键 | 作用 | 范围 |
|--------|------|------|
| `Ctrl` `D` `S` | 呼出/隐藏快捷对话 mini 面板 | 全局（底层键盘钩子） |
| `Ctrl` `Alt` `B` | 老板键：立即隐藏/恢复应用 | 全局（可关闭） |
| `Ctrl` `K` | 快速搜索并跳转会话 | 应用内 |
| `F1` | 快捷键帮助 | 应用内 |
| `Ctrl` `Shift` `V` | 剪贴板历史（输入框内插入） | 应用内 |
| `Ctrl` `E` | 导出当前会话为 Markdown | 应用内 |
| `Ctrl` `/` | 快捷片段选择器 | 应用内 |
| `Ctrl` `+ / - / 0` | 界面缩放 放大/缩小/重置 | 应用内 |
| 双击标题栏 | 最大化/还原 | 窗口 |
| `Alt` | 临时唤出菜单栏 | 窗口 |
| 悬停代码块 | 复制 / 保存为文件 / 折叠 | 对话 |

---

## 数据存放位置

所有用户数据都在 `$DSH_HOME`（Windows 下即 `%USERPROFILE%\.dsh`）：

| 路径 | 内容 |
|------|------|
| `$DSH_HOME/memory/memory.jsonl` | 长期记忆 |
| `$DSH_HOME/skills/<id>/` | 从市场安装的技能（`SKILL.md`） |
| `$DSH_HOME/profiles/<profile>/cordis.patch.yml` | 用户 patch 层（市场安装的插件在此登记） |
| `$DSH_HOME/plugin-market.json` | 插件市场状态（已装列表、令牌、市场地址） |
| `$DSH_HOME/runtime/` | 电脑控制的 uv 与隔离 Python 运行时 |
| `$DSH_HOME/plugin-market-backup/` | 安装/更新时的备份 |
| 附件存储 | 内容寻址的本地附件目录（`dsh-attachment-local`） |
| 产物交付 | `<files>/deliver/`（`send_file` 落位，界面可一键保存） |

---

## 复现 / 构建

```bash
npm install
# 把 plugins/@deepseek-ai/* 覆盖到 node_modules/@deepseek-ai/（替换/新增对应包），
# 并在 $DSH_HOME/profiles/node_modules 下建立 junction
node scripts/install-plugins.mjs
npm start
```

> **computer-use 运行时**：电脑控制需要 `uv`（仅打包时读取）。从
> https://github.com/astral-sh/uv/releases 下载 `uv-x86_64-pc-windows-msvc.zip`，
> 解压后把 `uv.exe` 放到 `resources/runtime/uv/uv.exe`（该目录不入库）。

打包 Windows 安装包：

```bash
npm run dist          # NSIS 安装器 + portable 单文件 exe（输出到 dist/）
npm run dist:portable # 仅 portable exe
```

> 国内网络先设置镜像：
> ```powershell
> $env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
> $env:ELECTRON_BUILDER_BINARIES_MIRROR = "https://npmmirror.com/mirrors/electron-builder-binaries/"
> ```
> 若不想让 electron-builder 尝试发布到 GitHub，构建时加 `--publish never`。

---

## 仓库结构

本仓库**不包含** `node_modules`（约 671MB，`npm install` 后生成）。

```
src/main.js               Electron 主进程：进程内 boot harness + 窗口/菜单/托盘/热键/生命周期
src/preload.cjs           contextBridge 桥（沙箱开启，仅白名单 API）
src/quickchat-hotkey.cjs  Ctrl+D+S 三键和弦的底层键盘钩子
src/quickchat.html        快捷对话 mini 面板页面
src/splash.html           启动开屏页
src/update-downloader.mjs 多线程并行加速的安装器下载器
resources/icon.svg        应用图标源（DeepSeek 鲸鱼）
scripts/                  图标生成、插件同步安装、发布与各类验证脚本
plugins/@deepseek-ai/     本 fork 新增/修改的 dsh 插件（复制进 node_modules 使用）
plugin-market/            插件市场服务端（独立部署，不参与打包）
```

`plugins/@deepseek-ai/` 里既有本 fork 新增的插件，也有修改过的上游包完整副本
（如 `dsh-client-ui-sidebar`、`dsh-client-ui-settings-general`、`dsh-web-app`、`dsh-base` 等）。

---

## 工作原理（为什么不需要改前端）

`dsh web` 的本质是：挂载 `@deepseek-ai/dsh-base` + `@deepseek-ai/dsh-web-app` 两个
bundle 的 patch 层，由 `dsh-host-webserver` 监听 `127.0.0.1`，由
`dsh-host-frontend-static` 托管 `@deepseek-ai/dsh-web-frontend/dist` 并在每个 index
响应里注入 `window.__DSH_BOOT__`（client 插件清单）。桌面版复用同一套 composition，只是：

- 用 `boot()` + `provideCmdline()` 在 Electron 主进程内挂载，传 `--port 0` 让系统分配端口，
  再从 `ctx.webServer.port` 读回实际端口
- 原生模块（sharp/koffi/node-pty 等）全部是 N-API，在 Electron 的 Node 上无需重编译
- `node:sqlite`（会话搜索）在 Electron 43+ 内置的 Node 24 中已可用
- 打包时 `node_modules` 全部 `asarUnpack`：harness 的模块回退机制会把
  `$DSH_HOME/profiles/node_modules` 的 junction 指向真实目录——指向 asar 虚拟文件系统的
  junction 无法被原生模块解析（会导致 `__DSH_BOOT__` 空清单，UI 报 “Failed to load plugins”）

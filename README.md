# DeepSeek Harness — Desktop

将 [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) 的 Web 界面
(`dsh web`) 打包为原生 Electron 桌面应用。

> **开源说明（版权）**：上游 deepseek-harness 由 DeepSeek 于 2026 年以 MIT 许可发布。
> 本仓库为桌面 fork，桌面壳层与新增桌面插件（记忆、电脑控制、桌面设置、定时任务、
> 快捷对话、预算血条）由 xxccdl 于 2026 年补充，沿用 MIT。详见 [LICENSE](LICENSE) 与
> [LICENSE-THIRD-PARTY](LICENSE-THIRD-PARTY)。

与网页版完全相同的 harness 在**应用进程内部**启动(无需浏览器、无需单独的 CLI 进程):

- 主进程通过 `@deepseek-ai/dsh-app-boot` 的稳定 API 挂载 `web` profile 的 cordis 组合
  (与 `dsh web` 完全相同的 bundle 层 + 用户 patch 层)
- harness 服务器绑定在操作系统分配的随机 loopback 端口(仅本机可访问)
- `BrowserWindow` 直接加载该端口上的 SPA;`window.__DSH_BOOT__` 仍由服务器端
  index-tap 注入,前端代码零改动
- 退出时自动 dispose harness 树,干净落盘会话状态

## 仓库结构

本仓库**不包含** `node_modules`(约 671MB,安装后生成)。源码分为两部分:

- `src/`,`scripts/`,`resources/`,`package.json` — 桌面壳层与打包配置(本仓库主体)
- `plugins/@deepseek-ai/<package>/` — 桌面 fork 新增/修改的 dsh 插件(见下)

桌面 fork 新增的插件已整理到 `plugins/@deepseek-ai/`,对应上游 npm 包的同名包:

| 插件 | 作用 |
|------|------|
| `dsh-client-ui-memory` | 设置里查看 AI 记忆(文字/KV/思维导图) |
| `dsh-client-ui-computer-use` | 电脑控制设置页 |
| `dsh-client-ui-desktop` | 桌面(托盘/自启/快捷键)设置页 |
| `dsh-client-ui-scheduler` | 定时任务(支持日期/重复/时间)设置页 |
| `dsh-client-ui-quickchat` | Ctrl+D+S 玻璃拟态快捷对话 + 任务列表 |
| `dsh-client-ui-usage` | 侧边栏花费/余额血条 |
| `dsh-tool-memory` | 记忆工具 + `/api/memory` HTTP |
| `dsh-tool-computer-use` | Windows-MCP 电脑控制 |
| `dsh-tool-notify` | 通知 + 定时任务调度 |
| `dsh-tool-usage` | token 花费估算 + DeepSeek 实时余额 |

修改过的上游包(同样在 `plugins/@deepseek-ai/` 提供完整副本):
`dsh-client-ui-sidebar`(新增 footer.status 槽位)、`dsh-client-ui-settings-general`(分区图标)、
`dsh-client-ui-settings-models`、`dsh-client-ui-agent-preset`、`dsh-web-app`(注册插件)、
`dsh-base`(注册后端插件)。

## 复现 / 构建

```bash
npm install
# 将 plugins/@deepseek-ai/* 覆盖到 node_modules/@deepseek-ai/(会替换/新增对应包)
node scripts/install-plugins.mjs   # 或手动复制 plugins/@deepseek-ai/* 到 node_modules/@deepseek-ai/
npm start
```

> **computer-use 运行时**:电脑控制功能需要 uv 可执行文件(仅打包时读取)。
> 从 https://github.com/astral-sh/uv/releases 下载 `uv-x86_64-pc-windows-msvc.zip`,
> 解压后把 `uv.exe` 放到 `resources/runtime/uv/uv.exe`(该目录不入库)。

打包 Windows 安装包:

```bash
npm run dist          # NSIS 安装器 + portable 单文件 exe (输出到 dist/)
npm run dist:portable # 仅 portable exe
```

> 国内网络请先设置镜像环境变量:
> ```powershell
> $env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
> $env:ELECTRON_BUILDER_BINARIES_MIRROR = "https://npmmirror.com/mirrors/electron-builder-binaries/"
> ```

## 运行

启动后会打开 "DeepSeek Harness" 窗口。会话、设置、凭据与网页版完全共享
(`%USERPROFILE%\.dsh`,即 `$DSH_HOME`)。

## 桌面集成

- **无边框窗口 + 自定义标题栏**:窗口无原生边框,标题栏由 preload 注入
  (左侧标题/拖拽区,右侧自定义最小化、最大化/还原、关闭按钮),双击标题栏切换最大化;
  按钮图标随最大化状态自动切换。标题栏参与文档流(`body` 变为 flex 列),
  SPA 自动缩进剩余高度,内容永不被遮挡
- **菜单**:Edit(剪贴板角色,Web 输入框可用)、View(缩放/DevTools/全屏)、
  Help(打开 `$DSH_HOME`、关于);`Alt` 键临时唤出菜单栏
- **外部链接**:`target=_blank` / 站外导航自动交给系统浏览器
- **通知**:harness 的通知走系统原生通知(已授权)
- **窗口状态**:位置/尺寸/最大化在重启后恢复;单实例锁,二次启动聚焦已有窗口
- **快捷对话**:`Ctrl+D+S` 唤起玻璃拟态 mini 对话框(4 个模式:标准/PTC/极简/创造),
  含快捷对话与任务列表两个页面
- **预算血条**:侧边栏左下角(设置上方)显示 token 花费估算与 DeepSeek 实时余额
- **preload bridge**:SPA 可通过 `window.dshDesktop` 调用
  `getAppInfo()` / `getServerUrl()` / `openExternal()` / `showItemInFolder()` / `openPath()`

## 结构

```
src/main.js        Electron 主进程:进程内 boot harness + 窗口/菜单/生命周期
src/preload.cjs    contextBridge 桥(沙箱开启,仅暴露白名单 API)
resources/icon.svg 应用图标源(DeepSeek 鲸鱼)
scripts/make-icon.mjs 由 SVG 生成 PNG 图标
plugins/@deepseek-ai/<pkg>/ 桌面 fork 的插件源码(复制到 node_modules 使用)
```

## 工作原理(为什么不需要改前端)

`dsh web` 的本质是:挂载 `@deepseek-ai/dsh-base` + `@deepseek-ai/dsh-web-app` 两个
bundle 的 patch 层,由 `dsh-host-webserver` 监听 `127.0.0.1`,由
`dsh-host-frontend-static` 托管 `@deepseek-ai/dsh-web-frontend/dist` 并在每个
index 响应里注入 `window.__DSH_BOOT__`(client 插件清单)。桌面版复用同一套
composition,只是:

- 用 `boot()` + `provideCmdline()` 在 Electron 主进程内挂载,传 `--port 0` 让系统
  分配端口,再从 `ctx.webServer.port` 读回实际端口
- 原生模块(sharp/koffi/node-pty 等)全部是 N-API,在 Electron 的 Node 上无需重编译
- `node:sqlite`(会话搜索)在 Electron 43+ 内置的 Node 24 中已可用
- 打包时 `node_modules` 全部 `asarUnpack`:harness 的模块回退机制会把
  `$DSH_HOME/profiles/node_modules` 的 junction 指向真实目录——指向 asar
  虚拟文件系统的 junction 无法被原生模块解析(会导致 `__DSH_BOOT__` 空清单,
  UI 报 "Failed to load plugins")

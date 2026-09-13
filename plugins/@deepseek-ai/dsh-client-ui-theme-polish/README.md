# 外观美化 · Appearance Polish

给 DSH 换一套更耐看的配色，并顺手调整正文显示大小。**不做任何破坏性改动**：只叠加一层主题 token 覆盖层，随时可一键还原。

## 功能

- **六套精选调色板**：原始外观（不覆盖）· 极简白 · 雾蓝 · 墨玉 · 暖砂 · 霓虹夜。
- **整套换色**：一次覆盖 DSH 的 13 个主题 token —— 底色、二级卡片层、浮层、两级描边、强调色、主次文字、成功 / 警告 / 错误、侧栏底色。
- **浅色深色同时定义**：每套调色板都提供了浅色与深色两套值，所以切换系统的浅色 / 深色主题时配色跟着走，不会出现「一半新色一半原色」。
- **正文字号**：13–17 px 一键切换，走 DSH 内置的 `theme.setFontSize`。
- **实时预览**：设置页里有一块用主题变量渲染的迷你界面，换配色当场看到效果。
- **选择会被记住**：调色板存于 `localStorage`，下次启动自动套用。

## 使用

侧栏 → **设置** → **外观美化**。

1. 在「调色板」里点一张卡片即可全局生效；当前使用中的那张会高亮并显示「使用中」。
2. 每张卡片下方是浅色 / 深色对半拼接的色卡，一眼能看出两个模式下的观感。
3. 「正文字号」调整对话正文大小。
4. 「全部还原」回到 DSH 原始外观与默认字号（字号会恢复成插件启动时读到的值）。

## 实现说明

- 只使用官方扩展面：`theme.overrideTokens(source, tokens)` 叠加一层 token 覆盖层，`theme.setFontSize(px)` 写入产品自带的字号偏好，`settings.section` 槽位挂一页设置页。
- **不碰产品 DOM**：插件自身的样式只作用于自己注册的界面（`up-` 前缀），配色全部通过主题变量生效，没有任何硬编码的内部类名选择器。
- 覆盖层以包名为 source，停止插件或被卸载时随插件的 effect 一起移除。
- 零依赖。

## English

Six curated palettes (plus the untouched original) for the DSH interface, applied as a single theme-token override layer over whichever light/dark theme you use, with adjustable conversation body-text size. Everything lives on one page under Settings → Appearance+. Fully reversible: no product DOM is touched, and removing the plugin restores the shipped look.

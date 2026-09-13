// Create a GitHub release (no assets) for the current tag using the token
// resolved from git's credential store (same credential the push used).
import { execSync } from "node:child_process";

const owner = "xxccdl";
const repo = "deepseek-harness-desktop";
const tag = process.argv[2] ?? "v1.6.5";

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
  "## 1.6.5",
  "",
  "- **同步上游 dsh 到 0.1.5-rc.2**：核心依赖从 `0.1.2-alpha.2` 升级。18 个上游派生 fork 包已重基到新版本，零改动的 `dsh-llm` / `dsh-mcp-client` 归还上游，自研插件保持不变。随上游本版带进来的还有：模型菜单改为 portal + 实测定位、侧栏新增面板列表、`llm-deepseek` 模型表扩到 4 个（`deepseek-flash` 变为多模态 + `systemPromptUpdate: in-history`）、设置页描边/圆角重整、新增会话格式迁移系列包",
  "- **开机动画改为与手机版同一套**：纯黑背景、居中的 `Made by xxccdl`、光带裁剪进文字笔画内扫过；去掉光晕与涟漪环，最短展示 2.6 秒，服务未就绪则继续循环而不是淡出",
  "- **推理等级面板优化**：档位中文化（关闭/低/高/最高）、二级面板补上「返回」、进入/退回改为方向化滑动过渡、每次落档都有一次反馈脉冲、悬停时圆点放大提示可拖",
  "- **电脑控制改为视觉优先**：讲清 `Snapshot` 必须传 `use_vision=True` 才有画面（默认只返回元素树）、默认开启的元素外框与参考网格怎么用；坐标给出「元素列表坐标优先，否则按相对位置 × 元数据屏幕尺寸换算」的规则——图片进上下文前会被缩放两次，图上量到的绝对像素不能直接用",
  "- **`vision_analyze` 支持桌面自动截屏**：Windows 桌面端不传 `image_path` 时直接截取本机屏幕（移动端仍走原生截屏桥），纯文本模型也能看屏幕",
  "- **修复**：模型下拉的重试按钮此前显示成英文字面量 `retry`，现在正确显示「重新加载」",
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

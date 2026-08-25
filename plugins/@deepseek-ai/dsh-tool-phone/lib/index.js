// DeepSeek Harness phone control plugin.
//
// Lets the AI operate the phone through the Android accessibility service:
// read the current screen's interactive elements, then tap / swipe / type /
// press keys / scroll / open apps. All calls go over the local HTTP bridge
// exposed by the native layer (127.0.0.1:3090), so no extra permissions are
// needed on the Node side.
//
// Prerequisite: the user must enable the DeepSeek Harness accessibility
// service in system Settings → Accessibility. Tools report a clear error with
// guidance when it is off.
//
// @module @deepseek-ai/dsh-tool-phone
import { defineTool } from "@deepseek-ai/dsh-tools";

/** Cordis plugin name. */
const name = "tool-phone";
/** Required services: the tool registry. */
const inject = ["tools"];

/** Native phone-control HTTP bridge (started by the app's foreground service). */
const BASE = "http://127.0.0.1:3090";

/** 无障碍未开启时的引导文案（AI 拿它提示用户）。 */
const DISABLED_HINT =
  "手机控制未开启：请先在系统设置 → 无障碍 中开启 DeepSeek Harness 的无障碍服务（App 内也会显示引导横幅）。开启后才能操控手机。";

/** 模块级上下文引用（apply 时注入），供工具执行时访问 llm/attachments 等服务。 */
let ctxRef = null;

async function call(method, path, body) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (e) {
    return {
      ok: false,
      error: `无法连接手机控制服务（${BASE}）：${e instanceof Error ? e.message : String(e)}。请确认 App 后台服务已启动。`,
    };
  }
  let text;
  try {
    text = await res.text();
  } catch {
    return { ok: false, error: "手机控制服务响应异常" };
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: `手机控制服务返回异常：${text.slice(0, 200)}` };
  }
  if (data?.code === "ACCESSIBILITY_DISABLED") {
    return { ok: false, error: DISABLED_HINT, code: "ACCESSIBILITY_DISABLED" };
  }
  return data;
}

/** 给元素补上中心坐标 center{x,y}（由 bounds{l,t,r,b} 计算，屏幕像素）。 */
function enrichElement(el) {
  const out = { ...el };
  const b = el?.bounds;
  if (b && Number.isFinite(b.l) && Number.isFinite(b.t) && Number.isFinite(b.r) && Number.isFinite(b.b)) {
    out.center = {
      x: Math.round((b.l + b.r) / 2),
      y: Math.round((b.t + b.b) / 2),
    };
  }
  return out;
}

/** 把 phone_screen 结果格式化为模型可直接阅读的完整文本（文字 + 中心坐标 + 属性）。 */
function renderScreenElements(value) {
  const elements = Array.isArray(value.elements) ? value.elements : [];
  const clickable = Array.isArray(value.clickable) ? value.clickable : [];
  const inputs = Array.isArray(value.inputs) ? value.inputs : [];
  const lines = [`[读取屏幕] 共 ${elements.length} 个元素（可点击 ${clickable.length}，输入框 ${inputs.length}）`];
  const fmt = (e) => {
    const parts = [];
    if (e.text) parts.push(`「${e.text}」`);
    if (e.desc) parts.push(`描述:${e.desc}`);
    const c = e.center;
    if (c && Number.isFinite(c.x) && Number.isFinite(c.y)) parts.push(`中心(${c.x},${c.y})`);
    const b = e.bounds;
    if (b && Number.isFinite(b.l)) parts.push(`边界[${b.l},${b.t},${b.r},${b.b}]`);
    const flags = [];
    if (e.longClickable) flags.push("可长按");
    if (e.scrollable) flags.push("可滚动");
    if (e.editable) flags.push("可输入");
    if (e.checked) flags.push("已选中");
    if (flags.length) parts.push(flags.join("/"));
    return parts.join(" ");
  };
  if (clickable.length > 0) {
    lines.push("可点击元素：");
    clickable.slice(0, 60).forEach((e, i) => lines.push(`${i + 1}. ${fmt(e)}`));
    if (clickable.length > 60) lines.push(`…等共 ${clickable.length} 个可点击元素`);
  }
  if (inputs.length > 0) {
    lines.push("可输入框：");
    inputs.slice(0, 25).forEach((e, i) => lines.push(`${i + 1}. ${fmt(e)}`));
    if (inputs.length > 25) lines.push(`…等共 ${inputs.length} 个输入框`);
  }
  lines.push("操作：点击用 phone_tap 传「文字」或中心坐标；输入先 phone_tap 点输入框再 phone_type；长按/双击同理。");
  lines.push("视觉模式：若元素缺少文字、或需要理解图标/图片/图表/整体布局，调用 phone_screenshot 截屏（多模态模型直接看画面）后，再结合 phone_tap / phone_swipe / phone_type 完成操作。");
  return lines.join("\n");
}

/** 读取屏幕。无参数。返回可交互元素列表（text/desc/bounds/中心坐标/可点击等）。 */
const screenTool = defineTool({
  name: "phone_screen",
  description:
    "读取手机当前屏幕的可交互元素：每个元素返回 可交互文字(text)、描述(desc)、属性(clickable 可点击/longClickable 可长按/scrollable 可滚动/editable 可输入/checked 已选中)、边界 bounds{l,t,r,b} 与中心坐标 center{x,y}（屏幕像素）。同时返回 clickable 清单（可直接点击的元素及其文字和中心坐标）与 inputs 清单（可输入的输入框）。调用后据此决定后续点击、滑动、输入的位置。当用户要求操控手机（打开应用、点按钮、填表单、浏览页面等）时，先调用本工具查看当前界面。注意：本工具只能读取无障碍树里的文字元素；当需要理解界面的视觉内容（识别图片/图标/图表/配色/整体布局、或元素没有可用文字时），应调用 phone_screenshot（多模态模型直接看截图）或 vision_analyze 看懂屏幕。",
  parameters: {},
  output: {
    schema: {
      type: "object",
      additionalProperties: true,
      properties: {},
    },
    render: (_args, value) => {
      if (!value?.ok) {
        return [{ type: "text", text: `读取屏幕失败：${value?.error ?? "未知错误"}` }];
      }
      return [{ type: "text", text: renderScreenElements(value) }];
    },
  },
  async execute(_args) {
    const data = await call("GET", "/api/screen");
    if (!data?.ok) {
      return { ok: false, error: data?.error ?? "读取屏幕失败" };
    }
    const raw = Array.isArray(data.elements) ? data.elements : [];
    const elements = raw.map(enrichElement);
    // 可直接点击的元素清单（text/desc + 中心坐标），AI 据此决定点哪里
    const clickable = elements
      .filter((e) => e.clickable || e.longClickable)
      .map((e, i) => ({
        index: i,
        text: e.text ?? "",
        desc: e.desc ?? "",
        center: e.center ?? null,
        bounds: e.bounds,
        longClickable: !!e.longClickable,
      }));
    // 可输入的输入框清单
    const inputs = elements
      .filter((e) => e.editable)
      .map((e, i) => ({ index: i, text: e.text ?? "", desc: e.desc ?? "", center: e.center ?? null }));
    return {
      ok: true,
      screen: data.screen,
      elements,
      clickable,
      inputs,
    };
  },
  presentCall: () => ({ card: "generic", title: "读取屏幕", kind: "other" }),
});

/** 原生截屏接口（移动端无障碍服务提供，返回 base64 PNG）。 */
const SCREENSHOT_URL = "http://127.0.0.1:3090/api/screenshot";

async function captureScreenshot() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(SCREENSHOT_URL, { method: "GET", signal: controller.signal });
    if (!res.ok) throw new Error(`截屏失败：HTTP ${res.status}`);
    const data = await res.json();
    if (!data?.ok || !data?.data) throw new Error(data?.error ?? "截屏失败：原生服务未返回图像数据");
    return { base64: data.data, mediaType: "image/png" };
  } catch (err) {
    if (err.name === "AbortError") throw new Error("截屏服务连接超时：请确认 App 后台服务与无障碍服务已开启");
    throw new Error(`截屏不可用：${err.message}`);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 只限多模态模型：当前路由模型必须声明 image 输入能力。
 * 非视觉模型调用时抛错引导切换模型；无法判定时放行（序列化层对非视觉模型会拒绝图片内容兜底）。
 */
async function assertImageCapableRoute(exec) {
  const ctx = ctxRef;
  const routed = exec?.agent?.session?.requestHeader?.()?.config;
  const provider = routed?.provider ?? exec?.agent?.options?.provider;
  const model = routed?.model ?? exec?.agent?.options?.model;
  const llm = ctx?.get?.("llm");
  if (provider === void 0 || model === void 0 || llm === void 0) return;
  const active = await llm.resolveModelInfo(provider, model, exec?.signal);
  if (active?.inputModalities === void 0 || !active.inputModalities.includes("image")) {
    throw new Error(
      `当前模型「${model}」不支持图像输入（phone_screenshot 只限多模态模型）；请切换到多模态模型（如 deepseek-v4-flash-vision-exp）后，截图才能直接发给模型查看。`,
    );
  }
}

/** 截取手机屏幕，直接作为图片发给多模态模型（无需 vision_analyze）。 */
const screenshotTool = defineTool({
  name: "phone_screenshot",
  description:
    "截取手机当前屏幕并直接作为图片发给当前的多模态（视觉）模型查看——模型直接看到截图画面，无需再调用 vision_analyze。适合理解界面整体布局、识别图标/图片/图表/配色、或元素没有文字的视觉场景；可与 phone_screen 搭配（读元素 + 看画面）。仅当当前模型支持图像输入（多模态）时可用；非多模态模型会提示切换模型。",
  parameters: {},
  output: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        ok: { type: "boolean", required: true },
        attachmentId: { type: "string" },
        mediaType: { type: "string" },
        bytes: { type: "integer" },
        width: { type: "integer" },
        height: { type: "integer" },
      },
    },
    render: (_args, value) => {
      if (!value?.ok) return [{ type: "text", text: `截屏失败：${value?.error ?? "未知错误"}` }];
      return [
        { type: "text", text: `已截取手机屏幕（${value.width ?? "?"}x${value.height ?? "?"} px，见附图）` },
        {
          type: "image",
          attachment: {
            attachmentId: value.attachmentId,
            mediaType: value.mediaType,
            bytes: value.bytes,
            width: value.width,
            height: value.height,
          },
        },
      ];
    },
  },
  async execute(_args, exec) {
    await assertImageCapableRoute(exec);
    const shot = await captureScreenshot();
    const attachments = ctxRef?.get?.("attachments");
    if (attachments === void 0) {
      return { ok: false, error: "当前环境未挂载图片附件服务，无法直接发送截图；请改用 vision_analyze" };
    }
    const ref = await attachments.saveImage({
      data: Buffer.from(shot.base64, "base64"),
      mediaType: shot.mediaType,
      name: "screenshot.png",
    });
    return {
      ok: true,
      attachmentId: ref.attachmentId,
      mediaType: ref.mediaType,
      bytes: ref.bytes,
      width: ref.width,
      height: ref.height,
    };
  },
  presentCall: () => ({ card: "generic", title: "截取屏幕", kind: "other" }),
});

/** 点击。按文本匹配或坐标。 */
const tapTool = defineTool({
  name: "phone_tap",
  description:
    "点击手机屏幕上的元素或坐标。优先传 text 按元素文字/描述匹配（推荐，更稳定）；也可传 x/y 坐标直接点击。坐标为屏幕像素。",
  parameters: {
    text: {
      type: "string",
      description: "要点击的元素文字/描述（包含匹配，不区分大小写）。与 x/y 二选一。"
    },
    x: {
      type: "number",
      description: "点击位置横坐标（屏幕像素），需同时提供 y。"
    },
    y: {
      type: "number",
      description: "点击位置纵坐标（屏幕像素），需同时提供 x。"
    }
  },
  output: {
    schema: {
      type: "object",
      additionalProperties: true,
      properties: {},
    },
    render: (_args, value) => [
      { type: "text", text: value?.ok ? "点击成功" : `点击失败：${value?.error ?? "未知错误"}` }
    ],
  },
  async execute(args) {
    const hasText = typeof args.text === "string" && args.text.trim() !== "";
    if (hasText) {
      const data = await call("POST", "/api/action", { action: "tapText", text: args.text.trim() });
      return data?.ok
        ? { ok: true, matched: args.text.trim(), note: "已点击包含该文字的元素" }
        : { ok: false, error: data?.error ?? "点击失败" };
    }
    const x = Number(args.x);
    const y = Number(args.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return { ok: false, error: "phone_tap 需要 text（按文字匹配）或 x/y 坐标" };
    }
    const data = await call("POST", "/api/action", { action: "tap", x: Math.round(x), y: Math.round(y) });
    return data?.ok
      ? { ok: true, x: Math.round(x), y: Math.round(y) }
      : { ok: false, error: data?.error ?? "点击失败" };
  },
  presentCall: (args) => ({
    card: "generic",
    title: "点击",
    kind: "other",
    rawInput: args.text ? `「${args.text}」` : `(${args.x}, ${args.y})`,
  }),
});

/** 滑动。 */
const swipeTool = defineTool({
  name: "phone_swipe",
  description:
    "在手机屏幕上滑动（从 (x1,y1) 到 (x2,y2)）。用于上下滚动页面、左右切换、拖拽等。坐标为屏幕像素。",
  parameters: {
    x1: { type: "number", required: true, description: "起点横坐标（像素）。" },
    y1: { type: "number", required: true, description: "起点纵坐标（像素）。" },
    x2: { type: "number", required: true, description: "终点横坐标（像素）。" },
    y2: { type: "number", required: true, description: "终点纵坐标（像素）。" },
    duration: { type: "number", description: "滑动时长毫秒（50–5000），默认 300。" }
  },
  output: {
    schema: { type: "object", additionalProperties: true, properties: {} },
    render: (_args, value) => [
      { type: "text", text: value?.ok ? "滑动成功" : `滑动失败：${value?.error ?? "未知错误"}` }
    ],
  },
  async execute(args) {
    const n = (...k) => Number(args[k]);
    const data = await call("POST", "/api/action", {
      action: "swipe",
      x1: Math.round(n("x1")), y1: Math.round(n("y1")),
      x2: Math.round(n("x2")), y2: Math.round(n("y2")),
      duration: Math.round(n("duration") || 300),
    });
    return data?.ok ? { ok: true } : { ok: false, error: data?.error ?? "滑动失败" };
  },
  presentCall: (args) => ({
    card: "generic",
    title: "滑动",
    kind: "other",
    rawInput: `(${args.x1},${args.y1}) → (${args.x2},${args.y2})`,
  }),
});

/** 输入文本。 */
const typeTool = defineTool({
  name: "phone_type",
  description:
    "向当前聚焦的输入框输入文本（覆盖原内容）。输入前应先用 phone_tap 点击目标输入框使其聚焦。中文、英文、数字均可。",
  parameters: {
    text: { type: "string", required: true, description: "要输入的完整文本。" }
  },
  output: {
    schema: { type: "object", additionalProperties: true, properties: {} },
    render: (_args, value) => [
      { type: "text", text: value?.ok ? "输入成功" : `输入失败：${value?.error ?? "未知错误"}` }
    ],
  },
  async execute(args) {
    const text = String(args.text ?? "");
    if (text === "") return { ok: false, error: "phone_type 的 text 不能为空" };
    const data = await call("POST", "/api/action", { action: "type", text });
    return data?.ok ? { ok: true } : { ok: false, error: data?.error ?? "输入失败" };
  },
  presentCall: (args) => ({ card: "generic", title: "输入文本", kind: "other", rawInput: String(args.text ?? "") }),
});

/** 按键。 */
const keyTool = defineTool({
  name: "phone_key",
  description:
    "按下手机物理/导航键：back（返回）、home（回到桌面）、recent（最近任务）、enter（回车/发送，会尝试点击当前聚焦元素或常见的提交按钮，如搜索/发送/确定）。",
  parameters: {
    key: {
      type: "string",
      required: true,
      enum: ["back", "home", "recent", "enter"],
      description: "按键：back / home / recent / enter。"
    }
  },
  output: {
    schema: { type: "object", additionalProperties: true, properties: {} },
    render: (_args, value) => [
      { type: "text", text: value?.ok ? `已按 ${_args?.key}` : `按键失败：${value?.error ?? "未知错误"}` }
    ],
  },
  async execute(args) {
    const key = String(args.key ?? "").toLowerCase();
    if (!["back", "home", "recent", "enter"].includes(key)) {
      return { ok: false, error: "不支持的按键：" + key };
    }
    const data = await call("POST", "/api/action", { action: "key", key });
    return data?.ok ? { ok: true, key } : { ok: false, error: data?.error ?? "按键失败" };
  },
  presentCall: (args) => ({ card: "generic", title: "按键", kind: "other", rawInput: String(args?.key ?? "") }),
});

/** 滚动。 */
const scrollTool = defineTool({
  name: "phone_scroll",
  description:
    "滚动当前可滚动区域：up（向上滚，看更靠前内容）、down（向下滚，看更多内容）、left / right（左右滚）。优先滚动可滚动元素，必要时用滑动手势模拟。",
  parameters: {
    direction: {
      type: "string",
      required: true,
      enum: ["up", "down", "left", "right"],
      description: "滚动方向：up / down / left / right。"
    }
  },
  output: {
    schema: { type: "object", additionalProperties: true, properties: {} },
    render: (_args, value) => [
      { type: "text", text: value?.ok ? `已向${_args?.direction}滚动` : `滚动失败：${value?.error ?? "未知错误"}` }
    ],
  },
  async execute(args) {
    const dir = String(args.direction ?? "").toLowerCase();
    if (!["up", "down", "left", "right"].includes(dir)) {
      return { ok: false, error: "不支持的滚动方向：" + dir };
    }
    const data = await call("POST", "/api/action", { action: "scroll", direction: dir });
    return data?.ok ? { ok: true, direction: dir } : { ok: false, error: data?.error ?? "滚动失败" };
  },
  presentCall: (args) => ({ card: "generic", title: "滚动", kind: "other", rawInput: String(args?.direction ?? "") }),
});

/** 打开应用。 */
const openTool = defineTool({
  name: "phone_open",
  description:
    "打开手机上的应用。传入应用包名（package name）。常见包名：微信 com.tencent.mm、支付宝 com.eg.android.AlipayGphone、浏览器 com.android.browser、设置 com.android.settings、相机 com.android.camera、YouTube com.google.android.youtube 等。若不知道包名，先用 phone_screen 看当前界面或询问用户。",
  parameters: {
    package: { type: "string", required: true, description: "应用包名（package name）。" }
  },
  output: {
    schema: { type: "object", additionalProperties: true, properties: {} },
    render: (_args, value) => [
      { type: "text", text: value?.ok ? `已打开应用：${_args?.package}` : `打开失败：${value?.error ?? "未知错误"}` }
    ],
  },
  async execute(args) {
    const pkg = String(args.package ?? "").trim();
    if (pkg === "") return { ok: false, error: "phone_open 需要 package 参数" };
    const data = await call("POST", "/api/action", { action: "open", package: pkg });
    return data?.ok ? { ok: true, package: pkg } : { ok: false, error: data?.error ?? "打开失败" };
  },
  presentCall: (args) => ({ card: "generic", title: "打开应用", kind: "other", rawInput: String(args?.package ?? "") }),
});

/** 长按。 */
const longPressTool = defineTool({
  name: "phone_longpress",
  description:
    "在手机屏幕上长按某个位置（约 0.65 秒）。用于触发长按菜单、拖拽图标、选中文本等。传 text 按元素文字匹配（推荐），或传 x/y 坐标。",
  parameters: {
    text: { type: "string", description: "要长按的元素文字/描述（包含匹配）。与 x/y 二选一。" },
    x: { type: "number", description: "长按位置横坐标（像素），需同时提供 y。" },
    y: { type: "number", description: "长按位置纵坐标（像素），需同时提供 x。" }
  },
  output: {
    schema: { type: "object", additionalProperties: true, properties: {} },
    render: (_args, value) => [
      { type: "text", text: value?.ok ? "长按成功" : `长按失败：${value?.error ?? "未知错误"}` }
    ],
  },
  async execute(args) {
    let x, y;
    if (typeof args.text === "string" && args.text.trim() !== "") {
      // 先按文字找到元素中心
      const found = await call("POST", "/api/action", { action: "find", text: args.text.trim() });
      if (!found?.ok) return { ok: false, error: found?.error ?? "未找到该元素" };
      x = Math.round(Number(found.x));
      y = Math.round(Number(found.y));
    } else {
      x = Math.round(Number(args.x));
      y = Math.round(Number(args.y));
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return { ok: false, error: "phone_longpress 需要 text 或 x/y 坐标" };
      }
    }
    const data = await call("POST", "/api/action", { action: "longPress", x, y });
    return data?.ok ? { ok: true, x, y } : { ok: false, error: data?.error ?? "长按失败" };
  },
  presentCall: (args) => ({ card: "generic", title: "长按", kind: "other", rawInput: args.text ? `「${args.text}」` : `(${args.x}, ${args.y})` }),
});

/** 双击。 */
const doubleTapTool = defineTool({
  name: "phone_doubletap",
  description:
    "在手机屏幕上双击某个位置。用于点赞、放大、快速打开等场景。传 text 按元素文字匹配（推荐），或传 x/y 坐标。",
  parameters: {
    text: { type: "string", description: "要双击的元素文字/描述（包含匹配）。与 x/y 二选一。" },
    x: { type: "number", description: "双击位置横坐标（像素），需同时提供 y。" },
    y: { type: "number", description: "双击位置纵坐标（像素），需同时提供 x。" }
  },
  output: {
    schema: { type: "object", additionalProperties: true, properties: {} },
    render: (_args, value) => [
      { type: "text", text: value?.ok ? "双击成功" : `双击失败：${value?.error ?? "未知错误"}` }
    ],
  },
  async execute(args) {
    let x, y;
    if (typeof args.text === "string" && args.text.trim() !== "") {
      const found = await call("POST", "/api/action", { action: "find", text: args.text.trim() });
      if (!found?.ok) return { ok: false, error: found?.error ?? "未找到该元素" };
      x = Math.round(Number(found.x));
      y = Math.round(Number(found.y));
    } else {
      x = Math.round(Number(args.x));
      y = Math.round(Number(args.y));
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return { ok: false, error: "phone_doubletap 需要 text 或 x/y 坐标" };
      }
    }
    const data = await call("POST", "/api/action", { action: "doubleTap", x, y });
    return data?.ok ? { ok: true, x, y } : { ok: false, error: data?.error ?? "双击失败" };
  },
  presentCall: (args) => ({ card: "generic", title: "双击", kind: "other", rawInput: args.text ? `「${args.text}」` : `(${args.x}, ${args.y})` }),
});

/** 查找元素。 */
const findTool = defineTool({
  name: "phone_find",
  description:
    "在手机当前屏幕上查找包含指定文字/描述的元素，返回它的中心坐标与边界。用于验证某个内容是否出现在屏幕上（如确认保存成功、检查搜索结果），或获取元素位置后再点击。",
  parameters: {
    text: { type: "string", required: true, description: "要查找的文字/描述（包含匹配，不区分大小写）。" }
  },
  output: {
    schema: { type: "object", additionalProperties: true, properties: {} },
    render: (_args, value) => [
      { type: "text", text: value?.ok ? `已找到「${value.text}」@ (${value.x}, ${value.y})` : `未找到：${value?.error ?? "未知错误"}` }
    ],
  },
  async execute(args) {
    const text = String(args.text ?? "").trim();
    if (text === "") return { ok: false, error: "phone_find 需要 text 参数" };
    const data = await call("POST", "/api/action", { action: "find", text });
    return data?.ok
      ? { ok: true, found: true, text, x: Number(data.x), y: Number(data.y), bounds: data.bounds }
      : { ok: false, found: false, error: data?.error ?? "查找失败" };
  },
  presentCall: (args) => ({ card: "generic", title: "查找元素", kind: "other", rawInput: String(args?.text ?? "") }),
});

/** 展开通知栏。 */
const notificationsTool = defineTool({
  name: "phone_notifications",
  description:
    "展开手机通知栏（下拉状态栏）。用于查看通知、快捷开关等。",
  parameters: {},
  output: {
    schema: { type: "object", additionalProperties: true, properties: {} },
    render: (_args, value) => [
      { type: "text", text: value?.ok ? "已展开通知栏" : `失败：${value?.error ?? "未知错误"}` }
    ],
  },
  async execute() {
    const data = await call("POST", "/api/action", { action: "notifications" });
    return data?.ok ? { ok: true } : { ok: false, error: data?.error ?? "展开通知栏失败" };
  },
  presentCall: () => ({ card: "generic", title: "展开通知栏", kind: "other" }),
});

/** 返回桌面。 */
const homeTool = defineTool({
  name: "phone_home",
  description:
    "返回手机桌面（按下主页键）。用于结束当前应用、回到桌面准备打开其他应用。",
  parameters: {},
  output: {
    schema: { type: "object", additionalProperties: true, properties: {} },
    render: (_args, value) => [
      { type: "text", text: value?.ok ? "已返回桌面" : `失败：${value?.error ?? "未知错误"}` }
    ],
  },
  async execute() {
    const data = await call("POST", "/api/action", { action: "home" });
    return data?.ok ? { ok: true } : { ok: false, error: data?.error ?? "返回桌面失败" };
  },
  presentCall: () => ({ card: "generic", title: "返回桌面", kind: "other" }),
});

/**
 * Register the phone-control tools.
 * @param ctx - registrant context carrying the tool registry.
 */
function apply(ctx) {
  ctxRef = ctx;
  ctx.tools.register(screenTool);
  ctx.tools.register(screenshotTool);
  ctx.tools.register(tapTool);
  ctx.tools.register(swipeTool);
  ctx.tools.register(typeTool);
  ctx.tools.register(keyTool);
  ctx.tools.register(scrollTool);
  ctx.tools.register(openTool);
  ctx.tools.register(longPressTool);
  ctx.tools.register(doubleTapTool);
  ctx.tools.register(findTool);
  ctx.tools.register(notificationsTool);
  ctx.tools.register(homeTool);
}

export { apply, inject, name };

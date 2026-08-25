// DeepSeek Harness multimodal vision tool.
//
// The model-facing `vision_analyze` tool lets the AI analyze an image file or
// a live screen capture using DeepSeek's vision model (deepseek-v4-flash-vision-exp).
// Images are sent as base64 data URLs to the DeepSeek chat-completions API.
//
// @module @deepseek-ai/dsh-tool-vision
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { installSettingsSection, settingsNamespace } from "@deepseek-ai/dsh-settings";
import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment";
import z from "@deepseek-ai/schemastery";

/** Cordis plugin name. */
const name = "tool-vision";
/** Required services. */
const inject = ["tools"];

const NS = settingsNamespace("tool-vision");
const DEFAULT_MODEL = "deepseek-v4-flash-vision-exp";
const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_API_KEY_ENV = "DEEPSEEK_API_KEY";
const SCREENSHOT_URL = "http://127.0.0.1:3090/api/screenshot";

const VISION_MODELS = [
  { id: "deepseek-v4-flash-vision-exp", name: "DeepSeek-V4-Flash-Vision-Exp (多模态视觉)" },
];

const Config = z.object({
  model: z.string().default(DEFAULT_MODEL),
  baseURL: z.string().default(DEFAULT_BASE_URL),
  apiKeyEnv: z.string().role("credential-ref").default(DEFAULT_API_KEY_ENV),
  maxTokens: z.number().step(1).min(1).default(4096),
});

const MIME_MAP = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function mediaTypeFor(path) {
  const ext = extname(path).toLowerCase();
  return MIME_MAP[ext] ?? "image/png";
}

/** Capture the current screen via the native HTTP bridge; returns base64 PNG.
 *  Only available on mobile (Termux bridge). On desktop the fetch fails and
 *  callers should fall back to requiring an explicit image_path. */
async function captureScreenshot() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(SCREENSHOT_URL, { method: "GET", signal: controller.signal });
    if (!res.ok) throw new Error(`截屏失败：HTTP ${res.status}`);
    const data = await res.json();
    if (!data?.ok || !data?.data) {
      throw new Error(data?.error ?? "截屏失败：原生服务未返回图像数据");
    }
    return { base64: data.data, mediaType: "image/png" };
  } catch (err) {
    if (err.name === "AbortError") throw new Error("截屏服务连接超时（仅移动端支持自动截屏，桌面端请指定 image_path）");
    throw new Error(`截屏不可用（桌面端请使用 image_path 指定图片路径）：${err.message}`);
  } finally {
    clearTimeout(timer);
  }
}

/** Read an image file and return base64 + media type. */
async function readImage(filePath) {
  const absPath = resolve(process.cwd(), filePath);
  const buf = await readFile(absPath);
  return { base64: buf.toString("base64"), mediaType: mediaTypeFor(absPath) };
}

/** Call DeepSeek chat-completions with a vision message. */
async function callVisionAPI({ apiKey, baseURL, model, prompt, imageBase64, mediaType, maxTokens }) {
  const body = {
    model,
    stream: false,
    max_tokens: maxTokens,
    messages: [{
      role: "user",
      content: [
        { type: "image_url", image_url: { url: `data:${mediaType};base64,${imageBase64}` } },
        { type: "text", text: prompt || "请详细描述这张图片的内容。" },
      ],
    }],
  };
  const res = await fetch(`${baseURL.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`视觉 API 返回 ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error("视觉 API 未返回内容");
  return content;
}

function apply(ctx, config) {
  let current = () => config;
  installSettingsSection(ctx, NS, Config, config, {
    setSource: (source) => { current = source; },
    onChange: () => {},
  });

  async function resolveConfig() {
    const cfg = current();
    const apiKeyEnv = credentialRef(cfg.apiKeyEnv ?? DEFAULT_API_KEY_ENV);
    let apiKey;
    const credentials = ctx.get("credentials");
    if (credentials !== void 0) {
      apiKey = (await credentials.resolve(apiKeyEnv))?.value;
    }
    if (!apiKey) {
      const ambient = launchEnvironmentOf(ctx).get(cfg.apiKeyEnv ?? DEFAULT_API_KEY_ENV);
      apiKey = ambient?.value;
    }
    if (!apiKey) throw new Error("未配置 DeepSeek API Key（设置环境变量 DEEPSEEK_API_KEY 或在设置中配置）");
    return {
      model: cfg.model ?? DEFAULT_MODEL,
      baseURL: cfg.baseURL ?? DEFAULT_BASE_URL,
      maxTokens: cfg.maxTokens ?? 4096,
      apiKey,
    };
  }

  const visionAnalyze = defineTool({
    name: "vision_analyze",
    description:
      "分析图片内容（支持识别图片中的文字、UI界面、图标、图表、物体、配色、整体布局等）。" +
      "必须提供 image_path 参数指定图片文件的路径（支持 png/jpg/jpeg/webp/gif）。" +
      "在移动端不填 image_path 时可自动截取当前屏幕——用于手机控制场景：当需要看懂手机屏幕的视觉内容（图标/图片/图表/布局/无文字元素）时，调用本工具（不传 image_path）即可截屏并让视觉模型识别。" +
      "也可使用 read_image 工具直接将图片附到对话中让模型直接查看。",
    parameters: {
      prompt: {
        type: "string",
        description: "向视觉模型提出的问题或分析要求，例如「描述这个界面的布局」「识别图中的文字」。默认为详细描述图片内容。",
      },
      image_path: {
        type: "string",
        description: "图片文件的绝对路径或相对于工作区的路径（支持 png/jpg/jpeg/webp/gif）。桌面端必填；移动端不填则自动截屏。",
      },
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          ok: { type: "boolean", required: true },
          model: { type: "string", required: true },
          source: { type: "string", required: true },
          result: { type: "string", required: true },
        },
      },
      render: (_args, value) => [{ type: "text", text: value.result }],
    },
    async execute(args) {
      const cfg = await resolveConfig();
      const prompt = typeof args?.prompt === "string" && args.prompt.trim()
        ? args.prompt.trim()
        : "请详细描述这张图片的内容。";
      const source = typeof args?.image_path === "string" && args.image_path.trim()
        ? { path: args.image_path.trim(), ...(await readImage(args.image_path.trim())) }
        : { path: "(screenshot)", ...(await captureScreenshot()) };
      const result = await callVisionAPI({
        apiKey: cfg.apiKey,
        baseURL: cfg.baseURL,
        model: cfg.model,
        prompt,
        imageBase64: source.base64,
        mediaType: source.mediaType,
        maxTokens: cfg.maxTokens,
      });
      return { ok: true, model: cfg.model, source: source.path, result };
    },
    presentCall: (args) => ({
      card: "generic",
      title: "视觉识别",
      kind: "vision",
      locations: typeof args?.image_path === "string" ? [{ path: args.image_path }] : [],
    }),
  });

  ctx.tools.register(visionAnalyze);
}

export { Config, DEFAULT_MODEL, VISION_MODELS, apply, inject, name };

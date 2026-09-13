// DeepSeek Harness multimodal vision tool.
//
// Image reading is native now: models that declare image input (deepseek-flash)
// see pictures directly through `read_image` / screenshot tools, so the
// model-facing `vision_analyze` tool is the fallback for routes that cannot take
// images at all. It analyzes an image file or a live screen capture with a
// DeepSeek vision-capable model (deepseek-flash, i.e. DeepSeek-V4.1-Flash).
// Images are sent as base64 data URLs to the DeepSeek chat-completions API.
//
// @module @deepseek-ai/dsh-tool-vision
import { readFile, rm } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment";
import z from "@deepseek-ai/schemastery";

/** Cordis plugin name. */
const name = "tool-vision";
/** Required services. */
const inject = ["tools"];

const NS = "tool-vision";
const DEFAULT_MODEL = "deepseek-flash";
const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_API_KEY_ENV = "DEEPSEEK_API_KEY";
const SCREENSHOT_URL = "http://127.0.0.1:3090/api/screenshot";

const VISION_MODELS = [
  { id: "deepseek-flash", name: "DeepSeek-V4.1-Flash（原生支持图片输入）" },
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

/**
 * Capture the Windows desktop into a temporary PNG.
 *
 * The screen has to become a real file for this tool: Windows-MCP and the
 * mobile bridge both hand the picture back as an image block, which is exactly
 * what a text-only route cannot receive — the same route that is the only
 * caller of `vision_analyze`. So this grabs the screen through the system's own
 * .NET imaging classes and writes one to the temp directory.
 *
 * @returns the temporary PNG's absolute path (the caller owns deleting it).
 */
async function captureDesktopFile() {
  const file = join(tmpdir(), `dsh-vision-${randomUUID()}.png`);
  const script = [
    "Add-Type -AssemblyName System.Windows.Forms,System.Drawing",
    "$b = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds",
    "$bmp = New-Object System.Drawing.Bitmap $b.Width, $b.Height",
    "$g = [System.Drawing.Graphics]::FromImage($bmp)",
    "$g.CopyFromScreen($b.Location, [System.Drawing.Point]::Empty, $b.Size)",
    // A PowerShell single-quoted literal is the only safe quoting here:
    // double quotes would leave JSON's escaped backslashes in the path.
    `$bmp.Save('${file.replaceAll("'", "''")}', [System.Drawing.Imaging.ImageFormat]::Png)`,
    "$g.Dispose()",
    "$bmp.Dispose()"
  ].join("; ");
  await new Promise((resolveRun, reject) => {
    const child = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], {
      windowsHide: true,
      stdio: ["ignore", "ignore", "pipe"],
    });
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("桌面截屏超时"));
    }, 15000);
    child.stderr?.on("data", (chunk) => { stderr += String(chunk); });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("exit", (code) => {
      clearTimeout(timer);
      if (code === 0) resolveRun();
      else reject(new Error(`桌面截屏失败（PowerShell 退出码 ${code}）：${stderr.trim().slice(0, 200) || "无输出"}`));
    });
  });
  return file;
}

/** Read an image file and return base64 + media type. */
async function readImage(filePath) {
  const absPath = resolve(process.cwd(), filePath);
  const buf = await readFile(absPath);
  return { base64: buf.toString("base64"), mediaType: mediaTypeFor(absPath) };
}

/**
 * Resolve the screen to analyze when the caller supplied no file: the native
 * bridge first (it captures the phone's screen on mobile), then a local Windows
 * capture, so the desktop has the same single-argument path as mobile.
 *
 * @returns the source path plus its base64 payload and media type.
 */
async function captureScreen() {
  try {
    return { path: "(screenshot)", ...(await captureScreenshot()) };
  } catch (bridgeError) {
    if (process.platform !== "win32") throw bridgeError;
    const file = await captureDesktopFile();
    try {
      return { path: file, ...(await readImage(file)) };
    } finally {
      await rm(file, { force: true }).catch(() => {});
    }
  }
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
  ctx.inject(["settings"], (settingsCtx) => {
    settingsCtx.settings.installSection(ctx, NS, Config, config, {
      setSource: (source) => { current = source; },
      onChange: () => {},
    });
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
      "分析图片内容（识别图片中的文字、UI界面、图标、图表、物体、配色、整体布局等）。" +
      "优先直接看图：当当前模型支持图像输入（如 deepseek-flash）时，请**直接用 read_image 工具读取本地图片**（截图类场景用对应的 screenshot 工具）——图片会附到对话中，你能直接看到画面，无需再调用本工具。" +
      "本工具仅用于：① 当前模型不支持图像输入（纯文本模型）时，借助独立视觉模型 API 代看图片；② 不传 image_path 时自动截屏——移动端走原生截屏桥，Windows 桌面端直接截取本机屏幕，所以桌面端也能不带参数调用本工具查看当前屏幕。" +
      "已有图片文件时请用 image_path 指定路径（支持 png/jpg/jpeg/webp/gif），避免重复截屏。",
    parameters: {
      prompt: {
        type: "string",
        description: "向视觉模型提出的问题或分析要求，例如「描述这个界面的布局」「识别图中的文字」。默认为详细描述图片内容。",
      },
      image_path: {
        type: "string",
        description: "图片文件的绝对路径或相对于工作区的路径（支持 png/jpg/jpeg/webp/gif）。不填则自动截屏（Windows 桌面端截取本机屏幕，移动端走原生截屏桥）。",
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
        : await captureScreen();
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

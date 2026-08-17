// DeepSeek Harness web-fetch plugin.
//
// A default-style dsh tool plugin registering one model-facing tool:
//
//   web_fetch(url, maxChars?) — fetch an http(s) URL and return its readable
//   text: <script>/<style>/<head> noise stripped, tags flattened, entities
//   decoded, whitespace collapsed, and length capped so a huge page cannot
//   blow up the context window.
//
// @module @deepseek-ai/dsh-tool-webfetch
import { defineTool } from "@deepseek-ai/dsh-tools";

/** Cordis plugin name. */
const name = "tool-webfetch";
/** Required services: the tool registry. */
const inject = ["tools"];

/** Default cap on returned text. */
const DEFAULT_MAX_CHARS = 8000;
/** Hard cap so a hostile page cannot flood the context. */
const HARD_MAX_CHARS = 60000;
/** Fetch timeout. */
const FETCH_TIMEOUT_MS = 20000;
/** Largest response body accepted before parsing (5 MB). */
const MAX_BODY_BYTES = 5 * 1024 * 1024;

const ENTITIES = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'",
  "&nbsp;": " ", "&mdash;": "—", "&ndash;": "–", "&hellip;": "…", "&middot;": "·"
};

function decodeEntities(text) {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try { return String.fromCodePoint(Number.parseInt(hex, 16)); } catch { return ""; }
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      try { return String.fromCodePoint(Number(dec)); } catch { return ""; }
    })
    .replace(/&[a-zA-Z]+;|&#39;|&apos;/g, (entity) => ENTITIES[entity] ?? " ");
}

/** Flatten an HTML document into readable text. */
function htmlToText(html) {
  let body = html;
  const bodyMatch = body.match(/<body[\s>][\s\S]*?<\/body>/i);
  if (bodyMatch !== null) body = bodyMatch[0];
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch === null ? "" : decodeEntities(titleMatch[1]).replace(/\s+/g, " ").trim();
  const text = body
    .replace(/<(script|style|noscript|svg|iframe|template)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|li|tr|h[1-6]|section|article|blockquote|pre)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  return { title, text: decodeEntities(text).replace(/[ \t\f\v]+/g, " ").replace(/\n\s*\n\s*\n+/g, "\n\n").trim() };
}

const webFetch = defineTool({
  name: "web_fetch",
  description:
    "Fetch an http(s) URL and return its readable text content (HTML pages are stripped to text; plain text/JSON is returned as-is). " +
    "Use it to read a documentation page, an article, an API response, or any public URL the user mentions. " +
    "For search use web_search instead; this tool only retrieves an exact URL.",
  parameters: {
    url: {
      type: "string",
      required: true,
      description: "The absolute http(s) URL to fetch."
    },
    maxChars: {
      type: "number",
      description: "Optional cap on returned characters (default 8000, max 60000)."
    }
  },
  output: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        url: { type: "string", required: true },
        status: { type: "integer", required: true },
        title: { type: "string", required: true },
        contentType: { type: "string", required: true },
        chars: { type: "integer", required: true },
        truncated: { type: "boolean", required: true },
        text: { type: "string", required: true }
      }
    },
    render: (_args, value) => [
      { type: "text", text: `web_fetch ${value.url} → HTTP ${value.status}${value.title === "" ? "" : ` “${value.title}”`}${value.truncated ? ` (前 ${value.chars} 字符)` : ""}` }
    ]
  },
  async execute(args, exec) {
    const url = String(args.url ?? "").trim();
    if (!/^https?:\/\//i.test(url)) throw new Error("web_fetch: `url` must be an absolute http(s) URL");
    const cap = Math.min(HARD_MAX_CHARS, Math.max(500, Math.floor(args.maxChars ?? DEFAULT_MAX_CHARS)));
    exec.signal?.throwIfAborted?.();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const onAbort = () => controller.abort();
    exec.signal?.addEventListener("abort", onAbort, { once: true });
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/json,text/plain,*/*"
        }
      });
      const contentType = String(res.headers.get("content-type") ?? "");
      if (!res.ok) throw new Error(`HTTP ${String(res.status)}`);
      const raw = await res.text();
      exec.signal?.throwIfAborted?.();
      if (raw.length > MAX_BODY_BYTES) throw new Error("页面过大（超过 5MB），拒绝读取");
      const isHtml = /html/i.test(contentType) || /^\s*<(!doctype|html)/i.test(raw);
      const parsed = isHtml ? htmlToText(raw) : { title: "", text: raw.trim() };
      const truncated = parsed.text.length > cap;
      const text = truncated ? parsed.text.slice(0, cap) : parsed.text;
      return {
        url: res.url || url,
        status: res.status,
        title: parsed.title.slice(0, 300),
        contentType: contentType.split(";")[0] ?? "",
        chars: text.length,
        truncated,
        text
      };
    } finally {
      clearTimeout(timer);
      exec.signal?.removeEventListener("abort", onAbort);
    }
  },
  presentCall: (args) => ({ card: "generic", title: "网页抓取", kind: "other", rawInput: String(args.url ?? "") })
});

/**
 * Register the web_fetch tool on the calling context (global layer).
 * @param ctx - registrant context carrying the tool registry.
 */
function apply(ctx) {
  ctx.tools.register(webFetch);
}

export { apply, inject, name };

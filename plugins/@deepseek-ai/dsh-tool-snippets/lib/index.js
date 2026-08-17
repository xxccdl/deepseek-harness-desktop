// DeepSeek Harness snippet-library plugin.
//
// One durable store shared by the user (the UI picker over /api/snippets) and
// the AI (model-facing tools):
//
//   snippet_save (title, content, tags?)   — insert or update by title.
//   snippet_list (query?)                  — list/search snippets.
//   snippet_get (title)                    — fetch one snippet's full content.
//   snippet_delete (title)                 — remove a snippet.
//
// Store: $DSH_HOME/snippets/snippets.json (atomic writes, promise-serialized).
//
// @module @deepseek-ai/dsh-tool-snippets
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { dshHomePath } from "@deepseek-ai/dsh-home-paths";

/** Cordis plugin name. */
const name = "tool-snippets";
/** Required services: the tool registry (webServer is optional/late). */
const inject = ["tools"];

const STORE = () => join(dshHomePath("snippets"), "snippets.json");
/** Cap on a single snippet's content. */
const MAX_CONTENT_CHARS = 20000;
/** Cap on listing results. */
const MAX_LIST = 100;
/** HTTP surface for the UI picker. */
const SNIPPETS_HTTP_PATH = "/api/snippets";

// ── store plumbing (promise-serialized, atomic) ──────────────────────────────
let writeQueue = Promise.resolve();
function serialized(task) {
  const next = writeQueue.then(task, task);
  writeQueue = next.catch(() => {});
  return next;
}

async function readSnippets() {
  try {
    const data = JSON.parse(await readFile(STORE(), "utf8"));
    return Array.isArray(data.snippets) ? data.snippets : [];
  } catch {
    return [];
  }
}

async function writeSnippets(snippets) {
  await mkdir(dirname(STORE()), { recursive: true });
  const tmp = `${STORE()}.tmp`;
  await writeFile(tmp, JSON.stringify({ snippets }, null, 2), "utf8");
  await rename(tmp, STORE());
}

function view(snippet) {
  return { id: snippet.id, title: snippet.title, content: snippet.content, tags: snippet.tags, updatedAt: snippet.updatedAt };
}

function normalizeTags(tags) {
  const seen = new Set();
  const out = [];
  for (const tag of tags ?? []) {
    const t = String(tag).trim().toLowerCase();
    if (t === "" || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

/** Core save: insert or update by exact title. Returns the stored view. */
async function saveSnippet({ title, content, tags }) {
  const cleanTitle = String(title ?? "").trim();
  const cleanContent = String(content ?? "");
  if (cleanTitle === "") throw new Error("snippet title 不能为空");
  if (cleanContent.length > MAX_CONTENT_CHARS) throw new Error(`snippet 内容超过 ${MAX_CONTENT_CHARS} 字符上限`);
  return serialized(async () => {
    const snippets = await readSnippets();
    const now = new Date().toISOString();
    let record = snippets.find((s) => s.title === cleanTitle);
    if (record === undefined) {
      record = { id: randomUUID(), title: cleanTitle, content: cleanContent, tags: normalizeTags(tags), createdAt: now, updatedAt: now };
      snippets.unshift(record);
    } else {
      record.content = cleanContent;
      record.tags = normalizeTags(tags);
      record.updatedAt = now;
    }
    await writeSnippets(snippets);
    return view(record);
  });
}

/** Core list with optional keyword filter over title/content/tags. */
async function listSnippets(query) {
  const snippets = await readSnippets();
  const q = String(query ?? "").trim().toLowerCase();
  const hits = q === ""
    ? snippets
    : snippets.filter((s) => (s.title + "\n" + s.content + "\n" + s.tags.join(" ")).toLowerCase().includes(q));
  return hits.slice(0, MAX_LIST).map(view);
}

/** Core delete by exact title. */
async function deleteSnippet(title) {
  const cleanTitle = String(title ?? "").trim();
  return serialized(async () => {
    const snippets = await readSnippets();
    const next = snippets.filter((s) => s.title !== cleanTitle);
    if (next.length === snippets.length) return { removed: false, title: cleanTitle };
    await writeSnippets(next);
    return { removed: true, title: cleanTitle };
  });
}

// ── model-facing tools ───────────────────────────────────────────────────────
const snippetSave = defineTool({
  name: "snippet_save",
  description:
    "Save a reusable snippet (prompt text, code template, command, boilerplate) into the shared snippet library by its TITLE. " +
    "Saving an existing title overwrites it. The user can insert snippets from the UI picker (Ctrl+/), so keep titles short and descriptive. " +
    "Use snippet_get to read one back; snippet_list to browse.",
  parameters: {
    title: { type: "string", required: true, description: "Short unique title shown in the picker." },
    content: { type: "string", required: true, description: "The snippet body (up to 20000 characters)." },
    tags: { type: "array", description: "Optional grouping tags.", items: { type: "string" } }
  },
  output: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: { id: { type: "string", required: true }, title: { type: "string", required: true }, updatedAt: { type: "string", required: true } }
    },
    render: (_args, value) => [{ type: "text", text: `已保存代码/提示片段「${value.title}」。` }]
  },
  async execute(args) {
    const saved = await saveSnippet(args);
    return { id: saved.id, title: saved.title, updatedAt: saved.updatedAt };
  },
  presentCall: (args) => ({ card: "generic", title: "保存片段", kind: "other", rawInput: String(args.title ?? "") })
});

const snippetList = defineTool({
  name: "snippet_list",
  description: "List snippets from the shared library, optionally filtered by a keyword over title/content/tags. Returns titles and previews.",
  parameters: { query: { type: "string", description: "Optional keyword filter." } },
  output: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        count: { type: "integer", required: true },
        snippets: {
          type: "array", required: true,
          items: {
            type: "object", additionalProperties: false,
            properties: {
              title: { type: "string", required: true },
              preview: { type: "string", required: true },
              tags: { type: "array", required: true, items: { type: "string" } },
              updatedAt: { type: "string", required: true }
            }
          }
        }
      }
    },
    render: (_args, value) => {
      if (value.count === 0) return [{ type: "text", text: "片段库为空。" }];
      return [{ type: "text", text: value.snippets.map((s) => `- ${s.title}${s.tags.length > 0 ? ` (${s.tags.join(", ")})` : ""}`).join("\n") }];
    }
  },
  async execute(args) {
    const snippets = await listSnippets(args?.query);
    return {
      count: snippets.length,
      snippets: snippets.map((s) => ({ title: s.title, preview: s.content.slice(0, 120), tags: s.tags, updatedAt: s.updatedAt }))
    };
  },
  presentCall: (args) => ({ card: "generic", title: "片段列表", kind: "other", rawInput: String(args?.query ?? "") })
});

const snippetGet = defineTool({
  name: "snippet_get",
  description: "Read one snippet's full content by its exact title. Returns found: false when it does not exist.",
  parameters: { title: { type: "string", required: true, description: "The exact snippet title." } },
  output: {
    schema: {
      type: "object", additionalProperties: false,
      properties: {
        found: { type: "boolean", required: true },
        title: { type: "string" },
        content: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        updatedAt: { type: "string" }
      }
    },
    render: (_args, value) => [
      { type: "text", text: value.found ? `${value.title}:\n${value.content}` : `没有名为「${_args.title}」的片段。` }
    ]
  },
  async execute(args) {
    const snippets = await readSnippets();
    const record = snippets.find((s) => s.title === String(args.title ?? "").trim());
    if (record === undefined) return { found: false };
    return { found: true, ...view(record) };
  },
  presentCall: (args) => ({ card: "generic", title: "读取片段", kind: "other", rawInput: String(args.title ?? "") })
});

const snippetDelete = defineTool({
  name: "snippet_delete",
  description: "Delete a snippet by its exact title from the shared library.",
  parameters: { title: { type: "string", required: true, description: "The exact snippet title to delete." } },
  output: {
    schema: { type: "object", additionalProperties: false, properties: { removed: { type: "boolean", required: true }, title: { type: "string", required: true } } },
    render: (_args, value) => [{ type: "text", text: value.removed ? `已删除片段「${value.title}」。` : `没有名为「${value.title}」的片段。` }]
  },
  async execute(args) {
    return deleteSnippet(args.title);
  },
  presentCall: (args) => ({ card: "generic", title: "删除片段", kind: "other", rawInput: String(args.title ?? "") })
});

// ── HTTP surface (UI picker) ─────────────────────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function json(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(payload));
}

function registerHttp(ctx) {
  const disposers = [];
  const sync = () => {
    for (const dispose of disposers) dispose();
    disposers.length = 0;
    const webServer = ctx.get("webServer", false);
    if (webServer === undefined) return;
    disposers.push(ctx.effect(() => webServer.register({
      kind: "exact",
      path: SNIPPETS_HTTP_PATH,
      handler: async (req, res) => {
        try {
          if (req.method === "GET") {
            const url = new URL(req.url ?? SNIPPETS_HTTP_PATH, "http://local");
            const snippets = await listSnippets(url.searchParams.get("q") ?? undefined);
            json(res, 200, { snippets });
            return;
          }
          if (req.method === "POST") {
            let body;
            try {
              body = JSON.parse(await readBody(req) || "{}");
            } catch {
              json(res, 400, { error: "invalid JSON body" });
              return;
            }
            if (body?.action === "save" && typeof body.title === "string" && typeof body.content === "string") {
              const snippet = await saveSnippet({ title: body.title, content: body.content, tags: body.tags });
              json(res, 200, { ok: true, snippet });
              return;
            }
            if (body?.action === "delete" && typeof body.title === "string") {
              json(res, 200, { ok: true, ...(await deleteSnippet(body.title)) });
              return;
            }
            json(res, 400, { error: "expected {action:'save'|'delete', ...}" });
            return;
          }
          json(res, 405, { error: "method not allowed" });
        } catch (error) {
          json(res, 500, { error: error instanceof Error ? error.message : String(error) });
        }
      }
    }), `tool-snippets: ${SNIPPETS_HTTP_PATH} route`));
  };
  ctx.on("internal/service", () => sync());
  sync();
}

/**
 * Register the snippet tools and the /api/snippets route.
 * @param ctx - registrant context carrying the tool registry.
 */
function apply(ctx) {
  registerHttp(ctx);
  ctx.tools.register(snippetSave);
  ctx.tools.register(snippetList);
  ctx.tools.register(snippetGet);
  ctx.tools.register(snippetDelete);
}

export { apply, inject, name };

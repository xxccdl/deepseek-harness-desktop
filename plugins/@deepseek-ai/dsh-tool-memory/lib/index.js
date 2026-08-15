// DeepSeek Harness long-term memory plugin.
//
// A default-style dsh tool plugin (`{ name, inject, apply }`), exactly like the
// other `dsh-tool-*` packages: it registers model-facing tools on `ctx.tools`
// and a runtime skill on `ctx.skills`. Memories persist under `$DSH_HOME/memory/`
// and survive sessions and restarts, in three forms:
//
//   - text (`memory.jsonl`)  — free-form facts, preferences, decisions.
//   - kv   (`kv.json`)       — structured key-value pairs (dotted keys form a graph/prefix tree).
//   - map  (`map.json`)      — a hierarchical mind-map tree of labelled nodes.
//
// @module @deepseek-ai/dsh-tool-memory
import { readFileSync } from "node:fs";
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { dirname, join } from "node:path";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { dshHomePath } from "@deepseek-ai/dsh-home-paths";
import z from "@deepseek-ai/schemastery";
import { settingsNamespace } from "@deepseek-ai/dsh-settings";

/** Cordis plugin name. */
const name = "tool-memory";
/** Required services: the tool registry, skill registry, and system prompt. */
const inject = ["tools", "skills", "systemPrompt"];

/** Default cap on how many records a listing/search returns. */
const DEFAULT_MAX_RESULTS = 50;
/** Live result cap, overridable through the `memory` settings namespace. */
let runtimeMax = DEFAULT_MAX_RESULTS;

/** Memory store directory under the harness home. */
const MEMORY_DIR = () => dshHomePath("memory");
const TEXT_STORE = () => join(MEMORY_DIR(), "memory.jsonl");
const KV_STORE = () => join(MEMORY_DIR(), "kv.json");
const MAP_STORE = () => join(MEMORY_DIR(), "map.json");

// ── store plumbing ────────────────────────────────────────────────────────────
// All mutations run through one promise chain so concurrent tool calls (and the
// model's parallel dispatch) never interleave reads/writes.
let writeQueue = Promise.resolve();
function serialized(task) {
  const next = writeQueue.then(task, task);
  writeQueue = next.catch(() => {});
  return next;
}

async function atomicWriteJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const tmp = `${path}.tmp`;
  await writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await rename(tmp, path);
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

/** Short stable id from a content hash + a salt. */
function shortId(content, salt) {
  let hash = 0;
  for (let i = 0; i < content.length; i += 1) {
    hash = ((hash << 5) - hash + content.charCodeAt(i)) | 0;
  }
  const tail = (Date.now() + (salt ?? 0)).toString(36);
  return `m${(hash >>> 0).toString(36)}-${tail}`;
}

function containsToken(haystack, needle) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

/** Normalize a tag list: trim, drop empties, de-duplicate, lowercase. */
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

function throwIfAborted(exec) {
  exec.signal?.throwIfAborted?.();
}

// ── text memory ───────────────────────────────────────────────────────────────
async function readTextRecords() {
  let raw;
  try {
    raw = await readFile(TEXT_STORE(), "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
  const records = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "") continue;
    try {
      records.push(JSON.parse(trimmed));
    } catch {
      // Skip a corrupted line rather than losing the whole store.
    }
  }
  return records;
}

async function writeTextRecords(records) {
  await mkdir(dirname(TEXT_STORE()), { recursive: true });
  const body = records.map((record) => JSON.stringify(record)).join("\n") + "\n";
  const tmp = `${TEXT_STORE()}.tmp`;
  await writeFile(tmp, body, "utf8");
  await rename(tmp, TEXT_STORE());
}

function textRecordView(record) {
  return {
    id: String(record.id),
    content: typeof record.content === "string" ? record.content : JSON.stringify(record.content ?? ""),
    tags: (record.tags ?? []).map(String),
    updatedAt: String(record.updatedAt ?? record.createdAt ?? "")
  };
}

const memoryRemember = defineTool({
  name: "memory_remember",
  description:
    "Save one fact, preference, decision, or convention as free-form TEXT memory so it is available in future sessions. " +
    "Use it for durable, prose-style information about the user or the project that should not be re-discovered every session " +
    "(naming preferences, an architectural decision, a standing rule, an environment quirk). " +
    "Write a self-contained, concrete sentence. Repeating the same content updates nothing (de-duplicated). " +
    "For structured key-value facts use memory_kv_set; for a hierarchy use memory_map_add.",
  parameters: {
    content: {
      type: "string",
      required: true,
      description: "The fact to remember, as one self-contained sentence."
    },
    tags: {
      type: "array",
      description: "Optional tags to group and later filter this memory (e.g. ['user', 'project-x']).",
      items: { type: "string" }
    }
  },
  output: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: { type: "string", required: true },
        content: { type: "string", required: true },
        tags: { type: "array", required: true, items: { type: "string" } },
        createdAt: { type: "string", required: true }
      }
    },
    render: (_args, value) => [
      { type: "text", text: `Saved to long-term memory: ${value.content} (id: ${value.id})` }
    ]
  },
  async execute(args, exec) {
    throwIfAborted(exec);
    const content = args.content.trim();
    if (content.length === 0) throw new Error("memory_remember: `content` must be a non-empty string");
    const tags = normalizeTags(args.tags);
    return serialized(async () => {
      const records = await readTextRecords();
      const existing = records.find((record) => record.content === content);
      if (existing) {
        existing.updatedAt = new Date().toISOString();
        existing.tags = tags;
        await writeTextRecords(records);
        return {
          id: existing.id,
          content: existing.content,
          tags: existing.tags,
          createdAt: existing.createdAt
        };
      }
      const now = new Date().toISOString();
      const record = { id: shortId(content, records.length), content, tags, createdAt: now, updatedAt: now };
      records.push(record);
      await writeTextRecords(records);
      return { id: record.id, content: record.content, tags: record.tags, createdAt: record.createdAt };
    });
  },
  presentCall: (args) => ({ card: "generic", title: "记住", kind: "other", rawInput: args.content })
});

const memoryRecall = defineTool({
  name: "memory_recall",
  description:
    "Search TEXT memory for facts matching a query and return the matching records. " +
    "Call this when the user refers to something that may have been recorded in an earlier session, or before assuming you lack context. " +
    "Matching is a case-insensitive keyword search over memory content and tags; it is not a web search. " +
    "For structured key-value lookups use memory_kv_get / memory_kv_list; for the mind map use memory_map_get.",
  parameters: {
    query: {
      type: "string",
      required: true,
      description: "Keywords to search for in memory content and tags."
    }
  },
  output: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        query: { type: "string", required: true },
        count: { type: "integer", required: true },
        results: {
          type: "array",
          required: true,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              id: { type: "string", required: true },
              content: { type: "string", required: true },
              tags: { type: "array", required: true, items: { type: "string" } },
              updatedAt: { type: "string", required: true }
            }
          }
        }
      }
    },
    render: (_args, value) => {
      if (value.count === 0) return [{ type: "text", text: `No memories match "${value.query}".` }];
      const lines = value.results.map(
        (record) => `- [${record.id}] ${record.content}${record.tags.length > 0 ? ` (tags: ${record.tags.join(", ")})` : ""}`
      );
      return [{ type: "text", text: [`${value.count} matching memor${value.count === 1 ? "y" : "ies"}:`, ...lines].join("\n") }];
    }
  },
  async execute(args, exec) {
    throwIfAborted(exec);
    const query = args.query.trim();
    if (query.length === 0) throw new Error("memory_recall: `query` must be a non-empty string");
    const records = await readTextRecords();
    const tokens = query.split(/\s+/).filter(Boolean);
    const scored = [];
    for (const record of records) {
      const content = String(record.content ?? "");
      const tags = (record.tags ?? []).join(" ");
      let score = 0;
      for (const token of tokens) {
        if (containsToken(content, token)) score += 2;
        if (containsToken(tags, token)) score += 1;
      }
      if (score > 0) scored.push({ record, score });
    }
    scored.sort((a, b) => b.score - a.score);
    const results = scored.slice(0, runtimeMax).map(({ record }) => textRecordView(record));
    return { query, count: results.length, results };
  },
  presentCall: (args) => ({ card: "generic", title: "搜索记忆", kind: "other", rawInput: args.query })
});

const memoryList = defineTool({
  name: "memory_list",
  description:
    "List TEXT memories, newest first. Optionally filter to records carrying any of the given tags. " +
    "Use it to survey stored facts, or to find a memory's id before forgetting it. " +
    "For the KV map use memory_kv_list; for the mind map use memory_map_get.",
  parameters: {
    tags: {
      type: "array",
      description: "Return only records tagged with any of these tags.",
      items: { type: "string" }
    }
  },
  output: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        count: { type: "integer", required: true },
        records: {
          type: "array",
          required: true,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              id: { type: "string", required: true },
              content: { type: "string", required: true },
              tags: { type: "array", required: true, items: { type: "string" } },
              updatedAt: { type: "string", required: true }
            }
          }
        }
      }
    },
    render: (_args, value) => {
      if (value.count === 0) return [{ type: "text", text: "No memories stored yet." }];
      const lines = value.records.map(
        (record) => `- [${record.id}] ${record.content}${record.tags.length > 0 ? ` (tags: ${record.tags.join(", ")})` : ""}`
      );
      return [{ type: "text", text: [`${value.count} memor${value.count === 1 ? "y" : "ies"}:`, ...lines].join("\n") }];
    }
  },
  async execute(args, exec) {
    throwIfAborted(exec);
    const filter = normalizeTags(args.tags);
    const records = await readTextRecords();
    const filtered = filter.length === 0
      ? records
      : records.filter((record) => (record.tags ?? []).some((tag) => filter.includes(String(tag).toLowerCase())));
    filtered.reverse();
    const out = filtered.slice(0, runtimeMax).map(textRecordView);
    return { count: out.length, records: out };
  },
  presentCall: (args) => ({ card: "generic", title: "列出记忆", kind: "other", rawInput: args.tags ?? [] })
});

const memoryForget = defineTool({
  name: "memory_forget",
  description:
    "Delete one TEXT memory record by id. Use the id returned by memory_remember, memory_recall, or memory_list. " +
    "For KV entries use memory_kv_delete; for mind-map nodes use memory_map_remove.",
  parameters: {
    id: {
      type: "string",
      required: true,
      description: "The id of the text memory to delete."
    }
  },
  output: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        removed: { type: "boolean", required: true },
        id: { type: "string", required: true }
      }
    },
    render: (_args, value) => [
      { type: "text", text: value.removed ? `Forgot memory ${value.id}.` : `No memory with id ${value.id}.` }
    ]
  },
  async execute(args, exec) {
    throwIfAborted(exec);
    const id = String(args.id).trim();
    if (id.length === 0) throw new Error("memory_forget: `id` must be a non-empty string");
    return serialized(async () => {
      const records = await readTextRecords();
      const next = records.filter((record) => String(record.id) !== id);
      if (next.length === records.length) return { removed: false, id };
      await writeTextRecords(next);
      return { removed: true, id };
    });
  },
  presentCall: (args) => ({ card: "generic", title: "删除记忆", kind: "other", rawInput: args.id })
});

// ── KV graph memory ───────────────────────────────────────────────────────────
// Dotted keys (`user.name`, `project.framework`) form a prefix tree / graph:
// listing under a prefix returns every entry in that subtree.
const KV_KEY_RE = /^[^\s.]+(?:\.[^\s.]+)*$/;

function kvEntryView(entry) {
  return { key: entry.key, value: entry.value, updatedAt: entry.updatedAt };
}

function kvEntriesUnder(entries, prefix) {
  return entries
    .filter((entry) => prefix === "" || entry.key === prefix || entry.key.startsWith(`${prefix}.`))
    .sort((a, b) => a.key.localeCompare(b.key));
}

async function readKvEntries() {
  const data = await readJson(KV_STORE(), {});
  return Object.entries(data).map(([key, stored]) => ({
    key,
    value: stored.value,
    updatedAt: stored.updatedAt ?? ""
  }));
}

async function writeKvEntries(entries) {
  const data = {};
  for (const entry of entries) data[entry.key] = { value: entry.value, updatedAt: entry.updatedAt };
  await atomicWriteJson(KV_STORE(), data);
}

function validKvKey(key) {
  return typeof key === "string" && key.trim() !== "" && KV_KEY_RE.test(key.trim()) && !key.includes("..");
}

const memoryKvSet = defineTool({
  name: "memory_kv_set",
  description:
    "Store one structured KEY-VALUE entry in KV graph memory (e.g. `user.email`, `project.framework`, `deploy.url`). " +
    "Dotted keys create a navigable hierarchy: setting `user.name` and `user.email` groups them under `user`. " +
    "Use this for exact, structured facts that are better as a lookup than prose. Setting an existing key overwrites it. " +
    "For prose facts use memory_remember; for hierarchies with sub-items use memory_map_add.",
  parameters: {
    key: {
      type: "string",
      required: true,
      description: "The dotted key path (segments joined by '.'), e.g. 'user.email'."
    },
    value: {
      type: "json",
      description: "The value to store: a string, number, boolean, or small JSON object.",
      required: true
    }
  },
  output: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        key: { type: "string", required: true },
        updatedAt: { type: "string", required: true }
      }
    },
    render: (_args, value) => [{ type: "text", text: `Set ${value.key} in KV memory.` }]
  },
  async execute(args, exec) {
    throwIfAborted(exec);
    const key = args.key.trim();
    if (!validKvKey(key)) throw new Error(`memory_kv_set: invalid key "${key}" (use dotted segments like 'a.b.c')`);
    return serialized(async () => {
      const entries = await readKvEntries();
      let entry = entries.find((e) => e.key === key);
      if (entry === undefined) {
        entry = { key, value: undefined, updatedAt: "" };
        entries.push(entry);
      }
      entry.value = args.value;
      entry.updatedAt = new Date().toISOString();
      await writeKvEntries(entries);
      return { key, updatedAt: entry.updatedAt };
    });
  },
  presentCall: (args) => ({ card: "generic", title: "KV 记忆", kind: "other", rawInput: `${args.key} = ${JSON.stringify(args.value)}` })
});

const memoryKvGet = defineTool({
  name: "memory_kv_get",
  description:
    "Read the value of one exact KEY in KV graph memory (e.g. 'user.email'). Returns `found: false` when the exact key does not exist. " +
    "Use memory_kv_list to browse a whole prefix instead.",
  parameters: {
    key: {
      type: "string",
      required: true,
      description: "The exact dotted key to read."
    }
  },
  output: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        key: { type: "string", required: true },
        found: { type: "boolean", required: true },
        value: { type: "json" },
        updatedAt: { type: "string" }
      }
    },
    render: (_args, value) => [
      { type: "text", text: value.found ? `${value.key} = ${JSON.stringify(value.value)}` : `No KV entry for ${value.key}.` }
    ]
  },
  async execute(args, exec) {
    throwIfAborted(exec);
    const key = args.key.trim();
    if (!validKvKey(key)) throw new Error(`memory_kv_get: invalid key "${key}"`);
    const entries = await readKvEntries();
    const entry = entries.find((e) => e.key === key);
    if (entry === undefined) return { key, found: false, value: undefined };
    return { key, found: true, value: entry.value, updatedAt: entry.updatedAt };
  },
  presentCall: (args) => ({ card: "generic", title: "KV 记忆", kind: "other", rawInput: args.key })
});

const memoryKvList = defineTool({
  name: "memory_kv_list",
  description:
    "List KV graph memory entries, optionally scoped to a prefix. With no prefix it returns every entry; " +
    "with `user` it returns `user` and everything under `user.*`. Use it to survey what structured facts are stored.",
  parameters: {
    prefix: {
      type: "string",
      description: "Optional dotted prefix to scope the listing to one subtree."
    }
  },
  output: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        count: { type: "integer", required: true },
        entries: {
          type: "array",
          required: true,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              key: { type: "string", required: true },
              value: { type: "json" },
              updatedAt: { type: "string", required: true }
            }
          }
        }
      }
    },
    render: (_args, value) => {
      if (value.count === 0) return [{ type: "text", text: "No KV entries." }];
      const lines = value.entries.map((e) => `- ${e.key} = ${JSON.stringify(e.value)}`);
      return [{ type: "text", text: [`${value.count} KV entr${value.count === 1 ? "y" : "ies"}:`, ...lines].join("\n") }];
    }
  },
  async execute(args, exec) {
    throwIfAborted(exec);
    const prefix = (args.prefix ?? "").trim();
    if (prefix !== "" && !validKvKey(prefix)) throw new Error(`memory_kv_list: invalid prefix "${prefix}"`);
    const entries = await readKvEntries();
    const out = kvEntriesUnder(entries, prefix).slice(0, runtimeMax).map(kvEntryView);
    return { count: out.length, entries: out };
  },
  presentCall: (args) => ({ card: "generic", title: "KV 记忆", kind: "other", rawInput: args.prefix ?? "" })
});

const memoryKvDelete = defineTool({
  name: "memory_kv_delete",
  description:
    "Delete KV graph memory entries. Deletes the exact key AND everything under its prefix (e.g. deleting `user` removes `user.*`). " +
    "Returns how many entries were removed.",
  parameters: {
    key: {
      type: "string",
      required: true,
      description: "The dotted key (or prefix) to delete."
    }
  },
  output: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        removed: { type: "integer", required: true },
        key: { type: "string", required: true }
      }
    },
    render: (_args, value) => [
      { type: "text", text: value.removed > 0 ? `Deleted ${value.removed} KV entr${value.removed === 1 ? "y" : "ies"} under ${value.key}.` : `No KV entries under ${value.key}.` }
    ]
  },
  async execute(args, exec) {
    throwIfAborted(exec);
    const key = args.key.trim();
    if (!validKvKey(key)) throw new Error(`memory_kv_delete: invalid key "${key}"`);
    return serialized(async () => {
      const entries = await readKvEntries();
      const next = entries.filter((e) => e.key !== key && !e.key.startsWith(`${key}.`));
      if (next.length === entries.length) return { removed: 0, key };
      await writeKvEntries(next);
      return { removed: entries.length - next.length, key };
    });
  },
  presentCall: (args) => ({ card: "generic", title: "KV 记忆", kind: "other", rawInput: args.key })
});

// ── mind-map memory ───────────────────────────────────────────────────────────
// A tree of labelled nodes. The root is a hidden container; the model addresses
// nodes by their label path from the root ([] = root). Removing a node removes
// its whole subtree.
const MAP_ROOT_ID = "root";

function emptyMapRoot() {
  return { id: MAP_ROOT_ID, label: "", value: undefined, children: [] };
}

async function readMapRoot() {
  return readJson(MAP_STORE(), emptyMapRoot());
}

/** Resolve a label path (from root) to its node. Throws with a helpful message when absent or ambiguous. */
function resolveMapPath(root, path) {
  let node = root;
  for (const label of path) {
    const matches = node.children.filter((child) => child.label === label);
    if (matches.length === 0) throw new Error(`mind-map path not found at "${label}" (path: ${JSON.stringify(path)})`);
    if (matches.length > 1) throw new Error(`mind-map has ${matches.length} siblings labelled "${label}"; remove by a unique label`);
    node = matches[0];
  }
  return node;
}

function mapNodeView(node, depth = 0) {
  return {
    id: node.id,
    label: node.label,
    ...(node.value !== undefined ? { value: node.value } : {}),
    children: node.children.map((child) => mapNodeView(child, depth + 1))
  };
}

const memoryMapAdd = defineTool({
  name: "memory_map_add",
  description:
    "Add a node to the MIND-MAP memory (a hierarchical tree). `parent` is the label path of the parent node from the root " +
    "(omit or `[]` to add at the root level). Example: to build 'project > frontend > components', call " +
    "memory_map_add('project'), then memory_map_add('frontend', ['project']), then memory_map_add('components', ['project','frontend']). " +
    "Use it for structures with levels: project architecture, feature breakdown, plans, topic outlines. " +
    "For flat facts use memory_remember; for exact key-value lookups use memory_kv_set.",
  parameters: {
    label: {
      type: "string",
      required: true,
      description: "The label of the new node."
    },
    value: {
      type: "json",
      description: "Optional note/value attached to the node (string, number, boolean, or small object)."
    },
    parent: {
      type: "array",
      description: "Label path of the parent node from the root; omit to add at the root level.",
      items: { type: "string" }
    }
  },
  output: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: { type: "string", required: true },
        label: { type: "string", required: true },
        path: { type: "array", required: true, items: { type: "string" } }
      }
    },
    render: (_args, value) => [
      { type: "text", text: `Added mind-map node "${value.label}" under ${value.path.length > 0 ? JSON.stringify(value.path) : "root"} (id: ${value.id}).` }
    ]
  },
  async execute(args, exec) {
    throwIfAborted(exec);
    const label = args.label.trim();
    if (label.length === 0) throw new Error("memory_map_add: `label` must be a non-empty string");
    const path = (args.parent ?? []).map((segment) => String(segment).trim());
    return serialized(async () => {
      const root = await readMapRoot();
      const parent = resolveMapPath(root, path);
      if (parent.children.some((child) => child.label === label)) {
        throw new Error(`mind-map already has a child "${label}" under ${path.length > 0 ? JSON.stringify(path) : "root"}`);
      }
      const node = {
        id: shortId(label, parent.children.length),
        label,
        ...(args.value !== undefined ? { value: args.value } : {}),
        children: []
      };
      parent.children.push(node);
      await atomicWriteJson(MAP_STORE(), root);
      return { id: node.id, label: node.label, path: [...path] };
    });
  },
  presentCall: (args) => ({ card: "generic", title: "思维导图", kind: "other", rawInput: `${args.label} under ${JSON.stringify(args.parent ?? [])}` })
});

const memoryMapGet = defineTool({
  name: "memory_map_get",
  description:
    "Read the MIND-MAP memory. With no `path` it returns the whole tree (every node with its children). " +
    "With a label path it returns that node's subtree. Use it to view an outline you built with memory_map_add.",
  parameters: {
    path: {
      type: "array",
      description: "Label path of the node whose subtree to return; omit to return the whole mind map.",
      items: { type: "string" }
    }
  },
  output: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        nodes: { type: "integer", required: true },
        tree: { type: "object", additionalProperties: true, required: true }
      }
    },
    render: (_args, value) => {
      const render = (node, indent) => {
        const lines = [`${indent}- ${node.label}${node.value !== undefined ? `: ${JSON.stringify(node.value)}` : ""}`];
        for (const child of node.children) lines.push(...render(child, `${indent}  `));
        return lines;
      };
      const tree = value.tree;
      const lines = tree.children.length > 0
        ? render(tree, "").map((line) => line.replace(/^- /, ""))
        : ["(empty mind map)"];
      return [{ type: "text", text: lines.join("\n") }];
    }
  },
  async execute(args, exec) {
    throwIfAborted(exec);
    const path = (args.path ?? []).map((segment) => String(segment).trim());
    const root = await readMapRoot();
    const node = resolveMapPath(root, path);
    const tree = mapNodeView(node);
    let count = 0;
    const walk = (n) => { count += 1; for (const c of n.children) walk(c); };
    // The root is a hidden container; a whole-map view counts its children, a
    // subtree view counts the requested node and everything under it.
    if (path.length === 0) for (const child of node.children) walk(child);
    else walk(tree);
    return { nodes: count, tree };
  },
  presentCall: (args) => ({ card: "generic", title: "思维导图", kind: "other", rawInput: JSON.stringify(args.path ?? []) })
});

const memoryMapRemove = defineTool({
  name: "memory_map_remove",
  description:
    "Remove a node from the MIND-MAP memory by its label path from the root (including the node itself). " +
    "Its entire subtree is removed too. Returns how many nodes were removed.",
  parameters: {
    path: {
      type: "array",
      required: true,
      description: "Label path of the node to remove, e.g. ['project','frontend'] removes 'frontend' and its children.",
      items: { type: "string" }
    }
  },
  output: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        removed: { type: "integer", required: true },
        path: { type: "array", required: true, items: { type: "string" } }
      }
    },
    render: (_args, value) => [
      { type: "text", text: value.removed > 0 ? `Removed ${value.removed} mind-map node(s) at ${JSON.stringify(value.path)}.` : `No mind-map node at ${JSON.stringify(value.path)}.` }
    ]
  },
  async execute(args, exec) {
    throwIfAborted(exec);
    const path = (args.path ?? []).map((segment) => String(segment).trim());
    if (path.length === 0) throw new Error("memory_map_remove: `path` must name at least one node (cannot remove the root)");
    return serialized(async () => {
      const root = await readMapRoot();
      const parentPath = path.slice(0, -1);
      const parent = resolveMapPath(root, parentPath);
      const label = path[path.length - 1];
      const index = parent.children.findIndex((child) => child.label === label);
      if (index === -1) return { removed: 0, path };
      const [removed] = parent.children.splice(index, 1);
      let count = 0;
      const walk = (n) => { count += 1; for (const c of n.children) walk(c); };
      walk(removed);
      await atomicWriteJson(MAP_STORE(), root);
      return { removed: count, path };
    });
  },
  presentCall: (args) => ({ card: "generic", title: "思维导图", kind: "other", rawInput: JSON.stringify(args.path ?? []) })
});

// ── skill ─────────────────────────────────────────────────────────────────────
const memorySkill = {
  name: "memory",
  description: "Persistent long-term memory across sessions in three forms: text facts, KV key-value facts, and a mind-map outline.",
  whenToUse: "Use when the user references something from an earlier session, when a preference or decision may already be recorded, or when you learn a durable fact worth keeping.",
  source: "custom",
  content: [
    "# Memory",
    "",
    "REMINDER: You MUST actively use the memory tools below in every session. Long-term memory is how you stay consistent with the user across conversations — do not behave as if every session starts from zero.",
    "",
    "DeepSeek Harness keeps persistent long-term memory across sessions, in three forms:",
    "",
    "1. **Text memory** (memory_remember / memory_recall / memory_list / memory_forget) — free-form prose facts: preferences, decisions, conventions, environment quirks.",
    "2. **KV graph memory** (memory_kv_set / memory_kv_get / memory_kv_list / memory_kv_delete) — exact structured key-value facts; dotted keys (`user.email`, `project.framework`) form a navigable hierarchy.",
    "3. **Mind-map memory** (memory_map_add / memory_map_get / memory_map_remove) — a hierarchical outline: project architecture, feature breakdown, plans, topic trees.",
    "",
    "## Always do this",
    "- BEFORE starting a task or answering, if the user references prior context, check memory first: memory_recall for prose, memory_kv_get / memory_kv_list for exact facts, memory_map_get for outlines.",
    "- DURING task execution, keep checking memory at each stage: before a meaningful step, when switching subtasks, or whenever you need project background, a roadmap, conventions, or environment facts. Look up the mind map with memory_map_get and search text memory with memory_recall — never guess when a fact may already be stored.",
    "- WHEN you learn a durable fact (a preference, a decision, a convention, an environment quirk), save it immediately — do not wait to be asked.",
    "",
    "## When to remember",
    "- The user states a preference, a standing rule, or a naming/styling convention -> TEXT.",
    "- An exact, lookup-style fact (a value, path, version, mapping) -> KV.",
    "- A structure with levels (architecture, plan, outline) -> MIND-MAP.",
    "- Attach tags to text memories (`user`, `project`, topic names) and use dotted prefixes for KV (`user.*`) for later filtering.",
    "",
    "## When to recall",
    "- The user references something that could have been recorded earlier (\"as I said before\", \"my usual setup\", project history).",
    "- A project or user preference might already be known; check memory before asking or guessing.",
    "- At the start of a task that depends on previously established context: query text with memory_recall, exact facts with memory_kv_get, outlines with memory_map_get.",
    "- DURING execution: at every meaningful step, after completing a phase, or when the environment, screen, or project layout feels unfamiliar — consult the mind map (memory_map_get) and the memories (memory_recall) to stay on track; key milestones require a map lookup before acting.",
    "",
    "## Guidance",
    "- Do not store transient state (current task steps, todo lists, chat content) — memory is for durable facts.",
    "- Keep memories concise and factual; avoid opinions unless the user asked you to remember them.",
    "- If a recalled memory is stale or wrong, correct it: delete the old entry and store the corrected fact."
  ].join("\n")
};

// ── persistent system-prompt reminder ─────────────────────────────────────────
// A short always-on prompt section so the model is reminded to use the memory
// tools in every request, without needing to load the `memory` skill first.
/**
 * Synchronously read the distinct tags currently stored in TEXT memory, so the
 * assembled prompt can tell the model which tags exist for recall/list
 * filtering. Read at assemble time (every request) so newly saved tags show up
 * immediately; the store is tiny and already resident on disk.
 * @returns a comma-separated tag list, or "" when none.
 */
function currentMemoryTags() {
  let raw;
  try {
    raw = readFileSync(TEXT_STORE(), "utf8");
  } catch {
    return "";
  }
  const seen = new Set();
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "") continue;
    try {
      const record = JSON.parse(trimmed);
      for (const tag of record.tags ?? []) if (tag) seen.add(String(tag));
    } catch {
      // skip a corrupted line
    }
  }
  return [...seen].sort().join(", ");
}

const MEMORY_PROMPT_SECTION = {
  name: "memory:usage",
  order: -90,
  text: [
    "【长期记忆】本环境提供跨会话持久记忆工具，请主动使用，任务执行过程中也要随时查看：",
    "- 任务开始或被问及历史背景时，先检索：memory_recall（文字）、memory_kv_get / memory_kv_list（KV）、memory_map_get（思维导图）。",
    "- 任务执行过程中，每个阶段/每完成一步/切换子任务/需要项目背景、路线、约定或环境信息时，都要查看记忆而不是凭猜测：用 memory_map_get 查看思维导图/路线图，用 memory_recall 检索文字记忆（memories），用 memory_kv_get 查精确事实；关键节点务必先查看导图再动手。",
    "- 当前记忆中的标签有：{{memorytags}}。需要按标签检索或筛选时，在 memory_recall 或 memory_list 的 tags 参数里直接使用这些标签。",
    "- 学到持久的用户偏好、决定、约定或环境事实时，立即保存：memory_remember（文字）/ memory_kv_set（KV）/ memory_map_add（导图），不要留到下次会话。",
    "- 选型：散文事实→文字记忆；精确键值→KV 记忆；分层结构→思维导图记忆。"
  ].join("\n")
};

// ── HTTP snapshot (settings viewer) ──────────────────────────────────────────
// A read-only JSON snapshot of every memory store, plus a small write surface
// for the settings viewer's delete actions, served on the optional `webServer`
// service (absent in TUI-only compositions), re-registered reactively when that
// service appears.
const MEMORY_HTTP_PATH = "/api/memory";
const MEMORY_DELETE_PATH = "/api/memory/delete";
const MEMORY_EXPORT_PATH = "/api/memory/export";
const MEMORY_IMPORT_PATH = "/api/memory/import";

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function memorySnapshot() {
  const [records, entries, map] = await Promise.all([readTextRecords(), readKvEntries(), readMapRoot()]);
  return {
    text: records.map(textRecordView).reverse(),
    kv: entries.map(kvEntryView),
    map
  };
}

/**
 * Merge an exported memory payload into the current stores (the inverse of a
 * snapshot): text records de-duplicate by content, KV entries overwrite by key,
 * and mind-map nodes are appended under the root / their parent labels. Missing
 * sections are ignored so a partial export round-trips safely.
 * @param payload - the parsed export ({ text?, kv?, map? }).
 * @returns the merged snapshot.
 */
async function importMemory(payload) {
  const exec = { signal: new AbortController().signal };
  for (const record of payload?.text ?? []) {
    if (!record || typeof record.content !== "string" || record.content.trim() === "") continue;
    await memoryRemember.execute({ content: record.content, tags: Array.isArray(record.tags) ? record.tags : undefined }, exec);
  }
  for (const entry of payload?.kv ?? []) {
    if (!entry || typeof entry.key !== "string" || entry.key.trim() === "") continue;
    if (entry.value === undefined) continue;
    await memoryKvSet.execute({ key: entry.key, value: entry.value }, exec);
  }
  const addMap = async (children, parent) => {
    for (const child of children ?? []) {
      if (!child || typeof child.label !== "string" || child.label.trim() === "") continue;
      const args = { label: child.label, parent };
      if (child.value !== undefined) args.value = child.value;
      try {
        await memoryMapAdd.execute(args, exec);
      } catch (error) {
        // A duplicate sibling label is skipped; the rest of the subtree still imports.
        if (!error?.message?.includes("already has a child")) throw error;
      }
      await addMap(child.children, [...parent, child.label]);
    }
  };
  await addMap(payload?.map?.children ?? [], []);
  return memorySnapshot();
}

function registerMemoryHttp(ctx) {
  const disposers = [];
  const sync = () => {
    for (const dispose of disposers) dispose();
    disposers.length = 0;
    const webServer = ctx.get("webServer", false);
    if (webServer === undefined) return;
    disposers.push(ctx.effect(() => webServer.register({
      kind: "exact",
      path: MEMORY_HTTP_PATH,
      handler: async (_req, res) => {
        try {
          const snapshot = await memorySnapshot();
          res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
          });
          res.end(JSON.stringify(snapshot));
        } catch (error) {
          res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
        }
      }
    }), `tool-memory: ${MEMORY_HTTP_PATH} route`));
    disposers.push(ctx.effect(() => webServer.register({
      kind: "exact",
      path: MEMORY_DELETE_PATH,
      handler: async (req, res) => {
        try {
          let body;
          try {
            body = JSON.parse(await readBody(req) || "{}");
          } catch {
            res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ error: "invalid JSON body" }));
            return;
          }
          const exec = { signal: new AbortController().signal };
          if (body.kind === "text" && typeof body.id === "string") {
            await memoryForget.execute({ id: body.id }, exec);
          } else if (body.kind === "kv" && typeof body.key === "string") {
            await memoryKvDelete.execute({ key: body.key }, exec);
          } else if (body.kind === "map" && Array.isArray(body.path)) {
            await memoryMapRemove.execute({ path: body.path.map((segment) => String(segment)) }, exec);
          } else if (body.kind === "text-all") {
            await serialized(() => writeTextRecords([]));
          } else if (body.kind === "kv-all") {
            await serialized(() => writeKvEntries([]));
          } else if (body.kind === "map-all") {
            await serialized(() => atomicWriteJson(MAP_STORE(), emptyMapRoot()));
          } else {
            res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ error: "invalid delete request: expected {kind:'text'|'kv'|'map'|'text-all'|'kv-all'|'map-all', ...}" }));
            return;
          }
          res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
          });
          res.end(JSON.stringify({ ok: true, ...(await memorySnapshot()) }));
        } catch (error) {
          res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
        }
      }
    }), `tool-memory: ${MEMORY_DELETE_PATH} route`));
    disposers.push(ctx.effect(() => webServer.register({
      kind: "exact",
      path: MEMORY_EXPORT_PATH,
      handler: async (_req, res) => {
        try {
          const snapshot = await memorySnapshot();
          res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": `attachment; filename="dsh-memory-${new Date().toISOString().slice(0, 10)}.json"`,
            "Cache-Control": "no-store"
          });
          res.end(JSON.stringify(snapshot, null, 2));
        } catch (error) {
          res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
        }
      }
    }), `tool-memory: ${MEMORY_EXPORT_PATH} route`));
    disposers.push(ctx.effect(() => webServer.register({
      kind: "exact",
      path: MEMORY_IMPORT_PATH,
      handler: async (req, res) => {
        try {
          let body;
          try {
            body = JSON.parse(await readBody(req) || "{}");
          } catch {
            res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ error: "invalid JSON body" }));
            return;
          }
          const snapshot = await importMemory(body);
          res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
          });
          res.end(JSON.stringify({ ok: true, ...snapshot }));
        } catch (error) {
          res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
        }
      }
    }), `tool-memory: ${MEMORY_IMPORT_PATH} route`));
  };
  ctx.on("internal/service", () => sync());
  sync();
}

// ── plugin ────────────────────────────────────────────────────────────────────
/** Settings namespace owned by the memory plugin. */
const MEMORY_SETTINGS_NS = settingsNamespace("memory");
/** Durable memory settings; the harness Settings document (`settings.yaml`) edits it. */
const MemorySettingsSchema = z.object({
  /** Master switch: when false, no memory tools, skill, or reminder are mounted. */
  enabled: z.boolean().default(true),
  /** Mount the text-memory tools (memory_remember/recall/list/forget). */
  text: z.boolean().default(true),
  /** Mount the KV graph-memory tools (memory_kv_set/get/list/delete). */
  kv: z.boolean().default(true),
  /** Mount the mind-map-memory tools (memory_map_add/get/remove). */
  map: z.boolean().default(true),
  /** Mount the persistent `memory:usage` system-prompt reminder. */
  autoRemind: z.boolean().default(true),
  /** Cap on records returned by memory_recall / memory_list / memory_kv_list. */
  maxResults: z.natural().min(1).max(500).default(DEFAULT_MAX_RESULTS)
});

/**
 * Register the memory tools, skill, and persistent usage reminder on the
 * calling context (global layer, so every agent in the harness sees them).
 * Whether each surface is mounted is driven by the `memory` settings namespace,
 * which is re-applied live when the settings document changes.
 * @param ctx - registrant context carrying the tool, skill, prompt, and settings registries.
 */
function apply(ctx) {
  registerMemoryHttp(ctx);
  const disposers = [];
  const sync = (config) => {
    for (const dispose of disposers) dispose();
    disposers.length = 0;
    if (!config.enabled) return;
    if (config.text) disposers.push(
      ctx.tools.register(memoryRemember),
      ctx.tools.register(memoryRecall),
      ctx.tools.register(memoryList),
      ctx.tools.register(memoryForget)
    );
    if (config.kv) disposers.push(
      ctx.tools.register(memoryKvSet),
      ctx.tools.register(memoryKvGet),
      ctx.tools.register(memoryKvList),
      ctx.tools.register(memoryKvDelete)
    );
    if (config.map) disposers.push(
      ctx.tools.register(memoryMapAdd),
      ctx.tools.register(memoryMapGet),
      ctx.tools.register(memoryMapRemove)
    );
    disposers.push(ctx.skills.register(memorySkill));
    if (config.autoRemind) {
      disposers.push(ctx.systemPrompt.section(MEMORY_PROMPT_SECTION));
      disposers.push(ctx.systemPrompt.variable("memorytags", () => currentMemoryTags() || "（暂无标签）"));
    }
  };
  ctx.inject(["settings"], (settingsCtx) => {
    const scope = settingsCtx.settings.register(MEMORY_SETTINGS_NS, MemorySettingsSchema);
    scope.watch((next) => {
      runtimeMax = next.maxResults;
      sync(next);
    });
    runtimeMax = scope.get().maxResults;
    sync(scope.get());
  });
}

export { apply, inject, name };

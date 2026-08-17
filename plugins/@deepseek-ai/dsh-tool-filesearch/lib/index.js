// DeepSeek Harness filename-search plugin.
//
// One model-facing tool:
//
//   file_name_search(pattern, root?, limit?) — recursive FILENAME search
//   (case-insensitive substring over the base name) under a root directory
//   (default: the process working directory). node_modules/.git/dist and
//   similar noise directories are skipped. Use the fs glob tool when you need
//   full path matching; this tool answers "where is the file called X".
//
// @module @deepseek-ai/dsh-tool-filesearch
import { readdir } from "node:fs/promises";
import { join, basename } from "node:path";
import { defineTool } from "@deepseek-ai/dsh-tools";

/** Cordis plugin name. */
const name = "tool-filesearch";
/** Required services: the tool registry. */
const inject = ["tools"];

/** Directories never entered. */
const SKIP_DIRS = new Set(["node_modules", ".git", ".hg", ".svn", "dist", "build", "out", ".next", ".cache", "__pycache__", ".venv", "venv", "target", ".turbo", ".idea", ".vs"]);
/** Default result cap. */
const DEFAULT_LIMIT = 50;
/** Hard cap. */
const HARD_LIMIT = 200;
/** Safety cap on visited directories per search. */
const MAX_DIRS = 20000;

/** Recursive case-insensitive filename substring search. */
async function searchNames(root, needle, limit, signal) {
  const hits = [];
  let visited = 0;
  const walk = async (dir, depth) => {
    if (hits.length >= limit || visited >= MAX_DIRS || depth > 12) return;
    visited += 1;
    signal?.throwIfAborted?.();
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return; // unreadable dir — skip quietly
    }
    for (const entry of entries) {
      if (hits.length >= limit) return;
      if (entry.name.startsWith(".") && entry.isDirectory()) {
        if (entry.name !== "." && !entry.name.startsWith("..")) {
          // hidden directories other than config-ish ones are skipped wholesale
          if (SKIP_DIRS.has(entry.name) || ![".config", ".github", ".vscode"].includes(entry.name)) continue;
        }
      }
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        await walk(join(dir, entry.name), depth + 1);
      } else if (entry.name.toLowerCase().includes(needle)) {
        hits.push(join(dir, entry.name));
      }
    }
  };
  await walk(root, 0);
  return { hits, visited };
}

const fileNameSearch = defineTool({
  name: "file_name_search",
  description:
    "Fast recursive FILENAME search: finds files whose NAME contains a substring (case-insensitive), under a root directory " +
    "(default: the current working directory). Returns matching relative paths, skipping node_modules/.git/build noise. " +
    "Use it to locate 'where is the file called X' before opening or editing it. For full-path glob matching use the fs glob tool instead.",
  parameters: {
    pattern: {
      type: "string",
      required: true,
      description: "Substring to match against file names (case-insensitive), e.g. 'webpack', '.env', 'schema'."
    },
    root: {
      type: "string",
      description: "Directory to search under (default: the working directory)."
    },
    limit: {
      type: "number",
      description: "Max results (default 50, max 200)."
    }
  },
  output: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        pattern: { type: "string", required: true },
        root: { type: "string", required: true },
        count: { type: "integer", required: true },
        files: { type: "array", required: true, items: { type: "string" } }
      }
    },
    render: (args, value) => {
      if (value.count === 0) return [{ type: "text", text: `没有找到文件名包含 “${value.pattern}” 的文件。` }];
      return [{ type: "text", text: [`${value.count} 个匹配（前 ${Math.min(value.count, 20)} 个）:`, ...value.files.slice(0, 20).map((f) => "- " + f)].join("\n") }];
    }
  },
  async execute(args, exec) {
    const needle = String(args.pattern ?? "").trim().toLowerCase();
    if (needle === "") throw new Error("file_name_search: pattern 不能为空");
    const root = String(args.root ?? process.cwd());
    const limit = Math.min(HARD_LIMIT, Math.max(1, Math.floor(args.limit ?? DEFAULT_LIMIT)));
    const { hits } = await searchNames(root, needle, limit, exec.signal);
    return { pattern: needle, root, count: hits.length, files: hits };
  },
  presentCall: (args) => ({ card: "generic", title: "文件名搜索", kind: "other", rawInput: String(args.pattern ?? "") })
});

/**
 * Register the file_name_search tool.
 * @param ctx - registrant context carrying the tool registry.
 */
function apply(ctx) {
  ctx.tools.register(fileNameSearch);
}

export { apply, inject, name };

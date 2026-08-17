// DeepSeek Harness OS-clipboard plugin.
//
// Two model-facing tools over the OPERATING-SYSTEM clipboard:
//
//   clipboard_read (maxChars?)  — read the current clipboard text.
//   clipboard_write (text)      — put text on the clipboard.
//
// Implementation note: the harness runs inside the Electron main process, but
// plugins must not import Electron directly (module resolution inside the
// profile loader does not guarantee it). On Windows the PowerShell
// Get-Clipboard/Set-Clipboard cmdlets provide a dependency-free bridge; other
// platforms fall back to pbcopy/pbpaste (macOS) / xclip (Linux) when present.
//
// @module @deepseek-ai/dsh-tool-clipboard
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { defineTool } from "@deepseek-ai/dsh-tools";

/** Cordis plugin name. */
const name = "tool-clipboard";
/** Required services: the tool registry. */
const inject = ["tools"];

const execFileAsync = promisify(execFile);
/** Hard cap on clipboard text handled by the tools. */
const MAX_CHARS = 100000;
/** Cmdlet timeout. */
const CLIP_TIMEOUT_MS = 8000;

function runClipboard(cmd, input) {
  return new Promise((resolve, reject) => {
    execFile(cmd.file, cmd.args, { timeout: CLIP_TIMEOUT_MS, windowsHide: true, encoding: "utf8", maxBuffer: 2 * MAX_CHARS }, (error, stdout, stderr) => {
      if (error !== null) reject(new Error(String(stderr || error.message)));
      else resolve(stdout);
    }).stdin?.end(input ?? undefined);
  });
}

/** Resolve the read command for this platform, or throw a clear error. */
function readCommand() {
  if (process.platform === "win32") {
    return { file: "powershell.exe", args: ["-NoProfile", "-NonInteractive", "-Command", "Get-Clipboard -Raw"] };
  }
  if (process.platform === "darwin") return { file: "pbpaste", args: [] };
  return { file: "xclip", args: ["-selection", "clipboard", "-o"] };
}

/** Resolve the write command for this platform, or throw a clear error. */
function writeCommand() {
  if (process.platform === "win32") {
    // Set-Clipboard reads the full stdin; -AsJson keeps newlines/unicode exact.
    return { file: "powershell.exe", args: ["-NoProfile", "-NonInteractive", "-Command", "$t=[Console]::In.ReadToEnd(); Set-Clipboard -Value $t"] };
  }
  if (process.platform === "darwin") return { file: "pbcopy", args: [] };
  return { file: "xclip", args: ["-selection", "clipboard", "-in"] };
}

const clipboardRead = defineTool({
  name: "clipboard_read",
  description:
    "Read the current operating-system clipboard TEXT (what the user last copied in any app). " +
    "Use it when the user says '看看我复制的内容' / '粘贴这里' instead of asking them to paste manually. " +
    "Files and images on the clipboard are not readable by this tool — text only.",
  parameters: {
    maxChars: { type: "number", description: "Optional cap on returned characters (default 20000)." }
  },
  output: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        chars: { type: "integer", required: true },
        truncated: { type: "boolean", required: true },
        text: { type: "string", required: true }
      }
    },
    render: (_args, value) => [
      { type: "text", text: `剪贴板（${value.chars} 字符${value.truncated ? "，已截断" : ""}）：\n${value.text.slice(0, 400)}` }
    ]
  },
  async execute(args, exec) {
    exec.signal?.throwIfAborted?.();
    const cap = Math.min(MAX_CHARS, Math.max(100, Math.floor(args.maxChars ?? 20000)));
    const raw = await runClipboard(readCommand());
    // Get-Clipboard can return a trailing newline the user never copied.
    const text = raw.replace(/\r\n/g, "\n").replace(/\n$/, "");
    const truncated = text.length > cap;
    return { chars: text.length, truncated, text: truncated ? text.slice(0, cap) : text };
  },
  presentCall: () => ({ card: "generic", title: "读取剪贴板", kind: "other", rawInput: "" })
});

const clipboardWrite = defineTool({
  name: "clipboard_write",
  description:
    "Put TEXT onto the operating-system clipboard, ready for the user to paste anywhere. " +
    "Use it when the user asks to copy something out (a command to run, a code snippet, a summary).",
  parameters: {
    text: { type: "string", required: true, description: "The text to place on the clipboard (up to 100000 characters)." }
  },
  output: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: { chars: { type: "integer", required: true } }
    },
    render: (_args, value) => [{ type: "text", text: `已复制 ${value.chars} 字符到剪贴板。` }]
  },
  async execute(args, exec) {
    exec.signal?.throwIfAborted?.();
    const text = String(args.text ?? "");
    if (text.length === 0) throw new Error("clipboard_write: text 不能为空");
    if (text.length > MAX_CHARS) throw new Error(`clipboard_write: 文本超过 ${MAX_CHARS} 字符上限`);
    await runClipboard(writeCommand(), text);
    return { chars: text.length };
  },
  presentCall: (args) => ({ card: "generic", title: "写入剪贴板", kind: "other", rawInput: String(args.text ?? "").slice(0, 80) })
});

/**
 * Register the clipboard tools.
 * @param ctx - registrant context carrying the tool registry.
 */
function apply(ctx) {
  ctx.tools.register(clipboardRead);
  ctx.tools.register(clipboardWrite);
}

export { apply, inject, name };

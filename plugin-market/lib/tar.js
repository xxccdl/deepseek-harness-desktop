// Minimal, dependency-free tar (ustar) reader/writer used to move plugin
// packages between the market and a DSH client.
//
// Only what a plugin package needs: regular files and directories, written with
// the ustar magic so GNU tar and Python's tarfile both read our output. Long
// paths fall back to the `prefix` field; GNU long-name entries are honoured on
// read because `tar czf` may emit them.
//
// Security: every name is normalized and validated on read — absolute paths,
// drive letters, `..` segments and links are refused before anything is written
// to disk.
import { gunzipSync, gzipSync } from "node:zlib";

/** Tar block size. */
const BLOCK = 512;
/** Largest single file we accept in a package. */
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
/** Largest package we accept, uncompressed. */
export const MAX_TOTAL_BYTES = 32 * 1024 * 1024;
/** Largest number of entries we accept. */
export const MAX_ENTRIES = 1024;

/** Thrown for malformed or unsafe archives. */
export class TarError extends Error {}

/** Octal field writer. */
function octal(value, length) {
  return value.toString(8).padStart(length - 1, "0") + "\0";
}

/** Write one 512-byte ustar header. */
function header(name, size, { mode = 0o644, mtime = 0, type = "0" } = {}) {
  const buf = Buffer.alloc(BLOCK);
  let prefix = "";
  let local = name;
  if (Buffer.byteLength(local) > 100) {
    const cut = local.lastIndexOf("/", 155);
    if (cut <= 0) throw new TarError(`路径过长：${name}`);
    prefix = local.slice(0, cut);
    local = local.slice(cut + 1);
    if (Buffer.byteLength(prefix) > 155 || Buffer.byteLength(local) > 100) throw new TarError(`路径过长：${name}`);
  }
  buf.write(local, 0, 100, "utf8");
  buf.write(octal(mode, 8), 100, 8, "ascii");
  buf.write(octal(0, 8), 108, 8, "ascii");
  buf.write(octal(0, 8), 116, 8, "ascii");
  buf.write(octal(size, 12), 124, 12, "ascii");
  buf.write(octal(Math.floor(mtime / 1000), 12), 136, 12, "ascii");
  buf.write("        ", 148, 8, "ascii");
  buf.write(type, 156, 1, "ascii");
  buf.write("ustar\0", 257, 6, "ascii");
  buf.write("00", 263, 2, "ascii");
  buf.write("dsh", 265, 3, "ascii");
  buf.write("dsh", 297, 3, "ascii");
  if (prefix !== "") buf.write(prefix, 345, 155, "utf8");
  let sum = 0;
  for (const byte of buf) sum += byte;
  buf.write(sum.toString(8).padStart(6, "0") + "\0 ", 148, 8, "ascii");
  return buf;
}

/**
 * Pack files into a tar.gz.
 * @param entries - `{ name, data }` pairs; names are archive-relative paths.
 * @returns the gzipped archive.
 */
export function packTarGz(entries, options = {}) {
  const mtime = options.mtime ?? Date.now();
  const blocks = [];
  const seenDirs = new Set();
  for (const entry of entries) {
    const name = normalizeName(entry.name);
    const dir = name.includes("/") ? name.slice(0, name.lastIndexOf("/")) : "";
    if (dir !== "" && !seenDirs.has(dir)) {
      seenDirs.add(dir);
      blocks.push(header(dir + "/", 0, { type: "5", mtime }));
    }
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data ?? "", "utf8");
    blocks.push(header(name, data.length, { mode: entry.mode ?? 0o644, mtime }));
    if (data.length > 0) {
      blocks.push(data);
      const pad = data.length % BLOCK;
      if (pad !== 0) blocks.push(Buffer.alloc(BLOCK - pad));
    }
  }
  blocks.push(Buffer.alloc(BLOCK * 2));
  return gzipSync(Buffer.concat(blocks), { level: 9 });
}

/** Reject anything that could escape the extraction root. */
export function normalizeName(raw) {
  const name = String(raw ?? "").replaceAll("\\", "/").replace(/^\.\//, "");
  if (name === "" || name.endsWith("/")) return name;
  if (name.startsWith("/") || /^[a-zA-Z]:/.test(name)) throw new TarError(`绝对路径不被允许：${raw}`);
  const parts = name.split("/");
  if (parts.includes("..")) throw new TarError(`路径穿越不被允许：${raw}`);
  return name;
}

/** Parse an octal/space padded numeric field. */
function numeric(field) {
  const text = field.toString("ascii").replace(/\0.*$/, "").trim();
  if (text === "") return 0;
  const value = Number.parseInt(text, 8);
  return Number.isFinite(value) ? value : 0;
}

/**
 * Unpack a tar.gz into memory.
 * @param buffer - the gzipped archive.
 * @returns `{ files, dirs, totalBytes }`.
 */
export function unpackTarGz(buffer) {
  let raw;
  try {
    raw = gunzipSync(buffer, { maxOutputLength: MAX_TOTAL_BYTES + BLOCK * 8 });
  } catch (error) {
    throw new TarError(`无法解压：${error instanceof Error ? error.message : String(error)}`);
  }
  const files = new Map();
  const dirs = new Set();
  let offset = 0;
  let totalBytes = 0;
  let longName = null;
  let entries = 0;
  while (offset + BLOCK <= raw.length) {
    const block = raw.subarray(offset, offset + BLOCK);
    offset += BLOCK;
    if (block.every((byte) => byte === 0)) break;
    entries += 1;
    if (entries > MAX_ENTRIES) throw new TarError(`条目过多（上限 ${MAX_ENTRIES}）`);
    const type = block.toString("ascii", 156, 157);
    const size = numeric(block.subarray(124, 136));
    const prefix = block.toString("utf8", 345, 500).replace(/\0.*$/, "");
    const local = block.toString("utf8", 0, 100).replace(/\0.*$/, "");
    const name = normalizeName(prefix === "" ? local : `${prefix}/${local}`);
    const body = raw.subarray(offset, offset + size);
    offset += size + (size % BLOCK === 0 ? 0 : BLOCK - (size % BLOCK));
    if (type === "L") {
      longName = body.toString("utf8").replace(/\0.*$/, "");
      continue;
    }
    if (type === "x" || type === "g") continue;
    const effective = longName === null ? name : normalizeName(longName);
    longName = null;
    if (type === "5" || name.endsWith("/")) {
      if (name !== "") dirs.add(name.replace(/\/$/, ""));
      continue;
    }
    if (type !== "0" && type !== "\0" && type !== "7") continue;
    if (effective === "") continue;
    if (size > MAX_FILE_BYTES) throw new TarError(`文件过大（>${MAX_FILE_BYTES} 字节）：${effective}`);
    totalBytes += size;
    if (totalBytes > MAX_TOTAL_BYTES) throw new TarError(`解压体积过大（>${MAX_TOTAL_BYTES} 字节）`);
    files.set(effective, Buffer.from(body));
  }
  if (files.size === 0) throw new TarError("压缩包内没有文件");
  return { files, dirs, totalBytes };
}

/**
 * Strip a single shared top-level directory from archive paths, so a package
 * created with `tar czf x.tgz my-plugin/` lands with `package.json` at the root.
 * @param files - unpacked archive files.
 * @returns the normalized files.
 */
export function stripRoot(files) {
  const names = [...files.keys()];
  const roots = new Set(names.map((name) => name.split("/")[0]));
  const shallow = names.every((name) => !name.includes("/"));
  if (shallow || roots.size !== 1) return files;
  const prefix = [...roots][0] + "/";
  const stripped = new Map();
  for (const [name, data] of files) {
    if (name === prefix.slice(0, -1)) continue;
    stripped.set(name.slice(prefix.length), data);
  }
  return stripped.size > 0 ? stripped : files;
}

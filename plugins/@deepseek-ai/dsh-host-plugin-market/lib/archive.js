// Package archive for the plugin market bridge.
//
// Deliberately a small local copy of the market server's reader/writer: a DSH
// plugin may only depend on the harness, never on the market's own package, and
// both ends must agree on the format. Keep the two in step — the checks here are
// the client-side half of the same contract (no absolute paths, no `..`, no
// links, bounded sizes).
import { gunzipSync, gzipSync } from "node:zlib";

/** Tar block size. */
const BLOCK = 512;
/** Largest single file accepted in a package. */
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
/** Largest package accepted, uncompressed. */
export const MAX_TOTAL_BYTES = 32 * 1024 * 1024;
/** Largest number of entries accepted. */
export const MAX_ENTRIES = 1024;

/** Thrown for malformed or unsafe archives. */
export class ArchiveError extends Error {}

/** Octal field writer. */
function octal(value, length) {
  return value.toString(8).padStart(length - 1, "0") + "\0";
}

/** Reject anything that could escape the extraction root. */
export function normalizeName(raw) {
  const name = String(raw ?? "").replaceAll("\\", "/").replace(/^\.\//, "");
  if (name === "" || name.endsWith("/")) return name;
  if (name.startsWith("/") || /^[a-zA-Z]:/.test(name)) throw new ArchiveError(`绝对路径不被允许：${raw}`);
  if (name.split("/").includes("..")) throw new ArchiveError(`路径穿越不被允许：${raw}`);
  return name;
}

/** One 512-byte ustar header. */
function header(name, size, { mode = 0o644, mtime = 0, type = "0" } = {}) {
  const buf = Buffer.alloc(BLOCK);
  let prefix = "";
  let local = name;
  if (Buffer.byteLength(local) > 100) {
    const cut = local.lastIndexOf("/", 155);
    if (cut <= 0) throw new ArchiveError(`路径过长：${name}`);
    prefix = local.slice(0, cut);
    local = local.slice(cut + 1);
    if (Buffer.byteLength(prefix) > 155 || Buffer.byteLength(local) > 100) throw new ArchiveError(`路径过长：${name}`);
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
 * @param entries - `{ name, data }` pairs.
 * @param options - optional fixed mtime.
 * @returns the gzipped archive.
 */
export function packTarGz(entries, options = {}) {
  const mtime = options.mtime ?? Date.now();
  const blocks = [];
  const dirs = new Set();
  for (const entry of entries) {
    const name = normalizeName(entry.name);
    const dir = name.includes("/") ? name.slice(0, name.lastIndexOf("/")) : "";
    if (dir !== "" && !dirs.has(dir)) {
      dirs.add(dir);
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

/** Read an octal/space padded field. */
function numeric(field) {
  const text = field.toString("ascii").replace(/\0.*$/, "").trim();
  if (text === "") return 0;
  const value = Number.parseInt(text, 8);
  return Number.isFinite(value) ? value : 0;
}

/**
 * Unpack a tar.gz into memory.
 * @param buffer - the gzipped archive.
 * @returns the file map.
 */
export function unpackTarGz(buffer) {
  let raw;
  try {
    raw = gunzipSync(buffer, { maxOutputLength: MAX_TOTAL_BYTES + BLOCK * 8 });
  } catch (error) {
    throw new ArchiveError(`无法解压：${error instanceof Error ? error.message : String(error)}`);
  }
  const files = new Map();
  let offset = 0;
  let total = 0;
  let longName = null;
  let entries = 0;
  while (offset + BLOCK <= raw.length) {
    const block = raw.subarray(offset, offset + BLOCK);
    offset += BLOCK;
    if (block.every((byte) => byte === 0)) break;
    entries += 1;
    if (entries > MAX_ENTRIES) throw new ArchiveError(`条目过多（上限 ${MAX_ENTRIES}）`);
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
    if (type === "5" || name.endsWith("/")) continue;
    if (type !== "0" && type !== "\0" && type !== "7") continue;
    if (effective === "") continue;
    if (size > MAX_FILE_BYTES) throw new ArchiveError(`文件过大：${effective}`);
    total += size;
    if (total > MAX_TOTAL_BYTES) throw new ArchiveError("解压体积过大");
    files.set(effective, Buffer.from(body));
  }
  if (files.size === 0) throw new ArchiveError("压缩包内没有文件");
  return files;
}

/**
 * Strip a single shared top-level directory so a package built with
 * `tar czf x.tgz my-plugin/` still lands with `package.json` at the root.
 * @param files - unpacked files.
 * @returns normalized files.
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

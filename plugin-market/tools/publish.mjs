#!/usr/bin/env node
// Publish a plugin directory to a market server.
//
//   node tools/publish.mjs <plugin-dir> [--market http://127.0.0.1:9009] [--token <t>]
//                          [--title t] [--summary s] [--category c] [--icon 🧩]
//                          [--tags a,b] [--author a] [--note "…"]
//
// The directory must hold a package.json with name/version/entry; everything
// else is packaging detail. The archive is built with the same writer the
// server reads (lib/tar.js), so no system tar is required.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { packTarGz } from "../lib/tar.js";

/** Read argv into a flag map plus the positional argument. */
function parse(argv) {
  const flags = {};
  const rest = [];
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (item.startsWith("--")) {
      const key = item.slice(2);
      const value = argv[index + 1];
      if (value === undefined || value.startsWith("--")) flags[key] = "true";
      else { flags[key] = value; index += 1; }
      continue;
    }
    rest.push(item);
  }
  return { flags, rest };
}

/** Every file under `dir`, excluding noise a package never ships. */
function walk(dir, base = dir) {
  const entries = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === ".DS_Store") continue;
    const full = join(dir, name);
    const info = statSync(full);
    if (info.isDirectory()) entries.push(...walk(full, base));
    else entries.push({ name: relative(base, full).split(sep).join("/"), data: readFileSync(full), size: info.size });
  }
  return entries;
}

const { flags, rest } = parse(process.argv.slice(2));
const dir = rest[0];
if (dir === undefined) {
  console.error("用法：node tools/publish.mjs <plugin-dir> [--market url] [--title …]");
  process.exit(2);
}

const files = walk(dir);
if (files.length === 0) {
  console.error("目录为空");
  process.exit(2);
}
const manifest = files.find((file) => file.name === "package.json");
if (manifest === undefined) {
  console.error("目录里没有 package.json");
  process.exit(2);
}

const archive = packTarGz(files.map(({ name, data }) => ({ name, data })));
const meta = {};
for (const key of ["title", "summary", "description", "category", "icon", "author", "homepage", "note"]) {
  if (flags[key] !== undefined) meta[key] = flags[key];
}
if (flags.tags !== undefined) meta.tags = flags.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag !== "");
if (flags.readme !== undefined) meta.readme = readFileSync(flags.readme, "utf8");
meta.kind = flags.kind ?? "plugin";

const base = (flags.market ?? process.env.DSH_MARKET_URL ?? "http://127.0.0.1:9009").replace(/\/$/, "");
const response = await fetch(`${base}/api/plugins`, {
  method: "POST",
  headers: {
    "Content-Type": "application/gzip",
    "X-Market-Meta": Buffer.from(JSON.stringify(meta), "utf8").toString("base64"),
    ...(flags.token === undefined ? {} : { "X-Market-Token": flags.token })
  },
  body: archive
});
const payload = await response.json().catch(() => ({}));
if (payload.ok !== true) {
  console.error(`发布失败：${payload.error ?? response.status}`);
  process.exit(1);
}
console.log(`已发布 ${payload.name}@${payload.version}（${(archive.length / 1024).toFixed(1)} KB）`);
console.log(`详情：${base}${payload.url}`);
if (payload.token !== undefined) console.log(`发布令牌（后续更新需要）：${payload.token}`);

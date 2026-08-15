#!/usr/bin/env node
// Install the desktop fork's plugins into node_modules: copies
// plugins/@deepseek-ai/<pkg> over node_modules/@deepseek-ai/<pkg>, creating or
// replacing as needed. Run after `npm install`.
import { cpSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, "plugins", "@deepseek-ai");
const target = join(root, "node_modules", "@deepseek-ai");

if (!existsSync(source)) {
  console.error("plugins/@deepseek-ai not found — nothing to install");
  process.exit(1);
}
if (!existsSync(target)) mkdirSync(target, { recursive: true });

let count = 0;
for (const name of (await import("node:fs")).readdirSync(source)) {
  const from = join(source, name);
  const to = join(target, name);
  if (!existsSync(from)) continue;
  if (existsSync(to)) rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
  count++;
}
console.log(`installed ${count} plugin package(s) into node_modules/@deepseek-ai`);

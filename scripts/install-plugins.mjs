#!/usr/bin/env node
// Install the desktop fork's plugins into node_modules: copies
// plugins/@deepseek-ai/<pkg> over node_modules/@deepseek-ai/<pkg>, creating or
// replacing as needed. Run after `npm install`.
//
// Also mirrors each plugin into $DSH_HOME/profiles/node_modules as a junction.
// The harness resolves profile bundles from that flat fallback directory, and
// its healer only links packages inside the upstream dependency closure — so
// brand-new fork packages (like dsh-tool-files) would never be discovered
// without this extra junction.
import { cpSync, mkdirSync, existsSync, lstatSync, rmSync, symlinkSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, "plugins", "@deepseek-ai");
const target = join(root, "node_modules", "@deepseek-ai");
const dshHome = process.env.DSH_HOME ?? join(homedir(), ".dsh");
const profileModules = join(dshHome, "profiles", "node_modules", "@deepseek-ai");

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

  // Junction the installed copy into the profile fallback dir.
  const link = join(profileModules, name);
  mkdirSync(profileModules, { recursive: true });
  let stat;
  try { stat = lstatSync(link); } catch { stat = undefined; }
  if (stat !== undefined) {
    if (stat.isSymbolicLink()) unlinkSync(link);
    else continue; // a real directory is not ours to replace
  }
  symlinkSync(to, link, "junction");
}
console.log(`installed ${count} plugin package(s) into node_modules/@deepseek-ai (profiles junctions under ${profileModules})`);

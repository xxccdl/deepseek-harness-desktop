// Headless verification: boot the web profile exactly like src/main.js does and
// assert the memory plugin's tools + skill are registered. Not a real product
// file — a dev-only check.
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { writeFileSync } from "node:fs";
import {
  PROFILE_PATCH_FILENAME,
  boot,
  composeEntries,
  healProfilesModuleFallback,
  loadLayeredEnv,
  loadOptionalPatches,
  loadProfile
} from "@deepseek-ai/dsh-app-boot";
import { resolveDshHome } from "@deepseek-ai/dsh-home-paths";
import { provideCmdline } from "@deepseek-ai/dsh-cmdline";
import { DSH_LAUNCH_ENVIRONMENT_KEY } from "@deepseek-ai/dsh-launch-environment";
import { validateJsonSchemaValue } from "@deepseek-ai/dsh-tools";

const BIN_NAME = "dsh";
const PROFILE_NAME = "web";
const PROFILE_ROOT_FILENAME = "cordis.yml";
const PROFILE_ROOT_CONFIG = `[]
`;
const DSH_ANCHOR = fileURLToPath(new URL("../node_modules/@deepseek-ai/dsh/package.json", import.meta.url));

const ctx = await boot(BIN_NAME, join(join(resolveDshHome(), "profiles", PROFILE_NAME), PROFILE_ROOT_FILENAME), (() => {
  healProfilesModuleFallback(DSH_ANCHOR);
  const profile = loadProfile(BIN_NAME, PROFILE_NAME, DSH_ANCHOR);
  writeFileSync(join(profile.dir, PROFILE_ROOT_FILENAME), PROFILE_ROOT_CONFIG);
  const homePatches = loadOptionalPatches(BIN_NAME, join(resolveDshHome(), PROFILE_PATCH_FILENAME)) ?? [];
  const bundlePatches = profile.layers.flatMap((layer) => layer.patches);
  const rows = new Map();
  for (const row of composeEntries([bundlePatches, profile.patches, homePatches])) {
    if (typeof row.id === "string") rows.set(row.id, row);
  }
  return [...bundlePatches, ...profile.patches, ...homePatches];
})(), (hostCtx) => {
  hostCtx.provide(DSH_LAUNCH_ENVIRONMENT_KEY, loadLayeredEnv(BIN_NAME));
  provideCmdline(hostCtx, {
    args: ["--port", "0"],
    exit: (code) => { void ctx.fiber.dispose().finally(() => process.exit(code)); }
  });
});

try {
  const tools = ctx.get("tools");
  const skills = ctx.get("skills");
  if (tools === undefined) throw new Error("tools service missing");
  if (skills === undefined) throw new Error("skills service missing");

  const visible = tools.view(undefined).visible;
  const expectedTools = [
    "memory_remember", "memory_recall", "memory_list", "memory_forget",
    "memory_kv_set", "memory_kv_get", "memory_kv_list", "memory_kv_delete",
    "memory_map_add", "memory_map_get", "memory_map_remove"
  ];
  for (const t of expectedTools) {
    if (!visible.has(t)) throw new Error(`tool ${t} NOT visible`);
    console.log(`tool OK: ${t}`);
  }

  const catalog = await skills.list();
  const memorySkill = catalog.find((s) => s.name === "memory");
  if (memorySkill === undefined) throw new Error("skill 'memory' NOT in catalog");
  console.log(`skill OK: memory (source=${memorySkill.source}, provider=${memorySkill.provider})`);

  // persistent system-prompt reminder is present
  const assembly = await ctx.get("systemPrompt").assemble({});
  const reminderSection = assembly.sections.find((s) => s.name === "memory:usage");
  if (reminderSection === undefined || !reminderSection.text.includes("长期记忆")) {
    throw new Error("persistent memory reminder section missing from assembled prompt");
  }
  console.log("prompt reminder OK: 'memory:usage' section present");

  // ── memoryTags variable ──
  const exec = { signal: new AbortController().signal };
  const tagSeed = `verify-tag-${Date.now()}`;
  const tagRecord = await visible.get("memory_remember").execute({ content: "memoryTags 变量注入验证", tags: [tagSeed] }, exec);
  const tagAssembly = await ctx.get("systemPrompt").assemble({});
  const tagsValue = tagAssembly.variables?.["memorytags"];
  if (typeof tagsValue !== "string" || !tagsValue.includes(tagSeed)) {
    throw new Error(`memorytags variable missing from assembly (expected tag ${tagSeed}, got ${JSON.stringify(tagsValue)})`);
  }
  await visible.get("memory_forget").execute({ id: tagRecord.id }, exec);
  console.log("prompt variable OK: memorytags injected");

  // ── TEXT round-trip ──
  const remember = visible.get("memory_remember");
  const recall = visible.get("memory_recall");
  const textList = visible.get("memory_list");
  const forget = visible.get("memory_forget");

  const saved = await remember.execute({ content: "用户偏好：喜欢中文回复，界面要现代化", tags: ["user", "language"] }, exec);
  if (typeof saved.id !== "string") throw new Error(`remember unexpected: ${JSON.stringify(saved)}`);
  const again = await remember.execute({ content: "用户偏好：喜欢中文回复，界面要现代化", tags: ["user"] }, exec);
  if (again.id !== saved.id) throw new Error("text dedupe failed");
  const hit = await recall.execute({ query: "中文回复" }, exec);
  if (hit.count !== 1 || hit.results[0].id !== saved.id) throw new Error(`recall failed: ${JSON.stringify(hit)}`);
  const all = await textList.execute({}, exec);
  if (!all.records.some((r) => r.id === saved.id)) throw new Error("text list failed");
  const removed = await forget.execute({ id: saved.id }, exec);
  if (!removed.removed) throw new Error("text forget failed");
  console.log("text memory round-trip OK");

  // ── KV round-trip ──
  const kvSet = visible.get("memory_kv_set");
  const kvGet = visible.get("memory_kv_get");
  const kvList = visible.get("memory_kv_list");
  const kvDelete = visible.get("memory_kv_delete");
  await kvSet.execute({ key: "user.email", value: "xx@example.com" }, exec);
  await kvSet.execute({ key: "user.name", value: "xxccdl" }, exec);
  await kvSet.execute({ key: "project.framework", value: "electron" }, exec);
  const got = await kvGet.execute({ key: "user.email" }, exec);
  if (!got.found || got.value !== "xx@example.com") throw new Error(`kv get failed: ${JSON.stringify(got)}`);
  const under = await kvList.execute({ prefix: "user" }, exec);
  if (under.count !== 2) throw new Error(`kv list prefix failed: ${JSON.stringify(under)}`);
  const deleted = await kvDelete.execute({ key: "user" }, exec);
  if (deleted.removed !== 2) throw new Error(`kv delete failed: ${JSON.stringify(deleted)}`);
  const afterKv = await kvList.execute({}, exec);
  if (afterKv.entries.some((e) => e.key.startsWith("user"))) throw new Error("kv delete left leftovers");
  console.log("kv graph memory round-trip OK");

  // ── MIND-MAP round-trip (scoped: never asserts on — or deletes — other data) ──
  const mapAdd = visible.get("memory_map_add");
  const mapGet = visible.get("memory_map_get");
  const mapRemove = visible.get("memory_map_remove");
  // Idempotent: drop any leftover root node from a previous run first.
  await mapRemove.execute({ path: ["项目A"] }, exec);
  await mapAdd.execute({ label: "项目A" }, exec);
  await mapAdd.execute({ label: "前端", parent: ["项目A"] }, exec);
  await mapAdd.execute({ label: "组件", parent: ["项目A", "前端"] }, exec);
  // regression: the tree output must validate against the declared output schema
  const whole = await mapGet.execute({}, exec);
  const treeViolations = validateJsonSchemaValue(mapGet.output.schema, whole, "value");
  if (treeViolations.length > 0) throw new Error(`map get output schema violations: ${JSON.stringify(treeViolations)}`);
  console.log("map output schema OK (tree validates)");
  const branch = await mapGet.execute({ path: ["项目A", "前端"] }, exec);
  if (branch.nodes !== 2 || branch.tree.label !== "前端") throw new Error(`map get subtree failed: ${JSON.stringify(branch)}`);
  const mapRemoved = await mapRemove.execute({ path: ["项目A", "前端"] }, exec);
  if (mapRemoved.removed !== 2) throw new Error(`map remove failed: ${JSON.stringify(mapRemoved)}`);
  const remaining = await mapGet.execute({ path: ["项目A"] }, exec);
  if (remaining.tree.children.length !== 0) throw new Error("map remove left leftovers");
  await mapRemove.execute({ path: ["项目A"] }, exec);
  console.log("mind-map memory round-trip OK");

  console.log("ALL CHECKS PASSED");
} finally {
  await ctx.fiber.dispose();
}

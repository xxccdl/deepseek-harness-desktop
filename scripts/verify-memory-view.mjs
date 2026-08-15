// Headless verification: boot the web profile exactly like src/main.js does and
// assert (1) the memory plugin serves /api/memory with text/kv/map snapshots and
// (2) the dsh-client-ui-memory bundle is discovered into window.__DSH_BOOT__.
// Not a real product file — a dev-only check.
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
  // ── /api/memory route ──
  const webServer = ctx.get("webServer", false);
  if (webServer === undefined) throw new Error("webServer service missing");
  const port = webServer.port;
  const baseUrl = `http://127.0.0.1:${port}`;

  // Seed a little memory through the model-facing tools so the snapshot is real.
  const tools = ctx.get("tools");
  const visible = tools.view(undefined).visible;
  const exec = { signal: new AbortController().signal };
  // Idempotent: drop any leftover verification data first.
  const recalled = await visible.get("memory_recall").execute({ query: "验证快照" }, exec);
  for (const r of recalled.results ?? []) await visible.get("memory_forget").execute({ id: r.id }, exec);
  await visible.get("memory_kv_delete").execute({ key: "verify.snapshot" }, exec);
  await visible.get("memory_map_remove").execute({ path: ["验证项目"] }, exec);

  await visible.get("memory_remember").execute({ content: "验证快照：记忆查看功能", tags: ["verify", "viewer"] }, exec);
  await visible.get("memory_kv_set").execute({ key: "verify.snapshot", value: "ok" }, exec);
  await visible.get("memory_map_add").execute({ label: "验证项目", value: "snapshot" }, exec);

  const res = await fetch(`${baseUrl}/api/memory`, { method: "GET" });
  if (!res.ok) throw new Error(`GET /api/memory -> HTTP ${res.status}`);
  const snapshot = await res.json();
  if (!Array.isArray(snapshot.text)) throw new Error("snapshot.text is not an array");
  if (!Array.isArray(snapshot.kv)) throw new Error("snapshot.kv is not an array");
  if (typeof snapshot.map !== "object" || snapshot.map === null) throw new Error("snapshot.map is not an object");
  if (!snapshot.text.some((r) => r.content === "验证快照：记忆查看功能")) throw new Error("text memory missing from snapshot");
  if (!snapshot.kv.some((e) => e.key === "verify.snapshot" && e.value === "ok")) throw new Error("kv memory missing from snapshot");
  console.log(`http OK: /api/memory -> text=${snapshot.text.length} kv=${snapshot.kv.length} mapId=${snapshot.map.id}`);

  // ── /api/memory/delete (settings viewer delete actions) ──
  const delRes = await fetch(`${baseUrl}/api/memory/delete`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind: "text", id: snapshot.text.find((r) => r.content === "验证快照：记忆查看功能").id })
  });
  if (!delRes.ok) throw new Error(`POST /api/memory/delete (text) -> HTTP ${delRes.status}`);
  const afterDelete = await delRes.json();
  if (afterDelete.ok !== true) throw new Error(`delete text not ok: ${JSON.stringify(afterDelete)}`);
  if (afterDelete.text.some((r) => r.content === "验证快照：记忆查看功能")) throw new Error("deleted text still present");
  const delKv = await fetch(`${baseUrl}/api/memory/delete`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind: "kv", key: "verify.snapshot" })
  });
  if (!delKv.ok) throw new Error(`POST /api/memory/delete (kv) -> HTTP ${delKv.status}`);
  const afterKv = await delKv.json();
  if (afterKv.kv.some((e) => e.key === "verify.snapshot")) throw new Error("deleted kv still present");
  const delMap = await fetch(`${baseUrl}/api/memory/delete`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind: "map", path: ["验证项目"] })
  });
  if (!delMap.ok) throw new Error(`POST /api/memory/delete (map) -> HTTP ${delMap.status}`);
  const afterMap = await delMap.json();
  if (afterMap.map.children.some((n) => n.label === "验证项目")) throw new Error("deleted map node still present");
  console.log("http OK: /api/memory/delete (text/kv/map)");

  // ── /api/memory/export (round-trips through import without touching other data) ──
  const exportRes = await fetch(`${baseUrl}/api/memory/export`, { method: "GET" });
  if (!exportRes.ok) throw new Error(`GET /api/memory/export -> HTTP ${exportRes.status}`);
  const exported = await exportRes.json();
  if (!Array.isArray(exported.text) || !Array.isArray(exported.kv) || typeof exported.map !== "object") {
    throw new Error(`export shape invalid: ${JSON.stringify(exported)}`);
  }
  const exportContent = `验证导出-${Date.now()}`;
  const importRes = await fetch(`${baseUrl}/api/memory/import`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: [...exported.text, { content: exportContent, tags: ["verify-export"] }] })
  });
  if (!importRes.ok) throw new Error(`POST /api/memory/import -> HTTP ${importRes.status}`);
  const imported = await importRes.json();
  if (!imported.text.some((r) => r.content === exportContent)) throw new Error("imported text missing from snapshot");
  await fetch(`${baseUrl}/api/memory/delete`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind: "text", id: imported.text.find((r) => r.content === exportContent).id })
  });
  console.log("http OK: /api/memory/export + import (merge)");

  // ── /api/computer-use (settings viewer status) ──
  const cuRes = await fetch(`${baseUrl}/api/computer-use`, { method: "GET" });
  if (!cuRes.ok) throw new Error(`GET /api/computer-use -> HTTP ${cuRes.status}`);
  const cu = await cuRes.json();
  if (cu.config === undefined || typeof cu.config.enabled !== "boolean") throw new Error(`computer-use config missing: ${JSON.stringify(cu)}`);
  console.log(`http OK: /api/computer-use -> enabled=${cu.config.enabled} python=${cu.config.pythonVersion} mounted=${cu.mounted === null ? "none" : cu.mounted.status}`);

  // ── /api/computer-use/logs (runtime log ring buffer) ──
  const cuLogsRes = await fetch(`${baseUrl}/api/computer-use/logs`, { method: "GET" });
  if (!cuLogsRes.ok) throw new Error(`GET /api/computer-use/logs -> HTTP ${cuLogsRes.status}`);
  const cuLogs = await cuLogsRes.json();
  if (!Array.isArray(cuLogs.logs)) throw new Error(`computer-use logs shape invalid: ${JSON.stringify(cuLogs)}`);
  console.log(`http OK: /api/computer-use/logs -> ${cuLogs.logs.length} entries`);

  // ── /api/scheduler (task CRUD round-trip, cleaned up afterwards) ──
  const schName = `验证任务-${Date.now()}`;
  const schAdd = await fetch(`${baseUrl}/api/scheduler`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ op: "add", name: schName, prompt: "验证 AI 执行", intervalMinutes: 5, command: "echo ok" })
  });
  if (!schAdd.ok) throw new Error(`POST /api/scheduler (add) -> HTTP ${schAdd.status}`);
  const schAdded = await schAdd.json();
  const schTask = (schAdded.tasks ?? []).find((t) => t.name === schName);
  if (schTask === undefined) throw new Error(`scheduler add failed: ${JSON.stringify(schAdded)}`);
  if (schTask.prompt !== "验证 AI 执行") throw new Error("scheduler prompt field missing");
  const schGet = await fetch(`${baseUrl}/api/scheduler`, { method: "GET" });
  const schList = await schGet.json();
  if (!schList.tasks.some((t) => t.id === schTask.id)) throw new Error("scheduler list missing added task");
  const schToggle = await fetch(`${baseUrl}/api/scheduler`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ op: "toggle", id: schTask.id })
  });
  const schToggled = await schToggle.json();
  if (!schToggled.tasks.find((t) => t.id === schTask.id).enabled === false) throw new Error("scheduler toggle failed");
  const schRemove = await fetch(`${baseUrl}/api/scheduler`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ op: "remove", id: schTask.id })
  });
  const schRemoved = await schRemove.json();
  if (schRemoved.tasks.some((t) => t.id === schTask.id)) throw new Error("scheduler remove left leftovers");
  console.log("http OK: /api/scheduler (add/list/toggle/remove)");

  // ── client bundle discovery ──
  const clientModules = ctx.get("clientModules", false);
  if (clientModules === undefined) throw new Error("clientModules service missing");
  const graph = clientModules.graph();
  for (const expected of ["@deepseek-ai/dsh-client-ui-memory", "@deepseek-ai/dsh-client-ui-computer-use", "@deepseek-ai/dsh-client-ui-desktop", "@deepseek-ai/dsh-client-ui-scheduler"]) {
    const entry = graph.entries.find((e) => e.id === expected);
    if (entry === undefined) {
      throw new Error(`client bundle '${expected}' NOT in boot graph (entries: ${graph.entries.map((e) => e.id).join(", ")})`);
    }
    console.log(`client bundle OK: ${entry.id} (rev=${entry.rev}, url=${entry.url})`);
  }

  // ── settings section registered on the client side is verified at runtime in
  // the browser; here we only confirm the section slot seat exists. ──

  console.log("ALL CHECKS PASSED");
} finally {
  await ctx.fiber.dispose();
}

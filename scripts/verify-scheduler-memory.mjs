// Headless verification for scheduled-task date/repeat/time support and the
// mind-map memory delete fix. Dev-only check.
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
  return [...bundlePatches, ...profile.patches, ...homePatches];
})(), (hostCtx) => {
  hostCtx.provide(DSH_LAUNCH_ENVIRONMENT_KEY, loadLayeredEnv(BIN_NAME));
  provideCmdline(hostCtx, {
    args: ["--port", "0"],
    exit: (code) => { void ctx.fiber.dispose().finally(() => process.exit(code)); }
  });
});

const post = async (url, payload) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  return { status: res.status, body: await res.json() };
};

try {
  await ctx.get("loader", false)?.await?.();
  const webServer = ctx.get("webServer", false);
  if (webServer === undefined) throw new Error("webServer service missing");
  const baseUrl = `http://127.0.0.1:${webServer.port}`;

  // ── scheduler: add with date + time + repeat ──
  const clean = async () => {
    const res = await fetch(`${baseUrl}/api/scheduler`, { method: "GET" });
    const { tasks } = await res.json();
    for (const t of tasks ?? []) {
      if (String(t.name).startsWith("验证排程-")) {
        await post(`${baseUrl}/api/scheduler`, { op: "remove", id: t.id });
      }
    }
  };
  await clean();
  const add = await post(`${baseUrl}/api/scheduler`, {
    op: "add", name: "验证排程-01", prompt: "每日总结", date: "2026-08-20", time: "09:30", repeat: "weekday"
  });
  if (add.status !== 200) throw new Error(`add -> HTTP ${add.status}: ${JSON.stringify(add.body)}`);
  const t1 = add.body.tasks.find((t) => t.name === "验证排程-01");
  if (t1?.date !== "2026-08-20" || t1?.time !== "09:30" || t1?.repeat !== "weekday") {
    throw new Error(`add stored wrong fields: ${JSON.stringify(t1)}`);
  }
  console.log(`OK: add date+time+repeat -> ${t1.date} ${t1.time} repeat=${t1.repeat}`);

  // ── scheduler: invalid date rejected ──
  const bad = await post(`${baseUrl}/api/scheduler`, { op: "add", name: "验证排程-02", date: "2026-02-30", time: "09:00" });
  if (bad.status !== 400) throw new Error(`add(bad date) should 400, got ${bad.status}`);
  console.log(`OK: invalid date "2026-02-30" -> HTTP ${bad.status}`);

  // ── scheduler: update repeat ──
  const upd = await post(`${baseUrl}/api/scheduler`, { op: "update", id: t1.id, patch: { repeat: "daily", date: "", time: "" } });
  const t1u = upd.body.tasks.find((t) => t.id === t1.id);
  if (t1u?.repeat !== "daily") throw new Error(`update repeat failed: ${JSON.stringify(t1u)}`);
  console.log(`OK: update repeat=daily, date/time cleared`);

  await clean();

  // ── memory: mind-map delete (nested path) ──
  const tools = ctx.get("tools");
  const visible = tools.view(undefined).visible;
  const exec = { signal: new AbortController().signal };
  // Seed a nested mind-map branch, then remove the deepest node.
  await visible.get("memory_map_add").execute({ label: "验证排程-导图根" }, exec);
  await visible.get("memory_map_add").execute({ label: "子节点A", parent: ["验证排程-导图根"] }, exec);
  await visible.get("memory_map_add").execute({ label: "孙节点B", parent: ["验证排程-导图根", "子节点A"] }, exec);
  const del = await post(`${baseUrl}/api/memory/delete`, { kind: "map", path: ["验证排程-导图根", "子节点A", "孙节点B"] });
  if (del.status !== 200) throw new Error(`map delete (nested) -> HTTP ${del.status}: ${JSON.stringify(del.body)}`);
  console.log(`OK: nested mind-map delete -> HTTP 200`);
  await post(`${baseUrl}/api/memory/delete`, { kind: "map", path: ["验证排程-导图根"] });

  console.log("scheduler+memory verify OK");
  ctx.fiber.dispose().then(() => process.exit(0));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

// Headless verification for scheduled-task daily time support: boots the web
// profile like src/main.js and exercises /api/scheduler with the new `time`
// (HH:MM) field — add with/without time, invalid-time rejection, update, clear,
// and cleanup. Not a product file — dev-only check.
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

  const clean = async () => {
    const res = await fetch(`${baseUrl}/api/scheduler`, { method: "GET" });
    const { tasks } = await res.json();
    for (const t of tasks ?? []) {
      if (String(t.name).startsWith("验证时间-")) {
        await post(`${baseUrl}/api/scheduler`, { op: "remove", id: t.id });
      }
    }
  };

  // add with daily time
  await clean();
  const add = await post(`${baseUrl}/api/scheduler`, { op: "add", name: "验证时间-01", prompt: "每日总结", time: "14:00", intervalMinutes: 60 });
  if (add.status !== 200) throw new Error(`add(time) -> HTTP ${add.status}: ${JSON.stringify(add.body)}`);
  const t1 = add.body.tasks.find((t) => t.name === "验证时间-01");
  if (t1 === undefined || t1.time !== "14:00") throw new Error(`add(time) did not store time: ${JSON.stringify(t1)}`);
  console.log(`OK: add with time=14:00 -> ${t1.time}`);

  // add without time (interval mode)
  const add2 = await post(`${baseUrl}/api/scheduler`, { op: "add", name: "验证时间-02", prompt: "间隔任务", intervalMinutes: 30 });
  const t2 = add2.body.tasks.find((t) => t.name === "验证时间-02");
  if (t2 === undefined || t2.time !== undefined) throw new Error(`add(no time) should have no time: ${JSON.stringify(t2)}`);
  console.log(`OK: add without time keeps interval mode (time=${t2.time})`);

  // invalid time rejected
  const bad = await post(`${baseUrl}/api/scheduler`, { op: "add", name: "验证时间-03", time: "25:99" });
  if (bad.status !== 400) throw new Error(`add(bad time) should 400, got ${bad.status}`);
  console.log(`OK: invalid time "25:99" -> HTTP ${bad.status}`);

  // update time
  const upd = await post(`${baseUrl}/api/scheduler`, { op: "update", id: t2.id, patch: { time: "08:30" } });
  const t2u = upd.body.tasks.find((t) => t.id === t2.id);
  if (t2u === undefined || t2u.time !== "08:30") throw new Error(`update(time) failed: ${JSON.stringify(t2u)}`);
  console.log(`OK: update time -> ${t2u.time}`);

  // clear time (back to interval)
  const clr = await post(`${baseUrl}/api/scheduler`, { op: "update", id: t1.id, patch: { time: "" } });
  const t1c = clr.body.tasks.find((t) => t.id === t1.id);
  if (t1c === undefined || t1c.time !== undefined) throw new Error(`update(clear time) failed: ${JSON.stringify(t1c)}`);
  console.log(`OK: clearing time -> interval mode (time=${t1c.time})`);

  await clean();
  console.log("scheduler-time verify OK");
  ctx.fiber.dispose().then(() => process.exit(0));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

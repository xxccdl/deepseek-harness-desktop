// Headless verification for spend accumulation: boot the web profile, create a
// session, append an assistant/message event carrying a known provider usage,
// and assert /api/usage reports the expected CNY spend. Dev-only check.
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

const SESSION_ID = "usage-verify-session";

try {
  await ctx.get("loader", false)?.await?.();
  const webServer = ctx.get("webServer", false);
  if (webServer === undefined) throw new Error("webServer service missing");
  const sessions = ctx.get("sessions", false);
  if (sessions === undefined) throw new Error("sessions service missing");
  const baseUrl = `http://127.0.0.1:${webServer.port}`;

  // Known usage: 1M uncached input + 250K output tokens.
  // expected = 1_000_000/1e6*2 + 250_000/1e6*8 = 2 + 2 = 4 CNY
  const session = sessions.create(SESSION_ID, { meta: { cwd: process.cwd() } });
  session.append("assistant/message", {
    message: { role: "assistant", content: [{ type: "text", text: "hello" }] },
    turn: 1,
    step: 1,
    usage: { inputTokens: 1_000_000, outputTokens: 250_000, cacheReadTokens: 0, cacheWriteTokens: 0 }
  }, { surfaceOp: "append" });
  // Let the session/event replay + persist throttle settle.
  await new Promise((r) => setTimeout(r, 500));

  const res = await fetch(`${baseUrl}/api/usage`, { method: "GET" });
  if (!res.ok) throw new Error(`GET /api/usage -> HTTP ${res.status}`);
  const body = await res.json();
  const spent = Number(body.spent) || 0;
  console.log(`spent after seeded usage = ${spent.toFixed(4)} CNY (expected ~4.0000)`);
  if (Math.abs(spent - 4) > 0.001) {
    throw new Error(`spent mismatch: expected 4, got ${spent}`);
  }
  console.log("usage spend verify OK");
  ctx.fiber.dispose().then(() => process.exit(0));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

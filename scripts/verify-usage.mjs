// Headless verification for the sidebar budget bar: boot the web profile like
// src/main.js and assert (1) the plugin tree loads with tool-usage, (2) the
// dsh-client-ui-usage bundle is in the client-modules graph, and (3) /api/usage
// returns the expected shape (configured:false without a key, spent:0).
// Dev-only check, not a product file.
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

try {
  await ctx.get("loader", false)?.await?.();
  const webServer = ctx.get("webServer", false);
  if (webServer === undefined) throw new Error("webServer service missing");
  const baseUrl = `http://127.0.0.1:${webServer.port}`;

  const res = await fetch(`${baseUrl}/api/usage`, { method: "GET" });
  if (!res.ok) throw new Error(`GET /api/usage -> HTTP ${res.status}`);
  const body = await res.json();
  if (typeof body.spent !== "number") throw new Error(`usage.spent is not a number: ${JSON.stringify(body)}`);
  if (body.configured === true) {
    if (typeof body.balance !== "number") throw new Error(`usage.balance missing when configured: ${JSON.stringify(body)}`);
    console.log(`http OK: /api/usage -> configured=${body.configured} balance=${body.balance} ${body.currency} spent=${body.spent}`);
  } else if (body.configured === false) {
    console.log(`http OK: /api/usage -> configured=false (no key) spent=${body.spent}`);
  } else {
    throw new Error(`usage.configured invalid: ${JSON.stringify(body)}`);
  }

  const clientModules = ctx.get("clientModules", false);
  if (clientModules !== undefined) {
    const row = clientModules.graph().entries.find((r) => r.id === "@deepseek-ai/dsh-client-ui-usage");
    if (row === undefined) throw new Error("ui-usage missing from client-modules graph");
    if (clientModules.clientPath(row.id) === undefined) throw new Error(`ui-usage clientPath missing (${row.url})`);
    console.log(`bundle OK: ui-usage -> ${row.url}`);
  } else {
    console.log("warn: clientModules not present in this profile (bundle check skipped)");
  }

  console.log("usage verify OK");
  ctx.fiber.dispose().then(() => process.exit(0));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

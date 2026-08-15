// Headless verification for the desktop pet settings bundle: boot the web
// profile exactly like src/main.js does and assert (1) the plugin tree loads
// without errors after adding ui-pet to the web patch and (2) the
// dsh-client-ui-pet bundle is present in the client-modules graph.
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
  return [...bundlePatches, ...profile.patches, ...homePatches];
})(), (hostCtx) => {
  hostCtx.provide(DSH_LAUNCH_ENVIRONMENT_KEY, loadLayeredEnv(BIN_NAME));
  provideCmdline(hostCtx, {
    args: ["--port", "0"],
    exit: (code) => { void ctx.fiber.dispose().finally(() => process.exit(code)); }
  });
});

try {
  // The loader itself already fails loudly on a malformed patch; an extra
  // probe makes the success explicit in the log.
  const loader = ctx.get("loader", false);
  if (loader === undefined) throw new Error("loader service missing");
  await loader.await();
  const stats = loader.stats?.();
  console.log(`plugin tree OK: ${stats?.length ?? "?"} rows`);

  // ── client bundle graph must contain the pet settings section ──
  const clientModules = ctx.get("clientModules", false);
  if (clientModules === undefined) throw new Error("clientModules service missing");
  const entries = clientModules.graph().entries;
  const petRow = entries.find((row) => row.id === "@deepseek-ai/dsh-client-ui-pet");
  if (petRow === undefined) {
    throw new Error(`ui-pet missing from client-modules graph; have ${entries.map((e) => e.id).join(", ")}`);
  }
  if (petRow.url === undefined || !petRow.url.includes("dsh-client-ui-pet")) {
    throw new Error(`ui-pet resolves to unexpected url: ${petRow.url}`);
  }
  const clientPath = clientModules.clientPath(petRow.id);
  if (clientPath === undefined) throw new Error(`ui-pet clientPath does not resolve (${petRow.url} would 404)`);
  console.log(`bundle OK: ui-pet -> ${petRow.url} (clientPath ${clientPath})`);

  // ── confirm the pet IPC bridge files ship next to main.js ──
  const { fileURLToPath } = await import("node:url");
  const { accessSync, constants } = await import("node:fs");
  accessSync(fileURLToPath(new URL("../src/pet-preload.cjs", import.meta.url)), constants.F_OK);
  accessSync(fileURLToPath(new URL("../src/pet.html", import.meta.url)), constants.F_OK);
  console.log("files OK: src/pet-preload.cjs + src/pet.html present");

  console.log("pet verify OK");
  ctx.fiber.dispose().then(() => process.exit(0));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

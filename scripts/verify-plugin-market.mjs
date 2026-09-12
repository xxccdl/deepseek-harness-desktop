// Headless verification for the plugin market bridge: boot the web profile like
// src/main.js and drive the real /api/market/* routes with a real browser
// cookie, asserting the round trip
//
//   install -> row mounted in the live loader -> client bundle in the graph
//   uninstall -> row gone -> files gone
//
// against the market server the state file points at. Dev-only check, not a
// product file.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PROFILE_PATCH_FILENAME,
  boot,
  healProfilesModuleFallback,
  loadLayeredEnv,
  loadOptionalPatches,
  loadProfile
} from "@deepseek-ai/dsh-app-boot";
import { provideCmdline } from "@deepseek-ai/dsh-cmdline";
import { resolveDshHome } from "@deepseek-ai/dsh-home-paths";
import { DSH_LAUNCH_ENVIRONMENT_KEY } from "@deepseek-ai/dsh-launch-environment";

const BIN_NAME = "dsh";
const PROFILE_NAME = "web";
const PROFILE_ROOT_FILENAME = "cordis.yml";
const PROFILE_ROOT_CONFIG = `[]
`;
const DSH_ANCHOR = fileURLToPath(new URL("../node_modules/@deepseek-ai/dsh/package.json", import.meta.url));
/** The deployment root: `plugins/@deepseek-ai` sits here, next to `node_modules`. */
const ROOT = fileURLToPath(new URL("../", import.meta.url));
/** The package under test, as published in the local market data. */
const SUBJECT = process.argv[2] ?? "dsh-client-ui-clock";

/** Assert a condition, printing the check as it passes. */
function check(label, condition) {
  if (!condition) throw new Error(`FAILED: ${label}`);
  console.log(`  ok  ${label}`);
}

/** Read a file for the patch assertions, tolerating absence. */
function readSafely(file) {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

// Compose the same patch list src/main.js composes, so the plugin under test is
// mounted by the same bundle rows the shipped app uses.
const profile = loadProfile(BIN_NAME, PROFILE_NAME, DSH_ANCHOR);
await healProfilesModuleFallback({ installAnchor: DSH_ANCHOR, profile });
writeFileSync(join(profile.dir, PROFILE_ROOT_FILENAME), PROFILE_ROOT_CONFIG);
const homePatches = loadOptionalPatches(BIN_NAME, join(resolveDshHome(), PROFILE_PATCH_FILENAME)) ?? [];
const patches = [...profile.layers.flatMap((layer) => layer.patches), ...profile.patches, ...homePatches];

const ctx = await boot(BIN_NAME, join(profile.dir, PROFILE_ROOT_FILENAME), patches, (hostCtx) => {
  hostCtx.provide(DSH_LAUNCH_ENVIRONMENT_KEY, loadLayeredEnv(BIN_NAME));
  provideCmdline(hostCtx, {
    args: ["--port", "0", "--no-open"],
    exit: (code) => { void ctx.fiber.dispose().finally(() => process.exit(code)); }
  });
});

/** The browser cookie the shell would hold, set after the index is minted. */
let cookie = "";

/** Call one market route the way the browser surface does. */
async function call(url, path, body) {
  const response = await fetch(`${url}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      ...(cookie === "" ? {} : { Cookie: cookie }),
      ...(body === undefined ? {} : { "Content-Type": "application/json" })
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const payload = await response.json();
  if (payload.ok !== true) throw new Error(`${path} -> ${payload.error}`);
  return payload;
}

let failure = "";
try {
  await ctx.get("loader", false)?.await?.();
  const webServer = ctx.get("webServer", false);
  if (webServer === undefined) throw new Error("webServer service missing");
  const connection = ctx.get("connection", false);
  if (connection === undefined) throw new Error("connection service missing");
  const baseUrl = `http://127.0.0.1:${webServer.port}`;
  const get = (path) => call(baseUrl, path);
  const post = (path, body) => call(baseUrl, path, body);

  // Mint the browser cookie exactly the way the shell does: an exact route
  // rejects anything that arrives without it.
  const minted = await fetch(connection.authenticatedUrl(`${baseUrl}/`), { redirect: "manual" });
  cookie = (minted.headers.getSetCookie?.() ?? [minted.headers.get("set-cookie")])
    .map((value) => value.split(";")[0])
    .join("; ");
  check("index mints the auth cookie", cookie !== "" && cookie !== "undefined");

  console.log(`\nmarket: ${baseUrl} -> subject ${SUBJECT}\n`);

  const state0 = await get("/api/market/state");
  check(`state route answers (market ${state0.market.reachable === true ? "reachable" : "unreachable"})`, Array.isArray(state0.installed));
  check("market server reachable", state0.market.reachable === true);
  check("no rows owned by the market yet", (state0.rows ?? []).every((id) => !id.startsWith("market-")));

  const installed = await post("/api/market/install", { id: SUBJECT });
  check(`installed ${installed.id}@${installed.version}`, installed.id === SUBJECT);
  check(`live mount: ${installed.message}`, installed.reloaded === true);

  const state1 = await get("/api/market/state");
  check("state lists the plugin", state1.installed.some((entry) => entry.id === SUBJECT));
  check(`loader holds market-${SUBJECT}`, (state1.rows ?? []).includes(`market-${SUBJECT}`));
  const patchFile = state1.patchPaths[0];
  check(`row persisted to ${patchFile}`, readSafely(patchFile).includes(`market-${SUBJECT}`));
  // A bare `{id, name}` patch can only modify an existing row; mounting a new
  // plugin needs an `insert`, which is also what makes the row survive a boot.
  check("row written as an insert patch", readSafely(patchFile).includes("- insert:"));
  check("package written under plugins/@deepseek-ai", existsSync(join(ROOT, "plugins", "@deepseek-ai", SUBJECT, "package.json")));

  const clientModules = ctx.get("clientModules", false);
  if (clientModules === undefined) {
    console.log("  --  clientModules absent in this profile (bundle check skipped)");
  } else {
    const row = clientModules.graph().entries.find((item) => item.id === `@deepseek-ai/${SUBJECT}`);
    check("client bundle is in the boot manifest", row !== undefined && clientModules.clientPath(row.id) !== undefined);
  }

  const removed = await post("/api/market/uninstall", { id: SUBJECT });
  check(`uninstall unloaded it: ${removed.message}`, removed.unloaded === true);

  const state2 = await get("/api/market/state");
  check("state no longer lists the plugin", !state2.installed.some((entry) => entry.id === SUBJECT));
  check(`loader dropped market-${SUBJECT}`, !(state2.rows ?? []).includes(`market-${SUBJECT}`));
  check(`row removed from ${patchFile}`, !readSafely(patchFile).includes(`market-${SUBJECT}`));
  check("package directory removed", !existsSync(join(ROOT, "plugins", "@deepseek-ai", SUBJECT)));

  console.log("\nplugin market verify OK");
} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
  console.error(`\n${failure}`);
} finally {
  await ctx.fiber.dispose();
  process.exit(failure === "" ? 0 : 1);
}

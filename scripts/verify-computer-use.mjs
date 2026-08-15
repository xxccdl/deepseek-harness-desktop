// Headless verification: boot the web profile like src/main.js and assert the
// computer-use plugin provisions the Windows-MCP runtime, mounts the MCP client,
// and exposes mcp__windows__* tools + the computer-use skill. Not a product file.
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
  const tools = ctx.get("tools");
  const skills = ctx.get("skills");
  if (tools === undefined || skills === undefined) throw new Error("services missing");

  // Provisioning is async at init (rebuilds the venv), then the MCP client mounts
  // and registers mcp__windows__* tools. Poll until they appear.
  const deadline = Date.now() + 180_000;
  let windowsTools = [];
  while (Date.now() < deadline) {
    const visible = tools.view(undefined).visible;
    windowsTools = [...visible.keys()].filter((name) => name.startsWith("mcp__windows__"));
    if (windowsTools.length > 0) break;
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  if (windowsTools.length === 0) {
    throw new Error("mcp__windows__* tools never appeared within 180s");
  }
  console.log(`computer-use tools OK: ${windowsTools.length} mcp__windows__* tools`);
  console.log("  sample:", windowsTools.slice(0, 8).join(", "), ...(windowsTools.length > 8 ? ["…"] : []));

  // Skill + prompt section register right after the MCP client mounts; retry
  // briefly in case the catalog needs a moment to settle.
  let cuSkill;
  for (let i = 0; i < 10; i += 1) {
    const catalog = await skills.list();
    cuSkill = catalog.find((s) => s.name === "computer-use");
    if (cuSkill !== undefined) break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  if (cuSkill === undefined) throw new Error("skill 'computer-use' NOT in catalog");
  console.log("skill OK: computer-use");

  let section;
  for (let i = 0; i < 10; i += 1) {
    const assembly = await ctx.get("systemPrompt").assemble({});
    section = assembly.sections.find((s) => s.name === "computer-use:capability");
    if (section !== undefined && section.text.includes("Windows-MCP")) break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  if (section === undefined) throw new Error("prompt section 'computer-use:capability' missing");
  console.log("prompt section OK: computer-use:capability");

  console.log("ALL CHECKS PASSED");
} finally {
  await ctx.fiber.dispose();
}

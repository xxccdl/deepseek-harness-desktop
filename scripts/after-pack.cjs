// electron-builder `afterPack` hook.
//
// electron-builder packs node_modules by walking the production dependency
// closure declared in package.json. That walk ignores `peerDependencies` and
// knows nothing about the fork's own plugin packages (they live in
// plugins/@deepseek-ai and are never published to npm), so a plain
// `npm run dist` ships an installation whose profile cannot resolve
// `@deepseek-ai/dsh-jobs`, `dsh-settings` and the whole desktop plugin layer —
// boot then dies with "plugin tree failed to load".
//
// Two steps close the gap for the packed (installed) copy of the app:
//
//   1. copy every @deepseek-ai package the source tree has and the packed tree
//      lacks, so the installation carries the same plugin set the dev tree runs;
//   2. re-declare that set in the packed @deepseek-ai/dsh manifest. The boot
//      healer links the module fallback ($DSH_HOME/profiles/node_modules) from
//      exactly that closure, and that is what makes the profile's rows
//      resolvable on a machine that never ran scripts/install-plugins.mjs.
const { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const SCOPE = "@deepseek-ai";
/** The installed package whose manifest seeds the module-fallback closure. */
const ANCHOR = "dsh";

/** Absolute path of the packed app's unpacked node_modules/@deepseek-ai. */
function packedScope(appOutDir) {
  return join(appOutDir, "resources", "app.asar.unpacked", "node_modules", ...SCOPE.split("/"));
}

/** Read one package manifest, or undefined when it is not a package. */
function readManifest(dir) {
  try {
    return JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  } catch {
    return undefined;
  }
}

/** Directory names of the real packages inside one @deepseek-ai scope directory. */
function packageNames(scopeDir) {
  return readdirSync(scopeDir).filter((name) => {
    const stat = statSync(join(scopeDir, name), { throwIfNoEntry: false });
    return stat !== undefined && stat.isDirectory();
  });
}

exports.afterPack = async function afterPack(context) {
  const source = join(context.packager.projectDir, "node_modules", ...SCOPE.split("/"));
  if (!existsSync(source)) {
    console.warn("after-pack: node_modules/@deepseek-ai is missing — run scripts/install-plugins.mjs before packing");
    return;
  }

  const target = packedScope(context.appOutDir);
  mkdirSync(target, { recursive: true });

  const copied = [];
  for (const name of packageNames(source)) {
    const to = join(target, name);
    if (existsSync(to)) continue;
    // dereference: a `file:` dependency may be a symlink into plugins/, and the
    // installed app must carry the real directory, not a link out of the bundle.
    cpSync(join(source, name), to, { recursive: true, dereference: true });
    copied.push(name);
  }

  const anchorPath = join(target, ANCHOR, "package.json");
  const manifest = readManifest(join(target, ANCHOR));
  if (manifest === undefined) {
    console.warn(`after-pack: packed ${SCOPE}/${ANCHOR} manifest not found — module fallback left untouched`);
  } else {
    const dependencies = { ...manifest.dependencies };
    const declared = [];
    for (const name of packageNames(target)) {
      const specifier = `${SCOPE}/${name}`;
      if (dependencies[specifier] !== undefined) continue;
      const version = readManifest(join(target, name))?.version ?? "0.0.0";
      dependencies[specifier] = version;
      declared.push(specifier);
    }
    if (declared.length !== 0) {
      writeFileSync(anchorPath, `${JSON.stringify({ ...manifest, dependencies }, undefined, 2)}\n`);
    }
    console.log(`after-pack: added ${String(copied.length)} missing ${SCOPE} package(s), declared ${String(declared.length)} for the module fallback`);
  }
};

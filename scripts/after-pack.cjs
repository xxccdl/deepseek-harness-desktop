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
//
// A third step prunes the packed tree. The dependency closure lands in the
// installer as ~25,000 small files — source maps, TypeScript sources, `.d.ts`
// type surfaces, readmes, licenses, test folders, and eight identical nested
// copies of zod carried in from the plugin source trees. The installer pays
// for every one of them (NTFS file creation plus the antivirus scan that runs
// per file), which is what turns an install into an hour of waiting. Nothing
// the runtime imports is touched: only files that are build input or type
// surface, and nested copies whose version the root copy already satisfies.
const { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } = require("node:fs");
const { dirname, join } = require("node:path");

const SCOPE = "@deepseek-ai";
/** The installed package whose manifest seeds the module-fallback closure. */
const ANCHOR = "dsh";

/**
 * Absolute path of the packed app's node_modules/@deepseek-ai.
 *
 * Packed with an asar the tree lives beside it (`app.asar.unpacked`, kept
 * unpacked so the harness can junction real directories); packed without one
 * (`asar: false`) it is the app directory itself.
 */
function packedScope(appOutDir) {
  const resources = join(appOutDir, "resources");
  const root = existsSync(join(resources, "app.asar")) ? join(resources, "app.asar.unpacked") : join(resources, "app");
  return join(root, "node_modules", ...SCOPE.split("/"));
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

/** File extensions that are build input or type surface — never read at runtime. */
const PRUNE_EXTENSIONS = new Set([".map", ".md", ".ts", ".mts", ".cts"]);
/** Directory names that only carry tests or CI metadata. */
const PRUNE_DIRS = new Set(["test", "tests", "__tests__", ".github"]);

/**
 * Whether a file name is licensing or documentation prose.
 * @param name - the bare file name.
 */
function isDocName(name) {
  return /^(readme|license|licence|changelog|changes|copying|notice|contributing|authors|security)(\.|$)/i.test(name);
}

/**
 * Delete prunable files under `dir`, counting what went.
 * @param dir - directory to walk.
 * @param counters - `{ files, bytes }` accumulated in place.
 */
function pruneTree(dir, counters) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path, { throwIfNoEntry: false });
    if (stat === undefined) continue;
    if (stat.isDirectory()) {
      if (!PRUNE_DIRS.has(name)) pruneTree(path, counters);
      else rmSync(path, { recursive: true, force: true });
      continue;
    }
    const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
    if (PRUNE_EXTENSIONS.has(ext) || isDocName(name)) {
      rmSync(path, { force: true });
      counters.files += 1;
      counters.bytes += stat.size;
    }
  }
  // Drop directories the pruning emptied (a stripped `@types` package, say).
  if (readdirSync(dir).length === 0 && dir.includes("node_modules")) {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Remove nested dependency copies the root `node_modules` already satisfies.
 *
 * The plugin source trees each carry their own `node_modules` (an `npm install`
 * run beside the package), and `cpSync` above brings them along: eight copies
 * of zod, a copy of fflate, and so on. A nested copy is dropped only when it is
 * the same version the root holds, or when the consumer pins exactly the root
 * version — a nested copy the root cannot satisfy (a different major, say) is
 * kept, because resolution would otherwise hand the consumer the wrong module.
 * @param nodeModules - the packed root `node_modules`.
 * @param counters - `{ files, bytes }` accumulated in place.
 */
function pruneNestedDeps(nodeModules, counters) {
  const rootVersion = (name) => readManifest(join(nodeModules, ...name.split("/")))?.version;
  const packages = [];
  for (const name of readdirSync(nodeModules)) {
    if (name === ".bin") continue;
    const dir = join(nodeModules, name);
    if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) continue;
    if (name.startsWith("@")) {
      for (const child of readdirSync(dir)) {
        if (statSync(join(dir, child), { throwIfNoEntry: false })?.isDirectory()) {
          packages.push({ name: `${name}/${child}`, dir: join(dir, child) });
        }
      }
    } else {
      packages.push({ name, dir });
    }
  }
  for (const pkg of packages) {
    const nested = join(pkg.dir, "node_modules");
    if (!existsSync(nested)) continue;
    const manifest = readManifest(pkg.dir);
    for (const name of readdirSync(nested)) {
      const scoped = name.startsWith("@")
        ? readdirSync(join(nested, name)).map((child) => `${name}/${child}`)
        : [name];
      for (const dep of scoped) {
        const depDir = join(nested, ...dep.split("/"));
        const nestedVersion = readManifest(depDir)?.version;
        const held = rootVersion(dep);
        if (nestedVersion === undefined || held === undefined) continue;
        const pinned = manifest?.dependencies?.[dep];
        const rootSatisfies =
          nestedVersion === held || (typeof pinned === "string" && /^\d/.test(pinned) && pinned === held);
        if (!rootSatisfies) continue;
        const count = { files: 0, bytes: 0 };
        const stack = [depDir];
        while (stack.length !== 0) {
          for (const entry of readdirSync(stack.pop())) {
            const path = join(depDir, entry);
            const stat = statSync(path, { throwIfNoEntry: false });
            if (stat === undefined) continue;
            if (stat.isDirectory()) stack.push(path);
            else {
              count.files += 1;
              count.bytes += stat.size;
            }
          }
        }
        rmSync(depDir, { recursive: true, force: true });
        counters.files += count.files;
        counters.bytes += count.bytes;
      }
    }
    // Clean away the `node_modules` shells the removals emptied.
    rmSync(join(nested, ".bin"), { recursive: true, force: true });
    if (readdirSync(nested).length === 0) rmSync(nested, { recursive: true, force: true });
  }
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

  // Prune what the installer must never carry: build input, type surface and
  // duplicated nested dependencies. Runs over the whole packed node_modules —
  // the dependency closure outside the scope is most of the file count.
  const nodeModules = dirname(target);
  const pruned = { files: 0, bytes: 0 };
  pruneNestedDeps(nodeModules, pruned);
  pruneTree(nodeModules, pruned);
  console.log(
    `after-pack: pruned ${String(pruned.files)} file(s), ${(pruned.bytes / 1048576).toFixed(0)}MB of build input and duplicates`
  );
};

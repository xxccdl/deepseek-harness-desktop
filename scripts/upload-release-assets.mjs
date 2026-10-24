// Build the desktop installers and publish them to a GitHub release.
//
// Usage:
//   node scripts/upload-release-assets.mjs <tag> --build            # build, then upload
//   node scripts/upload-release-assets.mjs <tag> <file...>          # upload only
//
// The token is the one git already stores (same credential the push used).
//
// `--build` runs electron-builder before the upload. Two build-machine quirks
// are handled here rather than on the command line:
//   - the Electron distribution is taken from node_modules/electron/dist, so
//     the build never reaches out to github.com for the runtime;
//   - TEMP/TMP point into the repo, because the 32-bit NSIS compiler maps a
//     ~254 MB file in the temp directory and the system drive does not always
//     have that much room.
// NODE_OPTIONS=--use-system-ca is required for the API calls: this Node only
// ships the builtin root certificates and every GitHub request fails with
// "unable to verify the first certificate" without it.
import { execSync, spawnSync } from "node:child_process";
import { createReadStream, mkdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const owner = "xxccdl";
const repo = "deepseek-harness-desktop";
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
const tag = args[0] ?? "v1.3.0";
const shouldBuild = args.includes("--build");
const files = args.slice(1).filter((a) => !a.startsWith("--"));

if (files.length === 0 && !shouldBuild) {
  console.error("usage: node scripts/upload-release-assets.mjs <tag> [--build] <file...>");
  process.exit(1);
}

// Resolve the token from git credential manager without printing it.
const cred = execSync(`git credential fill`, {
  input: "protocol=https\nhost=github.com\n\n",
  encoding: "utf8"
});
const tokenLine = cred.split(/\r?\n/).find((l) => l.startsWith("password="));
if (!tokenLine) {
  console.error("no github credential found");
  process.exit(1);
}
const token = tokenLine.slice("password=".length);

const headers = {
  "Authorization": `Bearer ${token}`,
  "Accept": "application/vnd.github+json",
  "User-Agent": "dsh-desktop-release-script"
};

/**
 * Build the Windows installers with electron-builder.
 * @returns {string[]} the artifacts produced, in upload order.
 */
function build() {
  const tmp = resolve(repoRoot, ".build-tmp");
  mkdirSync(tmp, { recursive: true });
  const electronDist = resolve(repoRoot, "node_modules", "electron", "dist");
  const cli = resolve(repoRoot, "node_modules", "electron-builder", "out", "cli", "cli.js");
  const env = {
    ...process.env,
    NODE_OPTIONS: [process.env.NODE_OPTIONS, "--use-system-ca"].filter(Boolean).join(" "),
    TEMP: tmp,
    TMP: tmp
  };
  console.log("building windows installers...");
  const result = spawnSync(
    process.execPath,
    [cli, "--win", "--publish", "never", `--config.electronDist=${electronDist}`],
    { cwd: repoRoot, env, stdio: "inherit" }
  );
  if (result.status !== 0) {
    console.error(`build failed with exit code ${result.status ?? "null"}`);
    process.exit(result.status ?? 1);
  }
  const version = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8")).version;
  const setup = resolve(repoRoot, "dist", `DeepSeek Harness Setup ${version}.exe`);
  const portable = resolve(repoRoot, "dist", `DeepSeek Harness ${version}.exe`);
  const produced = [setup, portable].filter((f) => {
    try {
      statSync(f);
      return true;
    } catch {
      return false;
    }
  });
  if (produced.length === 0) {
    console.error("build produced no installer in dist/");
    process.exit(1);
  }
  return produced;
}

const uploadFiles = shouldBuild ? build() : files.map((f) => resolve(f));

// Look up the release by tag to get its id; create it when the tag has none.
let release = await fetch(
  `https://api.github.com/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(tag)}`,
  { headers }
).then(async (res) => (res.ok ? await res.json() : undefined));

if (release === undefined) {
  console.log(`release ${tag} not found — creating it`);
  const created = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      tag_name: tag,
      name: `DeepSeek Harness Desktop ${tag.replace(/^v/, "")}`,
      body: [
        "## 1.10.2",
        "",
        "本次把 fork 重基到上游 **dsh 0.2.1-rc.3**，并补上桌面端的几处改动。",
        "- **重基：dsh 0.2.1-rc.2 → 0.2.1-rc.3**。上游这一版带来插件包解析的新组合方式、更多内置插件与设置项。fork 相对 rc.2 的 24 个上游包改动用三方合并逐个套回 rc.3（基线 rc.2），只有两处重叠需要手工解决：侧栏的 CSS 单行块与 DeepSeek 模型目录名。fork 自有的 43 个包原样保留，版本钉到 rc.3",
        "- **标题栏新增 Windows 风格菜单栏**（「应用」「编辑」等），入口不再只能从设置面板里找",
        "- **界面打磨**：首次使用引导、思考强度滑块、可读性与标题栏的适配",
        "- **新增通勤回收站页面**（`src/commute.html`，随安装包一起带上）",
        "",
        "升级安装前请先退出正在运行的 DeepSeek Harness。"
      ].join("\n"),
      draft: false,
      prerelease: false
    })
  });
  if (!created.ok) {
    console.error(`release creation failed: HTTP ${created.status}`, await created.text());
    process.exit(1);
  }
  release = await created.json();
}
console.log(`release: ${release.html_url} (id=${release.id})`);

for (const file of uploadFiles) {
  const abs = resolve(file);
  const name = basename(abs);
  const size = statSync(abs).size;
  console.log(`uploading ${name} (${(size / 1024 / 1024).toFixed(1)} MB)...`);

  const url =
    `https://uploads.github.com/repos/${owner}/${repo}/releases/${release.id}/assets` +
    `?name=${encodeURIComponent(name)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/octet-stream",
      "Content-Length": String(size)
    },
    body: createReadStream(abs),
    duplex: "half"
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`upload failed for ${name}: HTTP ${res.status}`, text);
    process.exit(1);
  }
  const asset = await res.json();
  console.log(`uploaded: ${asset.browser_download_url}`);
}

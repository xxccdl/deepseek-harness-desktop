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
// The system trust store is merged in at startup (see below): this Node only
// ships the builtin root certificates, so GitHub requests fail with
// "unable to verify the first certificate" otherwise.
import { execSync, spawnSync } from "node:child_process";
import { createReadStream, mkdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tls from "node:tls";

const owner = "xxccdl";
const repo = "deepseek-harness-desktop";
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// This Node only ships the builtin root certificates, so every GitHub request
// fails with "unable to verify the first certificate" unless the system trust
// store is merged in. NODE_OPTIONS=--use-system-ca has to be set before the
// process starts — assigning it here is too late for this process's own fetch —
// so the stores are merged at runtime instead, the same way src/main.js does.
if (typeof tls.getCACertificates === "function" && typeof tls.setDefaultCACertificates === "function") {
  try {
    tls.setDefaultCACertificates([...tls.getCACertificates("bundled"), ...tls.getCACertificates("system")]);
  } catch {
    // Leave Node's default store in force; the fetch will fail loudly.
  }
}

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
        "## 1.10.3",
        "",
        "- **安装速度大幅提升**：安装包里的文件数从 25,132 降到 12,256。打包时会剥掉运行时从不读取的 source map、TypeScript 源码与类型声明、README/许可证，以及插件目录里重复的嵌套依赖（8 份 zod）。写入磁盘的文件少了一半，杀软逐文件扫描的等待也随之少了一半",
        "- **新增 FixerMode**：插件加载失败时自动进入修复页面（Win11 首次开机风格：居中提示、流光「请稍后」、底部进度条），由 **deepseek-flash** 自动定位并修复损坏的插件",
        "- **API Key 缺失时自动接管**：检测到没有可用的 DeepSeek API Key 时弹出填写界面，保存后继续修复，无需手动重启",
        "- **修复完成自动重启进入应用**；修不好则自动停用该插件并回退到可用状态，同一插件最多自动修复 2 次，不会反复卡住启动",
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

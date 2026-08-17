// Upload release assets to an existing GitHub release using the token
// resolved from git's credential store (same credential the push used).
import { execSync } from "node:child_process";
import { createReadStream, statSync } from "node:fs";
import { basename, resolve } from "node:path";

const owner = "xxccdl";
const repo = "deepseek-harness-desktop";
const tag = process.argv[2] ?? "v1.3.0";
const files = process.argv.slice(3);

if (files.length === 0) {
  console.error("usage: node scripts/upload-release-assets.mjs <tag> <file...>");
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

// Look up the release by tag to get its id.
const relRes = await fetch(
  `https://api.github.com/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(tag)}`,
  { headers }
);
if (!relRes.ok) {
  const text = await relRes.text();
  console.error(`release lookup failed: HTTP ${relRes.status}`, text);
  process.exit(1);
}
const release = await relRes.json();
console.log(`release found: ${release.html_url} (id=${release.id})`);

for (const file of files) {
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

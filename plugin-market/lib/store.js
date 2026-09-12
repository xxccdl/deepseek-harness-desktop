// Catalogue and package storage for the DSH plugin market.
//
// One JSON record per plugin under `data/plugins/<id>.json`, one archive per
// version under `data/packages/<id>/<version>.tgz`. No database, no
// dependencies: the whole shop is files, so it can be copied, backed up or
// rsynced while it serves.
//
// Every publish runs the same gate the client-side installer relies on: archive
// safety, a package.json with a real entry file, no runtime dependencies, and a
// syntax check of every shipped script.
import { createHash, randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync, renameSync } from "node:fs";
import { execFile } from "node:child_process";
import { join } from "node:path";
import { promisify } from "node:util";
import { MAX_FILE_BYTES, TarError, packTarGz, stripRoot, unpackTarGz } from "./tar.js";

const run = promisify(execFile);

/** Packages whose names belong to the harness itself. */
const RESERVED = new Set(["dsh-base", "dsh-web-app", "dsh", "dsh-app-boot", "dsh-agent-presets", "plugin-market", "dsh-plugin-market"]);
/** Categories the market suggests; publishers may pick their own. */
export const SUGGESTED_CATEGORIES = ["开发工具", "效率提升", "内容创作", "数据分析", "界面美化", "研究调研", "自动化", "教育学习", "其他"];
/** Kinds a package may declare. */
const KINDS = new Set(["plugin", "skill"]);
/** Script extensions we syntax-check before accepting a package. */
const CHECK_EXTENSIONS = [".js", ".mjs", ".cjs"];
/** Largest upload we accept on the wire. */
export const MAX_UPLOAD_BYTES = 24 * 1024 * 1024;

/** Thrown when a publish is refused; the message reaches the publisher verbatim. */
export class PublishError extends Error {}

/** Read and validate the slug a package will be installed under. */
export function slugOf(rawName) {
  const text = String(rawName ?? "").trim();
  if (text === "") throw new PublishError("package.json 缺少 name");
  const tail = text.includes("/") ? text.slice(text.lastIndexOf("/") + 1) : text;
  const slug = tail.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^[-._]+|[-._]+$/g, "");
  if (slug === "" || slug.length > 64) throw new PublishError(`插件名不合法：${text}`);
  if (RESERVED.has(slug)) throw new PublishError(`插件名 ${slug} 属于 DeepSeek Harness 自身，请改名`);
  return slug;
}

/**
 * Compare two `x.y.z[-pre]` versions — semver enough to order a history:
 * numeric on the triple, a release above any prerelease of it, then the
 * prerelease text. A history ordered by "when it was uploaded" would put a
 * late fix of an old line above the current release, which is exactly the
 * order a reader cannot use.
 */
function compareVersions(a, b) {
  const split = (value) => {
    const [core, pre = ""] = String(value).split("-", 2);
    return { parts: core.split(".").map((part) => Number(part) || 0), pre };
  };
  const left = split(a);
  const right = split(b);
  for (let index = 0; index < 3; index += 1) {
    const diff = (left.parts[index] ?? 0) - (right.parts[index] ?? 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  if (left.pre === right.pre) return 0;
  if (left.pre === "") return 1;
  if (right.pre === "") return -1;
  return left.pre.localeCompare(right.pre);
}

/**
 * The version to publish when the package itself names none — a first release,
 * or the next patch after whatever is already on the shelf.
 *
 * A skill has no version of its own (its identity is the frontmatter name), and
 * making an author invent one for every wording fix is how "publish the skill
 * again" turns into a puzzle. Plugin archives always declare a version, so this
 * never overrides one.
 */
function suggestedVersion(record) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(record?.latest ?? ""));
  return match === null ? "1.0.0" : `${match[1]}.${match[2]}.${Number(match[3]) + 1}`;
}

/** Store on disk, with a small in-memory catalogue cache. */
export class MarketStore {
  constructor(root) {
    this.root = root;
    this.pluginDir = join(root, "plugins");
    this.packageDir = join(root, "packages");
    this.tmpDir = join(root, "tmp");
    this.cache = null;
    for (const dir of [this.pluginDir, this.packageDir, this.tmpDir]) mkdirSync(dir, { recursive: true });
  }

  /** Every plugin record, keyed by id; re-read when the directory changes. */
  all() {
    const files = readdirSync(this.pluginDir).filter((name) => name.endsWith(".json"));
    const stamp = files.length + ":" + files.map((name) => name).sort().join(",");
    if (this.cache !== null && this.cache.stamp === stamp) return this.cache.records;
    const records = new Map();
    for (const file of files) {
      try {
        const record = JSON.parse(readFileSync(join(this.pluginDir, file), "utf8"));
        if (typeof record?.id === "string") records.set(record.id, record);
      } catch {
        // A corrupt record must not take the shop down.
      }
    }
    this.cache = { stamp, records };
    return records;
  }

  /** One record, or undefined. */
  get(id) {
    return this.all().get(String(id ?? ""));
  }

  /** Write a record atomically and refresh the cache. */
  save(record) {
    const path = join(this.pluginDir, `${record.id}.json`);
    const scratch = `${path}.tmp`;
    writeFileSync(scratch, JSON.stringify(record, null, 2));
    renameSync(scratch, path);
    this.cache = null;
    return record;
  }

  /**
   * Public shape of a record: the publish token never leaves the server.
   *
   * The version history travels only when asked for. It is public — a reader
   * needs it to install an older release on purpose — but a catalogue of forty
   * plugins should not carry forty histories just to render forty version
   * numbers.
   * @param record - the stored record.
   * @param options - `{ history }` — include the full version list.
   */
  summary(record, { history = false } = {}) {
    const { token, versions, ...rest } = record;
    const list = Array.isArray(versions) ? versions : [];
    const latest = list.find((entry) => entry.version === record.latest);
    return {
      ...rest,
      version: record.latest,
      versionCount: list.length,
      size: latest?.size ?? 0,
      ...(history ? { versions: [...list].sort((a, b) => compareVersions(b.version, a.version)) } : {})
    };
  }

  /** Filtered, sorted catalogue listing plus the category tally. */
  list({ q = "", category = "", kind = "", sort = "featured" } = {}) {
    const needle = String(q).trim().toLowerCase();
    const records = [...this.all().values()];
    const tally = new Map();
    for (const record of records) {
      const key = record.category ?? "其他";
      tally.set(key, (tally.get(key) ?? 0) + 1);
    }
    const matched = records.filter((record) => {
      if (category !== "" && (record.category ?? "其他") !== category) return false;
      if (kind !== "" && (record.kind ?? "plugin") !== kind) return false;
      if (needle === "") return true;
      const haystack = [record.id, record.title, record.summary, record.author, ...(record.tags ?? [])].join(" ").toLowerCase();
      return haystack.includes(needle);
    });
    const weight = (record) => (sort === "downloads" ? record.downloads ?? 0 : sort === "recent" ? Date.parse(record.updatedAt ?? 0) : record.featured === true ? 1 : 0);
    matched.sort((a, b) => weight(b) - weight(a) || String(a.title ?? a.id).localeCompare(String(b.title ?? b.id), "zh-Hans-CN"));
    return {
      plugins: matched.map((record) => this.summary(record)),
      categories: [...tally.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-Hans-CN")),
      total: records.length
    };
  }

  /** Archive bytes for one version. */
  archive(id, version) {
    const record = this.get(id);
    if (record === undefined) throw new PublishError(`没有这个插件：${id}`);
    const wanted = version === "" ? record.latest : version;
    const entry = (record.versions ?? []).find((item) => item.version === wanted);
    if (entry === undefined) throw new PublishError(`没有这个版本：${id}@${wanted}`);
    const path = join(this.packageDir, record.id, `${wanted}.tgz`);
    if (!existsSync(path)) throw new PublishError(`包文件缺失：${id}@${wanted}`);
    return { record, entry, buffer: readFileSync(path) };
  }

  /** Count a download. */
  downloaded(id) {
    const record = this.get(id);
    if (record === undefined) return;
    record.downloads = (record.downloads ?? 0) + 1;
    this.save(record);
  }

  /** Remove a plugin and its archives. */
  remove(id) {
    const record = this.get(id);
    if (record === undefined) throw new PublishError(`没有这个插件：${id}`);
    rmSync(join(this.packageDir, record.id), { recursive: true, force: true });
    rmSync(join(this.pluginDir, `${record.id}.json`), { force: true });
    this.cache = null;
    return record;
  }

  /**
   * Validate and store one published archive.
   * @param input - `{ buffer, meta, token }` — the tar.gz, metadata overrides, and the publisher's token.
   * @returns the stored record.
   */
  async publish({ buffer, meta = {}, token = "" }) {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) throw new PublishError("请求体为空");
    if (buffer.length > MAX_UPLOAD_BYTES) throw new PublishError(`上传体积超过上限（${MAX_UPLOAD_BYTES} 字节）`);
    let files;
    try {
      files = stripRoot(unpackTarGz(buffer).files);
    } catch (error) {
      throw new PublishError(error instanceof TarError ? error.message : `无法读取压缩包：${String(error)}`);
    }
    const rawManifest = files.get("package.json");
    let manifest;
    if (rawManifest === undefined) {
      // A skill is a directory with a SKILL.md, not an npm package. Its manifest
      // is synthesised below so the stored record, the archive and the installer
      // still agree on one identity and one version.
      manifest = {};
    } else {
      try {
        manifest = JSON.parse(rawManifest.toString("utf8"));
      } catch (error) {
        throw new PublishError(`package.json 不是合法 JSON：${String(error)}`);
      }
      if (typeof manifest !== "object" || manifest === null || Array.isArray(manifest)) throw new PublishError("package.json 必须是对象");
    }

    const marketJson = readMarketJson(files);
    const merged = { ...marketJson, ...meta };
    const kind = KINDS.has(merged.kind) ? merged.kind : text(manifest.dsh?.market?.kind) === "skill" ? "skill" : "plugin";
    // A skill is named by its own frontmatter (that name is what the harness
    // loads it under), a plugin by its package name.
    const skill = kind === "skill" ? readSkill(files) : undefined;
    const id = slugOf(skill === undefined ? text(manifest.name) ?? text(merged.name) : skill.name);
    const existing = this.get(id);
    // Captured before the record is mutated below: a publish that reuses the
    // stored record would otherwise report the version it just wrote as the one
    // it replaced.
    const previousVersion = typeof existing?.latest === "string" ? existing.latest : "";
    const declaredVersion = String(manifest.version ?? merged.version ?? "").trim();
    const version = declaredVersion === "" ? suggestedVersion(existing) : declaredVersion;
    if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) throw new PublishError(`version 必须是 x.y.z：${version || "（空）"}`);
    for (const field of ["dependencies", "devDependencies", "optionalDependencies", "bundledDependencies"]) {
      const declared = manifest[field];
      if (declared !== undefined && typeof declared === "object" && Object.keys(declared).length > 0) {
        throw new PublishError(`插件市场不支持需要 npm 安装的依赖（package.json 里的 ${field}），请把依赖代码一起打包`);
      }
    }
    let entry;
    if (skill !== undefined) {
      // A skill ships Markdown and assets; it has no entry script to check, but
      // any script it does ship must still parse.
      entry = skill.entry;
      await this.checkSyntax(files, id, { requireScripts: false });
    } else {
      const entryField = typeof manifest.exports?.["."] === "string" ? manifest.exports["."] : typeof manifest.main === "string" ? manifest.main : "lib/index.js";
      entry = entryField.replace(/^\.\//, "");
      if (files.get(entry) === undefined) throw new PublishError(`入口文件不存在：${entry}`);
      await this.checkSyntax(files, id);
    }

    // A package is fetched once and installed under `@deepseek-ai/<id>`, so the
    // name is rewritten to that scope here rather than at install time.
    const packageName = `@deepseek-ai/${id}`;
    manifest.name = packageName;
    manifest.version = version;
    if (manifest.description === undefined && skill !== undefined) manifest.description = skill.description;
    files.set("package.json", Buffer.from(JSON.stringify(manifest, null, 2) + "\n", "utf8"));

    if (existing !== undefined) {
      if (typeof existing.token === "string" && existing.token !== "" && existing.token !== token) {
        throw new PublishError(`${id} 已存在，更新需要发布令牌（发布工具会自动携带）`);
      }
      if ((existing.versions ?? []).some((item) => item.version === version)) {
        throw new PublishError(`${id}@${version} 已发布过，请提升 version`);
      }
    }

    const archive = packTarGz([...files.entries()].map(([name, data]) => ({ name, data })));
    const sha256 = createHash("sha256").update(archive).digest("hex");
    const readme = files.get("README.md")?.toString("utf8") ?? files.get("readme.md")?.toString("utf8") ?? "";
    const now = new Date().toISOString();
    const record = existing ?? {
      id,
      token: token === "" ? randomBytes(16).toString("hex") : token,
      createdAt: now,
      downloads: 0,
      featured: false,
      versions: []
    };
    record.packageName = packageName;
    record.title = text(merged.title) ?? text(manifest.dsh?.market?.title) ?? (skill === undefined ? id : skill.name);
    record.summary = text(merged.summary) ?? text(manifest.description) ?? skill?.description ?? "";
    record.description = text(merged.description) ?? text(merged.summary) ?? text(manifest.description) ?? skill?.description ?? "";
    record.category = text(merged.category) ?? "其他";
    record.kind = kind;
    record.tags = Array.isArray(merged.tags) ? merged.tags.filter((tag) => typeof tag === "string").slice(0, 12) : [];
    record.author = text(merged.author) ?? text(manifest.author) ?? "匿名作者";
    record.homepage = text(merged.homepage) ?? text(manifest.homepage) ?? "";
    record.icon = text(merged.icon) ?? (kind === "skill" ? "◇" : "🧩");
    record.latest = version;
    record.updatedAt = now;
    record.readme = text(merged.readme) ?? readme;
    record.versions = [...(record.versions ?? []), {
      version,
      size: archive.length,
      sha256,
      publishedAt: now,
      note: text(merged.note) ?? "",
      entry,
      files: files.size
    }];

    const dir = join(this.packageDir, id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${version}.tgz`), archive);
    this.save(record);
    return { record, created: existing === undefined, token: record.token, previousVersion };
  }

  /**
   * `node --check` every shipped script so a bad package never reaches a client.
   *
   * Each script is checked as ESM (copied to `.mjs`): that is the stricter
   * grammar, it needs no package context, and — unlike checking a bare `.js`
   * file, which Node happily parses as CommonJS and can accept things that are
   * not valid modules — it actually fails on broken code.
   */
  async checkSyntax(files, id, { requireScripts = true } = {}) {
    const scripts = [...files.keys()].filter((name) => CHECK_EXTENSIONS.includes(name.slice(name.lastIndexOf("."))));
    if (scripts.length === 0) {
      // A skill ships Markdown and assets, so having no script is not a defect;
      // a plugin with no script is one.
      if (requireScripts) throw new PublishError("压缩包里没有可执行的 .js 文件");
      return;
    }
    if (scripts.length > 64) throw new PublishError(`脚本文件过多（${scripts.length}，上限 64）`);
    for (const name of scripts) {
      if (files.get(name).length > MAX_FILE_BYTES) throw new PublishError(`脚本过大：${name}`);
    }
    const scratch = join(this.tmpDir, `check-${id}-${Date.now()}`);
    mkdirSync(scratch, { recursive: true });
    try {
      const targets = scripts.map((name, index) => {
        const target = join(scratch, `${String(index).padStart(3, "0")}.mjs`);
        writeFileSync(target, files.get(name));
        return { name, target };
      });
      // Four workers: enough to hide process spawn cost, few enough to stay
      // polite on a small VPS.
      const queue = [...targets];
      const worker = async () => {
        for (;;) {
          const item = queue.shift();
          if (item === undefined) return;
          try {
            await run(process.execPath, ["--check", item.target], { timeout: 20000 });
          } catch (error) {
            const raw = String(error?.stderr ?? error?.message ?? error).split("\n").map((line) => line.trim()).filter((line) => line !== "").slice(0, 3).join(" ");
            const detail = raw.replaceAll(item.target, item.name);
            throw new PublishError(`语法检查未通过：${item.name} — ${detail}`);
          }
        }
      };
      await Promise.all([worker(), worker(), worker(), worker()]);
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  }
}

/** Optional `market.json` shipped inside the package. */
function readMarketJson(files) {
  const bytes = files.get("market.json");
  if (bytes === undefined) return {};
  try {
    const parsed = JSON.parse(bytes.toString("utf8"));
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Read and check the SKILL.md a skill package must carry.
 *
 * The harness silently ignores a skill file whose frontmatter is missing a name
 * or a description, and its name is what the skill is later loaded under — so
 * both are gated here. Accepting one without them would publish something that
 * installs cleanly and then never appears.
 * @param files - the package's file map.
 * @returns `{ entry, name, description }`.
 */
function readSkill(files) {
  const entry = files.has("SKILL.md")
    ? "SKILL.md"
    : [...files.keys()].find((name) => name.endsWith("/SKILL.md"));
  if (entry === undefined) throw new PublishError("技能包根目录缺少 SKILL.md");
  const front = readFrontmatter(files.get(entry).toString("utf8"));
  if (front === undefined) throw new PublishError("SKILL.md 缺少 YAML frontmatter（文件开头用 --- 包住的头部）");
  const name = text(front.name);
  const description = text(front.description);
  if (name === undefined) throw new PublishError("SKILL.md 的 frontmatter 缺少 name");
  if (description === undefined) throw new PublishError("SKILL.md 的 frontmatter 缺少 description");
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(name)) throw new PublishError(`技能名不合法：${name}（小写字母、数字、连字符，不能有下划线或空格）`);
  return { entry, name, description };
}

/** The scalar fields of a Markdown file's YAML frontmatter.
 *
 * The market is dependency-free and the fields it must check are always plain
 * scalars, so this reads `key: value` lines between the fences and stops there;
 * nested blocks (metadata:) are simply not needed here.
 */
function readFrontmatter(raw) {
  const lines = String(raw).replace(/\r\n/g, "\n").split("\n");
  if (lines[0]?.trim() !== "---") return undefined;
  const data = {};
  for (const line of lines.slice(1)) {
    if (line.trim() === "---") return data;
    const match = /^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/.exec(line);
    if (match === null) continue;
    const value = match[2].trim().replace(/^(["'])(.*)\1$/, "$2");
    if (value !== "") data[match[1]] = value;
  }
  return undefined;
}

/** Trimmed non-empty string, or undefined. */
function text(value) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

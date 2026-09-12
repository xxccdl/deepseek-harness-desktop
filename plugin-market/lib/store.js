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

  /** Public shape of a record: the publish token never leaves the server. */
  summary(record) {
    const { token, versions, ...rest } = record;
    return {
      ...rest,
      version: record.latest,
      versionCount: Array.isArray(versions) ? versions.length : 0,
      size: Array.isArray(versions) ? versions.find((entry) => entry.version === record.latest)?.size ?? 0 : 0
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
    const manifestBytes = files.get("package.json");
    if (manifestBytes === undefined) throw new PublishError("压缩包根目录缺少 package.json");
    let manifest;
    try {
      manifest = JSON.parse(manifestBytes.toString("utf8"));
    } catch (error) {
      throw new PublishError(`package.json 不是合法 JSON：${String(error)}`);
    }
    if (typeof manifest !== "object" || manifest === null || Array.isArray(manifest)) throw new PublishError("package.json 必须是对象");
    const id = slugOf(manifest.name);
    const version = String(manifest.version ?? "").trim();
    if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) throw new PublishError(`package.json 的 version 必须是 x.y.z：${version || "（空）"}`);
    for (const field of ["dependencies", "devDependencies", "optionalDependencies", "bundledDependencies"]) {
      const declared = manifest[field];
      if (declared !== undefined && typeof declared === "object" && Object.keys(declared).length > 0) {
        throw new PublishError(`插件市场不支持需要 npm 安装的依赖（package.json 里的 ${field}），请把依赖代码一起打包`);
      }
    }
    const entryField = typeof manifest.exports?.["."] === "string" ? manifest.exports["."] : typeof manifest.main === "string" ? manifest.main : "lib/index.js";
    const entry = entryField.replace(/^\.\//, "");
    if (files.get(entry) === undefined) throw new PublishError(`入口文件不存在：${entry}`);
    await this.checkSyntax(files, id);

    // A package is fetched once and installed as `plugins/@deepseek-ai/<id>`, so
    // the name is rewritten to that scope here rather than at install time.
    const packageName = `@deepseek-ai/${id}`;
    if (manifest.name !== packageName) {
      manifest.name = packageName;
      files.set("package.json", Buffer.from(JSON.stringify(manifest, null, 2) + "\n", "utf8"));
    }

    const existing = this.get(id);
    if (existing !== undefined) {
      if (typeof existing.token === "string" && existing.token !== "" && existing.token !== token) {
        throw new PublishError(`插件 ${id} 已存在，更新需要发布令牌（安装 dsh 后由发布工具自动携带）`);
      }
      if ((existing.versions ?? []).some((item) => item.version === version)) {
        throw new PublishError(`${id}@${version} 已发布过，请提升 version`);
      }
    }

    const archive = packTarGz([...files.entries()].map(([name, data]) => ({ name, data })));
    const sha256 = createHash("sha256").update(archive).digest("hex");
    const marketJson = readMarketJson(files);
    const merged = { ...marketJson, ...meta };
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
    record.title = text(merged.title) ?? text(manifest.dsh?.market?.title) ?? id;
    record.summary = text(merged.summary) ?? text(manifest.description) ?? "";
    record.description = text(merged.description) ?? text(merged.summary) ?? text(manifest.description) ?? "";
    record.category = text(merged.category) ?? "其他";
    record.kind = KINDS.has(merged.kind) ? merged.kind : text(manifest.dsh?.market?.kind) === "skill" ? "skill" : "plugin";
    record.tags = Array.isArray(merged.tags) ? merged.tags.filter((tag) => typeof tag === "string").slice(0, 12) : [];
    record.author = text(merged.author) ?? text(manifest.author) ?? "匿名作者";
    record.homepage = text(merged.homepage) ?? text(manifest.homepage) ?? "";
    record.icon = text(merged.icon) ?? "🧩";
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
    return { record, created: existing === undefined, token: record.token };
  }

  /**
   * `node --check` every shipped script so a bad package never reaches a client.
   *
   * Each script is checked as ESM (copied to `.mjs`): that is the stricter
   * grammar, it needs no package context, and — unlike checking a bare `.js`
   * file, which Node happily parses as CommonJS and can accept things that are
   * not valid modules — it actually fails on broken code.
   */
  async checkSyntax(files, id) {
    const scripts = [...files.keys()].filter((name) => CHECK_EXTENSIONS.includes(name.slice(name.lastIndexOf("."))));
    if (scripts.length === 0) throw new PublishError("压缩包里没有可执行的 .js 文件");
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

/** Trimmed non-empty string, or undefined. */
function text(value) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

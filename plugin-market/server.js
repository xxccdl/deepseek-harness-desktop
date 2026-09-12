// DeepSeek Harness plugin market — server.
//
// A single-file HTTP service (no dependencies) on port 9009 that serves:
//
//   • the market UI (`public/`) — the shop window people browse and install from;
//   • the catalogue API (`/api/*`) — listings, detail, download, publish;
//   • the raw packages — tar.gz archives the DSH client installs verbatim.
//
// Publishing is open to anyone: POST the archive and, if it passes the same
// checks the client installer trusts, it is on the shelf. The first publisher of
// an id receives a token that later versions of that id must present, so nobody
// can take over someone else's plugin.
//
// Run: node server.js   (env: MARKET_PORT, MARKET_DATA, MARKET_ADMIN_TOKEN)
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, normalize, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { MarketStore, PublishError, MAX_UPLOAD_BYTES, SUGGESTED_CATEGORIES } from "./lib/store.js";

/** Root of this package. */
const here = fileURLToPath(new URL(".", import.meta.url));
/** Port the market listens on. */
const port = Number(process.env.MARKET_PORT ?? 9009);
/** Where the catalogue and packages live. */
const dataDir = process.env.MARKET_DATA ?? join(here, "data");
/** Optional bearer token for destructive admin calls. */
const adminToken = process.env.MARKET_ADMIN_TOKEN ?? "";
/** Public directory holding the UI. */
const publicDir = join(here, "public");

const store = new MarketStore(dataDir);

/** Content types for the handful of static file kinds the UI ships. */
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon"
};

/** One JSON reply. */
function json(res, status, payload) {
  const body = Buffer.from(JSON.stringify(payload), "utf8");
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": body.length,
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(body);
}

/** Read a request body with a hard cap. */
function body(req, limit = MAX_UPLOAD_BYTES) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new PublishError(`请求体超过上限（${limit} 字节）`));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

/** Metadata travels either as a header or as `market.json` inside the archive. */
function metadataOf(req) {
  const raw = req.headers["x-market-meta"];
  if (typeof raw !== "string" || raw.trim() === "") return {};
  const decoded = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  try {
    const parsed = JSON.parse(decoded);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    throw new PublishError("X-Market-Meta 不是合法 JSON");
  }
}

/**
 * Serve one file out of `public/`, refusing anything outside it.
 *
 * The shell is revalidated on every load rather than cached: the market is an
 * embedded surface, and a stale `app.js` would outlive an update to it. A weak
 * ETag from size+mtime keeps the revalidation cheap.
 */
function serveStatic(req, res, pathname) {
  const relative = normalize(pathname).replace(/^([/\\])+/, "");
  const target = join(publicDir, relative === "" ? "index.html" : relative);
  if (!target.startsWith(publicDir)) {
    res.writeHead(403).end("forbidden");
    return true;
  }
  if (!existsSync(target) || statSync(target).isDirectory()) return false;
  const info = statSync(target);
  const etag = `W/"${info.size.toString(16)}-${Math.floor(info.mtimeMs).toString(16)}"`;
  if (req.headers["if-none-match"] === etag) {
    res.writeHead(304, { ETag: etag, "Cache-Control": "no-cache" });
    res.end();
    return true;
  }
  const body = readFileSync(target);
  res.writeHead(200, {
    "Content-Type": TYPES[extname(target).toLowerCase()] ?? "application/octet-stream",
    "Content-Length": body.length,
    "Cache-Control": "no-cache",
    ETag: etag
  });
  res.end(body);
  return true;
}

/** Route one request. */
async function route(req, res, url) {
  const path = url.pathname;

  if (path === "/api/health") {
    json(res, 200, { ok: true, name: "dsh-plugin-market", plugins: store.all().size, categories: SUGGESTED_CATEGORIES });
    return;
  }

  if (path === "/api/catalog") {
    const listing = store.list({
      q: url.searchParams.get("q") ?? "",
      category: url.searchParams.get("category") ?? "",
      kind: url.searchParams.get("kind") ?? "",
      sort: url.searchParams.get("sort") ?? "featured"
    });
    json(res, 200, { ok: true, ...listing, suggested: SUGGESTED_CATEGORIES });
    return;
  }

  if (path === "/api/plugins" && req.method === "POST") {
    const buffer = await body(req);
    const meta = metadataOf(req);
    const token = String(req.headers["x-market-token"] ?? "");
    const result = await store.publish({ buffer, meta, token });
    json(res, 200, {
      ok: true,
      created: result.created,
      id: result.record.id,
      name: result.record.packageName,
      version: result.record.latest,
      // What this publish replaced, so the publisher sees the move it made
      // ("1.0.0 → 1.0.1") instead of just the version it ended on.
      previousVersion: result.previousVersion,
      url: `/plugin/${result.record.id}`,
      // Handed back once, on first publish.
      token: result.created ? result.token : undefined,
      versionCount: result.record.versions.length
    });
    return;
  }

  const detail = /^\/api\/plugins\/([A-Za-z0-9._-]+)$/.exec(path);
  if (detail !== null) {
    const record = store.get(detail[1]);
    if (record === undefined) {
      json(res, 404, { ok: false, error: `没有这个插件：${detail[1]}` });
      return;
    }
    json(res, 200, { ok: true, plugin: store.summary(record, { history: true }) });
    return;
  }

  const download = /^\/api\/plugins\/([A-Za-z0-9._-]+)\/download$/.exec(path);
  if (download !== null) {
    const version = url.searchParams.get("version") ?? "";
    const { record, entry, buffer } = store.archive(download[1], version);
    store.downloaded(record.id);
    res.writeHead(200, {
      "Content-Type": "application/gzip",
      "Content-Length": buffer.length,
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "X-Market-Id": record.id,
      "X-Market-Name": record.packageName,
      "X-Market-Version": entry.version,
      "X-Market-Sha256": entry.sha256
    });
    res.end(buffer);
    return;
  }

  const remove = /^\/api\/plugins\/([A-Za-z0-9._-]+)\/delete$/.exec(path);
  if (remove !== null && req.method === "POST") {
    if (adminToken === "" || String(req.headers["x-market-admin"] ?? "") !== adminToken) {
      json(res, 403, { ok: false, error: "需要管理员令牌" });
      return;
    }
    json(res, 200, { ok: true, removed: store.remove(remove[1]).id });
    return;
  }

  if (path.startsWith("/api/")) {
    json(res, 404, { ok: false, error: `未知接口：${path}` });
    return;
  }

  // A plugin deep link renders the same SPA shell.
  if (path.startsWith("/plugin/")) {
    if (!serveStatic(req, res, "/index.html")) res.writeHead(404).end("not found");
    return;
  }

  if (!serveStatic(req, res, path)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("未找到");
  }
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "127.0.0.1"}`);
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,X-Market-Meta,X-Market-Token,X-Market-Admin"
    });
    res.end();
    return;
  }
  Promise.resolve(route(req, res, url)).catch((error) => {
    const status = error instanceof PublishError ? 400 : 500;
    if (!res.headersSent) json(res, status, { ok: false, error: error instanceof Error ? error.message : String(error) });
    else res.end();
    if (!(error instanceof PublishError)) console.error("[market]", error);
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`dsh plugin market: http://0.0.0.0:${port}/ (data: ${dataDir}, ${store.all().size} plugin(s))`);
});

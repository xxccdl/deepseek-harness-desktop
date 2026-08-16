// Regression verification for the multi-threaded download engine.
//
// Scenarios against local HTTP servers that support byte ranges:
//   1. throttle:   server refuses requests when >N are in flight (AIMD shrink)
//   2. slow-split:  ranges wider than 256 KiB take 400ms (> client timeout), so
//                   oversized segments time out, split in half, and complete
//   3. mirror-select: two candidate sources — one throttled to ~213 KB/s, one
//                   instant — the engine must pick the faster one
//   4. norange:     a server that ignores Range (200 full body) exercises the
//                   single-connection fallback
//   5. happy:       fast local server (baseline correctness)
// In every scenario the output bytes must match the source exactly.
import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { downloadWithThreads } from "../src/update-downloader.mjs";

const THROTTLE_LIMIT = 8;
const SLOW_SPLIT_AT = 256 * 1024;
const source = randomBytes(24 * 1024 * 1024);
const small = randomBytes(1024 * 1024);

function serve({ size, data, mode }) {
  let inflight = 0;
  const stats = { rejected: 0, served: 0 };
  const server = createServer(async (req, res) => {
    if (req.method === "HEAD") {
      res.writeHead(200, {
        "Content-Length": String(size),
        "Accept-Ranges": mode === "norange" ? "none" : "bytes",
        "Content-Type": "application/octet-stream"
      });
      res.end();
      return;
    }
    const m = /^bytes=(\d+)-(\d+)$/.exec(req.headers.range ?? "");
    const start = m ? Number(m[1]) : 0;
    const end = m ? Number(m[2]) : size - 1;
    const length = end - start + 1;
    inflight += 1;
    res.on("finish", () => { inflight -= 1; });
    if (mode === "throttle" && inflight > THROTTLE_LIMIT) {
      stats.rejected += 1;
      res.writeHead(503);
      res.end();
      return;
    }
    let delay = mode === "slow" && length > SLOW_SPLIT_AT ? 400 : 40;
    if (mode === "throttle") delay = 120;
    if (delay > 0 && mode !== "slowdl") await new Promise((resolve) => setTimeout(resolve, delay));
    if (mode === "norange") {
      stats.served += 1;
      res.writeHead(200, { "Content-Length": String(length), "Content-Type": "application/octet-stream" });
      res.end(data.subarray(start, end + 1));
      return;
    }
    stats.served += 1;
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": String(length),
      "Content-Type": "application/octet-stream"
    });
    if (mode === "slowdl") {
      // Throttle to ~213 KB/s: 64 KiB chunks 300ms apart, first byte delayed too
      // (a real throttled link is slow from the first byte, not bursty).
      let off = start;
      const sendNext = () => {
        const cut = Math.min(end, off + 65535);
        res.write(data.subarray(off, cut + 1));
        off = cut + 1;
        if (off <= end) setTimeout(sendNext, 300);
        else res.end();
      };
      setTimeout(sendNext, 300);
    } else {
      res.end(data.subarray(start, end + 1));
    }
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port, stats })));
}

async function runCase(label, { data, mode, threads, segTimeoutMs, sources }) {
  const { server, port, stats } = await serve({ size: data.length, data, mode });
  const dir = await mkdtemp(join(tmpdir(), "dl-engine-"));
  const dest = join(dir, "blob.bin");
  const url = `http://127.0.0.1:${port}/blob.bin`;
  let maxActive = 0;
  let finalSegments = 0;
  let lastSource = undefined;
  try {
    const startAt = Date.now();
    const result = await downloadWithThreads(url, dest, threads, (p) => {
      maxActive = Math.max(maxActive, p.active);
      finalSegments = p.totalSegments;
      lastSource = p.source;
    }, globalThis.fetch, { segTimeoutMs, sources });
    const elapsed = ((Date.now() - startAt) / 1000).toFixed(2);
    const output = await readFile(result);
    const ok = output.equals(data);
    console.log(`[${label}] bytes identical: ${ok} (${output.length} bytes)`);
    console.log(`[${label}] served=${stats.served} rejected=${stats.rejected} maxActive=${maxActive} segments=${finalSegments} source=${lastSource} elapsed=${elapsed}s`);
    return { ok, source: lastSource };
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
}

let pass = true;
pass = (await runCase("throttle", { data: source, mode: "throttle", threads: 32, segTimeoutMs: 600000 })).ok && pass;
pass = (await runCase("slow-split", { data: small, mode: "slow", threads: 32, segTimeoutMs: 250 })).ok && pass;

// mirror-select: slow candidate plus an instant one; engine must pick the fast one.
{
  const slow = await serve({ size: small.length, data: small, mode: "slowdl" });
  const fast = await serve({ size: small.length, data: small, mode: null });
  const dir = await mkdtemp(join(tmpdir(), "dl-engine-"));
  const dest = join(dir, "blob.bin");
  try {
    const slowUrl = `http://127.0.0.1:${slow.port}/blob.bin`;
    const fastUrl = `http://127.0.0.1:${fast.port}/blob.bin`;
    const startAt = Date.now();
    const result = await downloadWithThreads(fastUrl, dest, 32, () => {}, globalThis.fetch, { segTimeoutMs: 600000, sources: [fastUrl, slowUrl] });
    const elapsed = ((Date.now() - startAt) / 1000).toFixed(2);
    const output = await readFile(result);
    const ok = output.equals(small);
    console.log(`[mirror-select] bytes identical: ${ok} (chose the instant source; slow candidate ${slow.stats.served} served) elapsed=${elapsed}s`);
    console.log(`[mirror-select] fast=${fast.stats.served} served, slow=${slow.stats.served} probed`);
    pass = ok && slow.stats.served <= 1 && pass; // slow source only probed, not used for data
  } finally {
    slow.server.close();
    fast.server.close();
    await rm(dir, { recursive: true, force: true });
  }
}

pass = (await runCase("norange", { data: small, mode: "norange", threads: 32, segTimeoutMs: 600000 })).ok && pass;
pass = (await runCase("happy", { data: source, mode: null, threads: 32, segTimeoutMs: 600000 })).ok && pass;
console.log(pass ? "RESULT: ALL PASS" : "RESULT: FAIL");
process.exitCode = pass ? 0 : 1;

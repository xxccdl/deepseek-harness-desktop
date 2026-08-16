// High-speed multi-threaded download engine for the desktop updater.
//
// The engine does two things on top of a plain range-request downloader:
//
// 1. Source selection. GitHub's release CDN is throttled to tens of KB/s from
//    many regions. The engine probes a list of candidate URLs (the official
//    asset plus community acceleration mirrors) in parallel, measures how fast
//    each one actually streams, and picks the fastest responsive one. A slow
//    direct link therefore no longer stalls the whole update.
//
// 2. Adaptive transfer. After a source is chosen, the engine preallocates the
//    destination and runs a pool of worker fibers against a dynamic segment
//    queue. Concurrency is governed by an AIMD (additive-increase /
//    multiplicative-decrease) controller like TCP congestion control: it grows
//    one worker at a time while that buys throughput and halves the pool when
//    the speed collapses (the CDN "too many connections, throttled" signal).
//    Segment size is adaptive too — a segment that fails repeatedly is split in
//    half and requeued, down to MIN_SPLIT_BYTES, so slow links keep making
//    progress instead of aborting because one oversized range timed out.
//
// A source that does not support byte ranges falls back to a single streaming
// connection (many mirrors proxy the whole body without Range support), which
// is still much faster than the throttled direct link.
//
// @module update-downloader

/** Emit a progress tick roughly every 256 KiB of transferred bytes. */
const PROGRESS_TICK_BYTES = 256 * 1024;

/** Soft initial concurrency cap (GitHub CDNs throttle beyond ~16 connections). */
const INITIAL_WORKERS = 16;
/** Hard ceiling for the pool regardless of what `threads` asks for. */
const MAX_WORKERS = 64;
/** Throughput is sampled once per second to drive the AIMD controller. */
const SAMPLE_INTERVAL_MS = 1000;
/** A segment smaller than this is no longer split (it either works or is fatal). */
const MIN_SPLIT_BYTES = 64 * 1024;
/** Default per-segment timeout: generous, so slow links are not killed. */
const DEFAULT_SEG_TIMEOUT_MS = 10 * 60 * 1000;
/** How many bytes to pull when speed-testing a candidate source. */
const PROBE_BYTES = 64 * 1024;
/** Per-source probe budget before giving up on it. */
const PROBE_TIMEOUT_MS = 8000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Probe one candidate URL: reachability, size, range support, and speed. */
async function probeSource(fetchFn, url) {
  let head;
  try {
    head = await fetchFn(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(15000) });
  } catch {
    return { ok: false, url };
  }
  const total = Number(head.headers.get("content-length"));
  const supportsRange = head.headers.get("accept-ranges") === "bytes";
  // Speed test: stream the first ~64 KiB (or the whole body when the source
  // does not do ranges) and measure the throughput.
  const t0 = Date.now();
  try {
    const res = await fetchFn(url, {
      headers: supportsRange ? { Range: `bytes=0-${PROBE_BYTES - 1}` } : {},
      redirect: "follow",
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS)
    });
    if (!res.ok && res.status !== 206 && res.status !== 200) return { ok: false, url };
    const reader = res.body?.getReader?.();
    if (reader === undefined) return { ok: false, url };
    let bytes = 0;
    const deadline = Date.now() + 1500;
    while (Date.now() < deadline && bytes < PROBE_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.length;
      if (bytes >= 64 * 1024) break;
    }
    await reader.cancel().catch(() => {});
    const dt = Math.max(0.05, (Date.now() - t0) / 1000);
    return { ok: true, url, speed: bytes / dt, supportsRange, total };
  } catch {
    return { ok: false, url };
  }
}

/** Pick the fastest responsive candidate (official URL plus mirrors). */
async function selectSource(fetchFn, candidates) {
  const results = await Promise.all(candidates.map((url) => probeSource(fetchFn, url)));
  const usable = results.filter((r) => r.ok);
  if (usable.length === 0) throw new Error("所有下载源均不可用，请检查网络或代理");
  usable.sort((a, b) => b.speed - a.speed);
  return usable[0];
}

/** Single-connection download for sources without byte-range support. */
async function downloadSingle(url, destPath, total, fetchFn, onProgress, segTimeoutMs) {
  const { open: fspOpen, stat } = await import("node:fs/promises");
  const fd = await fspOpen(destPath, "w");
  let received = 0;
  let lastEmit = 0;
  try {
    const res = await fetchFn(url, { redirect: "follow", signal: AbortSignal.timeout(segTimeoutMs) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const reader = res.body?.getReader?.();
    if (reader === undefined) throw new Error("empty response body");
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      await fd.write(value, 0, value.length, received);
      received += value.length;
      if (received - lastEmit >= PROGRESS_TICK_BYTES) {
        lastEmit = received;
        onProgress?.({ received, total, speed: 0, etaMs: 0, active: 1, done: 0, totalSegments: 1 });
      }
    }
  } finally {
    await fd.close();
  }
  const final = await stat(destPath);
  if (total > 0 && final.size !== total) throw new Error(`下载不完整：${final.size}/${total}`);
  onProgress?.({ received, total, speed: 0, etaMs: 0, active: 1, done: 1, totalSegments: 1 });
  return destPath;
}

/**
 * Multi-threaded transfer of one range-supporting source (AIMD + segment split).
 * @returns the destination path once fully written and verified.
 */
async function downloadMulti(url, destPath, threads, onProgress, fetchFn, options) {
  const { open: fspOpen, stat } = await import("node:fs/promises");
  const segTimeoutMs = options.segTimeoutMs ?? DEFAULT_SEG_TIMEOUT_MS;
  const head = await fetchFn(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(15000) });
  const total = Number(head.headers.get("content-length"));
  const ranges = head.headers.get("accept-ranges");
  if (!(total > 0) || ranges !== "bytes") return downloadSingle(url, destPath, total, fetchFn, onProgress, segTimeoutMs);

  const maxWorkers = Math.max(2, Math.min(threads, MAX_WORKERS));
  const initialWorkers = Math.max(2, Math.min(maxWorkers, INITIAL_WORKERS));
  const targetSegs = Math.max(1, maxWorkers * 4);
  const segSize = Math.max(MIN_SPLIT_BYTES, Math.min(8 * 1024 * 1024, Math.ceil(total / targetSegs)));
  const totalSegments = Math.ceil(total / segSize);

  const prealloc = await fspOpen(destPath, "w");
  await prealloc.truncate(total);
  await prealloc.close();

  let cursor = 0;
  const retryStack = [];
  const hasMoreSegments = () => retryStack.length > 0 || cursor < total;
  const nextSegment = () => {
    if (retryStack.length > 0) return retryStack.pop();
    if (cursor >= total) return undefined;
    const start = cursor;
    const end = Math.min(total - 1, start + segSize - 1);
    cursor = end + 1;
    return { start, end };
  };
  const splitSegment = (seg) => {
    const length = seg.end - seg.start + 1;
    if (length <= MIN_SPLIT_BYTES) return false;
    const mid = seg.start + Math.floor(length / 2);
    retryStack.push({ start: seg.start, end: mid - 1 });
    retryStack.push({ start: mid, end: seg.end });
    return true;
  };

  let received = 0;
  let done = 0;
  let active = 0;
  let lastEmit = 0;
  const speedSamples = [];
  const emit = () => {
    const now = Date.now();
    speedSamples.push({ at: now, bytes: received });
    while (speedSamples.length > 0 && now - speedSamples[0].at > 2000) speedSamples.shift();
    const first = speedSamples[0];
    const speed = first !== undefined && now > first.at ? (received - first.bytes) * 1000 / (now - first.at) : 0;
    onProgress?.({
      received,
      total,
      speed,
      etaMs: speed > 0 ? Math.max(0, (total - received) / speed * 1000) : 0,
      active,
      done,
      totalSegments: Math.max(totalSegments, done)
    });
  };

  const downloadSegment = async (fd, seg) => {
    let failures = 0;
    for (;;) {
      failures += 1;
      try {
        const res = await fetchFn(url, {
          headers: { Range: `bytes=${seg.start}-${seg.end}` },
          redirect: "follow",
          signal: AbortSignal.timeout(segTimeoutMs)
        });
        if (!res.ok && res.status !== 206) throw new Error(`HTTP ${res.status}`);
        if (!res.body) throw new Error("empty response body");
        const reader = res.body.getReader();
        let offset = seg.start;
        for (;;) {
          const { done: streamDone, value } = await reader.read();
          if (streamDone) break;
          await fd.write(value, 0, value.length, offset);
          offset += value.length;
          received += value.length;
          if (received - lastEmit >= PROGRESS_TICK_BYTES) {
            lastEmit = received;
            emit();
          }
        }
        return;
      } catch (error) {
        shrinkPool();
        if (failures >= 3) {
          if (splitSegment(seg)) return "split";
          throw error;
        }
        await sleep(400 * failures + Math.floor(Math.random() * 200));
      }
    }
  };

  let poolSize = initialWorkers;
  let smoothedSpeed = 0;
  let lastSampleAt = Date.now();
  let lastSampleBytes = 0;
  const workers = new Set();
  const fatalErrors = [];

  const workerLoop = async () => {
    const fd = await fspOpen(destPath, "r+");
    try {
      for (;;) {
        if (workers.size > poolSize) return;
        const seg = nextSegment();
        if (seg === undefined) return;
        active += 1;
        try {
          const outcome = await downloadSegment(fd, seg);
          if (outcome !== "split") done += 1;
        } catch (error) {
          fatalErrors.push(error);
          return;
        } finally {
          active -= 1;
        }
      }
    } finally {
      await fd.close();
    }
  };
  const spawnWorker = () => {
    const p = workerLoop();
    workers.add(p);
    p.finally(() => workers.delete(p));
    return p;
  };
  const topUp = () => { while (workers.size < poolSize) spawnWorker(); };
  const shrinkPool = () => { poolSize = Math.max(2, Math.floor(poolSize / 2)); };

  const adjustTimer = setInterval(() => {
    const now = Date.now();
    const dt = (now - lastSampleAt) / 1000;
    const speed = dt > 0 ? (received - lastSampleBytes) / dt : 0;
    lastSampleAt = now;
    lastSampleBytes = received;
    if (speed > 0) {
      if (smoothedSpeed === 0) smoothedSpeed = speed;
      else smoothedSpeed = smoothedSpeed * 0.7 + speed * 0.3;
    }
    if (speed >= smoothedSpeed * 1.05 && workers.size >= poolSize) {
      poolSize = Math.min(maxWorkers, poolSize + 1);
    } else if (speed < smoothedSpeed * 0.7) {
      shrinkPool();
    }
    topUp();
  }, SAMPLE_INTERVAL_MS);

  try {
    topUp();
    for (;;) {
      if (workers.size === 0) {
        if (fatalErrors.length > 0) throw fatalErrors[0];
        if (!hasMoreSegments()) break;
        topUp();
        continue;
      }
      await Promise.all([...workers]);
    }
  } finally {
    clearInterval(adjustTimer);
  }

  const final = await stat(destPath);
  if (final.size !== total) throw new Error(`下载不完整：${final.size}/${total}`);
  emit();
  return destPath;
}

/**
 * Download a file, choosing the fastest source and transferring adaptively.
 * @param url - official asset URL (also the first candidate).
 * @param destPath - destination file path.
 * @param threads - target number of range-request workers (soft upper bound).
 * @param onProgress - periodic callback with { received, total, speed, etaMs, active, done, totalSegments, source }.
 * @param fetchFn - fetch implementation honoring system proxy (defaults to global fetch).
 * @param options - { segTimeoutMs, sources? } — extra candidate URLs (mirrors) probed alongside `url`.
 * @returns the destination path once fully written and verified.
 */
export async function downloadWithThreads(url, destPath, threads, onProgress, fetchFn = globalThis.fetch, options = {}) {
  const candidates = options.sources !== undefined && options.sources.length > 0 ? options.sources : [url];
  const chosen = await selectSource(fetchFn, candidates);
  const source = chosen.url === url ? "direct" : "mirror";
  const report = (p) => onProgress?.({ ...p, source });
  if (!chosen.supportsRange) {
    return downloadSingle(chosen.url, destPath, chosen.total, fetchFn, report, options.segTimeoutMs ?? DEFAULT_SEG_TIMEOUT_MS);
  }
  return downloadMulti(chosen.url, destPath, threads, report, fetchFn, options);
}

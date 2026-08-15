// DeepSeek Harness usage & balance plugin.
//
// Two small surfaces, both served to the desktop web UI over /api/usage and
// rendered as a compact budget bar at the bottom of the sidebar:
//
//  1. Spend tracking — replays each session's events, sums the provider usage
//     reported on assistant messages (uncached input / cache-read / cache-write
//     / output tokens), and converts them to CNY with DeepSeek's public
//     deepseek-chat pricing. The running total and per-session replay position
//     persist at $DSH_HOME/usage.json so the counter survives restarts.
//  2. DeepSeek balance — calls GET https://api.deepseek.com/user/balance with
//     the configured DEEPSEEK_API_KEY credential and returns the live balance
//     (cached briefly). When the credential is absent or the call fails, the
//     HTTP response reports configured:false and the UI hides the bar.
//
// @module @deepseek-ai/dsh-tool-usage
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { dshHomePath } from "@deepseek-ai/dsh-home-paths";

/** Cordis plugin name. */
const name = "tool-usage";
/** Required services: the session store (for replay) and the web server (route). */
const inject = ["sessions", "credentials"];

/** Usage + balance store under the harness home. */
const USAGE_STORE = () => dshHomePath("usage.json");
/** HTTP surface for the sidebar budget bar. */
const USAGE_HTTP_PATH = "/api/usage";
/** Credential reference resolved per balance call (DeepSeek key). */
const DEEPSEEK_API_KEY_REF = "DEEPSEEK_API_KEY";
/** DeepSeek public API base. */
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
/** Persist throttle: coalesce rapid event bursts into one disk write. */
const PERSIST_DELAY_MS = 4_000;
/** DeepSeek deepseek-chat public pricing, CNY per 1M tokens (estimate). */
const PRICE_INPUT_MISS = 2;
const PRICE_INPUT_HIT = 0.5;
const PRICE_OUTPUT = 8;

function emptyTotals() {
  return { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
}

async function readState() {
  try {
    const data = JSON.parse(await readFile(USAGE_STORE(), "utf8"));
    return {
      totals: { ...emptyTotals(), ...(data?.totals ?? {}) },
      sessions: data?.sessions && typeof data.sessions === "object" ? data.sessions : {}
    };
  } catch {
    return { totals: emptyTotals(), sessions: {} };
  }
}

/**
 * Register the usage + balance surface on the calling context.
 * @param ctx - registrant context carrying the session store and web server.
 */
function apply(ctx) {
  /** Running token totals across all replayed sessions. */
  const totals = emptyTotals();
  /** Per-session replay position: sessionId -> consumed event count. */
  const sessionsSeen = new Map();
  let loaded = false;

  /** Estimated CNY spend from the current token totals (deepseek-chat pricing). */
  const cost = () => (totals.input / 1e6) * PRICE_INPUT_MISS
    + (totals.cacheRead / 1e6) * PRICE_INPUT_HIT
    + (totals.cacheWrite / 1e6) * PRICE_INPUT_MISS
    + (totals.output / 1e6) * PRICE_OUTPUT;

  /** Throttled best-effort persist of totals + replay positions. */
  let persistTimer = undefined;
  const schedulePersist = () => {
    if (persistTimer !== undefined) return;
    persistTimer = setTimeout(() => {
      persistTimer = undefined;
      const payload = { totals, sessions: Object.fromEntries(sessionsSeen) };
      void (async () => {
        try {
          await mkdir(dirname(USAGE_STORE()), { recursive: true });
          const tmp = `${USAGE_STORE()}.tmp`;
          await writeFile(tmp, JSON.stringify(payload, null, 2), "utf8");
          await rename(tmp, USAGE_STORE());
        } catch (error) {
          ctx.logger.warn(`tool-usage: failed to persist usage: ${error instanceof Error ? error.message : String(error)}`);
        }
      })();
    }, PERSIST_DELAY_MS);
  };

  /** Replay the unread tail of one session into the running totals. */
  const syncSession = (session) => {
    if (!loaded || session === undefined || session === null) return;
    const id = typeof session.id === "string" ? session.id : undefined;
    if (id === undefined) return;
    const events = Array.isArray(session.events) ? session.events : [];
    const consumed = sessionsSeen.get(id) ?? 0;
    if (consumed >= events.length) return;
    for (let i = consumed; i < events.length; i += 1) {
      const event = events[i];
      if (event?.type !== "assistant/message") continue;
      const usage = event.data?.usage;
      if (usage === undefined || usage === null) continue;
      totals.input += Number(usage.inputTokens) || 0;
      totals.output += Number(usage.outputTokens) || 0;
      totals.cacheRead += Number(usage.cacheReadTokens) || 0;
      totals.cacheWrite += Number(usage.cacheWriteTokens) || 0;
    }
    sessionsSeen.set(id, events.length);
    schedulePersist();
  };

  // Replay incrementally as sessions grow.
  ctx.on("session/event", (session) => syncSession(session));

  // Load the persisted baseline once sessions are available, then scan the
  // live store so anything persisted-but-unreplayed is caught up.
  ctx.inject(["sessions"], (sessionsCtx) => {
    void (async () => {
      const state = await readState();
      Object.assign(totals, state.totals);
      for (const [id, consumed] of Object.entries(state.sessions)) {
        sessionsSeen.set(id, Number(consumed) || 0);
      }
      loaded = true;
      for (const session of sessionsCtx.sessions.list()) syncSession(session);
    })();
  });

  /** Estimate for the active conversation only (sessions.current), computed from
   *  its session event slice — mirrors cost() but scoped to the latest session. */
  const sessionCost = (session) => {
    const t = emptyTotals();
    const events = Array.isArray(session?.events) ? session.events : [];
    for (const event of events) {
      if (event?.type !== "assistant/message") continue;
      const usage = event.data?.usage;
      if (usage === undefined || usage === null) continue;
      t.input += Number(usage.inputTokens) || 0;
      t.output += Number(usage.outputTokens) || 0;
      t.cacheRead += Number(usage.cacheReadTokens) || 0;
      t.cacheWrite += Number(usage.cacheWriteTokens) || 0;
    }
    return (t.input / 1e6) * PRICE_INPUT_MISS
      + (t.cacheRead / 1e6) * PRICE_INPUT_HIT
      + (t.cacheWrite / 1e6) * PRICE_INPUT_MISS
      + (t.output / 1e6) * PRICE_OUTPUT;
  };

  /** Resolve the live DeepSeek balance plus the current spend estimate.
   *  No caching: every /api/usage request re-queries the provider so the bar
   *  always reflects the latest balance. */
  const getPayload = async () => {
    const make = (value) => ({ ...value, spent: cost() });
    try {
      const credentials = ctx.get("credentials", false);
      const resolved = credentials === undefined ? undefined : await credentials.resolve(DEEPSEEK_API_KEY_REF);
      const key = typeof resolved?.value === "string" ? resolved.value.trim() : "";
      if (key === "") return make({ configured: false });
      const res = await fetch(`${DEEPSEEK_BASE_URL}/user/balance`, {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) return make({ configured: true, error: `HTTP ${res.status}` });
      const data = await res.json();
      const info = (data?.balance_infos ?? [])[0];
      return make({
        configured: true,
        isAvailable: data?.is_available === true,
        balance: Number(info?.total_balance ?? 0),
        granted: Number(info?.granted_balance ?? 0),
        toppedUp: Number(info?.topped_up_balance ?? 0),
        currency: typeof info?.currency === "string" ? info.currency : "CNY"
      });
    } catch (error) {
      return make({ configured: true, error: error instanceof Error ? error.message : String(error) });
    }
  };

  // ── HTTP surface ──
  const httpDisposers = [];
  const syncHttp = () => {
    for (const dispose of httpDisposers) dispose();
    httpDisposers.length = 0;
    const webServer = ctx.get("webServer", false);
    if (webServer === undefined) return;
    httpDisposers.push(ctx.effect(() => webServer.register({
      kind: "exact",
      path: USAGE_HTTP_PATH,
      handler: async (_req, res) => {
        try {
          const payload = await getPayload();
          // Current-session spend for the budget bar (sessions.current); the
          // all-time total stays under payload.spent / payload.sessions.total.
          const list = ctx.get("sessions", false)?.list?.() ?? [];
          const current = list.length > 0 ? list[list.length - 1] : undefined;
          payload.sessions = { current: sessionCost(current), total: payload.spent };
          res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
          });
          res.end(JSON.stringify(payload));
        } catch (error) {
          res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
        }
      }
    }), `tool-usage: ${USAGE_HTTP_PATH} route`));
  };
  ctx.on("internal/service", syncHttp);
  syncHttp();
}

export { apply, inject, name };

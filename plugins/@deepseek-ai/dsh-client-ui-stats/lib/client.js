window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-stats",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let jsxRuntime = require("react/jsx-runtime");
		const { jsx, jsxs, Fragment } = jsxRuntime;
		const { useState, useEffect, useCallback } = react;
		//#region styles
		const css = [
			".myst-wrap{display:flex;flex-direction:column;gap:14px;padding:4px 0 28px;max-width:760px}",
			".myst-hint{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;margin:0}",
			".myst-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}",
			".myst-card{padding:14px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-module-platform);display:flex;flex-direction:column;gap:4px}",
			".myst-card-label{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:16px}",
			".myst-card-value{color:var(--dsw-alias-label-primary);font-size:22px;line-height:28px;font-weight:600;font-variant-numeric:tabular-nums}",
			".myst-card-value small{font-size:12px;font-weight:400;color:var(--dsw-alias-label-secondary)}",
			".myst-note{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
			".myst-refresh{align-self:flex-start;font-size:12px;color:var(--dsw-static-blue-600);background:transparent;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:5px 14px;cursor:pointer}",
			".myst-refresh:hover{border-color:var(--dsw-static-blue-600)}"
		].join("");
		const tagId = "@deepseek-ai/dsh-client-ui-stats/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-stats";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region data sources
		let rpcSeq = 0;
		async function rpc(method, payload = {}) {
			const res = await fetch("/api/" + method, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ type: "client-request", rpcId: "myst-" + String(++rpcSeq), method, payload })
			});
			if (!res.ok) throw new Error("HTTP " + String(res.status));
			const envelope = await res.json();
			const result = envelope?.result;
			if (result === undefined || result.ok !== true) throw new Error(result?.error?.message ?? method + " 调用失败");
			return result.value;
		}
		function currentSessionId() {
			try {
				const raw = localStorage.getItem("dsh.sessions.current");
				if (raw === null) return undefined;
				const parsed = JSON.parse(raw);
				return typeof parsed?.sessionId === "string" ? parsed.sessionId : undefined;
			} catch {
				return undefined;
			}
		}
		async function collectStats() {
			const startOfDay = new Date();
			startOfDay.setHours(0, 0, 0, 0);
			const [list, usage] = await Promise.allSettled([
				rpc("session.list", {}),
				fetch("/api/usage", { cache: "no-store" }).then((res) => res.ok ? res.json() : undefined)
			]);
			const stats = {
				sessions: { total: 0, running: 0, today: 0 },
				current: undefined,
				usage: undefined
			};
			if (list.status === "fulfilled") {
				const items = list.value?.items ?? [];
				stats.sessions.total = items.filter((item) => item.blank !== true).length;
				stats.sessions.running = items.filter((item) => item.running === true).length;
				stats.sessions.today = items.filter((item) => item.updatedAt >= startOfDay.getTime()).length;
			}
			if (usage.status === "fulfilled" && usage.value !== undefined) stats.usage = usage.value;
			const sessionId = currentSessionId();
			if (sessionId !== undefined) {
				try {
					const history = await rpc("session.history", { sessionId, maxMessages: 500 });
					const events = (history?.events ?? []).map((entry) => entry.event ?? entry);
					let userMessages = 0;
					let assistantMessages = 0;
					let toolCalls = 0;
					let chars = 0;
					for (const event of events) {
						if (event.type === "user/message") {
							userMessages += 1;
							const content = event.data?.content;
							chars += typeof content === "string" ? content.length : 0;
						} else if (event.type === "assistant/message") {
							assistantMessages += 1;
							const content = event.data?.message?.content;
							if (Array.isArray(content)) {
								for (const block of content) {
									if (block?.type === "text" && typeof block.text === "string") chars += block.text.length;
								}
							} else if (typeof content === "string") chars += content.length;
						} else if (event.type === "tool/call") {
							toolCalls += 1;
						}
					}
					// Rough token estimate: ~1.7 chars per CJK-heavy token, 4 per ASCII.
					const tokens = Math.round(chars / 2.2);
					stats.current = { sessionId, userMessages, assistantMessages, toolCalls, chars, tokens };
				} catch { /* current session stats are optional */ }
			}
			return stats;
		}
		//#endregion
		//#region components
		let boundT = (key) => key;
		function Card({ label, value, unit }) {
			return jsxs("div", { className: "myst-card", children: [
				jsx("div", { className: "myst-card-label", children: label }),
				jsxs("div", { className: "myst-card-value", children: [value, unit === undefined ? null : jsx("small", { children: " " + unit })] })
			] });
		}
		function StatsSection() {
			const t = boundT;
			const [stats, setStats] = useState(undefined);
			const [error, setError] = useState("");
			const [loading, setLoading] = useState(true);
			const refresh = useCallback(async () => {
				setLoading(true);
				setError("");
				try {
					setStats(await collectStats());
				} catch (err) {
					setError(err instanceof Error ? err.message : String(err));
				}
				setLoading(false);
			}, []);
			useEffect(() => { void refresh(); }, [refresh]);
			const cards = [];
			if (stats !== undefined) {
				cards.push(
					jsx(Card, { key: "total", label: t("totalSessions"), value: stats.sessions.total }),
					jsx(Card, { key: "running", label: t("runningSessions"), value: stats.sessions.running }),
					jsx(Card, { key: "today", label: t("todayActive"), value: stats.sessions.today })
				);
				if (stats.usage !== undefined) {
					const spend = Number(stats.usage.estimatedCny ?? stats.usage.spend ?? 0);
					if (Number.isFinite(spend)) cards.push(jsx(Card, { key: "spend", label: t("spend"), value: "¥" + spend.toFixed(2) }));
					const balance = Number(stats.usage.balance ?? NaN);
					if (Number.isFinite(balance)) cards.push(jsx(Card, { key: "balance", label: t("balance"), value: "¥" + balance.toFixed(2) }));
				}
				if (stats.current !== undefined) {
					cards.push(
						jsx(Card, { key: "user", label: t("userMsgs"), value: stats.current.userMessages }),
						jsx(Card, { key: "assistant", label: t("aiMsgs"), value: stats.current.assistantMessages }),
						jsx(Card, { key: "tools", label: t("toolCalls"), value: stats.current.toolCalls }),
						jsx(Card, { key: "tokens", label: t("estTokens"), value: (stats.current.tokens / 1000).toFixed(1), unit: "k" })
					);
				}
			}
			return jsxs("div", { className: "myst-wrap", children: [
				jsx("p", { className: "myst-hint", children: t("hint") }),
				cards.length > 0 ? jsx("div", { className: "myst-cards", children: cards }) : null,
				stats?.current !== undefined ? jsx("p", { className: "myst-note", children: t("currentNote") + " " + stats.current.sessionId.slice(0, 8) + "…" }) : null,
				error !== "" ? jsx("p", { className: "myst-note", children: "错误: " + error }) : null,
				jsx("button", { type: "button", className: "myst-refresh", onClick: () => void refresh(), disabled: loading, children: loading ? t("loading") : t("refresh") })
			] });
		}
		//#endregion
		//#region plugin
		const NS = "settings.stats";
		const inject = ["slots", "locale"];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh: {
					"nav": "统计",
					"hint": "使用量与会话统计：花费与余额来自用量插件，会话数据实时查询。",
					"totalSessions": "总会话数",
					"runningSessions": "运行中会话",
					"todayActive": "今日活跃",
					"spend": "累计花费（估）",
					"balance": "账户余额",
					"userMsgs": "当前会话 · 用户消息",
					"aiMsgs": "当前会话 · AI 回复",
					"toolCalls": "当前会话 · 工具调用",
					"estTokens": "当前会话 · Tokens（估）",
					"currentNote": "当前会话：",
					"refresh": "刷新统计",
					"loading": "加载中…"
				},
				en: {
					"nav": "Stats",
					"hint": "Usage and session statistics: spend and balance come from the usage plugin; session data is queried live.",
					"totalSessions": "Total sessions",
					"runningSessions": "Running sessions",
					"todayActive": "Active today",
					"spend": "Est. spend",
					"balance": "Balance",
					"userMsgs": "Current · user messages",
					"aiMsgs": "Current · AI replies",
					"toolCalls": "Current · tool calls",
					"estTokens": "Current · tokens (est.)",
					"currentNote": "Current session:",
					"refresh": "Refresh",
					"loading": "Loading…"
				}
			}), "ui-stats: dictionaries");
			boundT = ctx.locale.bind(NS);
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "stats",
				order: 23,
				label: () => boundT("nav"),
				locale: NS
			}, StatsSection));
		}
		//#endregion
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});

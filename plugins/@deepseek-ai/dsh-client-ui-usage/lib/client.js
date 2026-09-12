window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-usage",
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
			".myuse-bar{box-sizing:border-box;width:100%;min-width:0;user-select:none;padding:3px 6px 4px;border-radius:10px;transition:background .18s ease}",
			".myuse-bar:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".myuse-cols{display:flex;align-items:baseline;gap:8px;white-space:nowrap;overflow:hidden}",
			".myuse-cell{display:flex;align-items:baseline;gap:4px;min-width:0}",
			".myuse-cell+.myuse-cell:before{content:'·';margin-right:2px;color:var(--dsw-alias-label-dimmed)}",
			".myuse-k{color:var(--dsw-alias-label-secondary);font-size:10.5px;line-height:14px;flex:none}",
			".myuse-v{color:var(--dsw-alias-label-primary);font-size:12px;line-height:16px;font-variant-numeric:tabular-nums;font-weight:500}",
			".myuse-dot{box-sizing:border-box;width:24px;height:4px;border-radius:999px;background:var(--dsw-alias-border-l2);overflow:hidden;position:relative;flex:none}",
			".myuse-dot .myuse-fill{position:absolute;left:0;top:0;bottom:0;border-radius:999px;transition:width .5s cubic-bezier(.22,1,.36,1),background-color .5s ease}"
		].join("");
		const tagId = "@deepseek-ai/dsh-client-ui-usage/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-usage";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region data
		const USAGE_URL = "/api/usage";
		async function fetchUsage() {
			const res = await fetch(USAGE_URL, { method: "GET", cache: "no-store" });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.json();
		}
		//#endregion
		//#region components
		let boundT = (key) => key;

		/** Bar hue from remaining fraction: green -> amber -> red as spend grows. */
		function hueOf(ratio) {
			return Math.round(150 - 150 * Math.min(1, Math.max(0, ratio)));
		}

		function BudgetBar({ wide }) {
			const t = boundT;
			const [data, setData] = useState(undefined);
			const refresh = useCallback(async () => {
				try {
					setData(await fetchUsage());
				} catch { /* non-fatal */ }
			}, []);
			useEffect(() => {
				void refresh();
				// Near-real-time: re-query every 5s (the backend re-fetches the live
				// balance on every request — no server-side cache), plus on focus.
				const id = setInterval(refresh, 5000);
				const onFocus = () => void refresh();
				window.addEventListener("focus", onFocus);
				return () => {
					clearInterval(id);
					window.removeEventListener("focus", onFocus);
				};
			}, [refresh]);

			if (data === undefined || data.configured !== true) return null;
			// "已用" tracks the current conversation's spend (sessions.current), not
			// the all-time total (sessions.total). Persisted server-side in usage.json.
			// Custom / self-hosted providers often expose no public balance endpoint,
			// so `balance` may be absent — the bar then degrades to the spend estimate.
			const hasBalance = typeof data.balance === "number";
			const spent = Math.max(0, Number(data.sessions?.current ?? data.spent) || 0);
			const balance = hasBalance ? Math.max(0, Number(data.balance) || 0) : 0;
			const total = spent + balance;
			const ratio = total > 0 ? Math.min(1, spent / total) : 0;
			const remaining = hasBalance && total > 0 ? Math.max(0, balance / total) : 0;
			const hue = hueOf(ratio);
			const fill = { width: `${Math.round(remaining * 100)}%`, background: `hsl(${hue} 72% 52%)` };
			const currency = hasBalance && typeof data.currency === "string" ? data.currency : "CNY";
			const money = (v) => `${currency === "CNY" ? "¥" : ""}${v.toFixed(2)}`;
			const tip = hasBalance ? t("tooltip") : t("tooltipNoBalance");

			if (wide === false) {
				return jsx("div", {
					className: "myuse-dot",
					title: `${t("spent")} ${money(spent)}${hasBalance ? ` · ${t("balance")} ${money(balance)}` : ""}`,
					children: hasBalance ? jsx("div", { className: "myuse-fill", style: fill }) : undefined
				});
			}
			return jsxs("div", {
				className: "myuse-bar",
				title: tip,
				children: [jsxs("div", { className: "myuse-cols", children: [
					jsxs("div", { className: "myuse-cell", children: [
						jsx("span", { className: "myuse-k", children: t("spent") }),
						jsx("span", { className: "myuse-v", children: money(spent) })
					] }),
					jsxs("div", { className: "myuse-cell", children: [
						jsx("span", { className: "myuse-k", children: t("balance") }),
						jsx("span", { className: "myuse-v", children: hasBalance ? money(balance) : t("noBalance") })
					] })
				] })]
			});
		}
		//#endregion
		//#region plugin
		const NS = "sidebar.footer.status";
		const inject = ["slots", "locale"];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh: {
					"spent": "已用",
					"balance": "余额",
					"noBalance": "—",
					"tooltip": "按 token 用量估算的花费与 DeepSeek 实时余额（血条越长越接近用尽）",
					"tooltipNoBalance": "按 token 用量估算的花费（当前模型提供商无公开余额接口，仅显示已用）"
				},
				en: {
					"spent": "Used",
					"balance": "Balance",
					"noBalance": "—",
					"tooltip": "Estimated spend from token usage and live DeepSeek balance (bar fills as you approach empty)",
					"tooltipNoBalance": "Estimated spend from token usage (current provider exposes no public balance endpoint)"
				}
			}), "ui-usage: dictionaries");
			boundT = ctx.locale.bind(NS);
			ctx.slots.inject("sidebar.footer.status", () => ctx.slots.register({
				name: "sidebar.footer.status",
				locale: NS
			}, BudgetBar));
		}
		//#endregion
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});

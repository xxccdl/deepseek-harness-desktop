window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-browser",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let jsxRuntime = require("react/jsx-runtime");
		const { jsx, jsxs, Fragment } = jsxRuntime;
		const { useState, useEffect, useCallback, useRef, useSyncExternalStore } = react;
		//#region styles
		const css = [
			".mybr-wrap{display:flex;flex-direction:column;gap:16px;padding:4px 0 28px;max-width:760px}",
			".mybr-hint{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:22px;margin:0}",
			".mybr-status{display:flex;flex-direction:column;gap:8px;padding:14px 16px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-module-platform)}",
			".mybr-status-head{display:flex;align-items:center;gap:10px}",
			".mybr-dot{width:8px;height:8px;border-radius:50%;flex:none}",
			".mybr-dot-running{background:var(--dsw-alias-state-success-primary)}",
			".mybr-dot-starting{background:var(--dsw-static-blue-600);animation:mybr-pulse 1.2s ease-in-out infinite}",
			".mybr-dot-error{background:var(--dsw-alias-state-error-primary)}",
			".mybr-dot-stopped{background:var(--dsw-alias-label-secondary)}",
			".mybr-status-title{color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px;font-weight:500}",
			".mybr-status-sub{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
			".mybr-status-err{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;word-break:break-word}",
			".mybr-path{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);word-break:break-all}",
			".mybr-actions{display:flex;align-items:center;gap:8px;margin-top:2px;flex-wrap:wrap}",
			".mybr-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}",
			".mybr-row:last-of-type{border-bottom:0}",
			".mybr-row-label{display:flex;flex-direction:column;gap:2px;min-width:0}",
			".mybr-row-title{color:var(--dsw-alias-label-primary);font-size:14px;line-height:20px}",
			".mybr-row-desc{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
			".mybr-control{flex:none;display:flex;align-items:center;gap:8px}",
			".mybr-input{border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:30px;padding:0 10px;border-radius:8px;width:160px;transition:border-color .15s ease}",
			".mybr-input:focus{outline:0;border-color:var(--dsw-static-blue-600)}",
			".mybr-select{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:30px;padding:0 10px;border-radius:8px;cursor:pointer;transition:border-color .15s ease}",
			".mybr-select:focus{outline:0;border-color:var(--dsw-static-blue-600)}",
			".mybr-switch{appearance:none;border:0;background:var(--dsw-alias-border-l2);width:36px;height:20px;border-radius:10px;position:relative;cursor:pointer;transition:background .18s ease;flex:none;padding:0}",
			".mybr-switch::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2);transition:transform .18s ease}",
			".mybr-switch-on{background:var(--dsw-static-blue-600)}",
			".mybr-switch-on::after{transform:translateX(16px)}",
			".mybr-switch:disabled{opacity:.5;cursor:default}",
			".mybr-btn{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;padding:6px 14px;border-radius:10px;cursor:pointer;flex:none;transition:background .15s ease,border-color .15s ease}",
			".mybr-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
			".mybr-btn:disabled{opacity:.5;cursor:default}",
			".mybr-btn-primary{border-color:transparent;color:#fff;background:var(--dsw-static-blue-600)}",
			".mybr-btn-primary:hover:not(:disabled){filter:brightness(1.08)}",
			".mybr-note{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
			".mybr-error{color:var(--dsw-alias-state-error-primary);font-size:13px;line-height:20px;padding:12px 14px;background:var(--dsw-alias-interactive-bg-hover-danger);border:1px solid var(--dsw-alias-border-l2);border-radius:12px}",
			".mybr-card{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;overflow:hidden;background:var(--dsw-alias-bg-module-platform)}",
			".mybr-card-body{padding:4px 16px 14px;display:flex;flex-direction:column}",
			"@keyframes mybr-pulse{0%,100%{opacity:1}50%{opacity:.35}}"
		].join("");
		const tagId = "@deepseek-ai/dsh-client-ui-browser/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-browser";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region data
		const STATUS_URL = "/api/browser";
		async function fetchStatus() {
			const res = await fetch(STATUS_URL, { method: "GET", cache: "no-store" });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.json();
		}
		async function postAction(payload) {
			const res = await fetch(STATUS_URL, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(payload)
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const body = await res.json();
			if (body.error !== undefined) throw new Error(body.error);
			return body;
		}
		//#endregion
		//#region components
		let boundT = (key) => key;
		let scopeRef = undefined;

		function Switch({ checked, onChange, disabled }) {
			return jsx("button", {
				type: "button",
				role: "switch",
				"aria-checked": checked,
				className: "mybr-switch" + (checked ? " mybr-switch-on" : ""),
				onClick: () => { if (!disabled) onChange(!checked); },
				disabled
			});
		}

		function BrowserSection() {
			const t = boundT;
			const [status, setStatus] = useState(undefined);
			const [error, setError] = useState(undefined);
			const [busy, setBusy] = useState(false);
			const [testUrl, setTestUrl] = useState("https://www.example.com");
			const snapshot = useSyncExternalStore(
				(cb) => { const off = scopeRef.subscribe(cb); return off; },
				() => scopeRef.getSnapshot()
			);
			const value = snapshot.value;
			const writable = snapshot.writable !== false;
			const cfg = {
				enabled: value?.enabled ?? true,
				browser: value?.browser ?? "auto",
				port: value?.port ?? 9222,
				headless: value?.headless ?? false,
				autoRemind: value?.autoRemind ?? true
			};
			const setField = (field, v) => { if (writable) scopeRef.set(field, v); };
			const refresh = useCallback(async () => {
				try {
					const data = await fetchStatus();
					setStatus(data);
					setError(undefined);
				} catch (err) {
					setError(err instanceof Error ? err.message : String(err));
				}
			}, []);
			useEffect(() => { void refresh(); }, [refresh]);
			const run = async (payload, busyLabel) => {
				setBusy(true);
				setError(undefined);
				try {
					const data = await postAction(payload);
					setStatus((s) => ({ ...(s ?? {}), runtime: { status: data.status ?? "error", error: data.error ?? null } }));
				} catch (err) {
					setError(err instanceof Error ? err.message : String(err));
				} finally {
					setBusy(false);
				}
			};
			const runtimeStatus = status?.runtime?.status ?? "stopped";
			const runtimeErr = status?.runtime?.error ?? undefined;
			const browserInfo = status?.browser;
			const dotClass = {
				running: "mybr-dot-running",
				starting: "mybr-dot-starting",
				error: "mybr-dot-error",
				stopped: "mybr-dot-stopped"
			}[runtimeStatus] ?? "mybr-dot-stopped";
			const statusTitle = runtimeStatus === "running"
				? t("status.running")
				: runtimeStatus === "starting"
					? t("status.starting")
					: runtimeStatus === "error"
						? t("status.error")
						: t("status.stopped");
			return jsxs("div", { className: "mybr-wrap", children: [
				jsx("p", { className: "mybr-hint", children: t("hint") }),
				error !== undefined ? jsx("div", { className: "mybr-error", children: error }) : null,
				jsxs("div", { className: "mybr-status", children: [
					jsxs("div", { className: "mybr-status-head", children: [
						jsx("span", { className: "mybr-dot " + dotClass }),
						jsx("span", { className: "mybr-status-title", children: statusTitle }),
						browserInfo !== undefined ? jsx("span", { className: "mybr-status-sub", children: `${browserInfo.label} · ${t("port")} ${cfg.port}` }) : null
					] }),
					browserInfo === undefined ? jsx("div", { className: "mybr-status-sub", children: t("notFound") }) : null,
					browserInfo !== undefined ? jsx("div", { className: "mybr-path", children: browserInfo.path }) : null,
					runtimeErr !== undefined ? jsx("div", { className: "mybr-status-err", children: runtimeErr }) : null,
					jsxs("div", { className: "mybr-actions", children: [
						jsx("button", { type: "button", className: "mybr-btn mybr-btn-primary", disabled: !cfg.enabled || busy || runtimeStatus === "running" || runtimeStatus === "starting", onClick: () => void run({ action: "start" }), children: t("start") }),
						jsx("button", { type: "button", className: "mybr-btn", disabled: !cfg.enabled || busy || runtimeStatus === "stopped", onClick: () => void run({ action: "stop" }), children: t("stop") }),
						jsx("button", { type: "button", className: "mybr-btn", disabled: !cfg.enabled || busy, onClick: () => void run({ action: "test", url: testUrl }), children: t("test") }),
						jsx("input", { className: "mybr-input", value: testUrl, onChange: (e) => setTestUrl(e.target.value), placeholder: "https://…", spellCheck: false })
					] })
				] }),
				jsxs("div", { className: "mybr-card", children: [
					jsxs("div", { className: "mybr-card-body", children: [
						jsxs("div", { className: "mybr-row", children: [
							jsxs("div", { className: "mybr-row-label", children: [jsx("div", { className: "mybr-row-title", children: t("enabled") }), jsx("div", { className: "mybr-row-desc", children: t("enabledDesc") })] }),
							jsx(Switch, { checked: cfg.enabled, onChange: (v) => setField("enabled", v) })
						] }),
						jsxs("div", { className: "mybr-row", children: [
							jsxs("div", { className: "mybr-row-label", children: [jsx("div", { className: "mybr-row-title", children: t("browser") }), jsx("div", { className: "mybr-row-desc", children: t("browserDesc") })] }),
							jsxs("select", { className: "mybr-select", value: cfg.browser, onChange: (e) => setField("browser", e.target.value), children: [
								jsx("option", { value: "auto", children: t("browser.auto") }),
								jsx("option", { value: "edge", children: t("browser.edge") }),
								jsx("option", { value: "chrome", children: t("browser.chrome") })
							] })
						] }),
						jsxs("div", { className: "mybr-row", children: [
							jsxs("div", { className: "mybr-row-label", children: [jsx("div", { className: "mybr-row-title", children: t("port") }), jsx("div", { className: "mybr-row-desc", children: t("portDesc") })] }),
							jsx("input", { type: "number", className: "mybr-input", value: cfg.port, min: 1024, max: 65535, onChange: (e) => setField("port", Number(e.target.value) || 9222) })
						] }),
						jsxs("div", { className: "mybr-row", children: [
							jsxs("div", { className: "mybr-row-label", children: [jsx("div", { className: "mybr-row-title", children: t("headless") }), jsx("div", { className: "mybr-row-desc", children: t("headlessDesc") })] }),
							jsx(Switch, { checked: cfg.headless, onChange: (v) => setField("headless", v) })
						] }),
						jsxs("div", { className: "mybr-row", children: [
							jsxs("div", { className: "mybr-row-label", children: [jsx("div", { className: "mybr-row-title", children: t("autoRemind") }), jsx("div", { className: "mybr-row-desc", children: t("autoRemindDesc") })] }),
							jsx(Switch, { checked: cfg.autoRemind, onChange: (v) => setField("autoRemind", v) })
						] })
					] })
				] }),
				jsx("p", { className: "mybr-note", children: t("note") })
			] });
		}
		//#endregion
		//#region plugin
		const NS = "settings.browser";
		const inject = ["slots", "locale", "settingsScope"];
		function apply(ctx) {
			scopeRef = ctx.settingsScope.bind({ namespace: "browser-control" });
			ctx.effect(() => ctx.locale.register(NS, {
				zh: {
					"nav": "浏览器控制",
					"hint": "启用后可驱动本机 Edge/Chrome 浏览器，让 AI 自动执行网页操作（打开、点击、输入、截图、执行 JS 等复杂自动化）。",
					"enabled": "启用浏览器控制",
					"enabledDesc": "关闭后 AI 无法使用 browser_control 工具。",
					"browser": "浏览器",
					"browserDesc": "选择要驱动的浏览器；自动检测优先使用 Edge。",
					"browser.auto": "自动检测",
					"browser.edge": "Microsoft Edge",
					"browser.chrome": "Google Chrome",
					"port": "调试端口",
					"portDesc": "浏览器远程调试端口，需避开占用。",
					"headless": "无头模式",
					"headlessDesc": "不显示浏览器窗口（后台运行）。",
					"autoRemind": "自动提醒",
					"autoRemindDesc": "在系统提示中注入浏览器控制能力说明。",
					"status.running": "运行中",
					"status.starting": "启动中…",
					"status.error": "异常",
					"status.stopped": "未启动",
					"notFound": "未检测到 Edge 或 Chrome，请在下方选择浏览器。",
					"start": "启动浏览器",
					"stop": "停止",
					"test": "测试打开",
					"note": "AI 通过 browser_control 工具驱动该浏览器（独立配置目录，不影响日常浏览）。复杂的网页自动化流程由 AI 自动编排。"
				},
				en: {
					"nav": "Browser control",
					"hint": "Drive this machine's Edge/Chrome so the AI can automate the web (open, click, type, screenshot, evaluate JS, and more).",
					"enabled": "Enable browser control",
					"enabledDesc": "When off, the AI cannot use the browser_control tool.",
					"browser": "Browser",
					"browserDesc": "Which browser to drive; auto-detect prefers Edge.",
					"browser.auto": "Auto-detect",
					"browser.edge": "Microsoft Edge",
					"browser.chrome": "Google Chrome",
					"port": "Debug port",
					"portDesc": "Remote debugging port; pick one that is free.",
					"headless": "Headless mode",
					"headlessDesc": "Run without a visible browser window.",
					"autoRemind": "Auto reminder",
					"autoRemindDesc": "Inject the browser-control capability note into the system prompt.",
					"status.running": "Running",
					"status.starting": "Starting…",
					"status.error": "Error",
					"status.stopped": "Stopped",
					"notFound": "No Edge or Chrome detected — pick a browser below.",
					"start": "Start browser",
					"stop": "Stop",
					"test": "Test open",
					"note": "The AI drives this browser through the browser_control tool (dedicated profile, does not affect your daily browsing). Complex automation is orchestrated by the AI."
				}
			}), "ui-browser: dictionaries");
			boundT = ctx.locale.bind(NS);
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "browser",
				order: 25,
				label: () => boundT("nav"),
				locale: NS
			}, BrowserSection));
		}
		//#endregion
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});

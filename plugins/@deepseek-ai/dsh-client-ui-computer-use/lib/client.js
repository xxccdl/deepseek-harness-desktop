window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-computer-use",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let jsxRuntime = require("react/jsx-runtime");
		const { jsx, jsxs, Fragment } = jsxRuntime;
		const { useState, useEffect, useMemo, useCallback, useSyncExternalStore, useRef } = react;
		//#region styles
		const css = [
			".mycu-wrap{display:flex;flex-direction:column;gap:16px;padding:4px 0 28px;max-width:760px}",
			".mycu-hint{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;margin:0}",
			".mycu-status{display:flex;flex-direction:column;gap:8px;padding:14px 16px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-module-platform)}",
			".mycu-status-head{display:flex;align-items:center;gap:10px}",
			".mycu-dot{width:8px;height:8px;border-radius:50%;flex:none}",
			".mycu-dot-ready{background:var(--dsw-alias-state-success-primary)}",
			".mycu-dot-provisioning{background:var(--dsw-static-blue-600);animation:mycu-pulse 1.2s ease-in-out infinite}",
			".mycu-dot-error{background:var(--dsw-alias-state-error-primary)}",
			".mycu-dot-disabled{background:var(--dsw-alias-label-secondary)}",
			".mycu-status-title{color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px;font-weight:500}",
			".mycu-status-sub{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
			".mycu-status-err{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;word-break:break-word}",
			".mycu-path{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);word-break:break-all}",
			".mycu-actions{display:flex;align-items:center;gap:8px;margin-top:2px}",
			".mycu-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}",
			".mycu-row:last-of-type{border-bottom:0}",
			".mycu-row-label{display:flex;flex-direction:column;gap:2px;min-width:0}",
			".mycu-row-title{color:var(--dsw-alias-label-primary);font-size:14px;line-height:20px}",
			".mycu-row-desc{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
			".mycu-control{flex:none;display:flex;align-items:center;gap:8px}",
			".mycu-input{border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:30px;padding:0 10px;border-radius:8px;width:160px;transition:border-color .15s ease}",
			".mycu-input:focus{outline:0;border-color:var(--dsw-static-blue-600)}",
			".mycu-switch{appearance:none;border:0;background:var(--dsw-alias-border-l2);width:36px;height:20px;border-radius:10px;position:relative;cursor:pointer;transition:background .18s ease;flex:none;padding:0}",
			".mycu-switch::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2);transition:transform .18s ease}",
			".mycu-switch-on{background:var(--dsw-static-blue-600)}",
			".mycu-switch-on::after{transform:translateX(16px)}",
			".mycu-switch:disabled{opacity:.5;cursor:default}",
			".mycu-btn{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;padding:6px 14px;border-radius:10px;cursor:pointer;flex:none;transition:background .15s ease,border-color .15s ease}",
			".mycu-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
			".mycu-btn:disabled{opacity:.5;cursor:default}",
			".mycu-note{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
			".mycu-loading{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;padding:24px 12px;text-align:center}",
			".mycu-error{color:var(--dsw-alias-state-error-primary);font-size:13px;line-height:20px;padding:12px 14px;background:var(--dsw-alias-interactive-bg-hover-danger);border:1px solid var(--dsw-alias-border-l2);border-radius:12px}",
			".mycu-logs{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;overflow:hidden;background:var(--dsw-alias-bg-module-platform)}",
			".mycu-logs-head{display:flex;align-items:center;justify-content:space-between;width:100%;appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;font-weight:500;padding:10px 14px;cursor:pointer}",
			".mycu-logs-head:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".mycu-logs-chevron{color:var(--dsw-alias-label-secondary);font-size:12px;transition:transform .15s ease}",
			".mycu-logs-open .mycu-logs-chevron{transform:rotate(90deg)}",
			".mycu-logs-body{display:flex;flex-direction:column;max-height:280px;overflow:auto;border-top:1px solid var(--dsw-alias-border-l1);padding:6px 0}",
			".mycu-log-line{display:flex;gap:10px;padding:2px 14px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:20px;white-space:pre-wrap;word-break:break-word}",
			".mycu-log-time{color:var(--dsw-alias-label-secondary);flex:none}",
			".mycu-log-msg{color:var(--dsw-alias-label-primary)}",
			".mycu-log-err .mycu-log-msg{color:var(--dsw-alias-state-error-primary)}",
			".mycu-logs-empty{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;padding:12px 14px}",
			"@keyframes mycu-pulse{0%,100%{opacity:1}50%{opacity:.35}}"
		].join("");
		const tagId = "@deepseek-ai/dsh-client-ui-computer-use/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-computer-use";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region data
		const STATUS_URL = "/api/computer-use";
		async function fetchStatus() {
			const res = await fetch(STATUS_URL, { method: "GET", cache: "no-store" });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.json();
		}
		async function fetchLogs() {
			const res = await fetch(`${STATUS_URL}/logs`, { method: "GET", cache: "no-store" });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.json();
		}
		async function triggerRebuild() {
			const res = await fetch(STATUS_URL, { method: "POST" });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.json();
		}
		//#endregion
		//#region components
		let scopeRef = undefined;
		let boundT = (key) => key;

		function Switch({ checked, onChange, disabled }) {
			return jsx("button", {
				type: "button",
				role: "switch",
				"aria-checked": checked,
				className: "mycu-switch" + (checked ? " mycu-switch-on" : ""),
				onClick: () => { if (!disabled) onChange(!checked); },
				disabled
			});
		}

		function TextField({ value, onChange, placeholder }) {
			const [draft, setDraft] = useState(value);
			useEffect(() => { setDraft(value); }, [value]);
			return jsx("input", {
				type: "text",
				className: "mycu-input",
				value: draft,
				placeholder,
				spellCheck: false,
				onChange: (e) => setDraft(e.target.value),
				onBlur: () => { if (draft.trim() !== "" && draft !== value) onChange(draft.trim()); }
			});
		}

		function StatusDot({ state }) {
			return jsx("span", { className: "mycu-dot mycu-dot-" + state });
		}

		function ComputerUseSection() {
			const t = boundT;
			const snapshot = useSyncExternalStore(
				(cb) => { const off = scopeRef.subscribe(cb); return off; },
				() => scopeRef.getSnapshot()
			);
			const value = snapshot.value;
			const ready = snapshot.status === "ready" && value !== undefined;
			const writable = snapshot.writable !== false;
			const config = {
				enabled: ready ? value.enabled : true,
				pythonVersion: ready ? value.pythonVersion : "3.13",
				package: ready ? value.package : "windows-mcp",
				autoRemind: ready ? value.autoRemind : true
			};
			const [status, setStatus] = useState(undefined);
			const [statusError, setStatusError] = useState(undefined);
			const [rebuilding, setRebuilding] = useState(false);
			const [logs, setLogs] = useState([]);
			const [logsOpen, setLogsOpen] = useState(false);
			const loadStatus = useCallback(async () => {
				try {
					const [s, l] = await Promise.all([fetchStatus(), fetchLogs()]);
					setStatus(s);
					setLogs(l.logs ?? []);
					setStatusError(undefined);
				} catch (err) {
					setStatusError(err instanceof Error ? err.message : String(err));
				}
			}, []);
			useEffect(() => {
				void loadStatus();
				const id = setInterval(() => void loadStatus(), 3000);
				return () => clearInterval(id);
			}, [loadStatus]);
			const mounted = status?.mounted ?? null;
			const mountedStatus = !config.enabled ? "disabled" : mounted?.status ?? (status === undefined ? "loading" : "provisioning");
			const rebuild = async () => {
				setRebuilding(true);
				try {
					await triggerRebuild();
				} catch { /* status polling surfaces errors */ }
				await loadStatus();
				setTimeout(() => setRebuilding(false), 6000);
			};
			const setField = (field, v) => { if (writable) scopeRef.set(field, v); };
			if (snapshot.status === "unavailable") {
				return jsxs("div", { className: "mycu-wrap", children: [
					jsx("div", { className: "mycu-error", children: t("unavailable") })
				] });
			}
			const statusTitle = {
				ready: t("status.ready"),
				provisioning: t("status.provisioning"),
				error: t("status.error"),
				disabled: t("status.disabled"),
				loading: t("status.loading")
			}[mountedStatus] ?? t("status.loading");
			const statusDot = mountedStatus === "ready" ? "ready"
				: mountedStatus === "error" ? "error"
				: mountedStatus === "disabled" ? "disabled" : "provisioning";
			return jsxs("div", { className: "mycu-wrap", children: [
				jsx("p", { className: "mycu-hint", children: t("hint") }),
				jsxs("div", { className: "mycu-status", children: [
					jsxs("div", { className: "mycu-status-head", children: [
						jsx(StatusDot, { state: statusDot }),
						jsx("span", { className: "mycu-status-title", children: statusTitle }),
						jsx("span", { className: "mycu-status-sub", children: mountedStatus === "ready" ? t("status.readySub") : mountedStatus === "provisioning" ? t("status.provisioningSub") : null })
					] }),
					mounted?.venvDir ? jsx("div", { className: "mycu-path", children: mounted.venvDir }) : null,
					mounted?.error ? jsx("div", { className: "mycu-status-err", children: mounted.error }) : null,
					statusError !== undefined ? jsx("div", { className: "mycu-status-err", children: `${t("error")}: ${statusError}` }) : null,
					jsx("div", { className: "mycu-actions", children: [
						jsx("button", { type: "button", className: "mycu-btn", onClick: () => void rebuild(), disabled: rebuilding || !config.enabled || mountedStatus === "provisioning", children: rebuilding ? t("rebuild.running") : t("rebuild") }),
						jsx("span", { className: "mycu-note", children: t("rebuild.note") })
					] })
				] }),
				jsxs("div", { className: "mycu-logs" + (logsOpen ? " mycu-logs-open" : ""), children: [
					jsxs("button", { type: "button", className: "mycu-logs-head", onClick: () => setLogsOpen(!logsOpen), children: [
						jsx("span", { children: t("logs.title") }),
						jsx("span", { className: "mycu-logs-chevron", children: "▸" })
					] }),
					logsOpen ? (logs.length === 0 ? jsx("div", { className: "mycu-logs-empty", children: t("logs.empty") }) : jsx("div", { className: "mycu-logs-body", children: logs.map((entry, index) => jsxs("div", {
						className: "mycu-log-line" + (entry.level === "error" ? " mycu-log-err" : ""),
						children: [
							jsx("span", { className: "mycu-log-time", children: (entry.time ?? "").slice(11, 19) }),
							jsx("span", { className: "mycu-log-msg", children: entry.message })
						]
					}, index)) })) : null
				] }),
				jsx("div", { className: "mycu-row", children: [
					jsxs("div", { className: "mycu-row-label", children: [
						jsx("div", { className: "mycu-row-title", children: t("enabled.title") }),
						jsx("div", { className: "mycu-row-desc", children: t("enabled.desc") })
					] }),
					jsx("div", { className: "mycu-control", children: jsx(Switch, { checked: config.enabled, onChange: (v) => setField("enabled", v), disabled: !ready || !writable }) })
				] }),
				jsx("div", { className: "mycu-row", children: [
					jsxs("div", { className: "mycu-row-label", children: [
						jsx("div", { className: "mycu-row-title", children: t("python.title") }),
						jsx("div", { className: "mycu-row-desc", children: t("python.desc") })
					] }),
					jsx("div", { className: "mycu-control", children: jsx(TextField, { value: config.pythonVersion, onChange: (v) => setField("pythonVersion", v), placeholder: "3.13" }) })
				] }),
				jsx("div", { className: "mycu-row", children: [
					jsxs("div", { className: "mycu-row-label", children: [
						jsx("div", { className: "mycu-row-title", children: t("package.title") }),
						jsx("div", { className: "mycu-row-desc", children: t("package.desc") })
					] }),
					jsx("div", { className: "mycu-control", children: jsx(TextField, { value: config.package, onChange: (v) => setField("package", v), placeholder: "windows-mcp" }) })
				] }),
				jsx("div", { className: "mycu-row", children: [
					jsxs("div", { className: "mycu-row-label", children: [
						jsx("div", { className: "mycu-row-title", children: t("remind.title") }),
						jsx("div", { className: "mycu-row-desc", children: t("remind.desc") })
					] }),
					jsx("div", { className: "mycu-control", children: jsx(Switch, { checked: config.autoRemind, onChange: (v) => setField("autoRemind", v), disabled: !ready || !writable }) })
				] })
			] });
		}
		//#endregion
		//#region plugin
		const NS = "settings.computer-use";
		const inject = ["slots", "locale", "settingsScope"];
		function apply(ctx) {
			scopeRef = ctx.settingsScope.bind({ namespace: "computer-use" });
			ctx.effect(() => ctx.locale.register(NS, {
				zh: {
					"nav": "电脑控制",
					"hint": "让 AI 直接操作本机 Windows 桌面（点击、输入、快捷键、打开应用、截图、文件与剪贴板、进程）。运行时由应用内置的 uv 和隔离的 Python 环境提供，无需自行安装。",
					"status.ready": "运行中",
					"status.readySub": "Windows-MCP 已就绪",
					"status.provisioning": "准备中…",
					"status.provisioningSub": "正在构建隔离运行时",
					"status.error": "运行异常",
					"status.disabled": "已停用",
					"status.loading": "读取状态…",
					"rebuild": "重建运行时",
					"rebuild.running": "重建中…",
					"rebuild.note": "修改下方配置后会自动重建；手动重建会清空并重新安装隔离环境。",
					"logs.title": "运行日志",
					"logs.empty": "暂无日志",
					"enabled.title": "启用电脑控制",
					"enabled.desc": "开启后 AI 可通过 Windows-MCP 控制电脑，并在会话中看到对应能力提醒。",
					"python.title": "Python 版本",
					"python.desc": "隔离环境使用的 Python 版本，由内置 uv 托管，不影响系统 Python。",
					"package.title": "PyPI 包名",
					"package.desc": "提供 windows-mcp 命令的 PyPI 包。",
					"remind.title": "会话能力提醒",
					"remind.desc": "在每次请求的系统提示中提醒 AI 它具备电脑控制能力。",
					"unavailable": "无法读取电脑控制配置。",
					"error": "读取失败"
				},
				en: {
					"nav": "Computer",
					"hint": "Let the AI operate this Windows desktop directly (click, type, shortcuts, open apps, screenshots, files & clipboard, processes). The runtime is provided by a bundled uv and an isolated Python environment — nothing to install.",
					"status.ready": "Running",
					"status.readySub": "Windows-MCP ready",
					"status.provisioning": "Preparing…",
					"status.provisioningSub": "Building the isolated runtime",
					"status.error": "Error",
					"status.disabled": "Disabled",
					"status.loading": "Reading status…",
					"rebuild": "Rebuild runtime",
					"rebuild.running": "Rebuilding…",
					"rebuild.note": "Changing the settings below rebuilds automatically; a manual rebuild wipes and reinstalls the isolated environment.",
					"logs.title": "Runtime log",
					"logs.empty": "No log entries yet",
					"enabled.title": "Enable computer use",
					"enabled.desc": "When on, the AI can control the PC through Windows-MCP and sees a capability reminder in sessions.",
					"python.title": "Python version",
					"python.desc": "Python version for the isolated environment, managed by the bundled uv; never touches system Python.",
					"package.title": "PyPI package",
					"package.desc": "The PyPI package providing the windows-mcp command.",
					"remind.title": "Session reminder",
					"remind.desc": "Remind the AI in every request's system prompt that it can control the computer.",
					"unavailable": "Could not read the computer-use configuration.",
					"error": "Read failed"
				}
			}), "ui-computer-use: dictionaries");
			boundT = ctx.locale.bind(NS);
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "computer-use",
				order: 21,
				label: () => boundT("nav"),
				locale: NS
			}, ComputerUseSection));
		}
		//#endregion
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});

window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-phone-control",
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
			".pc-wrap{display:flex;flex-direction:column;gap:18px;padding:6px 0 32px;max-width:780px}",
			".pc-hint{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:22px;margin:0}",
			".pc-card{border:1px solid var(--dsw-alias-border-l2);border-radius:14px;overflow:hidden;background:var(--dsw-alias-bg-module-platform);box-shadow:0 1px 2px rgba(0,0,0,.04)}",
			".pc-card-head{display:flex;align-items:center;gap:10px;width:100%;appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;font-weight:600;padding:13px 16px;cursor:pointer;text-align:left}",
			".pc-card-head:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".pc-head-dot{width:7px;height:7px;border-radius:50%;background:var(--dsw-static-blue-600);flex:none}",
			".pc-head-chevron{color:var(--dsw-alias-label-secondary);font-size:11px;margin-left:auto;transition:transform .18s ease}",
			".pc-open .pc-head-chevron{transform:rotate(90deg)}",
			".pc-card-body{border-top:1px solid var(--dsw-alias-border-l1);display:flex;flex-direction:column}",
			".pc-setrow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 16px}",
			".pc-setrow + .pc-setrow{border-top:1px solid var(--dsw-alias-border-l1)}",
			".pc-setrow-label{display:flex;flex-direction:column;gap:2px;min-width:0}",
			".pc-setrow-title{color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}",
			".pc-setrow-desc{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
			".pc-switch{appearance:none;border:0;background:var(--dsw-alias-border-l2);width:38px;height:22px;border-radius:11px;position:relative;cursor:pointer;transition:background .18s ease;flex:none;padding:0}",
			".pc-switch::after{content:'';position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.22);transition:transform .18s ease}",
			".pc-switch-on{background:var(--dsw-static-blue-600)}",
			".pc-switch-on::after{transform:translateX(16px)}",
			".pc-switch:disabled{opacity:.5;cursor:default}",
			".pc-status{display:inline-flex;align-items:center;gap:6px;font-size:12px;line-height:20px;border-radius:999px;padding:2px 10px;flex:none}",
			".pc-status-on{color:var(--dsw-static-green-600);background:color-mix(in srgb,var(--dsw-static-green-600) 12%,transparent)}",
			".pc-status-off{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover)}",
			".pc-btn{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;padding:7px 16px;border-radius:10px;cursor:pointer;flex:none;transition:background .15s ease,border-color .15s ease}",
			".pc-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
			".pc-btn:disabled{opacity:.5;cursor:default}",
			".pc-btn-primary{border-color:transparent;color:#fff;background:var(--dsw-static-blue-600)}",
			".pc-btn-primary:hover:not(:disabled){background:var(--dsw-static-blue-600);filter:brightness(1.08)}",
			".pc-actions{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;padding:14px 16px}",
			".pc-action{display:flex;align-items:flex-start;gap:9px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:11px 13px;background:var(--dsw-alias-bg-module-platform)}",
			".pc-action-k{flex:none;font-size:11px;line-height:18px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--dsw-static-blue-600);background:color-mix(in srgb,var(--dsw-static-blue-600) 10%,transparent);border-radius:6px;padding:0 6px}",
			".pc-action-d{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
			".pc-result{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:10px;padding:9px 12px;font-size:12px;line-height:19px;color:var(--dsw-alias-label-primary);word-break:break-word;white-space:pre-wrap;max-height:220px;overflow:auto;margin:12px 16px}",
			".pc-error{color:var(--dsw-alias-state-error-primary)}",
			".pc-actions-title{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary);padding:13px 16px 0}",
			".pc-actions-title .pc-head-dot{background:var(--dsw-alias-label-tertiary)}"
		].join("");
		const tagId = "@deepseek-ai/dsh-client-ui-phone-control/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-phone-control";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region api
		/** 原生手机控制本地服务（与 dsh web 同主机、不同端口；已加 CORS 允许跨端口）。 */
		const PHONE_URL = "http://127.0.0.1:3090";
		async function getStatus() {
			const res = await fetch(`${PHONE_URL}/api/status`, { method: "GET", cache: "no-store" });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.json();
		}
		async function testScreen() {
			const res = await fetch(`${PHONE_URL}/api/screen`, { method: "GET", cache: "no-store" });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.json();
		}
		/** 请求原生打开系统无障碍设置页。 */
		function requestEnable() {
			const bridge = window.ReactNativeWebView;
			if (bridge && typeof bridge.postMessage === "function") {
				bridge.postMessage(JSON.stringify({ type: "open-accessibility" }));
			}
		}
		//#endregion
		//#region components
		let boundT = (key) => key;

		function StatusPill({ enabled }) {
			return jsxs("span", {
				className: "pc-status " + (enabled ? "pc-status-on" : "pc-status-off"),
				children: [jsx("span", { className: "pc-head-dot", style: { background: enabled ? "var(--dsw-static-green-600)" : undefined } }), enabled ? boundT("status.on") : boundT("status.off")]
			});
		}

		function PhoneControlSection() {
			const [open, setOpen] = useState(true);
			const [status, setStatus] = useState(null); // null=loading, true/false=enabled
			const [checking, setChecking] = useState(false);
			const [testing, setTesting] = useState(false);
			const [result, setResult] = useState(null);
			const [error, setError] = useState(null);

			const refresh = useCallback(async () => {
				setChecking(true);
				setError(null);
				try {
					const data = await getStatus();
					setStatus(!!data.enabled);
				} catch (e) {
					setStatus(null);
					setError(e instanceof Error ? e.message : String(e));
				} finally {
					setChecking(false);
				}
			}, []);

			useEffect(() => {
				refresh();
				// 从系统设置返回后自动刷新状态
				const timer = setInterval(refresh, 4000);
				return () => clearInterval(timer);
			}, [refresh]);

			const runTest = useCallback(async () => {
				setTesting(true);
				setResult(null);
				setError(null);
				try {
					const data = await testScreen();
					if (data && data.ok) {
						const n = Array.isArray(data.elements) ? data.elements.length : 0;
						setResult(`读取成功：${n} 个可交互元素`);
						if (n > 0) {
							const sample = data.elements.slice(0, 5).map((el) => {
								const txt = el.text || el.desc || el.class || "";
								return txt.length > 40 ? txt.slice(0, 40) + "…" : txt;
							});
							setResult(`读取成功：${n} 个可交互元素\n示例：\n` + sample.join("\n"));
						}
					} else {
						setResult((data && data.error) || "读取失败");
					}
				} catch (e) {
					setError(e instanceof Error ? e.message : String(e));
				} finally {
					setTesting(false);
				}
			}, []);

			const toggle = useCallback(() => {
				// 开启 → 跳系统无障碍设置（Android 需用户在系统设置手动开启）
				requestEnable();
			}, []);

			return jsxs("div", {
				className: "pc-wrap",
				children: [
					jsx("p", { className: "pc-hint", children: boundT("hint") }),
					jsx("div", { className: "pc-card" + (open ? " pc-open" : ""), children: [
						jsx("button", {
							type: "button",
							className: "pc-card-head",
							onClick: () => setOpen(!open),
							"aria-expanded": open,
							children: [
								jsx("span", { className: "pc-head-dot" }),
								boundT("status.title"),
								jsx("span", { className: "pc-head-chevron", children: "▶" })
							]
						}),
						open && jsxs("div", {
							className: "pc-card-body",
							children: [
								jsxs("div", { className: "pc-setrow", children: [
									jsxs("div", { className: "pc-setrow-label", children: [
										jsx("span", { className: "pc-setrow-title", children: boundT("status.enable") }),
										jsx("span", { className: "pc-setrow-desc", children: boundT("status.enableDesc") })
									] }),
									jsx(StatusPill, { enabled: status === true })
								] }),
								jsxs("div", { className: "pc-setrow", children: [
									jsxs("div", { className: "pc-setrow-label", children: [
										jsx("span", { className: "pc-setrow-title", children: boundT("enable.title") }),
										jsx("span", { className: "pc-setrow-desc", children: boundT("enable.desc") })
									] }),
									jsx("button", {
										type: "button",
										className: "pc-btn " + (status === true ? "" : "pc-btn-primary"),
										disabled: checking,
										onClick: toggle,
										children: status === true ? boundT("enable.done") : boundT("enable.go")
									})
								] }),
								jsxs("div", { className: "pc-setrow", children: [
									jsxs("div", { className: "pc-setrow-label", children: [
										jsx("span", { className: "pc-setrow-title", children: boundT("test.title") }),
										jsx("span", { className: "pc-setrow-desc", children: boundT("test.desc") })
									] }),
									jsx("button", {
										type: "button",
										className: "pc-btn",
										disabled: testing || status !== true,
										onClick: runTest,
										children: testing ? boundT("test.running") : boundT("test.go")
									})
								] }),
								error !== null && jsx("div", { className: "pc-result pc-error", children: error }),
								result !== null && jsx("div", { className: "pc-result", children: result })
							]
						})
					] }),
					jsxs("div", { className: "pc-card", children: [
						jsx("div", { className: "pc-actions-title", children: [
							jsx("span", { className: "pc-head-dot" }),
							boundT("actions.title")
						] }),
						jsx("div", { className: "pc-actions", children: [
							["phone_screen", "actions.screen"],
							["phone_screenshot", "actions.screenshot"],
							["phone_tap", "actions.tap"],
							["phone_longpress", "actions.longpress"],
							["phone_swipe", "actions.swipe"],
							["phone_type", "actions.type"],
							["phone_scroll", "actions.scroll"],
							["phone_key", "actions.key"],
							["phone_open", "actions.open"],
							["phone_find", "actions.find"],
							["phone_notifications", "actions.notifications"]
						].map(([k, key]) => jsxs("div", { className: "pc-action", key: k, children: [
							jsx("span", { className: "pc-action-k", children: k }),
							jsx("span", { className: "pc-action-d", children: boundT(key) })
						] }))
					})
				]
				})
			]});
		}
		//#endregion
		//#region plugin
		const NS = "settings.phoneControl";
		const inject = ["slots", "locale"];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh: {
					"nav": "手机控制",
					"hint": "管理手机控制：开启后 AI 可读取当前屏幕的界面元素，并执行点击、长按、滑动、输入、滚动、按键、打开应用等操作来操控手机。使用支持视觉的多模态模型时，AI 还能截取屏幕画面直接查看（视觉控制），识别图标、图片、图表与整体布局。",
					"status.title": "服务状态",
					"status.enable": "无障碍服务",
					"status.enableDesc": "AI 操控手机依赖系统的无障碍服务。",
					"status.on": "已开启",
					"status.off": "未开启",
					"enable.title": "开启手机控制",
					"enable.desc": "点击后跳转到系统「无障碍」设置，找到 DeepSeek Harness 并打开开关。",
					"enable.go": "前往开启",
					"enable.done": "已开启",
					"test.title": "测试读取屏幕",
					"test.desc": "验证 AI 能否读取当前屏幕（请先切换到想读取的界面）。",
					"test.go": "测试",
					"test.running": "读取中…",
					"actions.title": "AI 可执行的操作",
					"actions.screen": "读取屏幕元素列表",
					"actions.screenshot": "截取屏幕画面（多模态模型直接看图）",
					"actions.tap": "点击（按文字或坐标）",
					"actions.longpress": "长按",
					"actions.swipe": "滑动（拖拽/翻页）",
					"actions.type": "输入文本",
					"actions.scroll": "滚动（上下左右）",
					"actions.key": "按键：返回/主页/最近/回车",
					"actions.open": "打开应用（包名）",
					"actions.find": "查找文字位置",
					"actions.notifications": "展开通知栏"
				},
				en: {
					"nav": "Phone control",
					"hint": "Manage phone control: when enabled, the AI can read the current screen's elements and tap, long-press, swipe, type, scroll, press keys, and open apps to operate your phone. With a vision-capable multimodal model, the AI can also capture the screen and see it directly (vision control) to recognize icons, images, charts, and overall layout.",
					"status.title": "Service status",
					"status.enable": "Accessibility service",
					"status.enableDesc": "AI phone control relies on the system accessibility service.",
					"status.on": "Enabled",
					"status.off": "Disabled",
					"enable.title": "Enable phone control",
					"enable.desc": "Opens system Accessibility settings; find DeepSeek Harness and turn it on.",
					"enable.go": "Enable",
					"enable.done": "Enabled",
					"test.title": "Test reading screen",
					"test.desc": "Verify the AI can read the screen (switch to the target app first).",
					"test.go": "Test",
					"test.running": "Reading…",
					"actions.title": "Actions the AI can run",
					"actions.screen": "Read screen elements",
					"actions.screenshot": "Capture screen (multimodal model sees the image)",
					"actions.tap": "Tap (by text or coordinate)",
					"actions.longpress": "Long-press",
					"actions.swipe": "Swipe (drag / flip pages)",
					"actions.type": "Type text",
					"actions.scroll": "Scroll (up/down/left/right)",
					"actions.key": "Keys: back/home/recents/enter",
					"actions.open": "Open app (package name)",
					"actions.find": "Find text position",
					"actions.notifications": "Open notification shade"
				}
			}), "ui-phone-control: dictionaries");
			boundT = ctx.locale.bind(NS);
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "phone-control",
				order: 22,
				label: () => boundT("nav"),
				locale: NS
			}, PhoneControlSection));
		}
		//#endregion
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});

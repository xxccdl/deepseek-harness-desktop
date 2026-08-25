window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-floatball",
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
			".fb-wrap{display:flex;flex-direction:column;gap:18px;padding:6px 0 32px;max-width:780px}",
			".fb-hint{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:22px;margin:0}",
			".fb-card{border:1px solid var(--dsw-alias-border-l2);border-radius:14px;overflow:hidden;background:var(--dsw-alias-bg-module-platform);box-shadow:0 1px 2px rgba(0,0,0,.04)}",
			".fb-setrow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 16px}",
			".fb-setrow + .fb-setrow{border-top:1px solid var(--dsw-alias-border-l1)}",
			".fb-setrow-label{display:flex;flex-direction:column;gap:2px;min-width:0}",
			".fb-setrow-title{color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}",
			".fb-setrow-desc{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
			".fb-status{display:inline-flex;align-items:center;gap:6px;font-size:12px;line-height:20px;border-radius:999px;padding:2px 10px;flex:none}",
			".fb-status-on{color:var(--dsw-static-green-600);background:color-mix(in srgb,var(--dsw-static-green-600) 12%,transparent)}",
			".fb-status-off{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover)}",
			".fb-btn{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;padding:7px 16px;border-radius:10px;cursor:pointer;flex:none;transition:background .15s ease,border-color .15s ease}",
			".fb-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
			".fb-btn:disabled{opacity:.5;cursor:default}",
			".fb-btn-primary{border-color:transparent;color:#fff;background:var(--dsw-static-blue-600)}",
			".fb-btn-primary:hover:not(:disabled){background:var(--dsw-static-blue-600);filter:brightness(1.08)}",
			".fb-dot{width:7px;height:7px;border-radius:50%;background:var(--dsw-static-blue-600);flex:none}",
			".fb-tips{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;padding:14px 16px}",
			".fb-tip{display:flex;align-items:flex-start;gap:9px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:11px 13px;background:var(--dsw-alias-bg-module-platform)}",
			".fb-tip-k{flex:none;font-size:11px;line-height:18px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--dsw-static-blue-600);background:color-mix(in srgb,var(--dsw-static-blue-600) 10%,transparent);border-radius:6px;padding:0 6px}",
			".fb-tip-d{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}"
		].join("");
		const tagId = "@deepseek-ai/dsh-client-ui-floatball/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-floatball";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region api
		const FB_URL = "http://127.0.0.1:3090";
		async function getStatus() {
			const res = await fetch(`${FB_URL}/api/floatball`, { method: "GET", cache: "no-store" });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.json();
		}
		/** 把控制指令发给 React Native 壳，由它调原生模块。 */
		function postToNative(msg) {
			const bridge = window.ReactNativeWebView;
			if (bridge && typeof bridge.postMessage === "function") {
				bridge.postMessage(JSON.stringify(msg));
			}
		}
		//#endregion
		//#region components
		let boundT = (key) => key;

		function StatusPill({ on }) {
			return jsxs("span", {
				className: "fb-status " + (on ? "fb-status-on" : "fb-status-off"),
				children: [jsx("span", { className: "fb-dot", style: { background: on ? "var(--dsw-static-green-600)" : undefined } }), on ? boundT("status.on") : boundT("status.off")]
			});
		}

		function FloatBallSection() {
			const [status, setStatus] = useState(null); // null=加载中
			const [checking, setChecking] = useState(false);

			const refresh = useCallback(async () => {
				setChecking(true);
				try {
					const data = await getStatus();
					setStatus(data);
				} catch (e) {
					setStatus(null);
				} finally {
					setChecking(false);
				}
			}, []);

			useEffect(() => {
				refresh();
				const timer = setInterval(refresh, 2500);
				return () => clearInterval(timer);
			}, [refresh]);

			const permission = !!status?.permission;
			const enabled = !!status?.enabled;

			return jsxs("div", {
				className: "fb-wrap",
				children: [
					jsx("p", { className: "fb-hint", children: boundT("hint") }),
					jsx("div", {
						className: "fb-card",
						children: [
							jsxs("div", { className: "fb-setrow", children: [
								jsxs("div", { className: "fb-setrow-label", children: [
									jsx("span", { className: "fb-setrow-title", children: boundT("perm.title") }),
									jsx("span", { className: "fb-setrow-desc", children: boundT("perm.desc") })
								] }),
								jsx(StatusPill, { on: permission })
							] }),
							jsxs("div", { className: "fb-setrow", children: [
								jsxs("div", { className: "fb-setrow-label", children: [
									jsx("span", { className: "fb-setrow-title", children: boundT("run.title") }),
									jsx("span", { className: "fb-setrow-desc", children: boundT("run.desc") })
								] }),
								jsx(StatusPill, { on: enabled })
							] }),
							jsxs("div", { className: "fb-setrow", children: [
								jsxs("div", { className: "fb-setrow-label", children: [
									jsx("span", { className: "fb-setrow-title", children: enabled ? boundT("ctrl.onTitle") : boundT("ctrl.offTitle") }),
									jsx("span", { className: "fb-setrow-desc", children: boundT("ctrl.desc") })
								] }),
								!permission
									? jsx("button", {
										type: "button",
										className: "fb-btn fb-btn-primary",
										disabled: checking,
										onClick: () => postToNative({ type: "floatball-open-settings" }),
										children: boundT("ctrl.grant")
									})
									: enabled
										? jsx("button", {
											type: "button",
											className: "fb-btn",
											disabled: checking,
											onClick: () => postToNative({ type: "floatball-stop" }),
											children: boundT("ctrl.stop")
										})
										: jsx("button", {
											type: "button",
											className: "fb-btn fb-btn-primary",
											disabled: checking,
											onClick: () => postToNative({ type: "floatball-start" }),
											children: boundT("ctrl.start")
										})
							] })
						]
					}),
					jsx("div", {
						className: "fb-card",
						children: [
							jsxs("div", { className: "fb-setrow", children: [
								jsxs("div", { className: "fb-setrow-label", children: [
									jsx("span", { className: "fb-setrow-title", children: boundT("tips.title") }),
									jsx("span", { className: "fb-setrow-desc", children: boundT("tips.desc") })
								] })
							] }),
							jsx("div", { className: "fb-tips", children: [
								["拖动", "tips.drag"],
								["点击", "tips.tap"],
								["长按", "tips.longpress"]
							].map(([k, key]) => jsxs("div", { className: "fb-tip", key: k, children: [
								jsx("span", { className: "fb-tip-k", children: k }),
								jsx("span", { className: "fb-tip-d", children: boundT(key) })
							] }))
						})
						]
					})
				]
			});
		}
		//#endregion
		//#region plugin
		const NS = "settings.floatball";
		const inject = ["slots", "locale"];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh: {
					"nav": "悬浮球",
					"hint": "在手机桌面（任意应用之上）显示 DeepSeek 悬浮球。右下角小圆点实时反映 dsh 服务状态：绿色=运行中，灰色=未运行。",
					"perm.title": "悬浮窗权限",
					"perm.desc": "显示在其他应用上层需要系统悬浮窗权限。",
					"run.title": "悬浮球状态",
					"run.desc": "服务是否正在运行。",
					"status.on": "已开启",
					"status.off": "未开启",
					"ctrl.onTitle": "悬浮球运行中",
					"ctrl.offTitle": "控制悬浮球",
					"ctrl.desc": "启动后可在桌面看到悬浮球，随时回到对话。",
					"ctrl.grant": "前往授权",
					"ctrl.start": "启动悬浮球",
					"ctrl.stop": "关闭悬浮球",
					"tips.title": "操作方式",
					"tips.desc": "悬浮球支持以下操作",
					"tips.drag": "拖动：任意移动，松手自动吸附边缘",
					"tips.tap": "点击：打开 App 主界面",
					"tips.longpress": "长按：查看 dsh / 手机控制状态，或关闭悬浮球"
				},
				en: {
					"nav": "Floating ball",
					"hint": "Show a DeepSeek floating ball on the phone desktop (above any app). The dot shows dsh status: green=running, gray=stopped.",
					"perm.title": "Overlay permission",
					"perm.desc": "Drawing over other apps requires the system overlay permission.",
					"run.title": "Floating ball status",
					"run.desc": "Whether the service is running.",
					"status.on": "Enabled",
					"status.off": "Disabled",
					"ctrl.onTitle": "Floating ball running",
					"ctrl.offTitle": "Control floating ball",
					"ctrl.desc": "Start to show the floating ball on the desktop.",
					"ctrl.grant": "Grant",
					"ctrl.start": "Start floating ball",
					"ctrl.stop": "Stop floating ball",
					"tips.title": "Gestures",
					"tips.desc": "Supported gestures",
					"tips.drag": "Drag: move freely, snap to edge on release",
					"tips.tap": "Tap: open the app",
					"tips.longpress": "Long-press: view dsh / phone-control status or close the ball"
				}
			}), "ui-floatball: dictionaries");
			boundT = ctx.locale.bind(NS);
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "floatball",
				order: 23,
				label: () => boundT("nav"),
				locale: NS
			}, FloatBallSection));
		}
		//#endregion
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});

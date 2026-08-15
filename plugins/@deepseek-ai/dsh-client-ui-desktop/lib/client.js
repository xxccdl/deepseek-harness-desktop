window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-desktop",
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
			".mydesk-wrap{display:flex;flex-direction:column;gap:14px;padding:4px 0 28px;max-width:760px}",
			".mydesk-hint{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;margin:0}",
			".mydesk-note{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;padding:16px 14px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-module-platform)}",
			".mydesk-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}",
			".mydesk-row:last-of-type{border-bottom:0}",
			".mydesk-row-label{display:flex;flex-direction:column;gap:2px;min-width:0}",
			".mydesk-row-title{color:var(--dsw-alias-label-primary);font-size:14px;line-height:20px}",
			".mydesk-row-desc{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
			".mydesk-control{flex:none;display:flex;align-items:center;gap:8px}",
			".mydesk-switch{appearance:none;border:0;background:var(--dsw-alias-border-l2);width:36px;height:20px;border-radius:10px;position:relative;cursor:pointer;transition:background .18s ease;flex:none;padding:0}",
			".mydesk-switch::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2);transition:transform .18s ease}",
			".mydesk-switch-on{background:var(--dsw-static-blue-600)}",
			".mydesk-switch-on::after{transform:translateX(16px)}",
			".mydesk-switch:disabled{opacity:.5;cursor:default}",
			".mydesk-input{border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:30px;padding:0 10px;border-radius:8px;width:200px;transition:border-color .15s ease}",
			".mydesk-input:focus{outline:0;border-color:var(--dsw-static-blue-600)}",
			".mydesk-status{color:var(--dsw-alias-state-success-primary);font-size:12px;line-height:18px;white-space:nowrap}",
			".mydesk-status-off{color:var(--dsw-alias-label-secondary)}"
		].join("");
		const tagId = "@deepseek-ai/dsh-client-ui-desktop/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-desktop";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region bridge
		const desktop = typeof window !== "undefined" && typeof window.dshDesktop === "object" && window.dshDesktop !== null
			? window.dshDesktop
			: undefined;
		//#endregion
		//#region components
		let boundT = (key) => key;

		function Switch({ checked, onChange, disabled }) {
			return jsx("button", {
				type: "button",
				role: "switch",
				"aria-checked": checked,
				className: "mydesk-switch" + (checked ? " mydesk-switch-on" : ""),
				onClick: () => { if (!disabled) onChange(!checked); },
				disabled
			});
		}

		function HotkeyField({ value, onChange }) {
			const [draft, setDraft] = useState(value);
			useEffect(() => { setDraft(value); }, [value]);
			return jsx("input", {
				type: "text",
				className: "mydesk-input",
				value: draft,
				placeholder: "CommandOrControl+Shift+Space",
				spellCheck: false,
				onChange: (e) => setDraft(e.target.value),
				onBlur: () => { if (draft !== value) onChange(draft.trim()); }
			});
		}

		function DesktopSection() {
			const t = boundT;
			const [settings, setSettings] = useState({ tray: false, autoLaunch: false, hotkey: "", trayActive: false, hotkeyActive: false });
			const [loaded, setLoaded] = useState(false);
			const refresh = useCallback(async () => {
				try {
					setSettings(await desktop.getDesktopSettings());
				} catch { /* non-fatal */ }
				setLoaded(true);
			}, []);
			useEffect(() => { void refresh(); }, [refresh]);
			const update = async (patch) => {
				try {
					setSettings(await desktop.setDesktopSettings(patch));
				} catch { /* non-fatal */ }
			};
			const row = (title, desc, control) => jsxs("div", { className: "mydesk-row", children: [
				jsxs("div", { className: "mydesk-row-label", children: [
					jsx("div", { className: "mydesk-row-title", children: title }),
					jsx("div", { className: "mydesk-row-desc", children: desc })
				] }),
				jsx("div", { className: "mydesk-control", children: control })
			] });
			if (!desktop) {
				return jsxs("div", { className: "mydesk-wrap", children: [
					jsx("p", { className: "mydesk-hint", children: t("hint") }),
					jsx("div", { className: "mydesk-note", children: t("notDesktop") })
				] });
			}
			return jsxs("div", { className: "mydesk-wrap", children: [
				jsx("p", { className: "mydesk-hint", children: t("hint") }),
				row(t("tray.title"), t("tray.desc"), jsxs(Fragment, { children: [
					jsx(Switch, { checked: settings.tray === true, onChange: (v) => void update({ tray: v }), disabled: !loaded }),
					jsx("span", { className: "mydesk-status" + (settings.trayActive ? "" : " mydesk-status-off"), children: settings.trayActive ? t("on") : t("off") })
				] })),
				row(t("autoLaunch.title"), t("autoLaunch.desc"), jsx(Switch, { checked: settings.autoLaunch === true, onChange: (v) => void update({ autoLaunch: v }), disabled: !loaded })),
				row(t("hotkey.title"), t("hotkey.desc"), jsxs(Fragment, { children: [
					jsx(HotkeyField, { value: settings.hotkey ?? "", onChange: (v) => void update({ hotkey: v }) }),
					jsx("span", { className: "mydesk-status" + (settings.hotkeyActive ? "" : " mydesk-status-off"), children: settings.hotkeyActive ? t("on") : t("off") })
				] }))
			] });
		}
		//#endregion
		//#region plugin
		const NS = "settings.desktop";
		const inject = ["slots", "locale"];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh: {
					"nav": "桌面",
					"hint": "管理应用在桌面环境中的行为：系统托盘、开机自启与全局快捷键。",
					"notDesktop": "这些选项仅在桌面版应用中可用。",
					"tray.title": "系统托盘",
					"tray.desc": "在系统托盘显示图标；开启后点击关闭按钮会最小化到托盘而不是退出。",
					"autoLaunch.title": "开机自启",
					"autoLaunch.desc": "登录 Windows 时自动启动应用。",
					"hotkey.title": "全局快捷键",
					"hotkey.desc": "任意应用前台时按下即可唤起主窗口；留空表示禁用。格式如 CommandOrControl+Shift+Space。",
					"on": "已开启",
					"off": "已关闭"
				},
				en: {
					"nav": "Desktop",
					"hint": "Manage how the app behaves on the desktop: system tray, launch at login, and the global hotkey.",
					"notDesktop": "These options are only available in the desktop app.",
					"tray.title": "System tray",
					"tray.desc": "Show an icon in the system tray; when on, closing the window minimizes to the tray instead of quitting.",
					"autoLaunch.title": "Launch at login",
					"autoLaunch.desc": "Start the app automatically when you sign in to Windows.",
					"hotkey.title": "Global hotkey",
					"hotkey.desc": "Summons the main window from any app; leave empty to disable. Format like CommandOrControl+Shift+Space.",
					"on": "On",
					"off": "Off"
				}
			}), "ui-desktop: dictionaries");
			boundT = ctx.locale.bind(NS);
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "desktop",
				order: 22,
				label: () => boundT("nav"),
				locale: NS
			}, DesktopSection));
		}
		//#endregion
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});

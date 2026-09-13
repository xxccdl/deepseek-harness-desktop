/**
 * 外观美化 (UI theme polish) — a curated palette layer plus body-text sizing.
 *
 * Registers one page in `settings.section` and stacks exactly one token
 * override layer over the active theme. Nothing global is mutated: the layer is
 * keyed by this package id, composes on top of whichever light/dark theme the
 * user picked (so both schemes stay coherent), and is removed with the plugin.
 *
 * The only product preference written here is the built-in conversation font
 * size, through `theme.setFontSize` — the same entry point the shipped
 * Appearance section uses.
 */
window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-theme-polish",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const react = require("react");
		const h = react.createElement;
		const { useState, useEffect } = react;

		const PLUGIN_ID = "@deepseek-ai/dsh-client-ui-theme-polish";
		const NS = "ui-theme-polish";
		const STYLE_KEY = PLUGIN_ID + "/styles";
		const STORE_KEY = "dsh.ui-theme-polish.v1";
		const DEFAULT_PRESET = "porcelain";
		const FONT_SIZES = [13, 14, 15, 16, 17];
		const CHIP_KEYS = ["bg", "layer1", "brand", "label1"];

		//#region palette
		/** Short name → the theme token it overrides. All 13 alias tokens the theme exposes. */
		const TOKEN_MAP = [
			["bg", "--dsw-alias-bg-base"],
			["layer1", "--dsw-alias-bg-layer-1"],
			["layer2", "--dsw-alias-bg-layer-2"],
			["overlay", "--dsw-alias-bg-overlay"],
			["border1", "--dsw-alias-border-l1"],
			["border2", "--dsw-alias-border-l2"],
			["brand", "--dsw-alias-brand-primary"],
			["label1", "--dsw-alias-label-primary"],
			["label2", "--dsw-alias-label-secondary"],
			["error", "--dsw-alias-state-error-primary"],
			["success", "--dsw-alias-state-success-primary"],
			["warn", "--dsw-alias-state-warn-primary"],
			["sidebar", "--dsw-specific-sidebar-fill"],
		];

		/** Light and dark values for every token, so the palette survives a scheme flip. */
		const PRESETS = [
			{ id: "default" },
			{
				id: "porcelain",
				light: { bg: "#f6f7f9", layer1: "#ffffff", layer2: "#f1f3f6", overlay: "#ffffff", border1: "#e9ebf0", border2: "#d7dbe4", brand: "#4f6ef7", label1: "#1b1f27", label2: "#6b7280", error: "#e5484d", success: "#12a594", warn: "#e5a000", sidebar: "#fbfbfd" },
				dark: { bg: "#0e1013", layer1: "#16191e", layer2: "#1e222a", overlay: "#1a1e24", border1: "#262b33", border2: "#343b46", brand: "#7c93ff", label1: "#e8eaf0", label2: "#98a1b0", error: "#ff6369", success: "#30a46c", warn: "#ffb224", sidebar: "#101317" },
			},
			{
				id: "mist",
				light: { bg: "#eef3f9", layer1: "#f9fcff", layer2: "#e7eff8", overlay: "#ffffff", border1: "#dbe5f1", border2: "#c5d5e8", brand: "#2f7ff0", label1: "#132133", label2: "#5d7391", error: "#d93a45", success: "#0f9d8a", warn: "#dd8a00", sidebar: "#e9f1f9" },
				dark: { bg: "#0b1420", layer1: "#101c2b", layer2: "#16273a", overlay: "#12202f", border1: "#1f3247", border2: "#2c4661", brand: "#4f9dff", label1: "#e3edf9", label2: "#8fa7c0", error: "#ff6166", success: "#2bb39c", warn: "#f5b02e", sidebar: "#0d1723" },
			},
			{
				id: "jade",
				light: { bg: "#f2f5f3", layer1: "#ffffff", layer2: "#eaf1ed", overlay: "#ffffff", border1: "#dde6e0", border2: "#c7d5cc", brand: "#0f9d76", label1: "#16211c", label2: "#5c6b63", error: "#d64545", success: "#0f9d76", warn: "#c98a00", sidebar: "#edf3ef" },
				dark: { bg: "#0a1210", layer1: "#101b17", layer2: "#16241f", overlay: "#12201b", border1: "#1e312a", border2: "#2b463c", brand: "#34d1a3", label1: "#e2efe9", label2: "#8aa79a", error: "#ff6b6b", success: "#34d1a3", warn: "#e8b44a", sidebar: "#0c1613" },
			},
			{
				id: "sand",
				light: { bg: "#faf6f0", layer1: "#fffdfa", layer2: "#f4ede3", overlay: "#fffdfa", border1: "#ece1d3", border2: "#dccdb9", brand: "#c2703e", label1: "#2b241d", label2: "#7a6b5c", error: "#d05252", success: "#4f9d68", warn: "#d99a2b", sidebar: "#f7f1e8" },
				dark: { bg: "#14100c", layer1: "#1d1813", layer2: "#26201a", overlay: "#221c16", border1: "#332a21", border2: "#483b2d", brand: "#e5925c", label1: "#f2e9de", label2: "#b3a08c", error: "#ff7575", success: "#6cbb84", warn: "#f0b64a", sidebar: "#17120e" },
			},
			{
				id: "neon",
				light: { bg: "#f7f5fc", layer1: "#ffffff", layer2: "#f0ecfa", overlay: "#ffffff", border1: "#e6dff6", border2: "#d3c8ee", brand: "#7c3aed", label1: "#1d1830", label2: "#6a6183", error: "#e0405f", success: "#12a594", warn: "#e0910a", sidebar: "#f4f1fc" },
				dark: { bg: "#0c0a14", layer1: "#14101f", layer2: "#1c172b", overlay: "#181327", border1: "#2a2340", border2: "#3c3258", brand: "#a98bff", label1: "#eae6f7", label2: "#a196c0", error: "#ff5d7a", success: "#2fbfa5", warn: "#ffb52e", sidebar: "#0e0b18" },
			},
		];

		function findPreset(id) {
			for (let i = 0; i < PRESETS.length; i++) {
				if (PRESETS[i].id === id) return PRESETS[i];
			}
			return null;
		}

		/** Turn one preset into the `{ light, dark }` pairs `theme.overrideTokens` expects. */
		function buildTokens(preset) {
			const out = {};
			for (let i = 0; i < TOKEN_MAP.length; i++) {
				const short = TOKEN_MAP[i][0];
				out[TOKEN_MAP[i][1]] = { light: preset.light[short], dark: preset.dark[short] };
			}
			return out;
		}
		//#endregion

		//#region styles
		const CSS = [
			".up-root{display:flex;flex-direction:column;gap:22px;padding:6px 2px 28px;color:var(--dsw-alias-label-primary);font-family:inherit}",
			".up-head{display:flex;flex-direction:column;gap:6px}",
			".up-title{font-size:17px;font-weight:600;letter-spacing:.01em}",
			".up-sub{font-size:13px;line-height:1.65;color:var(--dsw-alias-label-secondary);max-width:62ch}",
			".up-block{display:flex;flex-direction:column;gap:10px}",
			".up-label{font-size:11px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--dsw-alias-label-secondary)}",
			".up-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(176px,1fr));gap:12px}",
			".up-card{appearance:none;display:flex;flex-direction:column;gap:9px;text-align:left;cursor:pointer;padding:12px 13px;border-radius:13px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:inherit;font:inherit;transition:border-color .16s ease,box-shadow .16s ease,transform .16s ease}",
			".up-card:hover{border-color:var(--dsw-alias-border-l2);transform:translateY(-1px);box-shadow:0 10px 24px -18px var(--dsw-alias-label-primary)}",
			".up-card:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}",
			".up-card.is-active{border-color:var(--dsw-alias-brand-primary);box-shadow:inset 0 0 0 1px var(--dsw-alias-brand-primary)}",
			".up-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px}",
			".up-name{font-size:13.5px;font-weight:600}",
			".up-badge{font-size:10px;font-weight:700;letter-spacing:.04em;padding:2px 7px;border-radius:999px;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-layer-1)}",
			".up-note{font-size:12px;line-height:1.55;color:var(--dsw-alias-label-secondary)}",
			".up-chips{display:flex;gap:6px}",
			".up-chip{width:28px;height:13px;border-radius:4px;border:1px solid var(--dsw-alias-border-l1)}",
			".up-row{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:12px 14px;border-radius:13px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}",
			".up-row-text{display:flex;flex-direction:column;gap:3px}",
			".up-row-title{font-size:13.5px;font-weight:600}",
			".up-hint{font-size:12px;color:var(--dsw-alias-label-secondary)}",
			".up-seg{display:inline-flex;gap:2px;padding:3px;border-radius:11px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1)}",
			".up-size{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;min-width:42px;padding:5px 8px;border-radius:8px;cursor:pointer;transition:background .14s ease,color .14s ease}",
			".up-size:hover{color:var(--dsw-alias-label-primary)}",
			".up-size:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}",
			".up-size.is-active{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 1px 3px -1px rgba(0,0,0,.25)}",
			".up-preview{display:flex;gap:14px;padding:14px;border-radius:15px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base)}",
			".up-pv-side{flex:0 0 104px;display:flex;flex-direction:column;gap:9px;padding:11px 10px;border-radius:11px;background:var(--dsw-specific-sidebar-fill);border:1px solid var(--dsw-alias-border-l1)}",
			".up-pv-bar{height:7px;border-radius:4px;background:var(--dsw-alias-border-l2)}",
			".up-pv-brand{height:7px;border-radius:4px;background:var(--dsw-alias-brand-primary);opacity:.85}",
			".up-w45{width:45%}.up-w60{width:60%}.up-w70{width:70%}.up-w80{width:80%}",
			".up-pv-main{flex:1;display:flex;flex-direction:column;gap:10px;min-width:0}",
			".up-pv-bubble{align-self:flex-end;width:62%;height:28px;border-radius:10px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1)}",
			".up-pv-card{display:flex;flex-direction:column;gap:9px;padding:11px 12px;border-radius:12px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1)}",
			".up-pv-foot{display:flex;align-items:center;justify-content:space-between;gap:10px}",
			".up-pv-btn{padding:5px 13px;border-radius:9px;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-layer-1);font-size:11.5px;font-weight:600}",
			".up-dots{display:flex;gap:5px}",
			".up-dot{width:10px;height:10px;border-radius:50%}",
			".up-foot{display:flex;align-items:center;gap:12px;flex-wrap:wrap}",
			".up-reset{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;padding:7px 14px;border-radius:9px;cursor:pointer;transition:border-color .14s ease,color .14s ease}",
			".up-reset:hover{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}",
			".up-reset:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}",
			".up-foot-note{font-size:12px;color:var(--dsw-alias-label-secondary)}",
			"@media (prefers-reduced-motion:reduce){.up-card,.up-size,.up-reset{transition:none!important}}",
		].join("");

		/** Inject this plugin's stylesheet once; returns a disposer that removes it. */
		function installStyles() {
			if (typeof document === "undefined") return () => {};
			if (document.querySelector('style[data-plugin-css="' + STYLE_KEY + '"]') !== null) return () => {};
			const tag = document.createElement("style");
			tag.dataset.plugin = PLUGIN_ID;
			tag.dataset.pluginCss = STYLE_KEY;
			tag.textContent = CSS;
			document.head.appendChild(tag);
			return () => {
				if (tag.parentNode !== null) tag.parentNode.removeChild(tag);
			};
		}
		//#endregion

		//#region dictionaries
		const DICTS = {
			zh: {
				nav: "外观美化",
				title: "外观美化",
				subtitle: "用一套更耐看的配色替换 DSH 默认外观：底色、卡片层级、描边和强调色一起调整，正文显示大小也能顺手改。所有改动随时可还原。",
				palette: "调色板",
				active: "使用中",
				fontSize: "正文字号",
				fontHint: "只影响对话正文的显示大小，其余界面不变。",
				preview: "实时预览",
				previewBtn: "按钮",
				reset: "全部还原",
				resetHint: "回到 DSH 原始外观与默认字号。",
				p_default: "原始外观",
				n_default: "DSH 自带配色，不做任何覆盖。",
				p_porcelain: "极简白",
				n_porcelain: "干净的冷白底，卡片浮起，描边更柔和。",
				p_mist: "雾蓝",
				n_mist: "偏冷的蓝灰阶，长时间阅读更安静。",
				p_jade: "墨玉",
				n_jade: "墨绿与深青，低调但有质感。",
				p_sand: "暖砂",
				n_sand: "米色纸感配赤陶强调，温暖不刺眼。",
				p_neon: "霓虹夜",
				n_neon: "高饱和紫调，深色模式下最有精神。",
			},
			en: {
				nav: "Appearance+",
				title: "Appearance polish",
				subtitle: "Swap the shipped DSH palette for a more considered one: base, surfaces, borders and accent move together, and the body text size is adjustable too. Every change is reversible.",
				palette: "Palettes",
				active: "Active",
				fontSize: "Body text size",
				fontHint: "Affects conversation body text only.",
				preview: "Live preview",
				previewBtn: "Button",
				reset: "Restore everything",
				resetHint: "Back to the original look and default size.",
				p_default: "Original",
				n_default: "The shipped DSH palette, no overrides.",
				p_porcelain: "Porcelain",
				n_porcelain: "Clean cool-white surfaces with softer borders.",
				p_mist: "Mist Blue",
				n_mist: "A cool blue-grey ramp, calm for long reading.",
				p_jade: "Ink Jade",
				n_jade: "Deep jade and teal: restrained but tactile.",
				p_sand: "Warm Sand",
				n_sand: "Paper tones with a terracotta accent.",
				p_neon: "Neon Night",
				n_neon: "Saturated violet, liveliest in dark mode.",
			},
		};
		//#endregion

		//#region state
		/** Current selection; `fontSize` mirrors the product preference, not a copy we own. */
		let current = { presetId: DEFAULT_PRESET, fontSize: null };
		const listeners = new Set();
		let layerDispose = null;

		function notify() {
			listeners.forEach((fn) => {
				try { fn(); } catch (err) { console.error("ui-theme-polish: listener failed", err); }
			});
		}
		function patch(next) {
			current = Object.assign({}, current, next);
			notify();
		}
		function subscribe(fn) {
			listeners.add(fn);
			return () => { listeners.delete(fn); };
		}

		function readStoredPreset() {
			try {
				if (typeof localStorage === "undefined") return null;
				const raw = localStorage.getItem(STORE_KEY);
				if (raw === null) return null;
				const parsed = JSON.parse(raw);
				if (parsed !== null && typeof parsed === "object" && typeof parsed.presetId === "string") {
					return findPreset(parsed.presetId) === null ? null : parsed.presetId;
				}
			} catch (err) {
				console.error("ui-theme-polish: stored palette unreadable", err);
			}
			return null;
		}
		function writeStoredPreset(id) {
			try {
				if (typeof localStorage === "undefined") return;
				localStorage.setItem(STORE_KEY, JSON.stringify({ presetId: id }));
			} catch (err) {
				console.error("ui-theme-polish: stored palette unwritable", err);
			}
		}

		function releaseLayer() {
			if (layerDispose === null) return;
			const dispose = layerDispose;
			layerDispose = null;
			try { dispose(); } catch (err) { console.error("ui-theme-polish: token layer dispose failed", err); }
		}

		/** Stack the chosen palette over the active theme; `default` drops the layer entirely. */
		function applyPreset(theme, id) {
			const preset = findPreset(id);
			if (preset === null) return;
			releaseLayer();
			if (preset.light !== undefined) {
				try {
					layerDispose = theme.overrideTokens(PLUGIN_ID, buildTokens(preset));
				} catch (err) {
					console.error("ui-theme-polish: palette rejected", err);
				}
			}
			patch({ presetId: id });
			writeStoredPreset(id);
		}

		function applyFontSize(theme, px) {
			if (px === current.fontSize) return;
			try {
				theme.setFontSize(px);
				patch({ fontSize: px });
			} catch (err) {
				console.error("ui-theme-polish: font size rejected", err);
			}
		}
		//#endregion

		//#region panel
		function useSelected() {
			const [snapshot, setSnapshot] = useState(current);
			useEffect(() => subscribe(() => setSnapshot(current)), []);
			return snapshot;
		}

		function Preview(props) {
			const t = props.t;
			return h("div", { className: "up-block" },
				h("div", { className: "up-label" }, t("preview")),
				h("div", { className: "up-preview" },
					h("div", { className: "up-pv-side" },
						h("div", { className: "up-pv-brand up-w70" }),
						h("div", { className: "up-pv-bar up-w80" }),
						h("div", { className: "up-pv-bar up-w60" }),
						h("div", { className: "up-pv-bar up-w45" })
					),
					h("div", { className: "up-pv-main" },
						h("div", { className: "up-pv-bubble" }),
						h("div", { className: "up-pv-card" },
							h("div", { className: "up-pv-bar up-w80" }),
							h("div", { className: "up-pv-bar up-w60" }),
							h("div", { className: "up-pv-foot" },
								h("span", { className: "up-pv-btn" }, t("previewBtn")),
								h("span", { className: "up-dots" },
									h("span", { className: "up-dot", style: { background: "var(--dsw-alias-state-success-primary)" } }),
									h("span", { className: "up-dot", style: { background: "var(--dsw-alias-state-warn-primary)" } }),
									h("span", { className: "up-dot", style: { background: "var(--dsw-alias-state-error-primary)" } })
								)
							)
						)
					)
				)
			);
		}

		function Panel(props) {
			const t = props.t;
			const theme = props.theme;
			const selected = useSelected();

			const cards = PRESETS.map((preset) => {
				const isActive = preset.id === selected.presetId;
				const chips = preset.light === undefined ? null : CHIP_KEYS.map((key, index) => h("span", {
					key: "chip-" + index,
					className: "up-chip",
					style: { background: "linear-gradient(100deg, " + preset.light[key] + " 0 50%, " + preset.dark[key] + " 50% 100%)" },
				}));
				return h("button", {
					key: preset.id,
					type: "button",
					className: isActive ? "up-card is-active" : "up-card",
					"aria-pressed": isActive ? "true" : "false",
					onClick: () => applyPreset(theme, preset.id),
				},
					h("span", { className: "up-card-top" },
						h("span", { className: "up-name" }, t("p_" + preset.id)),
						isActive ? h("span", { className: "up-badge" }, t("active")) : null
					),
					h("span", { className: "up-note" }, t("n_" + preset.id)),
					chips
				);
			});

			const sizes = FONT_SIZES.map((px) => h("button", {
				key: "size-" + px,
				type: "button",
				className: px === selected.fontSize ? "up-size is-active" : "up-size",
				"aria-pressed": px === selected.fontSize ? "true" : "false",
				onClick: () => applyFontSize(theme, px),
			}, String(px)));

			return h("div", { className: "up-root" },
				h("div", { className: "up-head" },
					h("div", { className: "up-title" }, t("title")),
					h("div", { className: "up-sub" }, t("subtitle"))
				),
				h("div", { className: "up-block" },
					h("div", { className: "up-label" }, t("palette")),
					h("div", { className: "up-grid" }, cards)
				),
				h("div", { className: "up-row" },
					h("div", { className: "up-row-text" },
						h("div", { className: "up-row-title" }, t("fontSize")),
						h("div", { className: "up-hint" }, t("fontHint"))
					),
					h("div", { className: "up-seg" }, sizes)
				),
				h(Preview, { t: t }),
				h("div", { className: "up-foot" },
					h("button", {
						type: "button",
						className: "up-reset",
						onClick: () => applyPreset(theme, "default"),
					}, t("reset")),
					h("span", { className: "up-foot-note" }, t("resetHint"))
				)
			);
		}
		//#endregion

		//#region plugin
		const inject = ["slots", "locale", "theme"];

		function apply(ctx) {
			ctx.effect(installStyles, "ui-theme-polish: stylesheet");
			ctx.effect(() => ctx.locale.register(NS, DICTS), "ui-theme-polish: dictionaries");
			ctx.effect(() => () => releaseLayer(), "ui-theme-polish: token layer");

			const t = ctx.locale.bind(NS);

			// Mirror the product's font-size preference instead of owning a copy of it.
			try {
				const snapshot = ctx.theme.getTheme();
				if (snapshot !== undefined && typeof snapshot.fontSize === "number") patch({ fontSize: snapshot.fontSize });
			} catch (err) {
				console.error("ui-theme-polish: could not read the current font size", err);
			}
			ctx.on("theme/change", (snapshot) => {
				if (snapshot !== undefined && typeof snapshot.fontSize === "number" && snapshot.fontSize !== current.fontSize) {
					patch({ fontSize: snapshot.fontSize });
				}
			});

			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "theme-polish",
				order: 6,
				label: () => t("nav"),
			}, () => h(Panel, { t: t, theme: ctx.theme })));

			const stored = readStoredPreset();
			applyPreset(ctx.theme, stored === null ? DEFAULT_PRESET : stored);
		}
		//#endregion

		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});

/**
 * Floating ball (悬浮球) — one draggable quick-action orb pinned to the frame.
 *
 * Registers a single entry in `shell.overlay` (frame-wide floating layer) and
 * keeps everything else local: position, hidden state, open state. The orb is
 * pointer-draggable, snaps to the nearest left/right edge on release, and opens
 * a vertical quick-action menu on tap.
 */
window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-floating-ball",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const react = require("react");
		const h = react.createElement;
		const { useState, useEffect, useRef } = react;

		const PLUGIN_ID = "@deepseek-ai/dsh-client-ui-floating-ball";
		const NS = "ui-floating-ball";
		const STYLE_KEY = PLUGIN_ID + "/styles";
		const STORE_KEY = "dsh.floating-ball.v1";
		const SIZE = 54;
		const MARGIN = 24;
		const MENU_ROOM = 300;

		//#region styles
		const CSS = [
			".fball-root{position:fixed;inset:0;pointer-events:none;z-index:8}",
			".fball-backdrop{position:absolute;inset:0;pointer-events:auto;background:transparent}",
			".fball-anchor{position:absolute;width:54px;height:54px;pointer-events:none;transition:right .26s cubic-bezier(.34,1.4,.64,1),bottom .2s ease}",
			".fball-anchor.is-drag{transition:none}",
			".fball-ball{position:absolute;inset:0;pointer-events:auto;display:flex;align-items:center;justify-content:center;padding:0;border:0;border-radius:50%;color:#fff;cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;background-color:#2f5bff;background-image:radial-gradient(circle at 32% 24%,rgba(255,255,255,.5) 0%,rgba(255,255,255,.14) 32%,rgba(255,255,255,0) 55%),linear-gradient(150deg,color-mix(in srgb,var(--dsw-alias-brand-primary) 32%,#6d95ff) 0%,color-mix(in srgb,var(--dsw-alias-brand-primary) 28%,#2f5bff) 48%,#1b34a8 100%);box-shadow:0 10px 24px rgba(9,30,66,.34),0 2px 6px rgba(9,30,66,.22),inset 0 1px 0 rgba(255,255,255,.5);transition:transform .18s cubic-bezier(.34,1.56,.64,1),box-shadow .18s ease;animation:fball-bob 5s ease-in-out infinite}",
			".fball-ball:hover{transform:scale(1.07);box-shadow:0 14px 30px rgba(9,30,66,.4),inset 0 1px 0 rgba(255,255,255,.55)}",
			".fball-ball:active{cursor:grabbing;transform:scale(.95)}",
			".fball-ball.is-drag{animation:none;transform:scale(1.08);cursor:grabbing}",
			".fball-ball.is-open{animation:none;transform:scale(1.04)}",
			".fball-ball.is-open .fball-glyph{transform:rotate(45deg)}",
			".fball-ball:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:3px}",
			".fball-glyph{position:relative;transition:transform .24s cubic-bezier(.34,1.4,.64,1);filter:drop-shadow(0 1px 1px rgba(0,0,0,.25))}",
			".fball-halo{position:absolute;inset:-5px;border-radius:50%;border:1.5px solid var(--dsw-alias-brand-primary);opacity:.45;pointer-events:none;animation:fball-pulse 2.8s ease-out infinite}",
			".fball-ball.is-drag .fball-halo,.fball-ball.is-open .fball-halo{opacity:0;animation:none}",
			".fball-ring{position:absolute;inset:-2px;border-radius:50%;border:2px solid var(--dsw-alias-brand-primary);pointer-events:none;animation:fball-ring .55s ease-out forwards}",
			".fball-menu{position:absolute;display:flex;flex-direction:column;gap:8px;pointer-events:none}",
			".fball-menu.up{bottom:calc(100% + 14px)}",
			".fball-menu.down{top:calc(100% + 14px)}",
			".fball-menu.al-right{right:0;align-items:flex-end}",
			".fball-menu.al-left{left:0;align-items:flex-start}",
			".fball-item{pointer-events:auto;display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 14px 0 12px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:1;white-space:nowrap;cursor:pointer;box-shadow:0 8px 22px rgba(9,30,66,.18);backdrop-filter:blur(10px) saturate(160%);animation:fball-in .22s cubic-bezier(.34,1.4,.64,1) both;transition:border-color .15s ease,color .15s ease,transform .15s ease}",
			".fball-item:hover{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary);transform:translateY(-1px)}",
			".fball-item:active{transform:translateY(0) scale(.97)}",
			".fball-item:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}",
			".fball-item .fball-ic{opacity:.85;flex:none}",
			".fball-peek{position:fixed;right:0;width:14px;height:56px;padding:0;border:1px solid var(--dsw-alias-border-l2);border-right:0;border-radius:9px 0 0 9px;background:var(--dsw-alias-bg-overlay);cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:-4px 0 14px rgba(9,30,66,.16);transition:width .18s ease;z-index:8;pointer-events:auto}",
			".fball-peek:hover{width:22px}",
			".fball-peek span{width:5px;height:22px;border-radius:999px;background:var(--dsw-alias-brand-primary);opacity:.7}",
			"@keyframes fball-bob{0%,100%{translate:0 0}50%{translate:0 -5px}}",
			"@keyframes fball-pulse{0%{transform:scale(1);opacity:.45}70%{transform:scale(1.35);opacity:0}100%{transform:scale(1.35);opacity:0}}",
			"@keyframes fball-ring{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.95);opacity:0}}",
			"@keyframes fball-in{from{opacity:0;transform:translateY(6px) scale(.94)}to{opacity:1;transform:none}}",
			"@media (prefers-reduced-motion:reduce){.fball-ball,.fball-halo,.fball-item,.fball-ring{animation:none!important}}",
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

		//#region icons
		const ICONS = {
			plus: "M12 5.5v13M5.5 12h13",
			bottom: "M12 3.5v12.5M7.2 11.2 12 16l4.8-4.8M5 20.2h14",
			top: "M12 20.5V8M7.2 12.8 12 8l4.8 4.8M5 3.8h14",
			sun: "M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6M12 1.8v2.4M12 19.8v2.4M4.7 4.7l1.7 1.7M17.6 17.6l1.7 1.7M1.8 12h2.4M19.8 12h2.4M4.7 19.3l1.7-1.7M17.6 6.4l1.7-1.7",
			moon: "M20.6 14.4A8.8 8.8 0 0 1 9.6 3.4a8.9 8.9 0 1 0 11 11Z",
			hide: "M13.5 6.2 19.3 12l-5.8 5.8M6.4 6.2 12.2 12l-5.8 5.8",
		};

		function Icon(props) {
			return h("svg", {
				className: "fball-ic", width: 15, height: 15, viewBox: "0 0 24 24",
				fill: "none", stroke: "currentColor", strokeWidth: 1.9,
				strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true",
			}, h("path", { d: props.d }));
		}

		function Glyph() {
			const dots = [[8.6, 8.6], [15.4, 8.6], [8.6, 15.4], [15.4, 15.4]];
			return h("svg", {
				className: "fball-glyph", width: 22, height: 22, viewBox: "0 0 24 24",
				fill: "currentColor", "aria-hidden": "true",
			}, dots.map((p, i) => h("circle", { key: i, cx: p[0], cy: p[1], r: 2.1 })));
		}
		//#endregion

		//#region helpers
		function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

		function viewport() {
			return {
				w: window.innerWidth || 1280,
				h: window.innerHeight || 800,
			};
		}

		/**
		 * Pick the tallest/ widest scrollable column, which in practice is the
		 * conversation view. Generic on purpose: no product selector is hard-coded,
		 * so a layout change degrades to "nothing happens" instead of scrolling
		 * the wrong thing.
		 */
		function findScroller() {
			const nodes = document.querySelectorAll("div");
			let best = null;
			let bestScore = 0;
			for (let i = 0; i < nodes.length; i += 1) {
				const node = nodes[i];
				if (node.scrollHeight - node.clientHeight < 140) continue;
				if (node.clientHeight < 180) continue;
				const score = node.clientHeight * Math.min(node.clientWidth, 1200);
				if (score > bestScore) { bestScore = score; best = node; }
			}
			return best;
		}

		function loadSaved() {
			try {
				const raw = window.localStorage.getItem(STORE_KEY);
				if (raw === null) return null;
				const parsed = JSON.parse(raw);
				if (parsed === null || typeof parsed !== "object") return null;
				if (typeof parsed.right !== "number" || typeof parsed.bottom !== "number") return null;
				return {
					right: parsed.right,
					bottom: parsed.bottom,
					align: parsed.align === "al-left" ? "al-left" : "al-right",
					hidden: parsed.hidden === true,
				};
			} catch (error) {
				return null;
			}
		}

		function saveState(state) {
			try {
				window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
			} catch (error) { /* private mode: the orb still works, it just forgets */ }
		}
		//#endregion

		//#region component
		function FloatingBall(props) {
			const ctx = props.ctx;
			const t = props.t;

			const stateBox = useState(() => {
				const saved = loadSaved();
				return {
					right: saved === null ? MARGIN : saved.right,
					bottom: saved === null ? MARGIN : saved.bottom,
					align: saved === null ? "al-right" : saved.align,
					hidden: saved === null ? false : saved.hidden,
				};
			});
			const state = stateBox[0];
			const setState = stateBox[1];

			const openBox = useState(false);
			const open = openBox[0];
			const setOpen = openBox[1];

			const dragBox = useState(false);
			const dragging = dragBox[0];
			const setDragging = dragBox[1];

			const tapBox = useState(0);
			const tapKey = tapBox[0];
			const setTapKey = tapBox[1];

			const bumpBox = useState(0);
			const bumpScheme = bumpBox[1];

			const ballRef = useRef(null);
			const dragRef = useRef(null);
			const stateRef = useRef(state);
			stateRef.current = state;

			useEffect(() => ctx.on("theme/change", () => bumpScheme((v) => v + 1)), []);

			function patch(next) {
				setState((prev) => {
					const merged = Object.assign({}, prev, next);
					saveState(merged);
					return merged;
				});
			}

			function ping() { setTapKey((k) => k + 1); }

			function schemeNow() {
				try {
					const theme = ctx.get("theme");
					if (theme === undefined) return "light";
					const snapshot = theme.getTheme();
					const active = snapshot ? snapshot.active : null;
					return active && active.colorScheme === "dark" ? "dark" : "light";
				} catch (error) {
					return "light";
				}
			}

			function closeAndPing() {
				setOpen(false);
				ping();
			}

			function runNewSession() {
				closeAndPing();
				const ui = ctx.get("uiWorkspace");
				if (ui === undefined) return;
				try { ui.startSession(); } catch (error) { console.error(error); }
			}

			function runScroll(where) {
				closeAndPing();
				const node = findScroller();
				if (node === null || typeof node.scrollTo !== "function") return;
				try {
					node.scrollTo({ top: where === "top" ? 0 : node.scrollHeight, behavior: "smooth" });
				} catch (error) { console.error(error); }
			}

			function runTheme() {
				closeAndPing();
				const theme = ctx.get("theme");
				if (theme === undefined) return;
				try { theme.setTheme(schemeNow() === "dark" ? "light" : "dark"); } catch (error) { console.error(error); }
			}

			function runHide() {
				setOpen(false);
				patch({ hidden: true });
			}

			function onPointerDown(ev) {
				if (typeof ev.button === "number" && ev.button !== 0) return;
				dragRef.current = {
					x: ev.clientX, y: ev.clientY,
					right: stateRef.current.right, bottom: stateRef.current.bottom,
					moved: false, next: null,
				};
				setDragging(true);
				try {
					const el = ballRef.current;
					if (el !== null && typeof el.setPointerCapture === "function") el.setPointerCapture(ev.pointerId);
				} catch (error) { /* capture is an optimisation, not a requirement */ }
			}

			function onPointerMove(ev) {
				const drag = dragRef.current;
				if (drag === null) return;
				const dx = ev.clientX - drag.x;
				const dy = ev.clientY - drag.y;
				if (!drag.moved) {
					if (Math.abs(dx) + Math.abs(dy) < 4) return;
					drag.moved = true;
					if (open) setOpen(false);
				}
				const view = viewport();
				const next = {
					right: clamp(drag.right - dx, MARGIN, Math.max(MARGIN, view.w - SIZE - MARGIN)),
					bottom: clamp(drag.bottom - dy, MARGIN, Math.max(MARGIN, view.h - SIZE - MARGIN)),
				};
				drag.next = next;
				stateRef.current = Object.assign({}, stateRef.current, next);
				setState((prev) => Object.assign({}, prev, next));
			}

			function onPointerUp(ev) {
				const drag = dragRef.current;
				dragRef.current = null;
				setDragging(false);
				try {
					const el = ballRef.current;
					if (el !== null && typeof el.releasePointerCapture === "function") el.releasePointerCapture(ev.pointerId);
				} catch (error) { /* nothing captured */ }
				if (drag === null) return;
				if (!drag.moved) { setOpen((v) => !v); return; }
				const view = viewport();
				const current = drag.next === null ? stateRef.current : drag.next;
				const leftHalf = view.w - current.right - SIZE / 2 < view.w / 2;
				patch({
					right: leftHalf ? Math.max(MARGIN, view.w - SIZE - MARGIN) : MARGIN,
					bottom: clamp(current.bottom, MARGIN, Math.max(MARGIN, view.h - SIZE - MARGIN - 24)),
					align: leftHalf ? "al-left" : "al-right",
				});
			}

			if (state.hidden) {
				return h("button", {
					type: "button",
					className: "fball-peek",
					style: { bottom: Math.max(8, state.bottom - 1) },
					title: t("show"),
					"aria-label": t("show"),
					onClick: () => patch({ hidden: false }),
				}, h("span", null));
			}

			const scheme = schemeNow();
			const actions = [
				{ key: "new", icon: "plus", label: t("new"), run: runNewSession },
				{ key: "bottom", icon: "bottom", label: t("bottom"), run: () => runScroll("bottom") },
				{ key: "top", icon: "top", label: t("top"), run: () => runScroll("top") },
				{
					key: "theme",
					icon: scheme === "dark" ? "sun" : "moon",
					label: scheme === "dark" ? t("theme.toLight") : t("theme.toDark"),
					run: runTheme,
				},
				{ key: "hide", icon: "hide", label: t("hide"), run: runHide },
			];
			const up = state.bottom <= MENU_ROOM;

			const menu = open ? actions.map((action, index) => h("button", {
				key: action.key,
				type: "button",
				className: "fball-item",
				style: { animationDelay: (index * 32) + "ms" },
				title: action.label,
				onPointerDown: (ev) => ev.stopPropagation(),
				onClick: action.run,
			}, h(Icon, { key: "icon", d: ICONS[action.icon] }), h("span", { key: "label" }, action.label))) : null;

			return h("div", { className: "fball-root" },
				open ? h("div", {
					key: "backdrop",
					className: "fball-backdrop",
					onPointerDown: () => setOpen(false),
				}) : null,
				h("div", {
					key: "anchor",
					className: "fball-anchor" + (dragging ? " is-drag" : ""),
					style: { right: state.right, bottom: state.bottom },
				},
					h("div", {
						key: "menu",
						className: "fball-menu " + (up ? "up " : "down ") + state.align,
					}, menu),
					tapKey > 0 ? h("span", { key: "ring" + tapKey, className: "fball-ring" }) : null,
					h("button", {
						key: "ball",
						ref: ballRef,
						type: "button",
						className: "fball-ball" + (dragging ? " is-drag" : "") + (open ? " is-open" : ""),
						title: t("menu"),
						"aria-label": t("menu"),
						"aria-expanded": open ? "true" : "false",
						onPointerDown: onPointerDown,
						onPointerMove: onPointerMove,
						onPointerUp: onPointerUp,
						onPointerCancel: onPointerUp,
						onContextMenu: (ev) => ev.preventDefault(),
						onKeyDown: (ev) => {
							if (ev.key === "Enter" || ev.key === " ") {
								ev.preventDefault();
								setOpen((v) => !v);
							}
						},
					},
						h("span", { key: "halo", className: "fball-halo" }),
						h(Glyph, { key: "glyph" })
					)
				)
			);
		}
		//#endregion

		//#region plugin
		const inject = ["slots", "locale"];

		function apply(ctx) {
			ctx.effect(installStyles, "ui-floating-ball: stylesheet");
			ctx.effect(() => ctx.locale.register(NS, {
				zh: {
					nav: "悬浮球",
					menu: "快捷操作",
					new: "新建会话",
					bottom: "回到底部",
					top: "回到顶部",
					"theme.toDark": "切到深色",
					"theme.toLight": "切到浅色",
					hide: "藏起来",
					show: "显示悬浮球",
				},
				en: {
					nav: "Floating ball",
					menu: "Quick actions",
					new: "New session",
					bottom: "Scroll to bottom",
					top: "Scroll to top",
					"theme.toDark": "Switch to dark",
					"theme.toLight": "Switch to light",
					hide: "Hide",
					show: "Show floating ball",
				},
			}), "ui-floating-ball: dictionaries");

			const t = ctx.locale.bind(NS);
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "floating-ball",
				order: 70,
			}, () => h(FloatingBall, { ctx, t })));
		}
		//#endregion

		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});

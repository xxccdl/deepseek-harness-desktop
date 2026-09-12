// DeepSeek desktop pet — the browser half.
//
// One whale, rendered into the frame-wide `shell.overlay` slot. That layer is
// click-through by design, so the pet is the only thing that takes pointer
// events; everything else in the app keeps working underneath it.
//
// It keeps to the published plugin contract: a module-loader entry, one slot
// registration, and no dependencies beyond react and the host's own services.
window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-desktop-pet",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const react = require("react");

		const NS = "ui-desktop-pet";

		// ── geometry ──────────────────────────────────────────────────────────
		/** Rendered size of the whale box, in CSS pixels. */
		const PET_W = 96;
		const PET_H = 78;
		/** Distance one arrow-key nudge travels. */
		const GRID = 12;
		/** Panel box, used to keep it inside the viewport. */
		const PANEL_W = 300;
		const PANEL_H = 214;
		/** Inset from the viewport edge for the default resting spot. */
		const HOME_RIGHT = 36;
		const HOME_BOTTOM = 28;

		/** Mood id → label. The id also lands on `data-mood` and drives the CSS. */
		const MOODS = [
			["happy", "开心"],
			["idle", "发呆"],
			["think", "思考"],
			["alert", "警觉"],
			["sleep", "睡觉"]
		];

		/** Things the pet says when poked or asked to speak up. */
		const LINES = [
			"我在呢，有什么要做的吗？",
			"需要我帮你看点什么吗？",
			"写代码累了就歇会儿～",
			"今天也要加油哦！",
			"我一直守在这个角落。",
			"有新任务随时叫我。"
		];

		// ── store ─────────────────────────────────────────────────────────────
		// The whale is the only occupant, so a module-level store is enough; it
		// keeps position, mood and the transient bubble in one place and lets
		// every helper read the latest value without threading props around.
		const store = {
			x: null,
			y: null,
			mood: "idle",
			bubble: "",
			bubbleSeq: 0,
			petSeq: 0,
			visible: true,
			dragging: false,
			panelOpen: false
		};
		const listeners = new Set();

		/** The external-store snapshot React reads. */
		function snapshot() {
			return store;
		}
		/** Subscribe a component to the store. */
		function subscribe(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		}
		/** Merge a patch into the store and wake subscribers only on real change. */
		function update(patch) {
			let changed = false;
			for (const key of Object.keys(patch)) {
				if (store[key] !== patch[key]) {
					store[key] = patch[key];
					changed = true;
				}
			}
			if (!changed) return;
			for (const listener of Array.from(listeners)) listener();
		}

		// ── viewport helpers ──────────────────────────────────────────────────
		/** The viewport width, with a sane stand-in before the first layout. */
		function viewportW() {
			return typeof innerWidth === "number" && innerWidth > 0 ? innerWidth : 1280;
		}
		/** The viewport height, with a sane stand-in before the first layout. */
		function viewportH() {
			return typeof innerHeight === "number" && innerHeight > 0 ? innerHeight : 800;
		}
		/** Keep the whale horizontally inside the viewport. */
		function clampX(value) {
			if (typeof value !== "number" || !isFinite(value)) return 12;
			const max = Math.max(12, viewportW() - PET_W - 12);
			return value < 12 ? 12 : value > max ? max : value;
		}
		/** Keep the whale vertically inside the viewport. */
		function clampY(value) {
			if (typeof value !== "number" || !isFinite(value)) return 60;
			const max = Math.max(60, viewportH() - PET_H - 12);
			return value < 12 ? 12 : value > max ? max : value;
		}
		/** The default resting spot: just inside the bottom-right corner. */
		function homeX() {
			return clampX(viewportW() - PET_W - HOME_RIGHT);
		}
		/** The default resting spot: just inside the bottom-right corner. */
		function homeY() {
			return clampY(viewportH() - PET_H - HOME_BOTTOM);
		}
		/** A random line from the pet's repertoire. */
		function randomLine() {
			return LINES[Math.floor(Math.random() * LINES.length)];
		}

		// ── styles ────────────────────────────────────────────────────────────
		const css = [
			".dpet-layer{position:fixed;inset:0;pointer-events:none;z-index:2147483000}",
			".dpet{position:fixed;width:96px;pointer-events:auto;user-select:none;-webkit-user-select:none;touch-action:none;cursor:grab;transition:filter .2s ease}",
			".dpet:active{cursor:grabbing}",
			".dpet-svg{display:block;width:100%;height:auto;overflow:visible;filter:drop-shadow(0 6px 10px rgba(0,0,0,.22))}",
			'.dpet[data-mood="sleep"] .dpet-svg{filter:drop-shadow(0 6px 10px rgba(0,0,0,.22)) saturate(.55) brightness(.92)}',
			'.dpet[data-mood="alert"] .dpet-svg{filter:drop-shadow(0 0 10px rgba(77,107,254,.75))}',
			'.dpet[data-mood="think"] .dpet-svg{filter:drop-shadow(0 0 8px rgba(255,193,7,.55))}',
			".dpet-body{transform-box:fill-box;transform-origin:50% 100%;animation:dpet-float 3.2s ease-in-out infinite}",
			'.dpet[data-mood="sleep"] .dpet-body{animation-duration:5s}',
			"@keyframes dpet-float{0%,100%{transform:translateY(0) rotate(-1.2deg)}50%{transform:translateY(-6px) rotate(1.2deg)}}",
			".dpet-tail{transform-box:fill-box;transform-origin:100% 50%;animation:dpet-tail 2.1s ease-in-out infinite}",
			"@keyframes dpet-tail{0%,100%{transform:rotate(-9deg)}50%{transform:rotate(9deg)}}",
			".dpet-fin{transform-box:fill-box;transform-origin:50% 0%;animation:dpet-fin 1.7s ease-in-out infinite}",
			"@keyframes dpet-fin{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}",
			".dpet-eye{transform-box:fill-box;transform-origin:center;animation:dpet-blink 4.4s ease-in-out infinite}",
			"@keyframes dpet-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.12)}}",
			'.dpet[data-mood="sleep"] .dpet-eye{animation:none;transform:scaleY(.15)}',
			".dpet-spout{animation:dpet-spout 2.6s ease-in-out infinite}",
			"@keyframes dpet-spout{0%,100%{opacity:.35;transform:translateY(0)}50%{opacity:.95;transform:translateY(-7px)}}",
			".dpet-spark{animation:dpet-spark 1.6s ease-in-out infinite}",
			"@keyframes dpet-spark{0%,100%{opacity:.2}50%{opacity:1}}",
			".dpet-spark2{animation:dpet-spark 1.6s ease-in-out infinite .5s}",
			".dpet-z{animation:dpet-z 2.4s ease-in-out infinite}",
			"@keyframes dpet-z{0%{opacity:0;transform:translate(0,0)}40%{opacity:.9}100%{opacity:0;transform:translate(10px,-16px)}}",
			".dpet-bubble{position:fixed;max-width:230px;padding:7px 11px;border-radius:12px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);font-size:12px;line-height:1.45;box-shadow:0 8px 20px rgba(0,0,0,.18);pointer-events:auto;cursor:pointer;animation:dpet-pop .22s ease-out}",
			"@keyframes dpet-pop{from{opacity:0;transform:translateY(5px) scale(.94)}to{opacity:1;transform:none}}",
			".dpet-menu{position:fixed;width:300px;box-sizing:border-box;padding:10px 12px 12px;border-radius:14px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);box-shadow:0 12px 32px rgba(0,0,0,.24);pointer-events:auto;font-size:12px}",
			".dpet-menu h4{margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:.02em}",
			".dpet-row{display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap}",
			".dpet-label{flex:0 0 38px;color:var(--dsw-alias-label-secondary)}",
			".dpet-seg{display:flex;flex-wrap:wrap;gap:5px}",
			".dpet-chip{padding:3px 9px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;cursor:pointer;transition:all .14s ease}",
			".dpet-chip:hover{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary)}",
			'.dpet-chip[data-on="1"]{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:#fff}',
			".dpet-btn{padding:4px 10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:11px;cursor:pointer}",
			".dpet-btn:hover{border-color:var(--dsw-alias-border-l2)}",
			".dpet-hint{margin-top:4px;color:var(--dsw-alias-label-secondary);font-size:10.5px;line-height:1.5}",
			".dpet-restore{position:fixed;right:12px;bottom:12px;width:30px;height:30px;padding:0;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);font-size:15px;line-height:1;cursor:pointer;pointer-events:auto;box-shadow:0 4px 12px rgba(0,0,0,.18)}"
		].join("");
		const cssTag = "@deepseek-ai/dsh-client-ui-desktop-pet/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(cssTag) + "]") === null) {
			const style = document.createElement("style");
			style.dataset.plugin = "@deepseek-ai/dsh-client-ui-desktop-pet";
			style.dataset.pluginCss = cssTag;
			style.textContent = css;
			document.head.appendChild(style);
		}

		// ── the whale ─────────────────────────────────────────────────────────
		/**
		 * Pick the idx-th child of a rendered node.
		 *
		 * The SVG is written out as a flat child list, so the mood effect below
		 * can address the pieces it animates by position instead of by keeping a
		 * ref per decoration.
		 */
		function kid(node, idx) {
			const list = node && node.children ? node.children : null;
			return list && list.length > idx ? list[idx] : null;
		}

		/**
		 * The whale body.
		 *
		 * Every mood change repaints it. The shapes that come and go — spout,
		 * sparkles, drifting z, thinking dot — are toggled through `display` on
		 * the already-rendered nodes, which keeps the markup declarative and
		 * avoids a second drawing pass.
		 */
		function Whale(props) {
			const mood = props.mood;
			const svgRef = react.useRef(null);
			const eyeBoxRef = react.useRef(null);
			const eyeLeftRef = react.useRef(null);
			const eyeRightRef = react.useRef(null);

			react.useEffect(() => {
				const svg = svgRef.current;
				if (!svg) return undefined;
				const group = kid(svg, 1);
				const spout = group ? kid(group, 0) : null;
				const tail = group ? kid(group, 1) : null;
				const fin = group ? kid(group, 4) : null;
				const eyes = group ? kid(group, 6) : null;
				const sparkLeft = group ? kid(group, 9) : null;
				const sparkRight = group ? kid(group, 10) : null;
				const snore = group ? kid(group, 11) : null;
				const thought = group ? kid(group, 12) : null;

				const asleep = mood === "sleep";
				const sparkling = mood === "happy";
				const thinking = mood === "think";
				const alarmed = mood === "alert";

				// Closed eyes win over the blink animation, so hide the whole
				// set while asleep rather than fighting the keyframes.
				for (const node of [eyes, eyeLeftRef.current, eyeRightRef.current]) {
					if (node) node.style.display = asleep ? "none" : "";
				}
				if (spout) spout.style.display = asleep ? "none" : "";
				if (sparkLeft) sparkLeft.style.display = sparkling ? "" : "none";
				if (sparkRight) sparkRight.style.display = sparkling ? "" : "none";
				if (snore) snore.style.display = asleep ? "" : "none";
				if (thought) thought.style.display = thinking ? "" : "none";
				if (tail) tail.style.animationDuration = thinking ? "3.4s" : alarmed ? "1s" : "2.1s";
				if (fin) fin.style.animationDuration = thinking ? "2.6s" : alarmed ? ".9s" : "1.7s";
				return undefined;
			}, [mood]);

			const pieces = [
				// 0 — the spout, which breathes above the blowhole.
				react.createElement("g", { key: "dpet-spout", className: "dpet-spout" }, [
					react.createElement("ellipse", { key: "s1", cx: 60, cy: 10, rx: 5, ry: 3.4, fill: "#9cc0ff" }),
					react.createElement("ellipse", { key: "s2", cx: 72, cy: 15, rx: 3.4, ry: 2.6, fill: "#bcd4ff" })
				]),
				// 1 — the tail fluke, pivoting on its root.
				react.createElement("g", { key: "dpet-tail", className: "dpet-tail" }, [
					react.createElement("path", { key: "t", d: "M24 56 C10 42 4 52 1 62 C13 64 19 63 26 61 Z", fill: "#3f5ae0" })
				]),
				// 2 — the body, which also carries the idle bobbing.
				react.createElement("path", {
					key: "dpet-body",
					className: "dpet-body",
					d: "M94 50 C92 33 76 22 55 23 C36 24 22 32 16 44 C11 54 13 64 21 70 C34 79 70 81 84 69 C91 64 95 58 94 50 Z",
					fill: "url(#dpetBody)"
				}),
				// 3 — the pale belly.
				react.createElement("path", {
					key: "belly",
					d: "M33 64 C44 74 70 76 84 66 C76 74 48 78 33 64 Z",
					fill: "#eaf1ff"
				}),
				// 4 — the pectoral fin.
				react.createElement("g", { key: "dpet-fin", className: "dpet-fin" }, [
					react.createElement("path", { key: "f", d: "M50 62 C45 74 51 86 60 89 C63 80 62 70 58 62 Z", fill: "#4a68ea" })
				]),
				// 5 — a shading wedge where the tail meets the body.
				react.createElement("path", {
					key: "shade",
					d: "M22 52 C28 62 34 68 42 71 C34 72 26 68 20 60 Z",
					fill: "rgba(20,32,90,.35)"
				}),
				// 6 — both eyes, blinking as one group.
				react.createElement("g", { key: "dpet-eyes", className: "dpet-eye" }, [
					react.createElement("g", { key: "eyeL", ref: eyeLeftRef, className: "dpet-eye" }, [
						react.createElement("circle", { key: "c", cx: 41, cy: 43, r: 5.4, fill: "#fff" }),
						react.createElement("circle", { key: "p", cx: 43, cy: 43, r: 3.1, fill: "#1b2440" }),
						react.createElement("circle", { key: "h", cx: 44.6, cy: 41.2, r: 1.15, fill: "#fff" })
					]),
					react.createElement("g", { key: "eyeR", ref: eyeRightRef, className: "dpet-eye" }, [
						react.createElement("circle", { key: "c", cx: 71, cy: 42, r: 5, fill: "#fff" }),
						react.createElement("circle", { key: "p", cx: 73, cy: 42, r: 2.9, fill: "#1b2440" }),
						react.createElement("circle", { key: "h", cx: 74.4, cy: 40.4, r: 1.05, fill: "#fff" })
					])
				]),
				// 7 — a blush mark.
				react.createElement("ellipse", { key: "blush", cx: 34, cy: 55, rx: 6, ry: 3.4, fill: "rgba(255,120,150,.32)" }),
				// 8 — the gloss along the top of the body.
				react.createElement("path", {
					key: "gloss",
					d: "M40 28 C52 24 66 26 74 32 C64 30 50 30 40 32 Z",
					fill: "rgba(255,255,255,.35)"
				}),
				// 9 / 10 — sparkles for the happy mood.
				react.createElement("path", {
					key: "dpet-spark",
					className: "dpet-spark",
					d: "M96 22 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z",
					fill: "#ffd166"
				}),
				react.createElement("path", {
					key: "spark2",
					className: "dpet-spark2",
					d: "M12 30 l2.2 5 5 2.2 -5 2.2 -2.2 5 -2.2 -5 -5 -2.2 5 -2.2 z",
					fill: "#ffd166"
				}),
				// 11 — the drifting z for the sleeping mood.
				react.createElement("text", {
					key: "dpet-z",
					className: "dpet-z",
					x: 88,
					y: 18,
					fontSize: 15,
					fontWeight: 700,
					fill: "#9aa7c7"
				}, "z"),
				// 12 — the thinking dot.
				react.createElement("circle", { key: "think-dot", cx: 95, cy: 33, r: 3.4, fill: "#ffc14d" })
			];

			return react.createElement(
				"svg",
				{ className: "dpet-svg", viewBox: "0 0 112 96", ref: svgRef },
				react.createElement(
					"defs",
					{ key: "defs" },
					react.createElement(
						"linearGradient",
						{ id: "dpetBody", x1: "0", y1: "0", x2: "1", y2: "1" },
						react.createElement("stop", { offset: "0%", stopColor: "#7cb0ff" }),
						react.createElement("stop", { offset: "52%", stopColor: "#4d6bfe" }),
						react.createElement("stop", { offset: "100%", stopColor: "#2f45c4" })
					)
				),
				// Wrapped in one group so the pieces keep their flat indices.
				react.createElement("g", { key: "all", ref: eyeBoxRef }, pieces)
			);
		}

		// ── speech bubble ─────────────────────────────────────────────────────
		/** The bubble the pet talks through; clicking it dismisses it. */
		function Bubble(props) {
			const rect = props.rect;
			const left = Math.max(8, Math.min(rect.x + 22, viewportW() - 246));
			// Prefer above the whale; drop below when it sits near the top edge.
			const top = rect.y > 62 ? rect.y - 42 : rect.y + PET_H + 6;
			return react.createElement("div", {
				className: "dpet-bubble",
				style: { left: left + "px", top: top + "px" },
				onClick: props.onDismiss,
				title: "点一下收起"
			}, props.text);
		}

		// ── control panel ─────────────────────────────────────────────────────
		/** The little settings card opened from the gear beside the whale. */
		function Panel(props) {
			const rect = props.rect;
			let top = rect.y - PANEL_H - 10;
			if (top < 12) top = Math.min(rect.y + PET_H + 10, viewportH() - PANEL_H - 12);
			let left = rect.x + PET_W - PANEL_W;
			left = Math.max(12, Math.min(left, viewportW() - PANEL_W - 12));
			const style = { left: left + "px", top: Math.max(12, top) + "px" };
			return react.createElement(
				"div",
				{ className: "dpet-menu", style: style },
				react.createElement("h4", null, "DeepSeek 桌宠"),
				react.createElement(
					"div",
					{ className: "dpet-row" },
					react.createElement("span", { className: "dpet-label" }, "表情"),
					react.createElement(
						"div",
						{ className: "dpet-seg" },
						MOODS.map((item) => react.createElement("button", {
							key: item[0],
							type: "button",
							className: "dpet-chip",
							"data-on": props.mood === item[0] ? "1" : "0",
							onClick: () => {
								props.onMood(item[0]);
							}
						}, item[1]))
					)
				),
				react.createElement(
					"div",
					{ className: "dpet-row" },
					react.createElement("span", { className: "dpet-label" }, "挪一挪"),
					react.createElement(
						"div",
						{ className: "dpet-seg" },
						react.createElement("button", { type: "button", className: "dpet-chip", onClick: () => { props.onNudge(-1, 0); } }, "←"),
						react.createElement("button", { type: "button", className: "dpet-chip", onClick: () => { props.onNudge(1, 0); } }, "→"),
						react.createElement("button", { type: "button", className: "dpet-chip", onClick: () => { props.onNudge(0, -1); } }, "↑"),
						react.createElement("button", { type: "button", className: "dpet-chip", onClick: () => { props.onNudge(0, 1); } }, "↓")
					)
				),
				react.createElement(
					"div",
					{ className: "dpet-row" },
					react.createElement("button", { type: "button", className: "dpet-btn", onClick: props.onSpeak }, "说一句"),
					react.createElement("button", { type: "button", className: "dpet-btn", onClick: props.onHome }, "回角落"),
					react.createElement("button", { type: "button", className: "dpet-btn", onClick: props.onHide }, "先藏起来")
				),
				react.createElement("div", { className: "dpet-hint" }, "拖动鲸鱼换位置，点它跟你说话。位置会记住，刷新页面也还在。")
			);
		}

		// ── the overlay layer ─────────────────────────────────────────────────
		/**
		 * The single overlay entry: whale, bubble, panel and the collapsed rail
		 * button all live here so the whole pet is one registration.
		 */
		function PetLayer() {
			const state = react.useSyncExternalStore(subscribe, snapshot, snapshot);
			const [rect, setRect] = react.useState({ x: 0, y: 0 });
			const [dims, setDims] = react.useState({ w: viewportW(), h: viewportH() });
			const rectRef = react.useRef(rect);
			rectRef.current = rect;
			const drag = react.useRef(null);
			const lastPetSeq = react.useRef(0);

			// Follow the viewport so the whale can never be stranded off-screen.
			react.useEffect(() => {
				const onResize = () => {
					setDims({ w: viewportW(), h: viewportH() });
				};
				addEventListener("resize", onResize);
				return () => {
					removeEventListener("resize", onResize);
				};
			}, []);

			// Re-derive the drawn position whenever the store or viewport moves.
			react.useEffect(() => {
				setRect({
					x: clampX(state.x === null ? homeX() : state.x),
					y: clampY(state.y === null ? homeY() : state.y)
				});
			}, [state.x, state.y, dims.w, dims.h]);

			// Each poke is counted, so the pet answers once per poke.
			react.useEffect(() => {
				if (state.petSeq === lastPetSeq.current) return;
				lastPetSeq.current = state.petSeq;
				if (state.petSeq === 0) return;
				update({ bubble: "呀！别戳我啦～", bubbleSeq: store.bubbleSeq + 1, mood: "happy" });
			}, [state.petSeq]);

			// Drag tracking is bound to the document, so the whale keeps up with
			// the pointer even when it leaves the whale's own box.
			react.useEffect(() => {
				const onMove = (event) => {
					const current = drag.current;
					if (!current) return;
					current.moved = true;
					setRect({ x: clampX(event.clientX - current.dx), y: clampY(event.clientY - current.dy) });
				};
				const onUp = () => {
					const current = drag.current;
					if (!current) return;
					drag.current = null;
					update({ dragging: false });
					if (!current.moved) return;
					const next = rectRef.current;
					update({ x: Math.round(next.x), y: Math.round(next.y), mood: "happy" });
				};
				document.addEventListener("pointermove", onMove);
				document.addEventListener("pointerup", onUp);
				document.addEventListener("pointercancel", onUp);
				return () => {
					document.removeEventListener("pointermove", onMove);
					document.removeEventListener("pointerup", onUp);
					document.removeEventListener("pointercancel", onUp);
				};
			}, []);

			/** Begin dragging the whale from the pointer's grab point. */
			const startDrag = (event) => {
				event.preventDefault();
				drag.current = { dx: event.clientX - rect.x, dy: event.clientY - rect.y, moved: false };
				update({ dragging: true });
			};
			/** Show a line in the bubble. */
			const speak = (text) => {
				update({ bubble: text, bubbleSeq: store.bubbleSeq + 1, mood: "happy" });
			};
			/** Poke: bump the counter, which the effect above turns into a reply. */
			const poke = () => {
				if (drag.current) return;
				update({ petSeq: store.petSeq + 1 });
			};
			/** Step the whale one grid cell in a direction. */
			const nudge = (dx, dy) => {
				const next = { x: clampX(rect.x + dx * GRID), y: clampY(rect.y + dy * GRID) };
				setRect(next);
				update({ x: next.x, y: next.y, mood: "happy" });
			};
			/** Send the whale back to its corner. */
			const goHome = () => {
				const x = homeX();
				const y = homeY();
				setRect({ x: x, y: y });
				update({ x: x, y: y, bubble: "回到角落啦～", bubbleSeq: store.bubbleSeq + 1, mood: "happy" });
			};

			const children = [];

			// Collapsed state: the pet leaves a small whale button behind, so it
			// can always be brought back without hunting through settings.
			if (state.visible === false) {
				children.push(react.createElement("button", {
					key: "restore",
					type: "button",
					className: "dpet-restore",
					title: "把 DeepSeek 桌宠叫回来",
					onClick: () => {
						update({ visible: true });
					}
				}, "🐳"));
				return react.createElement("div", { className: "dpet-layer" }, children);
			}

			children.push(react.createElement("div", {
				key: "pet",
				className: "dpet",
				"data-mood": state.mood,
				style: { left: rect.x + "px", top: rect.y + "px" },
				onPointerDown: startDrag,
				onClick: poke,
				onDoubleClick: () => {
					speak(randomLine());
				},
				title: "DeepSeek 桌宠 —— 拖动换位置，双击让它说话"
			}, react.createElement(Whale, { mood: state.mood })));

			if (state.bubble && state.bubbleSeq > 0) {
				children.push(react.createElement(Bubble, {
					key: "bubble-" + state.bubbleSeq,
					text: state.bubble,
					rect: rect,
					onDismiss: () => {
						update({ bubble: "" });
					}
				}));
			}

			if (state.panelOpen) {
				children.push(react.createElement(Panel, {
					key: "panel",
					rect: rect,
					mood: state.mood,
					onMood: (mood) => {
						update({ mood: mood });
					},
					onNudge: nudge,
					onSpeak: () => {
						speak(randomLine());
					},
					onHome: goHome,
					onHide: () => {
						update({ panelOpen: false, visible: false });
					}
				}));
			}

			children.push(react.createElement("button", {
				key: "grip",
				type: "button",
				className: "dpet-chip",
				title: "DeepSeek 桌宠设置",
				style: {
					position: "fixed",
					left: rect.x + PET_W - 18 + "px",
					top: rect.y - 6 + "px",
					padding: "2px 7px",
					fontSize: "11px",
					pointerEvents: "auto",
					background: "var(--dsw-alias-bg-overlay)"
				},
				onClick: (event) => {
					event.stopPropagation();
					update({ panelOpen: !store.panelOpen });
				}
			}, state.panelOpen ? "×" : "⚙"));

			return react.createElement("div", { className: "dpet-layer" }, children);
		}

		// ── plugin ────────────────────────────────────────────────────────────
		/** Register the one overlay entry that owns the whole pet. */
		function apply(ctx) {
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "desktop-pet",
				order: 40
			}, PetLayer));
		}

		exports.apply = apply;
		exports.inject = ["slots"];
		return module.exports;
	}
});

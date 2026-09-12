// Motion vocabulary for the desktop fork — the browser half.
//
// Why this is its own package: the fork already animates a dozen surfaces, and
// they had each picked their own duration and easing. One vocabulary (the
// `--dsm-*` tokens below) is what keeps those from drifting, and one reduced
// motion switch is what keeps every consumer honest — collapsing the tokens
// disarms the whole layer at once instead of surface by surface.
//
// It also owns the two pieces no single surface can own:
//   1. the fade through a theme switch, which is app-wide by definition, and
//   2. the entrance motion of the conversation shell and its rows, which the
//      chat and conversation packages render but never animate.
//
// The selectors for those two are the upstream packages' CSS-module class names
// (hashed, so they are only meaningful for the pinned versions in package.json).
// They are read-only decoration: a name that stops matching simply stops
// animating, and nothing here can break a surface it no longer recognises.
window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-motion",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region styles
		const css = [
			// ── the vocabulary ──
			// Transform and opacity only: those two the compositor can animate off
			// the main thread, so a busy turn never stutters because of decoration.
			// Neither entrance keeps a fill: an animation that outlives itself would
			// leave the element a stacking context for the rest of the Session, and
			// the header it landed on is exactly where the fork's popovers live.
			":root{--dsm-ease-out:cubic-bezier(.22,1,.36,1);--dsm-ease-soft:cubic-bezier(.32,.72,0,1);--dsm-t-fast:140ms;--dsm-t-base:220ms;--dsm-t-slow:320ms;--dsm-rise:6px}",
			"@keyframes dsmRise{from{opacity:0;transform:translateY(var(--dsm-rise))}to{opacity:1;transform:none}}",
			"@keyframes dsmFade{from{opacity:0}to{opacity:1}}",
			// ── through a theme switch ──
			// Flipping the preference repaints every token at once; without this the
			// whole window snaps. The attribute is present only for the length of the
			// swap (see the observer below), so nothing carries a universal transition
			// at rest — which is also why this is the one place a transition is
			// declared with !important: it has to outrank each component's own.
			`html[data-dsh-theme-fade] *:not(svg):not(path){transition:background-color var(--dsm-t-slow) ease,color var(--dsm-t-slow) ease,border-color var(--dsm-t-slow) ease,box-shadow var(--dsm-t-slow) ease,fill var(--dsm-t-slow) ease,stroke var(--dsm-t-slow) ease !important}`,
			// ── the conversation ──
			// Only the scrolling area fades as a Session's view mounts; each row the
			// chat package renders rises as it appears — including the rows that
			// stream in while the model is working, since a new row is a new element.
			// The header and the tabs are deliberately left out: the header carries
			// the fork's own popovers (panel menu, market entry, Session log), and an
			// animated transform on it would make it a stacking context, which traps
			// those menus underneath the conversation they hang over.
			".wSkVaW_viewArea,.wSkVaW_scrollBody{animation:dsmFade var(--dsm-t-base) var(--dsm-ease-out)}",
			".Sixlwa_userRow,.Sixlwa_userStack,.Sixlwa_compactionRow,.Sixlwa_retryRow,.Sixlwa_turnErrorRow,.Sixlwa_contextRow,.l_V-RG_root{animation:dsmRise var(--dsm-t-base) var(--dsm-ease-out)}",
			// The composer's own states — focus ring, tool row, placeholder — read as
			// motion rather than as a repaint.
			".uV2eYG_card,.uV2eYG_tools,.uV2eYG_placeholder,.uV2eYG_accessory{transition:box-shadow var(--dsm-t-base) ease,border-color var(--dsm-t-base) ease,background-color var(--dsm-t-base) ease,color var(--dsm-t-base) ease,opacity var(--dsm-t-base) ease}",
			// ── the sidebar and its tree ──
			// Rows rise as they mount, which is what makes expanding a Workspace (or
			// clearing a search) read as the list unfolding rather than as a jump cut.
			".YDXeBa_sessionRow,.YDXeBa_projectRow,.YDXeBa_searchResultRow{animation:dsmRise var(--dsm-t-base) var(--dsm-ease-out);transition:background-color var(--dsm-t-fast) ease}",
			// ── the controls ──
			// Every pressable control in the shell and the composer answers the press
			// itself; without this the only feedback is the click's effect, which for
			// the send button can arrive a whole turn later.
			".hHd-Xa_newSession,.hHd-Xa_iconButton,.hHd-Xa_toggle,.bhn1Oq_iconButton,.bhn1Oq_searchButton,.YDXeBa_iconButton,.uV2eYG_primary{transition:transform var(--dsm-t-fast) var(--dsm-ease-out),background-color var(--dsm-t-fast) ease,color var(--dsm-t-fast) ease,border-color var(--dsm-t-fast) ease,opacity var(--dsm-t-fast) ease}",
			".hHd-Xa_newSession:active,.hHd-Xa_iconButton:active,.hHd-Xa_toggle:active,.bhn1Oq_iconButton:active,.bhn1Oq_searchButton:active,.YDXeBa_iconButton:active{transform:scale(.94)}",
			".uV2eYG_primary:active:not(:disabled){transform:scale(.9)}",
			// Everything above is decoration: with reduced motion the tokens collapse
			// to a millisecond and the two entrances are dropped outright.
			"@media (prefers-reduced-motion: reduce){:root{--dsm-t-fast:1ms;--dsm-t-base:1ms;--dsm-t-slow:1ms;--dsm-rise:0px}.wSkVaW_viewArea,.wSkVaW_scrollBody,.Sixlwa_userRow,.Sixlwa_userStack,.Sixlwa_compactionRow,.Sixlwa_retryRow,.Sixlwa_turnErrorRow,.Sixlwa_contextRow,.l_V-RG_root,.YDXeBa_sessionRow,.YDXeBa_projectRow,.YDXeBa_searchResultRow{animation:none}.hHd-Xa_newSession:active,.hHd-Xa_iconButton:active,.hHd-Xa_toggle:active,.bhn1Oq_iconButton:active,.bhn1Oq_searchButton:active,.YDXeBa_iconButton:active,.uV2eYG_primary:active:not(:disabled){transform:none}}"
		].join("");
		const tagId = "@deepseek-ai/dsh-client-ui-motion/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-motion";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region theme fade
		/** Root attribute that arms the cross-fade; see the stylesheet above. */
		const THEME_FADE_ATTRIBUTE = "data-dsh-theme-fade";
		/** How long the fade outlives its own transition, so the tail is not cut. */
		const THEME_FADE_MS = 380;
		/** The harness's own statement of "dark is active" (see the theme presenter). */
		const DARK_ATTRIBUTE = "data-ds-dark-theme";
		/**
		* Fade the whole window through a light/dark switch.
		*
		* The theme presenter writes its resolved scheme onto the body attribute, so
		* watching that one attribute is exact: no colour probing, and no fade when a
		* preference change resolves to the same scheme.
		* @returns disposer that drops the observer and any pending fade.
		*/
		function watchThemeFade() {
			const root = document.documentElement;
			const body = document.body;
			if (body === null) return () => {};
			let dark = body.hasAttribute(DARK_ATTRIBUTE);
			let timer = 0;
			const observer = new MutationObserver(() => {
				const next = body.hasAttribute(DARK_ATTRIBUTE);
				if (next === dark) return;
				dark = next;
				root.setAttribute(THEME_FADE_ATTRIBUTE, "");
				window.clearTimeout(timer);
				timer = window.setTimeout(() => {
					root.removeAttribute(THEME_FADE_ATTRIBUTE);
				}, THEME_FADE_MS);
			});
			observer.observe(body, {
				attributes: true,
				attributeFilter: [DARK_ATTRIBUTE]
			});
			return () => {
				observer.disconnect();
				window.clearTimeout(timer);
				root.removeAttribute(THEME_FADE_ATTRIBUTE);
			};
		}
		//#endregion
		//#region plugin
		/** Cordis plugin name. */
		const name = "client-ui-motion";
		/** No service is required: this package only decorates the document. */
		const inject = [];
		/**
		* Arm the theme fade. The stylesheet is installed at module load, because the
		* tokens have to exist before any surface renders.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => watchThemeFade(), "ui-motion: theme fade");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

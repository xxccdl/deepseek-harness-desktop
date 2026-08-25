window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-deliver",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let _runtime_client = require("@deepseek-ai/dsh-client-runtime/client");

		/** Trailing path segment. */
		function basename(path) {
			const at = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
			return at === -1 ? path : path.slice(at + 1);
		}

		/**
		 * Turn-scoped accumulator for `send_file` deliver calls. Only generic
		 * cards with kind === "deliver" contribute; successful settle publishes
		 * the staging path (from that call's first location) for the closing
		 * turn. The value lands at location turn → data key "deliver".
		 */
		const deliverDefinition = {
			kind: "deliver",
			match: (event) => {
				if (event.type === "turn/start") return { id: String(event.data.turn), role: "start" };
				if (event.type === "tool/call") return { id: String(event.data.turn), role: "update" };
				if (event.type === "tool/result" && (0, _runtime_client.isAppendSurfaceEvent)(event)) return { id: String(event.data.turn), role: "update" };
				return null;
			},
			start: (_context, match) => {
				if (match.event.type !== "turn/start") throw new Error("deliver start requires turn/start");
				return { turn: match.event.data.turn, calls: new Map(), delivered: [] };
			},
			update: (context, match) => {
				if (match.event.type === "tool/call") {
					const view = match.view?.for === "call" ? match.view.view : null;
					if (!(view?.card === "generic" && view.kind === "deliver" && Array.isArray(view.locations) && view.locations.length > 0)) return context.state;
					const calls = new Map(context.state.calls);
					calls.set(String(match.event.data.callId), String(view.locations[0].path));
					return { ...context.state, calls };
				}
				if (match.event.type !== "tool/result") return context.state;
				if (match.event.data.message.content[0].isError === true) return context.state;
				const callId = String(match.event.data.message.source.callId);
				const path = context.state.calls.get(callId);
				if (path === undefined) return context.state;
				return { ...context.state, delivered: [...context.state.delivered, { seq: match.event.seq, path }] };
			},
			buildLocationData: (context, scope) => scope !== "turn" || context.state === undefined ? null : {
				kind: "turn",
				turn: context.state.turn,
				key: "deliver",
				value: { delivered: context.state.delivered }
			}
		};

		/** Delivered staging paths for the closing turn, or null to decline. */
		function selectDelivered(owner) {
			const data = owner.turn.data.get("deliver");
			if (data === undefined || !Array.isArray(data.delivered)) return null;
			const paths = [];
			const seen = new Set();
			for (const item of data.delivered) {
				if (item.seq > owner.seq || seen.has(item.path)) continue;
				seen.add(item.path);
				paths.push(item.path);
			}
			return paths.length === 0 ? null : paths;
		}

		/** Post save-deliver back to the React Native WebView bridge. */
		function saveToDevice(path) {
			const bridge = window.ReactNativeWebView;
			if (bridge && typeof bridge.postMessage === "function") {
				bridge.postMessage(JSON.stringify({ type: "save-deliver", path, name: basename(path) }));
			}
		}

		function DeliveredRow({ matched: paths }) {
			const label = { color: "var(--dsw-alias-label-tertiary)", fontSize: 13, lineHeight: "22px" };
			const row = { display: "flex", alignItems: "center", gap: 8, minWidth: 0 };
			const chip = { color: "var(--dsw-alias-label-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220, font: "inherit" };
			const btn = { cursor: "pointer", background: "var(--dsw-alias-interactive-bg-hover)", border: "none", borderRadius: 6, padding: "2px 10px", fontSize: 12, lineHeight: "20px", color: "var(--dsw-alias-label-primary)" };
			return react_jsx_runtime.jsxs("div", {
				style: { display: "grid", gridTemplateColumns: "max-content minmax(0,1fr)", alignItems: "center", gap: "6px 8px", marginTop: 16 },
				children: [
					react_jsx_runtime.jsx("span", { style: label, children: "产物" }),
					react_jsx_runtime.jsx("div", {
						style: { display: "flex", flexDirection: "column", gap: 6, minWidth: 0 },
						children: paths.map((path) => react_jsx_runtime.jsxs("div", {
							key: path,
							style: row,
							children: [
								react_jsx_runtime.jsx("span", { title: path, style: chip, children: basename(path) }),
								react_jsx_runtime.jsx("button", {
									type: "button",
									style: btn,
									onClick: () => { saveToDevice(path); },
									children: "保存"
								})
							]
						}))
					})
				]
			});
		}

		const inject = ["slots", "conversationEvents"];

		function apply(ctx) {
			ctx.conversationEvents.register(deliverDefinition);
			ctx.slots.inject("conversation.chat.turnTail", () => ctx.slots.register({
				name: "conversation.chat.turnTail",
				select: selectDelivered,
				inject: () => ({})
			}, DeliveredRow));
		}

		exports.DeliveredRow = DeliveredRow;
		exports.apply = apply;
		exports.inject = inject;
		exports.selectDelivered = selectDelivered;
		return module.exports;
	}
});
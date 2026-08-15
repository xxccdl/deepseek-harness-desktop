window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-quickchat",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let jsxRuntime = require("react/jsx-runtime");
		const { jsx, jsxs, Fragment } = jsxRuntime;
		const { useState, useEffect, useCallback, useSyncExternalStore, useRef } = react;
		//#region styles
		const css = [
			".qck-mask{position:fixed;inset:0;z-index:900;background:rgba(8,10,16,.34);backdrop-filter:blur(4px);animation:qck-in .16s ease both}",
			".qck-panel{position:fixed;right:28px;bottom:28px;z-index:901;width:420px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 64px);box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden;border-radius:26px;border:1px solid rgba(255,255,255,.45);background:linear-gradient(165deg,rgba(255,255,255,.78),rgba(244,247,255,.58) 42%,rgba(238,243,255,.5));backdrop-filter:blur(30px) saturate(170%);box-shadow:0 30px 70px rgba(15,20,40,.4),0 6px 20px rgba(15,20,40,.16),inset 0 1px 0 rgba(255,255,255,.8);color:#151b2e;animation:qck-in .24s cubic-bezier(.16,1,.3,1) both;font-family:system-ui,-apple-system,\"Segoe UI\",\"Microsoft YaHei\",sans-serif}",
			"@keyframes qck-in{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:none}}",
			// header
			".qck-head{flex:none;display:flex;align-items:center;gap:10px;padding:16px 18px 12px}",
			".qck-back{all:initial;cursor:pointer;width:28px;height:28px;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;color:rgba(21,27,46,.66);font:600 15px/1 system-ui;transition:background .15s ease,color .15s ease}",
			".qck-back:hover{background:rgba(21,27,46,.08);color:rgba(21,27,46,.9)}",
			".qck-title{flex:1;min-width:0;display:flex;align-items:baseline;gap:7px;font-size:14.5px;font-weight:650;line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.2px}",
			".qck-sub{font-size:11px;font-weight:500;color:rgba(21,27,46,.45);letter-spacing:.4px}",
			".qck-close{all:initial;cursor:pointer;width:28px;height:28px;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;color:rgba(21,27,46,.58);font:500 17px/1 system-ui;transition:background .15s ease,color .15s ease}",
			".qck-close:hover{background:rgba(21,27,46,.08);color:rgba(21,27,46,.9)}",
			// mode chips
			".qck-modes{flex:none;display:flex;gap:7px;padding:2px 18px 12px;flex-wrap:wrap}",
			".qck-mode{cursor:pointer;appearance:none;border:1px solid rgba(21,27,46,.14);background:rgba(255,255,255,.55);color:rgba(21,27,46,.8);font:inherit;font-size:12px;font-weight:600;line-height:24px;padding:0 13px;border-radius:999px;letter-spacing:.3px;transition:all .16s ease;flex:none}",
			".qck-mode:hover{border-color:rgba(21,27,46,.3);background:rgba(255,255,255,.9)}",
			".qck-mode.on{background:linear-gradient(135deg,#4f8cff,#7a5cff);border-color:transparent;color:#fff;box-shadow:0 5px 14px rgba(103,92,255,.4)}",
			// tabs
			".qck-tabs{flex:none;display:flex;gap:2px;margin:0 18px 10px;padding:3px;border-radius:12px;background:rgba(21,27,46,.07);border:1px solid rgba(21,27,46,.06)}",
			".qck-tab{cursor:pointer;appearance:none;flex:1;border:0;background:transparent;color:rgba(21,27,46,.66);font:inherit;font-size:12.5px;font-weight:600;line-height:26px;border-radius:9px;letter-spacing:.3px;transition:all .16s ease}",
			".qck-tab:hover{color:rgba(21,27,46,.85)}",
			".qck-tab.on{background:#fff;color:rgba(21,27,46,.92);box-shadow:0 2px 8px rgba(21,27,46,.12)}",
			".qck-body{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden}",
			// task list
			".qck-tasks{flex:1;min-height:0;overflow-y:auto;padding:2px 14px 12px;display:flex;flex-direction:column;gap:6px;scrollbar-width:thin}",
			".qck-task{cursor:pointer;display:flex;align-items:center;gap:9px;padding:10px 12px;border-radius:14px;border:1px solid rgba(21,27,46,.09);background:rgba(255,255,255,.55);transition:background .16s ease,border-color .16s ease,box-shadow .16s ease;min-width:0}",
			".qck-task:hover{background:rgba(255,255,255,.92);border-color:rgba(21,27,46,.16);box-shadow:0 3px 12px rgba(21,27,46,.1)}",
			".qck-task.on{border-color:rgba(79,140,255,.65);box-shadow:0 0 0 1px rgba(79,140,255,.28) inset,0 3px 10px rgba(79,140,255,.12)}",
			".qck-task-dot{flex:none;width:8px;height:8px;border-radius:50%;background:rgba(52,199,123,.95);box-shadow:0 0 0 3px rgba(52,199,123,.18)}",
			".qck-task.run .qck-task-dot{background:#4f8cff;box-shadow:0 0 0 3px rgba(79,140,255,.18);animation:qck-pulse 1.4s ease-in-out infinite}",
			"@keyframes qck-pulse{0%,100%{opacity:1}50%{opacity:.45}}",
			".qck-task-label{flex:1;min-width:0;font-size:12.5px;font-weight:500;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:rgba(21,27,46,.88)}",
			".qck-task-tag{flex:none;font-size:10px;font-weight:600;line-height:17px;padding:0 8px;border-radius:999px;background:rgba(21,27,46,.09);color:rgba(21,27,46,.52);letter-spacing:.3px}",
			".qck-task-tag.run{background:rgba(79,140,255,.16);color:#2f6bdb}",
			".qck-task-tag.done{background:rgba(52,199,123,.16);color:#1f9d63}",
			".qck-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:rgba(21,27,46,.42);font-size:12.5px;padding:24px 0}",
			".qck-empty svg{opacity:.35}",
			// chat
			".qck-chat{flex:1;min-height:0;display:flex;flex-direction:column}",
			".qck-msgs{flex:1;min-height:0;overflow-y:auto;padding:8px 16px;display:flex;flex-direction:column;gap:9px;scrollbar-width:thin}",
			".qck-msg{max-width:86%;padding:9px 13px;border-radius:16px;font-size:12.5px;line-height:1.55;white-space:pre-wrap;word-break:break-word;animation:qck-msg .18s cubic-bezier(.16,1,.3,1) both}",
			"@keyframes qck-msg{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}",
			".qck-msg.user{align-self:flex-end;background:linear-gradient(135deg,#4f8cff,#7a5cff);color:#fff;border-bottom-right-radius:5px;box-shadow:0 5px 16px rgba(103,92,255,.32)}",
			".qck-msg.ai{align-self:flex-start;background:rgba(255,255,255,.85);border:1px solid rgba(21,27,46,.09);color:rgba(21,27,46,.9);border-bottom-left-radius:5px;box-shadow:0 2px 8px rgba(21,27,46,.06)}",
			".qck-pending{display:flex;align-items:center;gap:7px;padding:10px 14px;font-size:12px;font-weight:500;color:rgba(21,27,46,.68);border-radius:16px;background:rgba(255,255,255,.6);border:1px solid rgba(21,27,46,.07);align-self:flex-start;border-bottom-left-radius:5px}",
			".qck-pending i{width:6px;height:6px;border-radius:50%;background:#4f8cff;display:inline-block;animation:qck-dot 1s ease-in-out infinite}",
			".qck-pending i:nth-child(2){animation-delay:.15s}.qck-pending i:nth-child(3){animation-delay:.3s}",
			"@keyframes qck-dot{0%,60%,100%{opacity:.25;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}",
			// input
			".qck-inputbar{flex:none;display:flex;align-items:flex-end;gap:9px;padding:12px 16px 15px;border-top:1px solid rgba(21,27,46,.07);background:rgba(255,255,255,.34)}",
			".qck-input{flex:1;min-width:0;resize:none;border:1px solid rgba(21,27,46,.16);background:rgba(255,255,255,.92);color:#151b2e;font:inherit;font-size:13px;line-height:20px;padding:10px 13px;border-radius:15px;outline:0;transition:border-color .15s ease,box-shadow .15s ease;max-height:96px;box-sizing:border-box}",
			".qck-input:focus{border-color:rgba(79,140,255,.75);box-shadow:0 0 0 3.5px rgba(79,140,255,.18)}",
			".qck-input::placeholder{color:rgba(21,27,46,.4)}",
			".qck-send{flex:none;appearance:none;cursor:pointer;border:0;width:40px;height:40px;border-radius:14px;background:linear-gradient(135deg,#4f8cff,#7a5cff);color:#fff;display:inline-flex;align-items:center;justify-content:center;transition:filter .15s ease,transform .1s ease,box-shadow .15s ease;box-shadow:0 7px 18px rgba(103,92,255,.38)}",
			".qck-send:hover{filter:brightness(1.1);box-shadow:0 8px 22px rgba(103,92,255,.46)}",
			".qck-send:active{transform:scale(.94)}",
			".qck-send:disabled{opacity:.5;cursor:default;filter:none;box-shadow:none}",
			".qck-send svg{width:16px;height:16px;display:block}"
		].join("");
		const tagId = "@deepseek-ai/dsh-client-ui-quickchat/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-quickchat";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region data
		const MODES = [
			{ id: "standard", label: "标准" },
			{ id: "code", label: "PTC" },
			{ id: "minimal", label: "极简" },
			{ id: "cordis", label: "创造" }
		];
		const modeLabel = (id) => MODES.find((m) => m.id === id)?.label ?? id;
		//#endregion
		//#region components
		let boundT = (key) => key;

		function nodeText(node) {
			if (node?.kind === "user") return (node.content ?? []).filter((b) => b?.type === "text").map((b) => b.text).join("");
			if (node?.kind === "assistant") return (node.content ?? []).filter((b) => b?.kind === "text").map((b) => b.text).join("");
			return "";
		}

		function SendIcon() {
			return jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", children: jsx("path", { d: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" }) });
		}
		function ChatIcon() {
			return jsx("svg", { viewBox: "0 0 24 24", width: 26, height: 26, fill: "none", stroke: "currentColor", "stroke-width": 1.6, "stroke-linecap": "round", "stroke-linejoin": "round", children: jsx("path", { d: "M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z" }) });
		}

		function QuickChatPanel({ t, sessions, api }) {
			const [visible, setVisible] = useState(false);
			const [tab, setTab] = useState("chat"); // 'chat' | 'tasks'
			const [mode, setMode] = useState("standard");
			const [inTask, setInTask] = useState(false); // inside a task's mini conversation
			const [targetId, setTargetId] = useState(undefined);
			const [draft, setDraft] = useState("");
			const [sending, setSending] = useState(false);
			const draftRef = useRef("");
			draftRef.current = draft;
			const targetRef = useRef(targetId);
			targetRef.current = targetId;
			const modeRef = useRef(mode);
			modeRef.current = mode;

			useEffect(() => {
				const bridge = typeof window !== "undefined" ? window.dshQuickChat : undefined;
				if (!bridge || typeof bridge.onToggle !== "function") return;
				return bridge.onToggle(() => setVisible((v) => !v));
			}, []);

			// Esc: close a task view, else close the panel.
			useEffect(() => {
				if (!visible) return;
				const onKey = (e) => {
					if (e.key !== "Escape") return;
					if (inTask) { setInTask(false); setTargetId(undefined); }
					else setVisible(false);
				};
				window.addEventListener("keydown", onKey);
				return () => window.removeEventListener("keydown", onKey);
			}, [visible, inTask]);

			const inputRef = useRef(undefined);
			useEffect(() => {
				if (visible) setTimeout(() => inputRef.current?.focus(), 30);
			}, [visible, tab, inTask]);

			const list = useSyncExternalStore(
				(cb) => sessions.list.subscribe(cb),
				() => sessions.list.getSnapshot()
			);
			const currentId = list?.current;
			const current = currentId === undefined ? undefined : list?.byId[currentId];
			useEffect(() => {
				if (current?.agentPreset !== undefined) setMode(current.agentPreset);
			}, [current?.agentPreset]);

			// The conversation shown in the chat page: the opened task, else the current session.
			const activeId = targetId ?? currentId;
			const activeSession = activeId === undefined ? undefined : sessions.binding(activeId)?.session;
			const snap = useSyncExternalStore(
				(cb) => activeSession ? activeSession.subscribe(cb) : () => {},
				() => activeSession ? activeSession.getSnapshot() : undefined
			);

			const openTask = (id) => {
				setTargetId(id);
				setInTask(true);
				setTab("chat");
				sessions.open(id);
			};

			const send = async () => {
				const text = draftRef.current.trim();
				if (text === "" || sending) return;
				const m = modeRef.current;
				let sessionId = currentId;
				const cur = currentId === undefined ? undefined : list?.byId[currentId];
				if (sessionId === undefined || cur === undefined || cur.blank || cur.agentPreset !== m) {
					setSending(true);
					try {
						sessionId = await sessions.create({});
						if (api) await api.agentPresets.select({ sessionId, agentPreset: m });
						sessions.open(sessionId);
					} catch {
						setSending(false);
						return;
					}
					setSending(false);
				}
				const binding = sessions.binding(sessionId);
				if (!binding) return;
				try {
					await binding.session.prompt([{ type: "text", text }], "queue");
					setDraft("");
					if (tab === "tasks") setTab("chat");
					if (!inTask && targetId === undefined) setTargetId(sessionId);
				} catch { /* prompt errors surface in the session */ }
			};

			const onKeyDown = (e) => {
				if (e.key === "Enter" && !e.shiftKey) {
					e.preventDefault();
					void send();
				}
			};

			if (!visible) return null;

			const rows = (list?.ids ?? []).map((id) => list.byId[id]).filter((s) => s && !s.blank);
			const chatNodes = (snap?.nodes ?? []).filter((n) => n && (n.kind === "user" || n.kind === "assistant") && nodeText(n) !== "").slice(-24);
			const activeSummary = activeId === undefined ? undefined : list?.byId[activeId];
			const showChat = tab === "chat";
			const chatHeading = inTask && activeSummary !== undefined ? activeSummary.displayTitle : t("chat");

			return jsxs(Fragment, { children: [
				jsx("div", { className: "qck-mask", onClick: () => setVisible(false) }),
				jsxs("div", { className: "qck-panel", role: "dialog", "aria-label": t("title"), children: [
					jsxs("div", { className: "qck-head", children: [
						inTask ? jsx("button", { type: "button", className: "qck-back", onClick: () => { setInTask(false); setTargetId(undefined); }, children: "‹" }) : null,
						jsx("div", { className: "qck-title", children: [
							showChat ? chatHeading : t("tasks"),
							jsx("span", { className: "qck-sub", children: "Ctrl+D+S" })
						] }),
						jsx("button", { type: "button", className: "qck-close", onClick: () => setVisible(false), children: "✕" })
					] }),
					jsxs("div", { className: "qck-modes", children: MODES.map((m) => jsx("button", {
						type: "button",
						className: "qck-mode" + (mode === m.id ? " on" : ""),
						onClick: () => setMode(m.id),
						children: m.label
					}, m.id)) }),
					jsxs("div", { className: "qck-tabs", children: [
						jsx("button", { type: "button", className: "qck-tab" + (showChat ? " on" : ""), onClick: () => setTab("chat"), children: t("chat") }),
						jsx("button", { type: "button", className: "qck-tab" + (!showChat ? " on" : ""), onClick: () => setTab("tasks"), children: t("tasks") })
					] }),
					jsx("div", { className: "qck-body", children: showChat
						? jsxs("div", { className: "qck-chat", children: [
							jsxs("div", { className: "qck-msgs", children: [
								chatNodes.length === 0 ? jsxs("div", { className: "qck-empty", children: [jsx(ChatIcon, {}), jsx("span", { children: t("noMessages") })] }) : null,
								chatNodes.map((n, i) => jsx("div", { className: "qck-msg " + (n.kind === "user" ? "user" : "ai"), children: nodeText(n) }, i)),
								snap?.running === true ? jsxs("div", { className: "qck-pending", children: [jsx("i", {}), jsx("i", {}), jsx("i", {}), "AI 思考中…"] }) : null
							] })
						] })
						: rows.length === 0
							? jsxs("div", { className: "qck-empty", children: [jsx(ChatIcon, {}), jsx("span", { children: t("noTasks") })] })
							: jsxs("div", { className: "qck-tasks", children: rows.map((s) => jsxs("div", {
								className: "qck-task" + (currentId === s.id ? " on" : "") + (s.running ? " run" : ""),
								onClick: () => openTask(s.id),
								children: [
									jsx("span", { className: "qck-task-dot" }),
									jsx("span", { className: "qck-task-label", children: s.displayTitle }),
									s.agentPreset !== undefined ? jsx("span", { className: "qck-task-tag", children: modeLabel(s.agentPreset) }) : null,
									jsx("span", { className: "qck-task-tag" + (s.running ? " run" : " done"), children: s.running ? "运行中" : "已完成" })
								]
							}, s.id)) })
					}),
					jsxs("div", { className: "qck-inputbar", children: [
						jsx("textarea", {
							ref: inputRef,
							className: "qck-input",
							rows: 1,
							value: draft,
							placeholder: showChat ? t("chatPlaceholder") : t("placeholder"),
							onChange: (e) => setDraft(e.target.value),
							onKeyDown: onKeyDown
						}),
						jsx("button", { type: "button", className: "qck-send", disabled: draft.trim() === "" || sending, onClick: () => void send(), "aria-label": t("send"), children: jsx(SendIcon, {}) })
					] })
				] })
			] });
		}
		//#endregion
		//#region plugin
		const NS = "quickchat";
		const inject = ["slots", "locale", "sessions", "connection"];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh: {
					"title": "快捷对话",
					"chat": "快捷对话",
					"tasks": "任务列表",
					"placeholder": "输入消息，Enter 发送，Shift+Enter 换行",
					"chatPlaceholder": "继续对话…",
					"send": "发送",
					"noTasks": "暂无任务，输入内容后按所选模式创建并发送",
					"noMessages": "还没有消息，输入后开始对话"
				},
				en: {
					"title": "Quick chat",
					"chat": "Quick chat",
					"tasks": "Tasks",
					"placeholder": "Type a message — Enter to send, Shift+Enter for a new line",
					"chatPlaceholder": "Continue…",
					"send": "Send",
					"noTasks": "No tasks yet — type a message to start one in the selected mode",
					"noMessages": "No messages yet — start the conversation"
				}
			}), "ui-quickchat: dictionaries");
			boundT = ctx.locale.bind(NS);
			const sessions = ctx.sessions;
			const api = ctx.get("connection")?.api;
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "quickchat",
				order: 40,
				locale: NS
			}, (props) => jsx(QuickChatPanel, { t: boundT, sessions, api, ...props })));
		}
		//#endregion
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});

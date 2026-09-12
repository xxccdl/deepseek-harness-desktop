// Plugin market — the browser half.
//
// Two surfaces:
//
//   1. `conversation.composer.dock` — the 「插件发布」strip. It is not a
//      fixture of creation mode: the model lights it up by calling the
//      `ask-publish-plugin` tool once it has written a plugin or skill, and the
//      host folds that call into the `publishHint` projection this strip reads.
//      A hint carries the package path and kind; the strip adds a version
//      number and an optional release note, and pressing publish hands the
//      model one explicit instruction whose `plugin_publish` call clears the
//      hint again.
//   2. `conversation.session.header.utilities` + `shell.overlay` — the market
//      itself, in an embedded window: it browses the deployed shop and installs
//      through the host bridge. The page and this surface talk over
//      `postMessage` (the market runs on its own origin, so it cannot call the
//      app's API directly).
window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-market",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const react = require("react");
		const react_jsx_runtime = require("react/jsx-runtime");
		const jsx = react_jsx_runtime.jsx;
		const jsxs = react_jsx_runtime.jsxs;
		const NS = "ui-market";

		//#region styles
		const css = [
			/* ── the publish strip ── */
			".dspm-strip{display:flex;flex-direction:column;gap:6px;box-sizing:border-box;width:100%;max-width:var(--dsh-chat-content-width,680px);margin:8px auto 0;padding:8px 8px 8px 12px;border-radius:12px;background:linear-gradient(120deg,color-mix(in srgb,var(--dsw-alias-brand-primary) 8%,transparent),transparent 62%);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--dsw-alias-brand-primary) 22%,transparent);animation:dspmRise .38s cubic-bezier(.22,1,.36,1) backwards}",
			".dspm-strip-head{display:flex;align-items:flex-start;gap:10px;min-width:0}",
			".dspm-strip-icon{flex:none;display:grid;place-items:center;width:22px;height:22px;border-radius:7px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,transparent);color:var(--dsw-alias-brand-primary)}",
			".dspm-strip-icon svg{width:13px;height:13px}",
			".dspm-strip-copy{flex:1 1 auto;min-width:0;font-size:12px;line-height:1.55;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}",
			".dspm-strip-copy b{color:var(--dsw-alias-label-primary);font-weight:500}",
			".dspm-strip-hintmeta{color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere}",
			".dspm-strip-controls{display:flex;align-items:center;gap:8px;padding-left:32px;min-width:0}",
			".dspm-publish{all:unset;display:inline-flex;align-items:center;gap:6px;flex:none;height:26px;padding:0 12px;border-radius:9px;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-1);font-size:12px;font-weight:500;cursor:pointer;transition:filter .16s ease,transform .12s ease,opacity .16s ease}",
			".dspm-publish svg{width:13px;height:13px}",
			".dspm-publish:hover{filter:brightness(1.1)}",
			".dspm-publish:active{transform:scale(.97)}",
			".dspm-publish:disabled{opacity:.45;cursor:default;filter:none}",
			".dspm-publish[data-sent='true']{background:var(--dsw-alias-state-success-primary);color:#fff}",
			".dspm-publish:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}",
			".dspm-strip-link{all:unset;flex:none;font-size:11.5px;color:var(--dsw-alias-label-tertiary);cursor:pointer;transition:color .16s ease}",
			".dspm-strip-link:hover{color:var(--dsw-alias-brand-primary)}",
			".dspm-strip-input{all:unset;flex:0 1 auto;min-width:0;height:26px;width:110px;box-sizing:border-box;padding:0 9px;border-radius:9px;font-size:12px;color:var(--dsw-alias-label-primary);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l1);transition:box-shadow .16s ease}",
			".dspm-strip-input::placeholder{color:var(--dsw-alias-label-tertiary)}",
			".dspm-strip-input:focus{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent)}",
			".dspm-strip-input.dspm-strip-note{flex:1 1 auto;min-width:120px;width:auto}",
			".dspm-strip-select{width:86px;padding:0 4px 0 8px;cursor:pointer;color:var(--dsw-alias-label-secondary)}",
			".dspm-strip-select:disabled{opacity:.5;cursor:default}",
			".dspm-strip-close{all:unset;flex:none;display:grid;place-items:center;width:22px;height:22px;border-radius:7px;color:var(--dsw-alias-label-tertiary);cursor:pointer;transition:background .16s ease,color .16s ease}",
			".dspm-strip-close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".dspm-strip-close svg{width:11px;height:11px}",
			"@keyframes dspmRise{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}",
			/* ── the market window ── */
			".dspm-layer{position:fixed;inset:0;z-index:70;display:grid;place-items:center;padding:26px}",
			".dspm-scrim{position:absolute;inset:0;background:rgba(10,12,18,.42);backdrop-filter:blur(3px);animation:dspmFade .22s ease both}",
			".dspm-window{position:relative;display:flex;flex-direction:column;width:min(1180px,100%);height:min(820px,100%);border-radius:18px;overflow:hidden;background:var(--dsw-alias-bg-base);box-shadow:0 30px 80px -26px rgba(8,10,16,.55),0 6px 18px rgba(8,10,16,.18);animation:dspmPop .3s cubic-bezier(.22,1,.36,1) both}",
			".dspm-head{display:flex;align-items:center;gap:10px;flex:none;padding:11px 12px 11px 16px;box-shadow:inset 0 -1px 0 0 var(--dsw-alias-border-l1);color:var(--dsw-alias-label-primary)}",
			".dspm-head-icon{display:grid;place-items:center;width:24px;height:24px;border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,transparent);color:var(--dsw-alias-brand-primary)}",
			".dspm-head-icon svg{width:14px;height:14px}",
			".dspm-head-title{font-size:13px;font-weight:600}",
			".dspm-head-hint{font-size:11.5px;color:var(--dsw-alias-label-tertiary)}",
			".dspm-spacer{flex:1 1 auto}",
			".dspm-icon-btn{all:unset;display:grid;place-items:center;width:28px;height:28px;border-radius:8px;color:var(--dsw-alias-label-tertiary);cursor:pointer;transition:background .16s ease,color .16s ease,transform .12s ease}",
			// The session-header entry: a labeled pill, so 「插件市场」 reads as a
			// destination rather than as another icon in the toolbar.
			".dspm-entry{all:unset;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px;box-sizing:border-box;border-radius:9px;cursor:pointer;color:var(--dsw-alias-label-secondary);font-size:12px;white-space:nowrap;box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l1);transition:background .16s ease,color .16s ease,box-shadow .16s ease,transform .12s ease}",
			".dspm-entry svg{width:15px;height:15px;flex:none}",
			".dspm-entry:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l2)}",
			".dspm-entry:active{transform:scale(.97)}",
			".dspm-entry[data-active='true']{color:var(--dsw-alias-brand-primary);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--dsw-alias-brand-primary) 42%,transparent)}",
			/* An installed count of updates is the only reason the pill has to be
			   loud: everything else about the market can wait to be opened. */
			".dspm-entry-badge{flex:none;display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 5px;box-sizing:border-box;border-radius:999px;background:var(--dsw-alias-brand-primary);color:#fff;font-size:10.5px;font-weight:600;font-variant-numeric:tabular-nums}",
			".dspm-entry[data-updates='true']{color:var(--dsw-alias-brand-primary);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--dsw-alias-brand-primary) 42%,transparent)}",
			".dspm-icon-btn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".dspm-icon-btn[data-active='true']{color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover)}",
			".dspm-icon-btn:active{transform:scale(.92)}",
			".dspm-icon-btn svg{width:15px;height:15px}",
			".dspm-btn{all:unset;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px;border-radius:9px;font-size:12px;color:var(--dsw-alias-label-primary);cursor:pointer;box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l1);transition:background .16s ease,transform .12s ease}",
			".dspm-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".dspm-btn:active{transform:scale(.97)}",
			".dspm-btn svg{width:13px;height:13px}",
			".dspm-notice{display:flex;align-items:center;gap:10px;flex:none;padding:8px 16px;background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 12%,transparent);color:var(--dsw-alias-label-primary);font-size:12px;animation:dspmRise .3s cubic-bezier(.22,1,.36,1) both}",
			".dspm-notice[data-tone='bad']{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent)}",
			".dspm-notice svg{width:14px;height:14px;flex:none}",
			".dspm-frame{flex:1 1 auto;width:100%;border:0;background:var(--dsw-alias-bg-base)}",
			".dspm-empty{display:grid;place-items:center;flex:1 1 auto;padding:40px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.7}",
			"@keyframes dspmFade{from{opacity:0}to{opacity:1}}",
			"@keyframes dspmPop{from{opacity:0;transform:translateY(10px) scale(.99)}to{opacity:1;transform:none}}",
			"@media (prefers-reduced-motion: reduce){.dspm-strip,.dspm-window,.dspm-scrim,.dspm-notice{animation:none}}"
		].join("");
		const tagId = "@deepseek-ai/dsh-client-ui-market/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-market";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion

		//#region shared
		/** Market the window opens before the host reports its own. */
		const FALLBACK_BASE = "http://175.27.141.172:9009";
		/** Creation mode's preset id. */
		const CREATOR_PRESET = "cordis";
		/** Icon: a shop front, drawn here so the strip needs no dependency. */
		function MarketIcon() {
			return jsx("svg", {
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				"stroke-width": "1.4",
				"stroke-linecap": "round",
				"stroke-linejoin": "round",
				children: [
					jsx("path", { d: "M2.6 6.2h10.8" }),
					jsx("path", { d: "M3.4 6.2 4.6 2.6h6.8l1.2 3.6" }),
					jsx("path", { d: "M3.6 6.2v7.2h8.8V6.2" }),
					jsx("path", { d: "M6.6 13.4V9.6h2.8v3.8" })
				]
			});
		}
		/** Icon: sparkles, for the publish affordance. */
		function SparkIcon() {
			return jsx("svg", {
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				"stroke-width": "1.4",
				"stroke-linecap": "round",
				"stroke-linejoin": "round",
				children: [
					jsx("path", { d: "M6.4 2.2 7.2 4.6l2.4.8-2.4.8-.8 2.4-.8-2.4L3.2 5.4l2.4-.8z" }),
					jsx("path", { d: "M11.6 8.2l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6z" })
				]
			});
		}
		/** Icon: check, for a settled state. */
		function TickIcon() {
			return jsx("svg", {
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				"stroke-width": "1.7",
				"stroke-linecap": "round",
				"stroke-linejoin": "round",
				children: jsx("path", { d: "M3.6 8.4l3 3 5.8-6.4" })
			});
		}
		/** Icon: close. */
		function CloseIcon() {
			return jsx("svg", {
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				"stroke-width": "1.6",
				"stroke-linecap": "round",
				children: jsx("path", { d: "M4 4l8 8M12 4l-8 8" })
			});
		}
		/** Icon: reload the page so freshly installed client halves arrive. */
		function ReloadIcon() {
			return jsx("svg", {
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				"stroke-width": "1.4",
				"stroke-linecap": "round",
				"stroke-linejoin": "round",
				children: [
					jsx("path", { d: "M13 8a5 5 0 1 1-1.6-3.7" }),
					jsx("path", { d: "M13 2.4V5h-2.6" })
				]
			});
		}
		/** The Session a slot entry addresses, from props or the current-Session record. */
		function sessionIdOf(props) {
			if (typeof props.sessionId === "string") return props.sessionId;
			if (typeof props.session?.id === "string") return props.session.id;
			try {
				const current = JSON.parse(localStorage.getItem("dsh.sessions.current") ?? "{}");
				return typeof current.sessionId === "string" ? current.sessionId : null;
			} catch {
				return null;
			}
		}
		/** Selector hook that answers nothing when the slot supplies no store. */
		function useNoSessions() {
			return undefined;
		}
		/** Projection hook that answers nothing when the slot supplies no store. */
		function useNoProjection() {
			return undefined;
		}
		/** One JSON call to the host bridge, which keeps the market's token. */
		async function bridge(path, body) {
			const response = await fetch(path, body === undefined ? undefined : {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body)
			});
			const payload = await response.json().catch(() => ({}));
			if (payload.ok !== true) throw new Error(payload.error ?? `HTTP ${response.status}`);
			return payload;
		}
		/**
		* The host's own light/dark, for the embedded market page to paint itself in.
		*
		* The harness STATES its resolved scheme twice — as the root element's inline
		* `color-scheme` and as the body's `data-ds-dark-theme` attribute — so reading
		* either is exact. This used to probe the app's `--dsw-alias-label-primary`
		* colour and rank it as "bright means light", which is backwards: that token
		* is near-black on the light palette, so every theme reported its opposite and
		* the market opened dark inside a light app.
		* @returns "light", "dark", or undefined when the host states neither (the
		*   market page opened on its own then follows the OS, as before).
		*/
		function hostTheme() {
			try {
				const declared = document.documentElement.style.colorScheme;
				if (declared === "dark" || declared === "light") return declared;
			} catch { /* fall through to the attribute */ }
			try {
				const body = document.body;
				if (body !== null) return body.hasAttribute("data-ds-dark-theme") ? "dark" : undefined;
			} catch { /* fall through */ }
			return undefined;
		}
		//#endregion

		//#region publish strip
		/** Loose semver — enough to stop a typo before it reaches the model. */
		const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;

		/**
		* The instruction handed to the model when the strip's 「插件发布」 is
		* pressed. The offer itself (`ask-publish-plugin`) already names the
		* directory, so this prompt pins down what the user chose here: the type
		* (pinned, or left for the model to judge), the version, and the note.
		* @param hint - the `publishHint` projection value (path/kind/title).
		* @param kind - the user-pinned type: "plugin", "skill", or "" for auto.
		* @param version - the user's version number, or "" to let the market pick.
		* @param note - the user's release note, or "".
		*/
		function publishPrompt(hint, kind, version, note) {
			const skill = kind === "skill";
			const typeLine = skill
				? "类型：技能（已确定）。plugin_publish 的 kind 传 skill；SKILL.md 的 frontmatter 必须有 name（小写字母/数字/连字符）和 description。"
				: kind === "plugin"
					? "类型：插件（已确定）。plugin_publish 的 kind 传 plugin（或不传 kind）。"
					: "类型：自动判断——目录里有 package.json 是插件，只有 SKILL.md 是技能；plugin_publish 的 kind 按此传。";
			return [
				"[插件发布] 请把刚写好的成果发布到 DeepSeek Harness 插件市场（plugin market）。",
				"",
				`包目录：${hint.path === "" ? "（未提供，请自动定位刚写好的那一层）" : hint.path}`,
				typeLine,
				version === ""
					? "版本号：不指定，由市场自动决定（技能重复发布自动递增 patch）。"
					: `版本号：使用 ${version}。`,
				...(note === "" ? [] : [`更新说明：${note}`]),
				"",
				"步骤：",
				"1. 调用 plugin_publish 发布：path 传上面的包目录，kind 按上面的类型；同时给出 title（中文展示名）、summary（一句话简介）、category（开发工具/效率提升/内容创作/数据分析/界面美化/其他）、tags（2-5 个）、author。",
				"2. 如果包内还没有 README.md，先补一份简短说明再发布。",
				"3. 发布成功后，把返回的市场链接原样告诉我。",
				"",
				"注意：插件包不要声明 npm 依赖（市场不支持安装依赖），所有 .js 必须能通过 node --check。"
			].join("\n");
		}

		/**
		* The creation-mode strip above the control panel.
		*
		* It is not a fixture: the model lights it up by calling
		* `ask-publish-plugin` after it has written something, and the host folds
		* that call into the `publishHint` projection this strip reads. No hint,
		* no strip. When a hint is present the user picks a version (empty means
		* the market decides), optionally a release note, and pressing publish
		* hands the model one explicit instruction whose `plugin_publish` call
		* clears the hint — the strip retires itself.
		*
		* Whether this Session is in creation mode is read from the `agentPreset`
		* Session PROJECTION, not from the Session summary: a preset is a committed
		* fact about the running agent, and the summary the sidebar lists carries no
		* such field — reading it there left the strip permanently hidden.
		*/
		function PublishStrip({ sessionId, sessions, useSessions, useProjection, t, onOpenMarket }) {
			const session = useSessions((state) => sessionId === null || state?.byId === undefined ? undefined : state.byId[sessionId]);
			const preset = useProjection("agentPreset");
			const hint = useProjection("publishHint");
			const [sent, setSent] = react.useState(false);
			const [error, setError] = react.useState(null);
			const [kind, setKind] = react.useState("");
			const [version, setVersion] = react.useState("");
			const [note, setNote] = react.useState("");
			const [dismissed, setDismissed] = react.useState(null);
			const callId = hint !== null && hint !== undefined ? hint.callId : "";
			react.useEffect(() => {
				setSent(false);
				setError(null);
				// A fresh offer resets the choices; the type starts on whatever the
				// model committed to in the offer (「自动判断」 when it did not).
				setKind(hint !== null && hint !== undefined ? hint.kind : "");
				setVersion("");
				setNote("");
			}, [sessionId, callId]);
			if (preset !== CREATOR_PRESET) return null;
			if (hint === null || hint === undefined) return null;
			if (dismissed !== null && dismissed === callId) return null;
			const running = session?.running === true;
			const publish = async () => {
				if (running || sent) return;
				const trimmed = version.trim();
				if (trimmed !== "" && !VERSION_PATTERN.test(trimmed)) {
					setError(t("strip.badVersion"));
					return;
				}
				const binding = sessions?.binding?.(sessionId);
				if (binding?.session === undefined) {
					setError(t("error.noSession"));
					return;
				}
				try {
					await binding.session.prompt([{ type: "text", text: publishPrompt(hint, kind, trimmed, note.trim()) }], "queue");
					setSent(true);
					setError(null);
				} catch (failure) {
					setError(failure instanceof Error ? failure.message : String(failure));
				}
			};
			const name = hint.title === "" ? t(hint.kind === "skill" ? "strip.skill" : "strip.plugin") : `「${hint.title}」`;
			return jsxs("div", {
				className: "dspm-strip",
				children: [
					jsxs("div", {
						className: "dspm-strip-head",
						children: [
							jsx("span", { className: "dspm-strip-icon", children: jsx(SparkIcon, {}) }),
							jsx("span", {
								className: "dspm-strip-copy",
								children: error !== null ? error : jsxs(react.Fragment, {
									children: [
										jsx("b", { children: t("strip.creator") }),
										t(sent ? "strip.sent" : running ? "strip.busy" : "strip.offered", { name }),
										jsx("span", { className: "dspm-strip-hintmeta", children: hint.path === "" ? "" : ` · ${hint.path}` })
									]
								})
							}),
							jsx("button", {
								type: "button",
								className: "dspm-strip-close",
								"aria-label": t("strip.dismiss"),
								title: t("strip.dismiss"),
								onClick: () => setDismissed(callId),
								children: jsx(CloseIcon, {})
							})
						]
					}),
					jsxs("div", {
						className: "dspm-strip-controls",
						children: [
							jsx("select", {
								className: "dspm-strip-input dspm-strip-select",
								value: kind,
								"aria-label": t("strip.kind"),
								disabled: sent,
								onChange: (event) => setKind(event.target.value),
								children: [
									jsx("option", { value: "", children: t("strip.kind.auto") }),
									jsx("option", { value: "plugin", children: t("strip.kind.plugin") }),
									jsx("option", { value: "skill", children: t("strip.kind.skill") })
								]
							}),
							jsx("input", {
								type: "text",
								className: "dspm-strip-input",
								value: version,
								placeholder: t("strip.version"),
								"aria-label": t("strip.version"),
								spellCheck: false,
								onChange: (event) => setVersion(event.target.value)
							}),
							jsx("input", {
								type: "text",
								className: "dspm-strip-input dspm-strip-note",
								value: note,
								placeholder: t("strip.note"),
								"aria-label": t("strip.note"),
								onChange: (event) => setNote(event.target.value)
							}),
							jsx("button", {
								type: "button",
								className: "dspm-strip-link",
								onClick: onOpenMarket,
								children: t("strip.market")
							}),
							jsx("button", {
								type: "button",
								className: "dspm-publish",
								"data-sent": String(sent),
								disabled: running || sent,
								onClick: () => {
									void publish();
								},
								children: [
									jsx(sent ? TickIcon : SparkIcon, {}),
									jsx("span", { children: t(sent ? "strip.published" : "strip.publish") })
								]
							})
						]
					})
				]
			});
		}
		//#endregion

		//#region market window
		/**
		* The market, embedded. The page is served by the market itself (its own
		* origin), so it cannot reach this app's API: every install travels as a
		* `postMessage` pair — request in, result out — and the host bridge does the
		* filesystem work.
		*/
		function MarketWindow({ open, onClose, t }) {
			const frameRef = react.useRef(null);
			const [baseUrl, setBaseUrl] = react.useState(FALLBACK_BASE);
			const [status, setStatus] = react.useState("loading");
			const [notice, setNotice] = react.useState(null);
			const [failed, setFailed] = react.useState(false);
			const [installed, setInstalled] = react.useState(0);
			const [updates, setUpdates] = react.useState(0);
			const [reload, setReload] = react.useState(false);
			/** Send one message into the embedded page. */
			const postToFrame = react.useCallback((message) => {
				const frame = frameRef.current;
				if (frame?.contentWindow !== null && frame?.contentWindow !== undefined) frame.contentWindow.postMessage(message, "*");
			}, []);

			react.useEffect(() => {
				if (!open) return undefined;
				let cancelled = false;
				setFailed(false);
				bridge("/api/market/state")
					.then((payload) => {
						if (cancelled) return;
						setBaseUrl(String(payload.baseUrl ?? FALLBACK_BASE).replace(/\/$/, ""));
						const list = Array.isArray(payload.installed) ? payload.installed : [];
						setInstalled(list.length);
						setUpdates(list.filter((entry) => entry.hasUpdate === true).length);
						setStatus(payload.market?.reachable === true ? "ready" : "unreachable");
					})
					.catch((failure) => {
						if (!cancelled) {
							setStatus("unreachable");
							setNotice(failure instanceof Error ? failure.message : String(failure));
						}
					});
				return () => {
					cancelled = true;
				};
			}, [open]);

			// The bridge: only messages from our own frame are trusted.
			react.useEffect(() => {
				if (!open) return undefined;
				const answer = postToFrame;
				const onMessage = async (event) => {
					const frame = frameRef.current;
					if (frame === null || event.source !== frame.contentWindow) return;
					const data = event.data;
					if (typeof data !== "object" || data === null || typeof data.type !== "string") return;
					if (data.type === "dsh-market:hello") {
						try {
							const payload = await bridge("/api/market/state");
							answer({ type: "dsh-market:context", installed: payload.installed ?? [], baseUrl: payload.baseUrl ?? baseUrl, theme: hostTheme() });
						} catch {
							answer({ type: "dsh-market:context", installed: [], baseUrl, theme: hostTheme() });
						}
						return;
					}
					if (data.type === "dsh-market:install") {
						try {
							const payload = await bridge("/api/market/install", { id: data.id, version: data.version });
							answer({ type: "dsh-market:result", action: "install", id: data.id, ok: true, version: payload.version, message: payload.message });
							setReload(true);
							setFailed(false);
							setNotice(payload.message ?? null);
						} catch (failure) {
							const message = failure instanceof Error ? failure.message : String(failure);
							answer({ type: "dsh-market:result", action: "install", id: data.id, ok: false, message });
							// A refused install must not be silent out here: the iframe
							// toasts it, but the window itself owns the durable banner.
							setReload(false);
							setFailed(true);
							setNotice(message);
						}
						return;
					}
					if (data.type === "dsh-market:uninstall") {
						try {
							const payload = await bridge("/api/market/uninstall", { id: data.id });
							answer({ type: "dsh-market:result", action: "uninstall", id: data.id, ok: true, message: payload.message });
							setReload(true);
							setFailed(false);
							setNotice(payload.message ?? null);
							setInstalled((value) => Math.max(0, value - 1));
						} catch (failure) {
							const message = failure instanceof Error ? failure.message : String(failure);
							answer({ type: "dsh-market:result", action: "uninstall", id: data.id, ok: false, message });
							setReload(false);
							setFailed(true);
							setNotice(message);
						}
					}
				};
				window.addEventListener("message", onMessage);
				return () => {
					window.removeEventListener("message", onMessage);
				};
			}, [open, baseUrl]);

			// Keep the embedded page on the host's theme. The theme service flips
			// attributes on the app's root elements, so an attribute observer is
			// enough; the OS-preference listener covers "follow system".
			react.useEffect(() => {
				if (!open) return undefined;
				const push = () => {
					const theme = hostTheme();
					if (theme !== undefined) postToFrame({ type: "dsh-market:theme", theme });
				};
				const observer = new MutationObserver(push);
				for (const target of [document.documentElement, document.body]) {
					if (target !== null && target !== undefined) observer.observe(target, { attributes: true });
				}
				const query = window.matchMedia?.("(prefers-color-scheme: dark)");
				query?.addEventListener?.("change", push);
				return () => {
					observer.disconnect();
					query?.removeEventListener?.("change", push);
				};
			}, [open, postToFrame]);

			react.useEffect(() => {
				if (!open) return undefined;
				const onKey = (event) => {
					if (event.key === "Escape") onClose();
				};
				window.addEventListener("keydown", onKey);
				return () => {
					window.removeEventListener("keydown", onKey);
				};
			}, [open, onClose]);

			if (!open) return null;
			return jsxs("div", {
				className: "dspm-layer",
				children: [
					jsx("div", { className: "dspm-scrim", onClick: onClose }),
					jsxs("div", {
						className: "dspm-window",
						role: "dialog",
						"aria-modal": true,
						"aria-label": t("market.title"),
						children: [
							jsxs("div", {
								className: "dspm-head",
								children: [
									jsx("span", { className: "dspm-head-icon", children: jsx(MarketIcon, {}) }),
									jsx("span", { className: "dspm-head-title", children: t("market.title") }),
									jsx("span", {
										className: "dspm-head-hint",
										children: installed === 0
											? t("market.subtitle")
											: updates > 0
												? t("market.summaryUpdates", { installed: String(installed), updates: String(updates) })
												: t("market.summary", { installed: String(installed) })
									}),
									jsx("span", { className: "dspm-spacer" }),
									jsx("button", {
										type: "button",
										className: "dspm-btn",
										onClick: () => {
											const frame = frameRef.current;
											if (frame !== null) frame.src = `${baseUrl}/?t=${Date.now()}`;
										},
										children: [jsx(ReloadIcon, {}), jsx("span", { children: t("market.reload") })]
									}),
									jsx("button", {
										type: "button",
										className: "dspm-icon-btn",
										"aria-label": t("market.close"),
										onClick: onClose,
										children: jsx(CloseIcon, {})
									})
								]
							}),
							(reload || failed) && jsxs("div", {
								className: "dspm-notice",
								"data-tone": failed ? "bad" : "ok",
								children: [
									jsx(failed ? CloseIcon : TickIcon, {}),
									jsx("span", { children: notice ?? (failed ? t("error.noSession") : t("market.installed")) }),
									jsx("span", { className: "dspm-spacer" }),
									reload && !failed && jsx("button", {
										type: "button",
										className: "dspm-btn",
										onClick: () => location.reload(),
										children: [jsx(ReloadIcon, {}), jsx("span", { children: t("market.applyNow") })]
									}),
									failed && jsx("button", {
										type: "button",
										className: "dspm-icon-btn",
										"aria-label": t("market.close"),
										onClick: () => setFailed(false),
										children: jsx(CloseIcon, {})
									})
								]
							}),
							status === "unreachable"
								? jsx("div", {
									className: "dspm-empty",
									children: jsxs("div", {
										children: [
											jsx("div", { children: t("market.unreachable") }),
											jsx("div", { children: baseUrl }),
											jsx("div", { children: notice ?? "" })
										]
									})
								})
								: jsx("iframe", {
									className: "dspm-frame",
									ref: frameRef,
									src: `${baseUrl}/`,
									title: t("market.title"),
									allow: "clipboard-write",
									onLoad: () => {
										const theme = hostTheme();
										if (theme !== undefined) postToFrame({ type: "dsh-market:theme", theme });
									}
								})
						]
					})
				]
			});
		}
		//#endregion

		//#region entries
		/** Locale namespace owner + the client services both surfaces need. */
		const inject = ["slots", "locale", "sessions"];

		/** One shared open/close state, so the strip's link and the header agree. */
		const windowStore = (() => {
			let open = false;
			const listeners = new Set();
			const emit = () => {
				for (const listener of listeners) listener();
			};
			return {
				get: () => open,
				set: (value) => {
					if (open === value) return;
					open = value;
					emit();
				},
				subscribe: (listener) => {
					listeners.add(listener);
					return () => listeners.delete(listener);
				},
				use: () => react.useSyncExternalStore(
					(listener) => {
						listeners.add(listener);
						return () => listeners.delete(listener);
					},
					() => open
				)
			};
		})();

		/** The publish strip, bound to the addressed Session and its stores. */
		function StripEntry(props) {
			return jsx(PublishStrip, {
				sessionId: sessionIdOf(props),
				sessions: props.sessions ?? sessionsRef,
				useSessions: props.useSessions ?? useNoSessions,
				useProjection: props.useProjection ?? useNoProjection,
				t: props.t ?? ((key) => key),
				onOpenMarket: () => windowStore.set(true)
			});
		}

		/**
		* How many installed market plugins sit behind their published version.
		*
		* Re-asked whenever the market window opens or closes, which is exactly
		* when the answer can have changed: browsing it is how an update gets
		* installed. A market that cannot be reached reports nothing rather than
		* zero, so the badge never claims "up to date" on a failed check.
		*/
		function useUpdates(active) {
			const [count, setCount] = react.useState(0);
			react.useEffect(() => {
				let cancelled = false;
				bridge("/api/market/state")
					.then((payload) => {
						if (cancelled) return;
						const list = Array.isArray(payload.installed) ? payload.installed : [];
						setCount(list.filter((entry) => entry.hasUpdate === true).length);
					})
					.catch(() => { /* an unreachable market has nothing to report */ });
				return () => {
					cancelled = true;
				};
			}, [active]);
			return count;
		}

		/**
		* The header entry. It is a labelled pill rather than a bare icon because
		* the market is the one surface a person has to be able to find without
		* knowing it exists; the icon alone was easy to read as decoration.
		*/
		function HeaderEntry(props) {
			const t = props.t ?? ((key) => key);
			const open = windowStore.use();
			const updates = useUpdates(open);
			const label = t("market.title");
			return jsx("button", {
				type: "button",
				className: "dspm-entry",
				"data-active": String(open),
				"data-updates": String(updates > 0),
				"aria-label": label,
				title: updates > 0 ? t("market.updates", { count: String(updates) }) : label,
				onClick: () => windowStore.set(!open),
				children: [
					jsx(MarketIcon, {}),
					jsx("span", { children: label }),
					updates > 0 ? jsx("span", { className: "dspm-entry-badge", children: String(updates) }) : null
				]
			});
		}

		/** The always-mounted window, so installs keep working while it is closed. */
		function WindowEntry(props) {
			const open = windowStore.use();
			return jsx(MarketWindow, {
				open,
				onClose: () => windowStore.set(false),
				t: props.t ?? ((key) => key)
			});
		}

		/** Bound in `apply`: the client sessions service, for prompting the model. */
		let sessionsRef = undefined;
		//#endregion

		//#region dictionaries
		const zh = {
			"strip.creator": "创造模式",
			"strip.offered": " · {name}已写好，可选择版本号后发布",
			"strip.plugin": "一个插件",
			"strip.skill": "一个技能",
			"strip.busy": " · AI 正在工作，等它停下再发布",
			"strip.sent": " · 已请 AI 打包发布，结果会出现在对话里",
			"strip.publish": "插件发布",
			"strip.published": "已请求发布",
			"strip.version": "版本号（留空自动）",
			"strip.note": "更新说明（可选）",
			"strip.kind": "发布类型",
			"strip.kind.auto": "类型：自动",
			"strip.kind.plugin": "类型：插件",
			"strip.kind.skill": "类型：技能",
			"strip.badVersion": "版本号格式应为 x.y.z",
			"strip.dismiss": "暂不发布",
			"strip.market": "插件市场",
			"market.title": "插件市场",
			"market.subtitle": "装完即用，无需重启",
			"market.reload": "重新载入",
			"market.close": "关闭",
			"market.installed": "插件已安装。界面插件需要刷新页面才会出现。",
			"market.applyNow": "立即刷新",
			"market.summary": "已装 {installed} 个插件",
			"market.summaryUpdates": "已装 {installed} 个插件 · {updates} 个可更新",
			"market.updates": "{count} 个插件有新版本，打开插件市场更新",
			"market.unreachable": "连不上插件市场服务器。",
			"error.noSession": "当前会话还没准备好，请稍后再试"
		};
		const en = {
			"strip.creator": "Creation mode",
			"strip.offered": " · {name} is ready — pick a version and publish",
			"strip.plugin": "a plugin",
			"strip.skill": "a skill",
			"strip.busy": " · the model is working — publish when it settles",
			"strip.sent": " · asked the model to package and publish it",
			"strip.publish": "Publish plugin",
			"strip.published": "Publish requested",
			"strip.version": "version (auto if empty)",
			"strip.note": "release note (optional)",
			"strip.kind": "Publish as",
			"strip.kind.auto": "Auto",
			"strip.kind.plugin": "Plugin",
			"strip.kind.skill": "Skill",
			"strip.badVersion": "version must look like x.y.z",
			"strip.dismiss": "Not now",
			"strip.market": "Plugin market",
			"market.title": "Plugin market",
			"market.subtitle": "install and use, no restart",
			"market.reload": "Reload",
			"market.close": "Close",
			"market.installed": "Installed. Interface plugins appear after a page reload.",
			"market.applyNow": "Reload now",
			"market.summary": "{installed} plugin(s) installed",
			"market.summaryUpdates": "{installed} plugin(s) installed · {updates} update(s)",
			"market.updates": "{count} plugin(s) have a newer version — open the market to update",
			"market.unreachable": "The plugin market is unreachable.",
			"error.noSession": "This session is not ready yet"
		};
		//#endregion

		/** Client plugin body: dictionaries, the strip, the header entry, the window. */
		function apply(ctx) {
			sessionsRef = ctx.sessions;
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "ui-market: dictionaries");
			// The desktop shell injects its own 「插件市场」 button into the window's
			// title bar (it is the one strip of chrome that is always on screen).
			// It cannot reach this plugin's store, so it announces the press as a
			// document event and the market window answers it here.
			ctx.effect(() => {
				const open = () => {
					windowStore.set(true);
				};
				window.addEventListener("dsh:open-market", open);
				return () => {
					window.removeEventListener("dsh:open-market", open);
				};
			}, "ui-market: title-bar entry");
			ctx.slots.inject("conversation.composer.dock", () => ctx.slots.register({
				name: "conversation.composer.dock",
				id: "market-publish",
				order: 10,
				locale: NS
			}, StripEntry));
			ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
				name: "conversation.session.header.utilities",
				id: "market-entry",
				order: 5,
				locale: NS
			}, HeaderEntry));
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "market-window",
				order: 45,
				locale: NS
			}, WindowEntry));
		}

		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});

window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-enhance",
	factory: () => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region styles
		const css = [
			".dshe-overlay{position:fixed;inset:0;z-index:9990;display:flex;align-items:flex-start;justify-content:center;padding-top:12vh;background:rgba(0,0,0,.45);backdrop-filter:blur(3px);animation:dsheFade .14s ease}",
			".dshe-overlay[hidden]{display:none}",
			"@keyframes dsheFade{from{opacity:0}to{opacity:1}}",
			".dshe-panel{width:min(640px,92vw);max-height:64vh;display:flex;flex-direction:column;background:#16181f;border:1px solid rgba(255,255,255,.1);border-radius:14px;box-shadow:0 18px 60px rgba(0,0,0,.5);overflow:hidden;color:#e6e9f0;font:14px/1.5 system-ui,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif}",
			".dshe-panel-header{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.08);font-size:13px;color:rgba(230,233,240,.6)}",
			".dshe-panel-header b{color:#e6e9f0;font-size:14px;font-weight:600}",
			".dshe-panel-header .dshe-kbd{margin-left:auto;font-size:11px;padding:2px 8px;border:1px solid rgba(255,255,255,.16);border-radius:6px;color:rgba(230,233,240,.55)}",
			".dshe-input{margin:12px 16px 8px;padding:9px 12px;border:1px solid rgba(255,255,255,.14);border-radius:9px;background:rgba(255,255,255,.05);color:#e6e9f0;font:14px/1.4 inherit;outline:0;width:calc(100% - 32px);box-sizing:border-box}",
			".dshe-input:focus{border-color:#7c8cf8}",
			".dshe-list{overflow-y:auto;padding:4px 8px 10px;flex:1}",
			".dshe-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:9px;cursor:pointer;white-space:nowrap;overflow:hidden}",
			".dshe-item:hover,.dshe-item.dshe-active{background:rgba(124,140,248,.14)}",
			".dshe-item-main{min-width:0;flex:1;display:flex;flex-direction:column;gap:1px}",
			".dshe-item-title{font-size:13.5px;color:#e6e9f0;overflow:hidden;text-overflow:ellipsis}",
			".dshe-item-sub{font-size:11.5px;color:rgba(230,233,240,.45);overflow:hidden;text-overflow:ellipsis}",
			".dshe-item-tag{flex:none;font-size:11px;color:#7c8cf8;background:rgba(124,140,248,.12);border-radius:6px;padding:2px 7px}",
			".dshe-empty{padding:28px 0;text-align:center;color:rgba(230,233,240,.4);font-size:13px}",
			".dshe-help{padding:8px 16px 16px;overflow-y:auto}",
			".dshe-help-row{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:13.5px}",
			".dshe-help-row:last-child{border-bottom:0}",
			".dshe-help-keys{display:flex;gap:6px}",
			".dshe-help-keys span{font-size:11.5px;padding:2px 8px;border:1px solid rgba(255,255,255,.16);border-radius:6px;color:#c9d2ff;background:rgba(124,140,248,.1)}",
			".dshe-help-desc{color:rgba(230,233,240,.75)}",
			".dshe-help-group{margin:14px 0 4px;font-size:11.5px;color:#7c8cf8;letter-spacing:.08em;text-transform:uppercase}",
			/* code-block toolbar */
			".dshe-pre{position:relative}",
			".dshe-toolbar{position:absolute;top:6px;right:8px;display:flex;gap:4px;z-index:5;opacity:0;transition:opacity .15s ease}",
			".dshe-pre:hover .dshe-toolbar{opacity:1}",
			".dshe-tb-btn{all:initial;font:11px/1 system-ui,sans-serif !important;color:rgba(230,233,240,.75) !important;background:rgba(20,22,30,.85) !important;border:1px solid rgba(255,255,255,.14) !important;border-radius:6px !important;padding:4px 8px !important;cursor:pointer}",
			".dshe-tb-btn:hover{color:#fff !important;border-color:#7c8cf8 !important}",
			".dshe-pre.dshe-collapsed{max-height:72px;overflow:hidden}",
			".dshe-pre.dshe-collapsed::after{content:'';position:absolute;inset:auto 0 0 0;height:44px;background:linear-gradient(transparent,#0d0f14)}",
			/* mermaid */
			".dshe-mermaid{border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:14px;margin:8px 0;background:rgba(255,255,255,.02);overflow:auto;text-align:center}",
			".dshe-mermaid svg{max-width:100%}",
			".dshe-mermaid-err{font:12px/1.6 system-ui,sans-serif;color:#e08c8c;text-align:left}",
			".dshe-src-toggle{all:initial;display:inline-flex;font:11px/1 system-ui,sans-serif !important;color:rgba(230,233,240,.6) !important;cursor:pointer;padding:6px 4px 0;user-select:none}"
		].join("");
		const tagId = "@deepseek-ai/dsh-client-ui-enhance/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-enhance";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region rpc
		let rpcSeq = 0;
		async function rpc(method, payload = {}) {
			const res = await fetch("/api/" + method, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ type: "client-request", rpcId: "dshe-" + String(++rpcSeq), method, payload })
			});
			if (!res.ok) throw new Error("HTTP " + String(res.status));
			const envelope = await res.json();
			const result = envelope?.result;
			if (result === undefined || result.ok !== true) {
				throw new Error(result?.error?.message ?? method + " 调用失败");
			}
			return result.value;
		}
		//#endregion
		//#region overlay kit
		let activeOverlay = undefined;
		/** Close whatever overlay is open. */
		function closeOverlay() {
			if (activeOverlay === undefined) return;
			activeOverlay.remove();
			activeOverlay = undefined;
		}
		/**
		 * Open (or replace) the shared overlay: a titled panel with an optional
		 * input and list area. Returns the { panel, list, input, close } handle
		 * the caller drives.
		 */
		function openOverlay({ title, hint, withInput, placeholder, onClose }) {
			closeOverlay();
			const overlay = document.createElement("div");
			overlay.className = "dshe-overlay";
			const panel = document.createElement("div");
			panel.className = "dshe-panel";
			const header = document.createElement("div");
			header.className = "dshe-panel-header";
			const b = document.createElement("b");
			b.textContent = title;
			header.appendChild(b);
			if (hint !== undefined) {
				const h = document.createElement("span");
				h.textContent = hint;
				header.appendChild(h);
			}
			const kbd = document.createElement("span");
			kbd.className = "dshe-kbd";
			kbd.textContent = "Esc 关闭";
			header.appendChild(kbd);
			panel.appendChild(header);
			let input = undefined;
			if (withInput) {
				input = document.createElement("input");
				input.className = "dshe-input";
				input.placeholder = placeholder ?? "";
				input.spellcheck = false;
				panel.appendChild(input);
			}
			const list = document.createElement("div");
			list.className = "dshe-list";
			panel.appendChild(list);
			overlay.appendChild(panel);
			overlay.addEventListener("mousedown", (event) => {
				if (event.target === overlay) { closeOverlay(); onClose?.(); }
			});
			document.body.appendChild(overlay);
			activeOverlay = overlay;
			const prevClose = onClose;
			activeOverlay.__dsheClose = () => prevClose?.();
			if (input !== undefined) setTimeout(() => input.focus(), 0);
			return { overlay, panel, list, input, close: () => { closeOverlay(); onClose?.(); } };
		}
		/** Global Esc handling for whichever overlay is open. */
		window.addEventListener("keydown", (event) => {
			if (event.key === "Escape" && activeOverlay !== undefined) {
				event.preventDefault();
				event.stopPropagation();
				activeOverlay.__dsheClose?.();
				closeOverlay();
			}
		}, true);
		//#endregion
		//#region session search (Ctrl+K)
		let sessionCache = undefined;
		let sessionCacheAt = 0;
		async function loadSessions(force = false) {
			if (!force && sessionCache !== undefined && Date.now() - sessionCacheAt < 30000) return sessionCache;
			const value = await rpc("session.list", {});
			const items = (value?.items ?? []).filter((item) => item.blank !== true);
			sessionCache = items;
			sessionCacheAt = Date.now();
			return items;
		}
		function timeAgo(ts) {
			const diff = Date.now() - ts;
			const min = Math.floor(diff / 60000);
			if (min < 1) return "刚刚";
			if (min < 60) return min + " 分钟前";
			const hr = Math.floor(min / 60);
			if (hr < 24) return hr + " 小时前";
			const day = Math.floor(hr / 24);
			if (day < 30) return day + " 天前";
			return new Date(ts).toLocaleDateString();
		}
		function jumpToSession(sessionId) {
			try {
				localStorage.setItem("dsh.sessions.current", JSON.stringify({ sessionId }));
			} catch { /* storage unavailable */ }
			location.reload();
		}
		function openSessionSearch() {
			let items = [];
			let filtered = [];
			let activeIndex = 0;
			const titleOf = (item) => {
				const p = item.projections?.values;
				return item.title ?? p?.title ?? p?.sessionListMetadata?.title ?? ("会话 " + item.sessionId.slice(0, 8));
			};
			const { list, input, close } = openOverlay({
				title: "搜索会话",
				hint: "输入关键词过滤，回车打开",
				withInput: true,
				placeholder: "搜索会话标题 / 工作区…",
				onClose: () => { /* nothing persisted */ }
			});
			const renderList = () => {
				list.textContent = "";
				if (filtered.length === 0) {
					const empty = document.createElement("div");
					empty.className = "dshe-empty";
					empty.textContent = items.length === 0 ? "加载中… / 暂无会话" : "没有匹配的会话";
					list.appendChild(empty);
					return;
				}
				filtered.slice(0, 12).forEach((item, index) => {
					const row = document.createElement("div");
					row.className = "dshe-item" + (index === activeIndex ? " dshe-active" : "");
					const main = document.createElement("div");
					main.className = "dshe-item-main";
					const t = document.createElement("div");
					t.className = "dshe-item-title";
					t.textContent = titleOf(item);
					const s = document.createElement("div");
					s.className = "dshe-item-sub";
					s.textContent = (item.cwd ? item.cwd.split(/[\\/]/).pop() + " · " : "") + timeAgo(item.updatedAt);
					main.appendChild(t);
					main.appendChild(s);
					row.appendChild(main);
					if (item.running === true) {
						const tag = document.createElement("span");
						tag.className = "dshe-item-tag";
						tag.textContent = "运行中";
						row.appendChild(tag);
					}
					row.addEventListener("click", () => { close(); jumpToSession(item.sessionId); });
					list.appendChild(row);
				});
			};
			const applyFilter = () => {
				const query = (input?.value ?? "").trim().toLowerCase();
				filtered = query === ""
					? items.slice()
					: items.filter((item) => {
						const hay = (titleOf(item) + " " + (item.cwd ?? "")).toLowerCase();
						return query.split(/\s+/).every((token) => hay.includes(token));
					});
				activeIndex = 0;
				renderList();
			};
			input?.addEventListener("input", applyFilter);
			input?.addEventListener("keydown", (event) => {
				if (event.key === "ArrowDown") {
					event.preventDefault();
					activeIndex = Math.min(activeIndex + 1, Math.min(filtered.length, 12) - 1);
					renderList();
				} else if (event.key === "ArrowUp") {
					event.preventDefault();
					activeIndex = Math.max(activeIndex - 1, 0);
					renderList();
				} else if (event.key === "Enter") {
					event.preventDefault();
					const target = filtered[activeIndex];
					if (target !== undefined) { close(); jumpToSession(target.sessionId); }
				}
			});
			renderList();
			loadSessions().then((loaded) => {
				items = loaded;
				applyFilter();
			}).catch(() => {
				list.textContent = "";
				const empty = document.createElement("div");
				empty.className = "dshe-empty";
				empty.textContent = "会话列表加载失败";
				list.appendChild(empty);
			});
		}
		//#endregion
		//#region shortcut help (F1)
		const HELP_SECTIONS = [
			{
				group: "全局",
				rows: [
					{ keys: ["Ctrl", "K"], desc: "快速搜索并跳转会话" },
					{ keys: ["F1"], desc: "快捷键帮助" },
					{ keys: ["Ctrl", "Shift", "V"], desc: "剪贴板历史（插入最近复制内容）" },
					{ keys: ["Ctrl", "E"], desc: "导出当前会话为 Markdown" },
					{ keys: ["Ctrl", "D", "S"], desc: "呼出/隐藏快捷输入条（任意界面）" },
					{ keys: ["Ctrl", "Alt", "B"], desc: "老板键：立即隐藏应用（再按恢复）" },
					{ keys: ["Ctrl", "Alt", "T"], desc: "窗口置顶开关" },
					{ keys: ["Ctrl", "+ / - / 0"], desc: "界面缩放 放大/缩小/重置" }
				]
			},
			{
				group: "代码块",
				rows: [
					{ keys: ["悬停代码块"], desc: "复制 / 保存为文件 / 折叠长代码" },
					{ keys: ["Mermaid"], desc: "流程图代码自动渲染为图表，可切换源码" }
				]
			}
		];
		function openHelp() {
			const { list } = openOverlay({ title: "快捷键", hint: "所有增强功能一览" });
			for (const section of HELP_SECTIONS) {
				const group = document.createElement("div");
				group.className = "dshe-help-group";
				group.textContent = section.group;
				list.appendChild(group);
				for (const row of section.rows) {
					const el = document.createElement("div");
					el.className = "dshe-help-row";
					const desc = document.createElement("span");
					desc.className = "dshe-help-desc";
					desc.textContent = row.desc;
					const keys = document.createElement("div");
					keys.className = "dshe-help-keys";
					for (const key of row.keys) {
						const k = document.createElement("span");
						k.textContent = key;
						keys.appendChild(k);
					}
					el.appendChild(desc);
					el.appendChild(keys);
					list.appendChild(el);
				}
			}
		}
		//#endregion
		//#region clipboard history (Ctrl+Shift+V)
		let lastEditable = undefined;
		document.addEventListener("focusin", (event) => {
			const target = event.target;
			if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement || (target instanceof HTMLElement && target.isContentEditable)) {
				lastEditable = target;
			}
		}, true);
		/** Insert text into the tracked editable (the input the user was typing in). */
		function insertIntoEditable(text) {
			const target = lastEditable;
			if (target === undefined || !document.contains(target)) return false;
			target.focus();
			if (target.isContentEditable) {
				document.execCommand("insertText", false, text);
				return true;
			}
			const start = target.selectionStart ?? target.value.length;
			const end = target.selectionEnd ?? target.value.length;
			target.value = target.value.slice(0, start) + text + target.value.slice(end);
			target.selectionStart = target.selectionEnd = start + text.length;
			target.dispatchEvent(new Event("input", { bubbles: true }));
			return true;
		}
		function openClipboardPicker() {
			const desktop = window.dshDesktop;
			if (desktop === undefined || typeof desktop.getClipboardHistory !== "function") return;
			let entries = [];
			let filtered = [];
			let activeIndex = 0;
			const { list, input, close } = openOverlay({
				title: "剪贴板历史",
				hint: "最近 50 条复制记录",
				withInput: true,
				placeholder: "过滤…",
				onClose: () => { /* nothing */ }
			});
			const renderList = () => {
				list.textContent = "";
				if (filtered.length === 0) {
					const empty = document.createElement("div");
					empty.className = "dshe-empty";
					empty.textContent = entries.length === 0 ? "暂无剪贴板记录" : "没有匹配项";
					list.appendChild(empty);
					return;
				}
				filtered.slice(0, 12).forEach((entry, index) => {
					const row = document.createElement("div");
					row.className = "dshe-item" + (index === activeIndex ? " dshe-active" : "");
					const main = document.createElement("div");
					main.className = "dshe-item-main";
					const t = document.createElement("div");
					t.className = "dshe-item-title";
					const text = entry.text.replace(/\s+/g, " ");
					t.textContent = text.length > 90 ? text.slice(0, 90) + "…" : text;
					const s = document.createElement("div");
					s.className = "dshe-item-sub";
					s.textContent = timeAgo(entry.at) + " · " + entry.text.length + " 字符";
					main.appendChild(t);
					main.appendChild(s);
					row.appendChild(main);
					row.addEventListener("click", () => { close(); insertIntoEditable(entry.text); });
					list.appendChild(row);
				});
			};
			const applyFilter = () => {
				const query = (input?.value ?? "").trim().toLowerCase();
				filtered = query === "" ? entries.slice() : entries.filter((entry) => entry.text.toLowerCase().includes(query));
				activeIndex = 0;
				renderList();
			};
			input?.addEventListener("input", applyFilter);
			input?.addEventListener("keydown", (event) => {
				if (event.key === "ArrowDown") {
					event.preventDefault();
					activeIndex = Math.min(activeIndex + 1, Math.min(filtered.length, 12) - 1);
					renderList();
				} else if (event.key === "ArrowUp") {
					event.preventDefault();
					activeIndex = Math.max(activeIndex - 1, 0);
					renderList();
				} else if (event.key === "Enter") {
					event.preventDefault();
					const target = filtered[activeIndex];
					if (target !== undefined) { close(); insertIntoEditable(target.text); }
				}
			});
			renderList();
			desktop.getClipboardHistory().then((history) => {
				entries = Array.isArray(history) ? history : [];
				applyFilter();
			}).catch(() => {
				list.textContent = "";
				const empty = document.createElement("div");
				empty.className = "dshe-empty";
				empty.textContent = "仅桌面版可用";
				list.appendChild(empty);
			});
		}
		//#endregion
		//#region markdown export (Ctrl+E)
		function currentSessionId() {
			try {
				const raw = localStorage.getItem("dsh.sessions.current");
				if (raw === null) return undefined;
				const parsed = JSON.parse(raw);
				return typeof parsed?.sessionId === "string" ? parsed.sessionId : undefined;
			} catch {
				return undefined;
			}
		}
		function blocksToText(content) {
			if (typeof content === "string") return content;
			if (!Array.isArray(content)) return "";
			const parts = [];
			for (const block of content) {
				if (block === null || typeof block !== "object") continue;
				if (block.type === "text" && typeof block.text === "string") parts.push(block.text);
				else if (block.type === "tool_call") parts.push("> `[工具调用]` " + String(block.name ?? "tool") + " " + safeArgsPreview(block.input ?? block.arguments));
				else if (block.type === "tool_result") { /* result folded; keep export lean */ }
			}
			return parts.join("\n\n");
		}
		function safeArgsPreview(args) {
			try {
				const text = typeof args === "string" ? args : JSON.stringify(args);
				if (text === undefined) return "";
				return text.length > 200 ? "`" + text.slice(0, 200) + "…`" : "`" + text + "`";
			} catch {
				return "";
			}
		}
		async function collectHistory(sessionId) {
			const entries = [];
			let beforeSeq;
			for (let page = 0; page < 12; page += 1) {
				const payload = { sessionId, maxMessages: 200 };
				if (beforeSeq !== undefined) payload.beforeSeq = beforeSeq;
				const value = await rpc("session.history", payload);
				const events = value?.events ?? [];
				if (events.length === 0) break;
				entries.push(...events);
				if (value?.hasMore !== true) break;
				beforeSeq = events[0].seq;
			}
			entries.sort((a, b) => a.seq - b.seq);
			return entries;
		}
		async function exportMarkdown() {
			const sessionId = currentSessionId();
			if (sessionId === undefined) return;
			const events = await collectHistory(sessionId);
			const lines = ["# DeepSeek Harness 会话导出", "", "- 会话 ID: `" + sessionId + "`", "- 导出时间: " + new Date().toLocaleString(), "- 消息事件数: " + String(events.length), "", "---", ""];
			for (const entry of events) {
				const event = entry.event ?? entry;
				if (event.ignorable === true) continue;
				const data = event.data ?? {};
				if (event.type === "user/message") {
					const text = blocksToText(data.content);
					if (text.trim() !== "") lines.push("## 用户", "", text, "");
				} else if (event.type === "assistant/message") {
					const text = blocksToText(data.message?.content ?? data.content);
					if (text.trim() !== "") lines.push("## 助手", "", text, "");
				} else if (event.type === "tool/call") {
					lines.push("> `[工具]` **" + String(data.name ?? data.toolName ?? "tool") + "** " + safeArgsPreview(data.input ?? data.arguments ?? data.args), "");
				}
			}
			const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = "dsh-session-" + sessionId.slice(0, 8) + "-" + new Date().toISOString().slice(0, 10) + ".md";
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			setTimeout(() => URL.revokeObjectURL(url), 5000);
		}
		function notifyExport(error) {
			const panel = document.createElement("div");
			const icon = error === undefined
				? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;flex:none"><path d="M20 6L9 17l-5-5"/></svg>'
				: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;flex:none"><path d="M18 6L6 18M6 6l12 12"/></svg>';
			const text = document.createElement("span");
			text.textContent = error === undefined ? "会话已导出为 Markdown" : "导出失败: " + error;
			panel.innerHTML = icon;
			panel.appendChild(text);
			panel.style.cssText = "position:fixed;bottom:28px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:9px;padding:10px 18px;border-radius:10px;background:#1b1e27;border:1px solid rgba(255,255,255,.14);color:#e6e9f0;font:13px/1.4 system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.4)";
			document.body.appendChild(panel);
			setTimeout(() => panel.remove(), 2600);
		}
		//#endregion
		//#region code-block enhancement + mermaid
		const MERMAID_CDNS = [
			"https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js",
			"https://unpkg.com/mermaid@10.9.1/dist/mermaid.min.js",
			"https://registry.npmmirror.com/mermaid/10.9.1/files/dist/mermaid.min.js"
		];
		let mermaidLoading = undefined;
		function loadMermaid() {
			if (window.mermaid !== undefined) return Promise.resolve(window.mermaid);
			if (mermaidLoading !== undefined) return mermaidLoading;
			mermaidLoading = new Promise((resolve, reject) => {
				let index = 0;
				const tryNext = () => {
					if (index >= MERMAID_CDNS.length) {
						mermaidLoading = undefined;
						reject(new Error("mermaid CDN 均不可用"));
						return;
					}
					const script = document.createElement("script");
					script.src = MERMAID_CDNS[index];
					script.async = true;
					script.onload = () => {
						if (window.mermaid === undefined) { index += 1; tryNext(); return; }
						const dark = document.documentElement.getAttribute("data-theme") === "dark"
							|| document.body.classList.contains("dark")
							|| window.matchMedia("(prefers-color-scheme: dark)").matches;
						window.mermaid.initialize({ startOnLoad: false, securityLevel: "loose", theme: dark ? "dark" : "default" });
						resolve(window.mermaid);
					};
					script.onerror = () => { index += 1; tryNext(); };
					document.head.appendChild(script);
				};
				tryNext();
			});
			return mermaidLoading;
		}
		const EXT_BY_LANG = {
			javascript: "js", js: "js", typescript: "ts", ts: "ts", jsx: "jsx", tsx: "tsx",
			python: "py", py: "py", shell: "sh", bash: "sh", sh: "sh", powershell: "ps1", ps1: "ps1",
			json: "json", yaml: "yaml", yml: "yaml", html: "html", css: "css", scss: "scss",
			sql: "sql", java: "java", c: "c", cpp: "cpp", "c++": "cpp", csharp: "cs", go: "go",
			rust: "rs", rs: "rs", ruby: "rb", php: "php", swift: "swift", kotlin: "kt",
			markdown: "md", md: "md", xml: "xml", toml: "toml", ini: "ini", diff: "diff",
			mermaid: "mmd", text: "txt", plaintext: "txt", "": "txt"
		};
		function langOf(code) {
			const match = String(code.className ?? "").match(/language-([\w+-]+)/);
			return match === null ? "" : match[1].toLowerCase();
		}
		function downloadCode(code, lang) {
			const ext = EXT_BY_LANG[lang] ?? "txt";
			const blob = new Blob([code.textContent ?? ""], { type: "text/plain;charset=utf-8" });
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = "snippet-" + new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14) + "." + ext;
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			setTimeout(() => URL.revokeObjectURL(url), 5000);
		}
		let mermaidSeq = 0;
		function renderMermaidBlock(pre, code) {
			pre.style.display = "none";
			const container = document.createElement("div");
			container.className = "dshe-mermaid";
			container.textContent = "正在渲染图表…";
			pre.parentNode?.insertBefore(container, pre);
			const toggle = document.createElement("span");
			toggle.className = "dshe-src-toggle";
			toggle.textContent = "显示源码";
			toggle.addEventListener("click", () => {
				const showing = pre.style.display !== "none";
				pre.style.display = showing ? "none" : "";
				container.style.display = showing ? "" : "none";
				toggle.textContent = showing ? "显示源码" : "显示图表";
			});
			pre.parentNode?.insertBefore(toggle, pre.nextSibling);
			loadMermaid().then(async (mermaid) => {
				const { svg } = await mermaid.render("dshe-mermaid-" + String(++mermaidSeq), code.textContent ?? "");
				container.innerHTML = svg;
			}).catch((error) => {
				container.classList.add("dshe-mermaid-err");
				container.textContent = "图表渲染失败（" + (error instanceof Error ? error.message : String(error)) + "），已保留源码。";
				pre.style.display = "";
			});
		}
		function enhanceCodeBlocks() {
			for (const pre of document.querySelectorAll("pre")) {
				if (pre.dataset.dshe === "1") continue;
				const code = pre.querySelector("code");
				if (code === null) continue;
				pre.dataset.dshe = "1";
				pre.classList.add("dshe-pre");
				const lang = langOf(code);
				const toolbar = document.createElement("div");
				toolbar.className = "dshe-toolbar";
				const mkBtn = (label, onClick) => {
					const btn = document.createElement("button");
					btn.type = "button";
					btn.className = "dshe-tb-btn";
					btn.textContent = label;
					btn.addEventListener("click", (event) => {
						event.stopPropagation();
						onClick();
					});
					toolbar.appendChild(btn);
					return btn;
				};
				mkBtn("复制", () => {
					void navigator.clipboard.writeText(code.textContent ?? "").then(() => {
						const btn = toolbar.firstElementChild;
						if (btn !== null) {
							btn.textContent = "已复制";
							setTimeout(() => { btn.textContent = "复制"; }, 1200);
						}
					});
				});
				mkBtn("保存", () => downloadCode(code, lang));
				mkBtn("折叠", () => {
					const collapsed = pre.classList.toggle("dshe-collapsed");
					const btn = toolbar.lastElementChild;
					if (btn !== null) btn.textContent = collapsed ? "展开" : "折叠";
				});
				pre.appendChild(toolbar);
				if (lang === "mermaid") renderMermaidBlock(pre, code);
				else if ((code.textContent ?? "").split("\n").length > 30) pre.classList.add("dshe-collapsed");
			}
		}
		//#endregion
		//#region wiring
		let exportBusy = false;
		window.addEventListener("keydown", (event) => {
			const mod = event.ctrlKey || event.metaKey;
			if (mod && event.key.toLowerCase() === "k" && !event.shiftKey && !event.altKey) {
				event.preventDefault();
				event.stopPropagation();
				openSessionSearch();
			} else if (event.key === "F1") {
				event.preventDefault();
				openHelp();
			} else if (mod && event.shiftKey && event.key.toLowerCase() === "v") {
				const target = event.target;
				const editable = target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement || (target instanceof HTMLElement && target.isContentEditable);
				if (!editable) return;
				event.preventDefault();
				event.stopPropagation();
				openClipboardPicker();
			} else if (mod && !event.shiftKey && !event.altKey && event.key.toLowerCase() === "e" && activeOverlay === undefined) {
				event.preventDefault();
				if (exportBusy) return;
				exportBusy = true;
				exportMarkdown().then(() => notifyExport()).catch((error) => notifyExport(error instanceof Error ? error.message : String(error))).finally(() => { exportBusy = false; });
			}
		}, true);
		const observer = new MutationObserver(() => enhanceCodeBlocks());
		const startObserving = () => {
			enhanceCodeBlocks();
			observer.observe(document.body, { childList: true, subtree: true });
		};
		if (document.body !== null) startObserving();
		else document.addEventListener("DOMContentLoaded", startObserving, { once: true });
		//#endregion
		exports.inject = ["locale"];
		exports.apply = function apply() { /* everything is self-wired above */ };
		return module.exports;
	}
});

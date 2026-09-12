window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-snippets",
	factory: () => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region styles
		const css = [
			".dssn-overlay{position:fixed;inset:0;z-index:9985;display:flex;align-items:flex-start;justify-content:center;padding-top:12vh;background:rgba(0,0,0,.32);backdrop-filter:blur(4px);animation:dssnFade var(--dsm-t-fast,140ms) var(--dsm-ease-out,ease)}",
			"@keyframes dssnFade{from{opacity:0}to{opacity:1}}",
			"@keyframes dssnRise{from{opacity:0;transform:translateY(-6px) scale(.99)}to{opacity:1;transform:none}}",
			".dssn-panel{box-sizing:border-box;width:min(620px,92vw);max-height:64vh;display:flex;flex-direction:column;background:var(--dsw-specific-menu);border:1px solid var(--dsw-alias-border-l1);border-radius:16px;box-shadow:var(--dsw-shadow-lv3);overflow:hidden;color:var(--dsw-alias-label-primary);font:14px/1.55 system-ui,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;animation:dssnRise var(--dsm-t-base,200ms) var(--dsm-ease-out,ease)}",
			".dssn-header{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--dsw-alias-border-l2);font-size:13px;color:var(--dsw-alias-label-tertiary)}",
			".dssn-header b{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:600}",
			".dssn-header .dssn-kbd{font-size:11px;padding:3px 8px;border:1px solid var(--dsw-alias-border-l1);border-radius:7px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-tertiary)}",
			".dssn-save{margin-left:auto;font:12px/1.4 inherit;color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 10%,transparent);border:1px solid color-mix(in srgb,var(--dsw-alias-state-business-primary) 32%,transparent);border-radius:9px;padding:5px 12px;cursor:pointer;transition:background-color var(--dsm-t-fast,140ms) ease,transform var(--dsm-t-fast,140ms) var(--dsm-ease-out,ease)}",
			".dssn-save:hover{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 20%,transparent)}",
			".dssn-save:active{transform:scale(.97)}",
			".dssn-save:disabled{opacity:.4;cursor:default;transform:none}",
			".dssn-input{margin:12px 16px 8px;padding:9px 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);font:14px/1.4 inherit;outline:0;width:calc(100% - 32px);box-sizing:border-box;transition:border-color var(--dsm-t-fast,140ms) ease,box-shadow var(--dsm-t-fast,140ms) ease}",
			".dssn-input::placeholder{color:var(--dsw-alias-label-tertiary)}",
			".dssn-input:focus{border-color:var(--dsw-alias-state-business-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-business-primary) 16%,transparent)}",
			".dssn-list{overflow-y:auto;padding:6px 8px 10px;flex:1}",
			".dssn-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:10px;cursor:pointer;white-space:nowrap;overflow:hidden;transition:background-color var(--dsm-t-fast,140ms) ease}",
			".dssn-item:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".dssn-item.dssn-active{background:var(--dsw-alias-interactive-bg-hover);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l1)}",
			".dssn-item-main{min-width:0;flex:1;display:flex;flex-direction:column;gap:1px}",
			".dssn-item-title{font-size:13.5px;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis}",
			".dssn-item-sub{font-size:11.5px;color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis}",
			".dssn-del{flex:none;font:11px/1.4 inherit;color:var(--dsw-alias-state-error-primary);border:1px solid color-mix(in srgb,var(--dsw-alias-state-error-primary) 30%,transparent);background:transparent;border-radius:7px;padding:3px 8px;cursor:pointer;transition:background-color var(--dsm-t-fast,140ms) ease}",
			".dssn-del:hover{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent)}",
			".dssn-empty{padding:30px 0;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:13px}",
			"@media (prefers-reduced-motion: reduce){.dssn-overlay,.dssn-panel{animation:none}.dssn-save,.dssn-input,.dssn-item,.dssn-del{transition:none}}"
		].join("");
		const tagId = "@deepseek-ai/dsh-client-ui-snippets/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-snippets";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region store api
		async function apiList(query) {
			const url = query === undefined || query === "" ? "/api/snippets" : "/api/snippets?q=" + encodeURIComponent(query);
			const res = await fetch(url, { cache: "no-store" });
			if (!res.ok) throw new Error("HTTP " + String(res.status));
			const data = await res.json();
			return Array.isArray(data.snippets) ? data.snippets : [];
		}
		async function apiAction(body) {
			const res = await fetch("/api/snippets", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body)
			});
			if (!res.ok) throw new Error("HTTP " + String(res.status));
			return res.json();
		}
		//#endregion
		//#region editable tracking
		let lastEditable = undefined;
		document.addEventListener("focusin", (event) => {
			const target = event.target;
			if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement || (target instanceof HTMLElement && target.isContentEditable)) {
				lastEditable = target;
			}
		}, true);
		function editableText() {
			if (lastEditable !== undefined && document.contains(lastEditable)) {
				return lastEditable.isContentEditable ? lastEditable.textContent ?? "" : lastEditable.value;
			}
			return "";
		}
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
		//#endregion
		//#region picker
		let overlay = undefined;
		function closePicker() {
			overlay?.remove();
			overlay = undefined;
		}
		async function openPicker() {
			if (overlay !== undefined) { closePicker(); return; }
			let snippets = [];
			let filtered = [];
			let activeIndex = 0;
			overlay = document.createElement("div");
			overlay.className = "dssn-overlay";
			const panel = document.createElement("div");
			panel.className = "dssn-panel";
			const header = document.createElement("div");
			header.className = "dssn-header";
			const b = document.createElement("b");
			b.textContent = "快捷短语";
			header.appendChild(b);
			const hint = document.createElement("span");
			hint.textContent = "回车插入到输入框";
			header.appendChild(hint);
			const saveBtn = document.createElement("button");
			saveBtn.type = "button";
			saveBtn.className = "dssn-save";
			saveBtn.textContent = "＋ 存当前输入为片段";
			header.appendChild(saveBtn);
			const kbd = document.createElement("span");
			kbd.className = "dssn-kbd";
			kbd.textContent = "Esc 关闭";
			header.appendChild(kbd);
			panel.appendChild(header);
			const input = document.createElement("input");
			input.className = "dssn-input";
			input.placeholder = "过滤片段（标题 / 内容 / 标签）…";
			input.spellcheck = false;
			panel.appendChild(input);
			const list = document.createElement("div");
			list.className = "dssn-list";
			panel.appendChild(list);
			overlay.appendChild(panel);
			overlay.addEventListener("mousedown", (event) => {
				if (event.target === overlay) closePicker();
			});
			document.body.appendChild(overlay);
			const draft = editableText();
			saveBtn.disabled = draft.trim() === "";
			saveBtn.addEventListener("click", async () => {
				const title = window.prompt("片段标题：", draft.trim().split("\n")[0].slice(0, 30));
				if (title === null || title.trim() === "") return;
				try {
					await apiAction({ action: "save", title: title.trim(), content: draft });
					snippets = await apiList();
					applyFilter();
				} catch (error) {
					window.alert("保存失败：" + (error instanceof Error ? error.message : String(error)));
				}
			});
			const renderList = () => {
				list.textContent = "";
				if (filtered.length === 0) {
					const empty = document.createElement("div");
					empty.className = "dssn-empty";
					empty.textContent = snippets.length === 0 ? "片段库为空 — 输入内容后点右上角保存" : "没有匹配的片段";
					list.appendChild(empty);
					return;
				}
				filtered.slice(0, 12).forEach((snippet, index) => {
					const row = document.createElement("div");
					row.className = "dssn-item" + (index === activeIndex ? " dssn-active" : "");
					const main = document.createElement("div");
					main.className = "dssn-item-main";
					const t = document.createElement("div");
					t.className = "dssn-item-title";
					t.textContent = snippet.title;
					const s = document.createElement("div");
					s.className = "dssn-item-sub";
					const preview = String(snippet.content ?? "").replace(/\s+/g, " ");
					s.textContent = preview.length > 60 ? preview.slice(0, 60) + "…" : preview;
					main.appendChild(t);
					main.appendChild(s);
					row.appendChild(main);
					if (Array.isArray(snippet.tags) && snippet.tags.length > 0) {
						const tag = document.createElement("span");
						tag.className = "dssn-kbd";
						tag.textContent = snippet.tags.join(" · ");
						row.appendChild(tag);
					}
					const del = document.createElement("button");
					del.type = "button";
					del.className = "dssn-del";
					del.textContent = "删除";
					del.addEventListener("click", async (event) => {
						event.stopPropagation();
						try {
							await apiAction({ action: "delete", title: snippet.title });
							snippets = await apiList();
							applyFilter();
						} catch { /* non-fatal */ }
					});
					row.appendChild(del);
					row.addEventListener("click", () => {
						closePicker();
						insertIntoEditable(String(snippet.content ?? ""));
					});
					list.appendChild(row);
				});
			};
			const applyFilter = () => {
				const query = input.value.trim().toLowerCase();
				filtered = query === ""
					? snippets.slice()
					: snippets.filter((s) => (s.title + "\n" + s.content + "\n" + (s.tags ?? []).join(" ")).toLowerCase().includes(query));
				activeIndex = 0;
				renderList();
			};
			input.addEventListener("input", applyFilter);
			input.addEventListener("keydown", (event) => {
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
					if (target !== undefined) {
						closePicker();
						insertIntoEditable(String(target.content ?? ""));
					}
				}
			});
			renderList();
			setTimeout(() => input.focus(), 0);
			try {
				snippets = await apiList();
				applyFilter();
			} catch {
				list.textContent = "";
				const empty = document.createElement("div");
				empty.className = "dssn-empty";
				empty.textContent = "片段服务不可用（需要 dsh-tool-snippets 插件）";
				list.appendChild(empty);
			}
		}
		window.addEventListener("keydown", (event) => {
			if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key === "/") {
				event.preventDefault();
				event.stopPropagation();
				void openPicker();
			} else if (event.key === "Escape" && overlay !== undefined) {
				event.preventDefault();
				closePicker();
			}
		}, true);
		//#endregion
		exports.inject = ["locale"];
		exports.apply = function apply() { /* self-wired above */ };
		return module.exports;
	}
});

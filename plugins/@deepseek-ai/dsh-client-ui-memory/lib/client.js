window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-memory",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let jsxRuntime = require("react/jsx-runtime");
		const { jsx, jsxs, Fragment } = jsxRuntime;
		const { useState, useEffect, useMemo, useCallback, useRef, useSyncExternalStore } = react;
		//#region styles
		const css = [
			".mymem-wrap{display:flex;flex-direction:column;gap:14px;padding:4px 0 28px;max-width:760px}",
			".mymem-head{display:flex;align-items:center;justify-content:space-between;gap:12px}",
			".mymem-hint{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;margin:0}",
			".mymem-count{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
			".mymem-btn{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;padding:6px 14px;border-radius:10px;cursor:pointer;flex:none;transition:background .15s ease,border-color .15s ease}",
			".mymem-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
			".mymem-btn:disabled{opacity:.5;cursor:default}",
			".mymem-btn-primary{border-color:transparent;color:#fff;background:var(--dsw-static-blue-600)}",
			".mymem-btn-primary:hover:not(:disabled){background:var(--dsw-static-blue-600);filter:brightness(1.08)}",
			".mymem-btn-danger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger);border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}",
			".mymem-btn-confirm{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}",
			".mymem-tabs{display:flex;gap:2px;border-bottom:1px solid var(--dsw-alias-border-l2)}",
			".mymem-tab{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:14px;line-height:22px;padding:8px 16px;cursor:pointer;border-radius:8px 8px 0 0;position:relative;transition:color .15s ease,background .15s ease}",
			".mymem-tab:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".mymem-tab-active{color:var(--dsw-alias-label-primary);font-weight:500}",
			".mymem-tab-active::after{content:'';position:absolute;left:10px;right:10px;bottom:-1px;height:2px;border-radius:2px;background:var(--dsw-static-blue-600)}",
			".mymem-body{display:flex;flex-direction:column;gap:10px}",
			".mymem-loading{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;padding:28px 12px;text-align:center}",
			".mymem-empty{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;padding:28px 12px;text-align:center}",
			".mymem-error{color:var(--dsw-alias-state-error-primary);font-size:13px;line-height:20px;padding:12px 14px;background:var(--dsw-alias-interactive-bg-hover-danger);border:1px solid var(--dsw-alias-border-l2);border-radius:12px}",
			".mymem-toolbar{display:flex;align-items:center;gap:8px}",
			".mymem-search{display:flex;align-items:center;gap:8px;flex:1;min-width:0;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:0 10px;transition:border-color .15s ease}",
			".mymem-search:focus-within{border-color:var(--dsw-static-blue-600)}",
			".mymem-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:32px;padding:0}",
			".mymem-search input::placeholder{color:var(--dsw-alias-label-secondary)}",
			".mymem-search-clear{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font-size:14px;line-height:1;cursor:pointer;padding:4px}",
			".mymem-search-clear:hover{color:var(--dsw-alias-label-primary)}",
			".mymem-group{display:flex;align-items:center;gap:8px;margin:6px 0 2px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;font-weight:500}",
			".mymem-group::after{content:'';flex:1;height:1px;background:var(--dsw-alias-border-l2)}",
			".mymem-chip{appearance:none;border:1px solid transparent;background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;border-radius:6px;padding:1px 8px;cursor:pointer;transition:all .15s ease}",
			".mymem-chip:hover{color:var(--dsw-alias-label-primary)}",
			".mymem-chip-active{background:var(--dsw-static-blue-600);color:#fff}",
			".mymem-chip-clear{margin-left:2px;font-size:12px}",
			".mymem-card{display:flex;flex-direction:column;gap:6px;padding:12px 14px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-module-platform)}",
			".mymem-card-text{color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px;white-space:pre-wrap;word-break:break-word}",
			".mymem-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap}",
			".mymem-meta .mymem-chip{margin-top:2px}",
			".mymem-time{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;margin-left:auto;white-space:nowrap}",
			".mymem-kvrow{display:flex;align-items:flex-start;gap:12px;padding:10px 14px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-module-platform)}",
			".mymem-key{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px;line-height:20px;color:var(--dsw-static-blue-600);min-width:150px;max-width:240px;word-break:break-all;flex:none}",
			".mymem-val{flex:1;font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary);white-space:pre-wrap;word-break:break-word}",
			".mymem-tree{display:flex;flex-direction:column}",
			".mymem-node{display:flex;flex-direction:column;border-left:1px solid var(--dsw-alias-border-l2);margin-left:12px;padding-left:12px}",
			".mymem-node-row{display:flex;align-items:center;gap:8px;min-height:30px;border-radius:8px;padding:3px 6px;user-select:none}",
			".mymem-node-row-clickable{cursor:pointer}",
			".mymem-node-row:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".mymem-caret{width:12px;height:14px;flex:none;display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-secondary);font-size:10px;transition:transform .15s ease}",
			".mymem-caret-open{transform:rotate(90deg)}",
			".mymem-node-label{font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary);word-break:break-word}",
			".mymem-node-hit{color:var(--dsw-static-blue-600);font-weight:500}",
			".mymem-node-value{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);margin-left:8px;white-space:pre-wrap;word-break:break-word}",
			".mymem-node-count{font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover);border-radius:6px;padding:0 6px;flex:none}",
			".mymem-row-action{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:20px;padding:2px 8px;border-radius:6px;cursor:pointer;flex:none;opacity:0;transition:opacity .12s ease,background .12s ease,color .12s ease}",
			".mymem-row:hover .mymem-row-action,.mymem-kvrow:hover .mymem-row-action,.mymem-node-row:hover .mymem-row-action{opacity:1}",
			".mymem-row-action:hover{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary)}",
			".mymem-row-action-always{opacity:1}",
			".mymem-row-action-confirm{opacity:1;color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-interactive-bg-hover-danger)}",
			".mymem-settings{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;overflow:hidden;background:var(--dsw-alias-bg-module-platform)}",
			".mymem-settings-head{display:flex;align-items:center;justify-content:space-between;width:100%;appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;font-weight:500;padding:10px 14px;cursor:pointer}",
			".mymem-settings-head:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".mymem-settings-chevron{color:var(--dsw-alias-label-secondary);font-size:12px;transition:transform .15s ease}",
			".mymem-settings-open .mymem-settings-chevron{transform:rotate(90deg)}",
			".mymem-settings-body{display:flex;flex-direction:column;border-top:1px solid var(--dsw-alias-border-l1)}",
			".mymem-setrow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 14px}",
			".mymem-setrow + .mymem-setrow{border-top:1px solid var(--dsw-alias-border-l1)}",
			".mymem-setrow-label{display:flex;flex-direction:column;gap:1px;min-width:0}",
			".mymem-setrow-title{color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}",
			".mymem-setrow-desc{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
			".mymem-switch{appearance:none;border:0;background:var(--dsw-alias-border-l2);width:36px;height:20px;border-radius:10px;position:relative;cursor:pointer;transition:background .18s ease;flex:none;padding:0}",
			".mymem-switch::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2);transition:transform .18s ease}",
			".mymem-switch-on{background:var(--dsw-static-blue-600)}",
			".mymem-switch-on::after{transform:translateX(16px)}",
			".mymem-switch:disabled{opacity:.5;cursor:default}",
			".mymem-num-input{border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:28px;padding:0 10px;border-radius:8px;width:76px;text-align:center}",
			".mymem-num-input:focus{outline:0;border-color:var(--dsw-static-blue-600)}",
			".mymem-head-actions{display:flex;align-items:center;gap:8px;flex:none}"
		].join("");
		const tagId = "@deepseek-ai/dsh-client-ui-memory/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-memory";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region data
		const MEMORY_URL = "/api/memory";
		const MEMORY_DELETE_URL = "/api/memory/delete";
		const MEMORY_EXPORT_URL = "/api/memory/export";
		const MEMORY_IMPORT_URL = "/api/memory/import";
		async function loadMemory() {
			const res = await fetch(MEMORY_URL, { method: "GET", cache: "no-store" });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.json();
		}
		async function deleteMemory(payload) {
			const res = await fetch(MEMORY_DELETE_URL, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(payload)
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const body = await res.json();
			if (body.ok !== true) throw new Error(body.error ?? "delete failed");
			return body;
		}
		async function fetchExport() {
			const res = await fetch(MEMORY_EXPORT_URL, { method: "GET", cache: "no-store" });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.json();
		}
		async function postImport(payload) {
			const res = await fetch(MEMORY_IMPORT_URL, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(payload)
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const body = await res.json();
			if (body.ok !== true) throw new Error(body.error ?? "import failed");
			return body;
		}
		function downloadMemoryJson(data) {
			const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `dsh-memory-${new Date().toISOString().slice(0, 10)}.json`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		}
		function formatDate(iso) {
			if (!iso) return "";
			const d = new Date(iso);
			if (Number.isNaN(d.getTime())) return String(iso);
			const pad = (n) => String(n).padStart(2, "0");
			return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
		}
		function formatValue(value) {
			if (value === undefined) return "";
			if (typeof value === "string") return value;
			try { return JSON.stringify(value, null, 2); } catch { return String(value); }
		}
		function countDescendants(node) {
			let n = 0;
			const walk = (nd) => { for (const child of nd?.children ?? []) { n += 1; walk(child); } };
			walk(node);
			return n;
		}
		function matchesQuery(text, query) {
			return query === "" || text.toLowerCase().includes(query.toLowerCase());
		}
		//#endregion
		//#region shared components
		let boundT = (key) => key;
		let scopeRef = undefined;

		function SearchBox({ value, onChange, placeholder }) {
			return jsxs("div", { className: "mymem-search", children: [
				jsx("input", { type: "text", value, placeholder, onChange: (e) => onChange(e.target.value), spellCheck: false }),
				value ? jsx("button", { type: "button", className: "mymem-search-clear", onClick: () => onChange(""), children: "×" }) : null
			] });
		}

		function ConfirmAction({ label, confirmLabel, onConfirm, always }) {
			const [armed, setArmed] = useState(false);
			const timer = react.useRef(undefined);
			useEffect(() => () => { if (timer.current !== undefined) clearTimeout(timer.current); }, []);
			const fire = () => {
				if (armed) {
					if (timer.current !== undefined) clearTimeout(timer.current);
					setArmed(false);
					onConfirm();
					return;
				}
				setArmed(true);
				timer.current = setTimeout(() => setArmed(false), 3000);
			};
			return jsx("button", {
				type: "button",
				className: "mymem-row-action" + (always ? " mymem-row-action-always" : "") + (armed ? " mymem-row-action-confirm" : ""),
				onClick: (e) => { e.stopPropagation(); fire(); },
				children: armed ? confirmLabel : label
			});
		}

		function EmptyState({ text }) {
			return jsx("div", { className: "mymem-empty", children: text });
		}

		function Switch({ checked, onChange, disabled }) {
			return jsx("button", {
				type: "button",
				role: "switch",
				"aria-checked": checked,
				className: "mymem-switch" + (checked ? " mymem-switch-on" : ""),
				onClick: () => { if (!disabled) onChange(!checked); },
				disabled
			});
		}

		function SettingRow({ title, desc, control }) {
			return jsxs("div", { className: "mymem-setrow", children: [
				jsxs("div", { className: "mymem-setrow-label", children: [
					jsx("div", { className: "mymem-setrow-title", children: title }),
					desc ? jsx("div", { className: "mymem-setrow-desc", children: desc }) : null
				] }),
				jsx("div", { children: control })
			] });
		}

		function NumberField({ value, onChange, min, max, placeholder }) {
			const [draft, setDraft] = useState(value);
			useEffect(() => { setDraft(value); }, [value]);
			return jsx("input", {
				type: "text",
				className: "mymem-num-input",
				value: draft,
				placeholder,
				spellCheck: false,
				onChange: (e) => setDraft(e.target.value),
				onBlur: () => {
					const n = Number(draft);
					if (!Number.isFinite(n)) { setDraft(value); return; }
					const clamped = Math.max(min, Math.min(max, Math.round(n)));
					if (clamped !== value) onChange(clamped);
					else setDraft(clamped);
				}
			});
		}

		function SettingsCard({ snapshot, writable, t }) {
			const [open, setOpen] = useState(false);
			const value = snapshot.value;
			const ready = snapshot.status === "ready" && value !== undefined;
			const config = {
				enabled: ready ? value.enabled : true,
				text: ready ? value.text : true,
				kv: ready ? value.kv : true,
				map: ready ? value.map : true,
				autoRemind: ready ? value.autoRemind : true,
				maxResults: ready ? value.maxResults : 50
			};
			const setField = (field, v) => { if (writable) scopeRef.set(field, v); };
			const row = (title, desc, field, checked) => jsx(SettingRow, {
				title, desc,
				control: jsx(Switch, { checked, onChange: (v) => setField(field, v), disabled: !ready || !writable })
			});
			return jsxs("div", { className: "mymem-settings" + (open ? " mymem-settings-open" : ""), children: [
				jsxs("button", { type: "button", className: "mymem-settings-head", onClick: () => setOpen(!open), children: [
					jsx("span", { children: t("settings.title") }),
					jsx("span", { className: "mymem-settings-chevron", children: "▸" })
				] }),
				open ? jsxs("div", { className: "mymem-settings-body", children: [
					row(t("settings.enabled"), t("settings.enabledDesc"), "enabled", config.enabled),
					row(t("settings.text"), t("settings.textDesc"), "text", config.text),
					row(t("settings.kv"), t("settings.kvDesc"), "kv", config.kv),
					row(t("settings.map"), t("settings.mapDesc"), "map", config.map),
					row(t("settings.remind"), t("settings.remindDesc"), "autoRemind", config.autoRemind),
					jsx(SettingRow, {
						title: t("settings.maxResults"),
						desc: t("settings.maxResultsDesc"),
						control: jsx(NumberField, { value: config.maxResults, onChange: (v) => setField("maxResults", v), min: 1, max: 500, placeholder: "50" })
					})
				] }) : null
			] });
		}
		//#endregion
		//#region text panel
		function TextPanel({ data, t, onDelete }) {
			const [query, setQuery] = useState("");
			const [tag, setTag] = useState(null);
			const allTags = useMemo(() => {
				const seen = new Set();
				for (const record of data?.text ?? []) for (const tg of record.tags ?? []) if (tg) seen.add(tg);
				return [...seen].sort();
			}, [data]);
			const items = useMemo(() => {
				const q = query.trim();
				return (data?.text ?? []).filter((record) => {
					if (tag !== null && !(record.tags ?? []).includes(tag)) return false;
					if (q !== "" && !matchesQuery(`${record.content} ${(record.tags ?? []).join(" ")}`, q)) return false;
					return true;
				});
			}, [data, query, tag]);
			return jsxs(Fragment, { children: [
				jsxs("div", { className: "mymem-toolbar", children: [
					jsx(SearchBox, { value: query, onChange: setQuery, placeholder: t("search.text") }),
					(data?.text?.length ?? 0) > 0 ? jsx(ConfirmAction, { label: t("clearAll"), confirmLabel: t("confirmClearAll"), onConfirm: () => void onDelete({ kind: "text-all" }), always: true }) : null
				] }),
				allTags.length > 0 ? jsx("div", { className: "mymem-meta", children: [
					allTags.map((tg) => jsx("button", {
						type: "button",
						className: "mymem-chip" + (tag === tg ? " mymem-chip-active" : ""),
						onClick: () => setTag(tag === tg ? null : tg),
						children: tg
					}, tg)),
					tag !== null ? jsx("button", { type: "button", className: "mymem-chip mymem-chip-clear", onClick: () => setTag(null), children: t("clearFilter") }) : null
				] }) : null,
				items.length === 0 ? jsx(EmptyState, { text: (data?.text?.length ?? 0) === 0 ? t("empty") : t("noResults") })
					: jsx(Fragment, { children: items.map((record) => jsxs("div", {
						className: "mymem-card mymem-row",
						children: [
							jsx("div", { className: "mymem-card-text", children: record.content }),
							jsx("div", { className: "mymem-meta", children: [
								(record.tags ?? []).map((tg) => jsx("button", { type: "button", className: "mymem-chip", onClick: () => setTag(tg), children: tg }, String(tg))),
								record.updatedAt ? jsx("span", { className: "mymem-time", children: formatDate(record.updatedAt) }) : null,
								jsx(ConfirmAction, { label: t("delete"), confirmLabel: t("confirmDelete"), onConfirm: () => void onDelete({ kind: "text", id: record.id }) })
							] })
						]
					}, String(record.id))) })
			] });
		}
		//#endregion
		//#region kv panel
		function KvPanel({ data, t, onDelete }) {
			const [query, setQuery] = useState("");
			const entries = useMemo(() => {
				const q = query.trim();
				return (data?.kv ?? []).filter((entry) => {
					if (q === "") return true;
					return matchesQuery(`${entry.key} ${formatValue(entry.value)}`, q);
				}).sort((a, b) => a.key.localeCompare(b.key));
			}, [data, query]);
			// Group by the first dotted segment so long hierarchies read as sections.
			const groups = useMemo(() => {
				const map = new Map();
				for (const entry of entries) {
					const head = entry.key.includes(".") ? entry.key.split(".")[0] : null;
					if (head === null) {
						if (!map.has("\u0000")) map.set("\u0000", []);
						map.get("\u0000").push(entry);
						continue;
					}
					if (!map.has(head)) map.set(head, []);
					map.get(head).push(entry);
				}
				return [...map.entries()].sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
			}, [entries]);
			return jsxs(Fragment, { children: [
				jsxs("div", { className: "mymem-toolbar", children: [
					jsx(SearchBox, { value: query, onChange: setQuery, placeholder: t("search.kv") }),
					(data?.kv?.length ?? 0) > 0 ? jsx(ConfirmAction, { label: t("clearAll"), confirmLabel: t("confirmClearAll"), onConfirm: () => void onDelete({ kind: "kv-all" }), always: true }) : null
				] }),
				entries.length === 0 ? jsx(EmptyState, { text: (data?.kv?.length ?? 0) === 0 ? t("empty") : t("noResults") })
					: jsx(Fragment, { children: groups.map(([head, list]) => jsxs(Fragment, { children: [
						head === "\u0000" ? null : jsx("div", { className: "mymem-group", children: head }),
						list.map((entry) => jsxs("div", {
							className: "mymem-kvrow mymem-row",
							children: [
								jsx("div", { className: "mymem-key", children: entry.key }),
								jsx("div", { className: "mymem-val", children: formatValue(entry.value) }),
								jsx(ConfirmAction, { label: t("delete"), confirmLabel: t("confirmDelete"), onConfirm: () => void onDelete({ kind: "kv", key: entry.key }) })
							]
						}, entry.key))
					] }, head)) })
			] });
		}
		//#endregion
		//#region mind-map panel
		function TreeNode({ node, pathKey, labelPath, t, search, hitKeys, defaultOpen, onDelete }) {
			const [open, setOpen] = useState(defaultOpen);
			const children = node?.children ?? [];
			const hasChildren = children.length > 0;
			const descendants = useMemo(() => countDescendants(node), [node]);
			const hasValue = node.value !== undefined;
			const q = search.trim().toLowerCase();
			const hasSearch = q !== "";
			const text = `${node.label} ${hasValue ? formatValue(node.value) : ""}`;
			const selfHit = hasSearch && text.toLowerCase().includes(q);
			const subtreeHasHit = useMemo(() => {
				if (!hasSearch) return false;
				if (selfHit) return true;
				const prefix = `${pathKey}/`;
				for (const key of hitKeys) if (key.startsWith(prefix)) return true;
				return false;
			}, [pathKey, hitKeys, hasSearch, selfHit]);
			if (hasSearch && !selfHit && !subtreeHasHit) return null;
			const openEffective = hasSearch ? subtreeHasHit : open;
			return jsxs(Fragment, { children: [
				jsxs("div", {
					className: "mymem-node-row mymem-row" + (hasChildren ? " mymem-node-row-clickable" : ""),
					onClick: hasChildren ? () => setOpen(!open) : undefined,
					children: [
						jsx("span", { className: "mymem-caret" + (openEffective ? " mymem-caret-open" : ""), children: hasChildren ? "▶" : "" }),
						jsx("span", { className: "mymem-node-label" + (selfHit ? " mymem-node-hit" : ""), children: node.label }),
						hasValue ? jsx("span", { className: "mymem-node-value", children: formatValue(node.value) }) : null,
						descendants > 0 ? jsx("span", { className: "mymem-node-count", children: descendants }) : null,
						jsx(ConfirmAction, { label: t("delete"), confirmLabel: t("confirmDelete"), onConfirm: () => void onDelete({ kind: "map", path: labelPath }) })
					]
				}),
				hasChildren && openEffective ? jsx("div", {
					className: "mymem-node",
					children: children.map((child) => jsx(TreeNode, {
						node: child,
						pathKey: `${pathKey}/${child.id}`,
						labelPath: [...labelPath, child.label],
						t,
						search,
						hitKeys,
						defaultOpen,
						onDelete
					}, child.id))
				}) : null
			] });
		}

		function MapPanel({ data, t, onDelete }) {
			const [query, setQuery] = useState("");
			const [defaultOpen, setDefaultOpen] = useState(true);
			const [treeVersion, setTreeVersion] = useState(0);
			const root = data?.map;
			const top = useMemo(() => (root?.children ?? []).filter((node) => node && typeof node.label === "string" && node.label !== ""), [root]);
			const hitKeys = useMemo(() => {
				const q = query.trim().toLowerCase();
				if (q === "") return new Set();
				const hits = new Set();
				const walk = (node, key) => {
					const myKey = key === "" ? node.id : `${key}/${node.id}`;
					const text = `${node.label} ${node.value !== undefined ? formatValue(node.value) : ""}`;
					if (text.toLowerCase().includes(q)) hits.add(myKey);
					for (const child of node.children ?? []) walk(child, myKey);
				};
				for (const node of top) walk(node, "");
				return hits;
			}, [top, query]);
			return jsxs(Fragment, { children: [
				jsxs("div", { className: "mymem-toolbar", children: [
					jsx(SearchBox, { value: query, onChange: setQuery, placeholder: t("search.map") }),
					top.length > 0 ? jsx(ConfirmAction, { label: t("clearAll"), confirmLabel: t("confirmClearAll"), onConfirm: () => void onDelete({ kind: "map-all" }), always: true }) : null,
					jsx("button", {
						type: "button",
						className: "mymem-btn",
						onClick: () => { setDefaultOpen(true); setTreeVersion((v) => v + 1); },
						children: t("expandAll")
					}),
					jsx("button", {
						type: "button",
						className: "mymem-btn",
						onClick: () => { setDefaultOpen(false); setTreeVersion((v) => v + 1); },
						children: t("collapseAll")
					})
				] }),
				top.length === 0 ? jsx(EmptyState, { text: t("empty") })
					: jsx("div", { className: "mymem-tree", children: top.map((node) => jsx(TreeNode, {
						node,
						pathKey: node.id,
						labelPath: [node.label],
						t,
						search: query,
						hitKeys,
						defaultOpen,
						onDelete
					}, `${node.id}|${treeVersion}`)) })
			] });
		}
		//#endregion
		//#region section
		function MemorySection() {
			const [data, setData] = useState(undefined);
			const [error, setError] = useState(undefined);
			const [loading, setLoading] = useState(false);
			const [tab, setTab] = useState("text");
			const fileRef = useRef(undefined);
			const t = boundT;
			const snapshot = useSyncExternalStore(
				(cb) => { const off = scopeRef.subscribe(cb); return off; },
				() => scopeRef.getSnapshot()
			);
			const refresh = useCallback(async () => {
				setLoading(true);
				setError(undefined);
				try {
					const data = await loadMemory();
					setData(data);
				} catch (err) {
					setError(err instanceof Error ? err.message : String(err));
				} finally {
					setLoading(false);
				}
			}, []);
			useEffect(() => { void refresh(); }, [refresh]);
			const handleDelete = useCallback(async (payload) => {
				setError(undefined);
				try {
					const next = await deleteMemory(payload);
					setData(next);
				} catch (err) {
					setError(err instanceof Error ? err.message : String(err));
				}
			}, []);
			const handleExport = useCallback(async () => {
				setError(undefined);
				try {
					downloadMemoryJson(await fetchExport());
				} catch (err) {
					setError(err instanceof Error ? err.message : String(err));
				}
			}, []);
			const handleImportFile = useCallback(async (file) => {
				if (!file) return;
				setError(undefined);
				try {
					const payload = JSON.parse(await file.text());
					const next = await postImport(payload);
					setData(next);
				} catch (err) {
					setError(err instanceof Error ? err.message : String(err));
				}
			}, []);
			const tabs = [
				{ id: "text", label: t("tabs.text") },
				{ id: "kv", label: t("tabs.kv") },
				{ id: "map", label: t("tabs.map") }
			];
			const textCount = data?.text?.length ?? 0;
			const kvCount = data?.kv?.length ?? 0;
			const mapCount = data?.map ? countDescendants(data.map) : 0;
			const renderBody = () => {
				if (loading && data === undefined) return jsx("div", { className: "mymem-loading", children: t("loading") });
				if (error !== undefined) return jsxs("div", { className: "mymem-error", children: [`${t("error")}: ${error}`, error !== undefined && jsx("button", { type: "button", className: "mymem-btn mymem-btn-danger", style: { marginLeft: 8 }, onClick: () => setError(undefined), children: t("dismiss") })] });
				if (data === undefined) return null;
				if (tab === "kv") return jsx(KvPanel, { data, t, onDelete: handleDelete });
				if (tab === "map") return jsx(MapPanel, { data, t, onDelete: handleDelete });
				return jsx(TextPanel, { data, t, onDelete: handleDelete });
			};
			return jsxs("div", { className: "mymem-wrap", children: [
				jsxs("div", { className: "mymem-head", children: [
					jsx("p", { className: "mymem-hint", children: t("hint") }),
					jsxs("div", { className: "mymem-head-actions", children: [
						jsx("button", { type: "button", className: "mymem-btn", onClick: () => void handleExport(), children: t("export") }),
						jsx("button", { type: "button", className: "mymem-btn", onClick: () => fileRef.current?.click(), children: t("import") }),
						jsx("input", { type: "file", ref: fileRef, accept: ".json,application/json", style: { display: "none" }, onChange: (e) => { const f = e.target.files?.[0]; e.target.value = ""; void handleImportFile(f); } }),
						jsx("button", { type: "button", className: "mymem-btn", onClick: () => void refresh(), disabled: loading, children: t("refresh") })
					] })
				] }),
				jsx(SettingsCard, { snapshot, writable: snapshot.writable !== false, t }),
				jsx("div", { className: "mymem-count", children: `${t("text.count", { count: textCount })} · ${t("kv.count", { count: kvCount })} · ${t("map.count", { count: mapCount })}` }),
				jsx("div", { className: "mymem-tabs", children: tabs.map((item) => jsx("button", {
					type: "button",
					className: "mymem-tab" + (tab === item.id ? " mymem-tab-active" : ""),
					onClick: () => setTab(item.id),
					children: item.label
				}, item.id)) }),
				jsx("div", { className: "mymem-body", children: renderBody() })
			] });
		}
		//#endregion
		//#region plugin
		const NS = "settings.memory";
		const inject = ["slots", "locale", "settingsScope"];
		function apply(ctx) {
			scopeRef = ctx.settingsScope.bind({ namespace: "memory" });
			ctx.effect(() => ctx.locale.register(NS, {
				zh: {
					"nav": "记忆",
					"hint": "查看 AI 保存的跨会话长期记忆：文字事实、结构化键值，以及分层思维导图 / 路线图。可搜索、筛选和删除。",
					"refresh": "刷新",
					"loading": "正在读取记忆…",
					"error": "读取记忆失败",
					"dismiss": "忽略",
					"empty": "暂无记录，AI 会在会话中自动保存持久信息。",
					"noResults": "没有匹配的结果",
					"tabs.text": "文字记忆",
					"tabs.kv": "KV 记忆",
					"tabs.map": "思维导图",
					"text.count": "{count} 条文字",
					"kv.count": "{count} 个 KV",
					"map.count": "{count} 个节点",
					"search.text": "搜索文字记忆…",
					"search.kv": "搜索键或值…",
					"search.map": "搜索节点…",
					"delete": "删除",
					"confirmDelete": "确认删除？",
					"clearFilter": "清除筛选",
					"expandAll": "全部展开",
					"collapseAll": "全部折叠",
					"clearAll": "清空全部",
					"confirmClearAll": "确认清空全部？",
					"export": "导出",
					"import": "导入",
					"settings.title": "记忆设置",
					"settings.enabled": "启用记忆",
					"settings.enabledDesc": "关闭后 AI 不再使用记忆工具。",
					"settings.text": "文字记忆",
					"settings.textDesc": "启用 memory_remember / recall / list / forget。",
					"settings.kv": "KV 记忆",
					"settings.kvDesc": "启用 memory_kv_set / get / list / delete。",
					"settings.map": "思维导图",
					"settings.mapDesc": "启用 memory_map_add / get / remove。",
					"settings.remind": "自动提醒",
					"settings.remindDesc": "在系统提示中提醒 AI 使用记忆并告知现有标签。",
					"settings.maxResults": "最大结果数",
					"settings.maxResultsDesc": "每次检索/列表最多返回的记录数（1–500）。"
				},
				en: {
					"nav": "Memory",
					"hint": "Browse the AI's cross-session long-term memory: text facts, structured key-values, and a hierarchical mind map / roadmap. Search, filter, and delete.",
					"refresh": "Refresh",
					"loading": "Loading memory…",
					"error": "Failed to load memory",
					"dismiss": "Dismiss",
					"empty": "Nothing recorded yet — the AI saves durable facts automatically during sessions.",
					"noResults": "No matching results",
					"tabs.text": "Text",
					"tabs.kv": "KV",
					"tabs.map": "Mind map",
					"text.count": "{count} text",
					"kv.count": "{count} KV",
					"map.count": "{count} nodes",
					"search.text": "Search text memory…",
					"search.kv": "Search keys or values…",
					"search.map": "Search nodes…",
					"delete": "Delete",
					"confirmDelete": "Confirm?",
					"clearFilter": "Clear filter",
					"expandAll": "Expand all",
					"collapseAll": "Collapse all",
					"clearAll": "Clear all",
					"confirmClearAll": "Clear all?",
					"export": "Export",
					"import": "Import",
					"settings.title": "Memory settings",
					"settings.enabled": "Enable memory",
					"settings.enabledDesc": "Turns off all memory tools for the AI.",
					"settings.text": "Text memory",
					"settings.textDesc": "Enables memory_remember / recall / list / forget.",
					"settings.kv": "KV memory",
					"settings.kvDesc": "Enables memory_kv_set / get / list / delete.",
					"settings.map": "Mind map",
					"settings.mapDesc": "Enables memory_map_add / get / remove.",
					"settings.remind": "Auto reminder",
					"settings.remindDesc": "Reminds the AI in the system prompt and lists current tags.",
					"settings.maxResults": "Max results",
					"settings.maxResultsDesc": "Records returned per recall/list call (1–500)."
				}
			}), "ui-memory: dictionaries");
			boundT = ctx.locale.bind(NS);
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "memory",
				order: 20,
				label: () => boundT("nav"),
				locale: NS
			}, MemorySection));
		}
		//#endregion
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});
//dsh-gui memory plugin
// DeepSeek Harness GUI memory plugin.

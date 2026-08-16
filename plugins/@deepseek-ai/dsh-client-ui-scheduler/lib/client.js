window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-scheduler",
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
			".msc-wrap{display:flex;flex-direction:column;gap:18px;padding:6px 0 32px;max-width:780px}",
			".msc-hint{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:22px;margin:0}",
			".msc-note{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:19px}",
			".msc-card{border:1px solid var(--dsw-alias-border-l2);border-radius:14px;overflow:hidden;background:var(--dsw-alias-bg-module-platform);box-shadow:0 1px 2px rgba(0,0,0,.04)}",
			".msc-card-head{display:flex;align-items:center;gap:10px;width:100%;appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;font-weight:600;padding:13px 16px;cursor:pointer;text-align:left}",
			".msc-card-head:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".msc-head-dot{width:7px;height:7px;border-radius:50%;background:var(--dsw-static-blue-600);flex:none}",
			".msc-head-chevron{color:var(--dsw-alias-label-secondary);font-size:11px;margin-left:auto;transition:transform .18s ease}",
			".msc-open .msc-head-chevron{transform:rotate(90deg)}",
			".msc-card-body{border-top:1px solid var(--dsw-alias-border-l1);display:flex;flex-direction:column}",
			".msc-setrow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 16px}",
			".msc-setrow + .msc-setrow{border-top:1px solid var(--dsw-alias-border-l1)}",
			".msc-setrow-label{display:flex;flex-direction:column;gap:2px;min-width:0}",
			".msc-setrow-title{color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}",
			".msc-setrow-desc{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
			".msc-switch{appearance:none;border:0;background:var(--dsw-alias-border-l2);width:38px;height:22px;border-radius:11px;position:relative;cursor:pointer;transition:background .18s ease;flex:none;padding:0}",
			".msc-switch::after{content:'';position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.22);transition:transform .18s ease}",
			".msc-switch-on{background:var(--dsw-static-blue-600)}",
			".msc-switch-on::after{transform:translateX(16px)}",
			".msc-switch:disabled{opacity:.5;cursor:default}",
			".msc-list{display:flex;flex-direction:column;gap:12px;padding:14px 16px}",
			".msc-task{border:1px solid var(--dsw-alias-border-l2);border-radius:13px;padding:14px 16px;background:var(--dsw-alias-bg-module-platform);display:flex;flex-direction:column;gap:10px;transition:border-color .15s ease,box-shadow .15s ease}",
			".msc-task:hover{border-color:var(--dsw-alias-border-l3);box-shadow:0 3px 14px rgba(0,0,0,.06)}",
			".msc-task-head{display:flex;align-items:center;gap:10px;min-width:0}",
			".msc-task-dot{width:8px;height:8px;border-radius:50%;flex:none;background:var(--dsw-alias-label-tertiary)}",
			".msc-task-dot-on{background:var(--dsw-static-blue-600);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-static-blue-600) 16%,transparent)}",
			".msc-task-name{flex:1;min-width:0;color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px;font-weight:600;word-break:break-word}",
			".msc-task-actions{display:flex;align-items:center;gap:6px;flex:none}",
			".msc-chiprow{display:flex;flex-wrap:wrap;gap:6px}",
			".msc-chip{display:inline-flex;align-items:center;gap:5px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover);border-radius:999px;padding:3px 10px;white-space:nowrap}",
			".msc-chip-key{color:var(--dsw-alias-label-tertiary)}",
			".msc-chip-accent{color:var(--dsw-static-blue-600)}",
			".msc-prompt{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:10px;padding:9px 12px;font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary);word-break:break-word;white-space:pre-wrap}",
			".msc-prompt-empty{color:var(--dsw-alias-label-tertiary)}",
			".msc-edit-toggle{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;padding:2px 4px;border-radius:6px;cursor:pointer;align-self:flex-start}",
			".msc-edit-toggle:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".msc-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;border-top:1px solid var(--dsw-alias-border-l1);padding-top:12px;margin-top:2px}",
			".msc-fields .msc-fwide{grid-column:span 3}",
			".msc-field{display:flex;flex-direction:column;gap:5px;min-width:0}",
			".msc-field-label{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:16px}",
			".msc-input{border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:32px;padding:0 11px;border-radius:9px;width:100%;min-width:0;box-sizing:border-box;transition:border-color .15s ease,box-shadow .15s ease}",
			".msc-input:focus{outline:0;border-color:var(--dsw-static-blue-600);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-static-blue-600) 14%,transparent)}",
			".msc-input:disabled{opacity:.55;cursor:not-allowed}",
			".msc-select{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:32px;padding:0 10px;border-radius:9px;width:100%;box-sizing:border-box;cursor:pointer;transition:border-color .15s ease}",
			".msc-select:focus{outline:0;border-color:var(--dsw-static-blue-600)}",
			".msc-btn{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;padding:7px 16px;border-radius:10px;cursor:pointer;flex:none;transition:background .15s ease,border-color .15s ease}",
			".msc-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
			".msc-btn:disabled{opacity:.5;cursor:default}",
			".msc-btn-primary{border-color:transparent;color:#fff;background:var(--dsw-static-blue-600)}",
			".msc-btn-primary:hover:not(:disabled){background:var(--dsw-static-blue-600);filter:brightness(1.08)}",
			".msc-btn-danger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger);border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}",
			".msc-btn-confirm{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}",
			".msc-iconbtn{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary);width:28px;height:28px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s ease,color .15s ease}",
			".msc-iconbtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".msc-iconbtn svg{width:15px;height:15px;display:block}",
			".msc-empty{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:22px;padding:26px 12px;text-align:center;border:1px dashed var(--dsw-alias-border-l2);border-radius:12px}",
			".msc-error{color:var(--dsw-alias-state-error-primary);font-size:13px;line-height:20px;padding:12px 16px;background:var(--dsw-alias-interactive-bg-hover-danger);border:1px solid var(--dsw-alias-border-l2);border-radius:12px}",
			".msc-add{padding:16px;display:flex;flex-direction:column;gap:14px}",
			".msc-add-title{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".msc-add-title .msc-head-dot{background:var(--dsw-alias-label-tertiary)}",
			".msc-add-row{display:flex;justify-content:flex-end}"
		].join("");
		const tagId = "@deepseek-ai/dsh-client-ui-scheduler/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-scheduler";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region data
		const SCHEDULER_URL = "/api/scheduler";
		async function fetchTasks() {
			const res = await fetch(SCHEDULER_URL, { method: "GET", cache: "no-store" });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.json();
		}
		async function postTask(payload) {
			const res = await fetch(SCHEDULER_URL, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(payload)
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const body = await res.json();
			if (body.error !== undefined) throw new Error(body.error);
			return body;
		}
		//#endregion
		//#region schedule helpers
		const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
		const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
		const REPEATS = new Set(["none", "daily", "weekday", "weekend"]);
		/** Next fire time for a task, mirroring the backend scheduler logic. */
		function nextFireAt(task, now) {
			const d = new Date(now);
			if (typeof task.date === "string" && DATE_RE.test(task.date) && typeof task.time === "string" && TIME_RE.test(task.time)) {
				const [y, mo, day] = task.date.split("-").map(Number);
				const [h, mi] = task.time.split(":").map(Number);
				const base = new Date(y, mo - 1, day, h, mi, 0, 0);
				const repeat = REPEATS.has(task.repeat) ? task.repeat : "none";
				if (repeat === "none") return base.getTime() > d.getTime() ? base : undefined;
				const matches = (dt) => {
					const dow = dt.getDay();
					if (repeat === "daily") return true;
					if (repeat === "weekday") return dow >= 1 && dow <= 5;
					return dow === 0 || dow === 6;
				};
				const c = new Date(base);
				if (c.getTime() <= d.getTime()) c.setDate(c.getDate() + 1);
				let guard = 0;
				while (!matches(c) && guard < 400) { c.setDate(c.getDate() + 1); guard += 1; }
				return c.getTime() > d.getTime() ? c : undefined;
			}
			if (typeof task.time === "string" && TIME_RE.test(task.time.trim())) {
				const [h, m] = task.time.trim().split(":").map(Number);
				const next = new Date(d);
				next.setHours(h, m, 0, 0);
				if (next.getTime() <= d.getTime()) next.setDate(next.getDate() + 1);
				return next;
			}
			const minutes = Number(task.intervalMinutes) || 5;
			return new Date(d.getTime() + minutes * 60000);
		}
		function formatNext(d) {
			if (d === undefined) return undefined;
			const now = new Date();
			const pad = (n) => String(n).padStart(2, "0");
			const sameDay = d.toDateString() === now.toDateString();
			const hhmm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
			if (sameDay) return hhmm;
			return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${hhmm}`;
		}
		//#endregion
		//#region icons
		const ClockIcon = () => jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", children: [jsx("circle", { cx: "12", cy: "12", r: "10", key: "a" }), jsx("path", { d: "M12 6v6l4 2", key: "b" })] });
		//#endregion
		//#region components
		let boundT = (key) => key;
		let scopeRef = undefined;

		function Switch({ checked, onChange, disabled }) {
			return jsx("button", {
				type: "button",
				role: "switch",
				"aria-checked": checked,
				className: "msc-switch" + (checked ? " msc-switch-on" : ""),
				onClick: () => { if (!disabled) onChange(!checked); },
				disabled
			});
		}

		function BlurInput({ value, onCommit, className, placeholder, disabled }) {
			const [draft, setDraft] = useState(value);
			useEffect(() => { setDraft(value); }, [value]);
			return jsx("input", {
				type: "text",
				className: "msc-input" + (className ? ` ${className}` : ""),
				value: draft,
				placeholder,
				disabled,
				spellCheck: false,
				onChange: (e) => setDraft(e.target.value),
				onBlur: () => { if (draft !== value) onCommit(draft.trim()); },
				onKeyDown: (e) => { if (e.key === "Enter") { e.currentTarget.blur(); } }
			});
		}

		/** Native date input that commits on change (YYYY-MM-DD or empty). */
		function DateInput({ value, onCommit, disabled }) {
			return jsx("input", {
				type: "date",
				className: "msc-input",
				value: value ?? "",
				disabled,
				onChange: (e) => onCommit(e.target.value)
			});
		}

		/** Native time input that commits on change (HH:MM or empty). */
		function TimeInput({ value, onCommit, disabled }) {
			return jsx("input", {
				type: "time",
				className: "msc-input",
				value: value ?? "",
				disabled,
				onChange: (e) => onCommit(e.target.value)
			});
		}

		/** Select (repeat mode). */
		function RepeatSelect({ value, onCommit, disabled }) {
			return jsxs("select", {
				className: "msc-select",
				value: value ?? "none",
				disabled,
				onChange: (e) => onCommit(e.target.value),
				children: [
					jsx("option", { value: "none", children: boundT("repeat.none") }),
					jsx("option", { value: "daily", children: boundT("repeat.daily") }),
					jsx("option", { value: "weekday", children: boundT("repeat.weekday") }),
					jsx("option", { value: "weekend", children: boundT("repeat.weekend") })
				]
			});
		}

		function ConfirmButton({ label, confirmLabel, onConfirm, danger, icon }) {
			const [armed, setArmed] = useState(false);
			const timer = useRef(undefined);
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
				className: "msc-btn" + (danger ? " msc-btn-danger" : "") + (armed ? " msc-btn-confirm" : ""),
				onClick: fire,
				children: armed ? confirmLabel : label
			});
		}

		function TaskRow({ task, t, onChange }) {
			const [editing, setEditing] = useState(false);
			const enabled = task.enabled === true;
			const next = nextFireAt(task, Date.now());
			const nextText = formatNext(next);
			const chips = [];
			if (task.date) chips.push(jsxs(Fragment, { children: [jsx("span", { className: "msc-chip-key", children: t("date") }), jsx("span", { children: task.date })] }, "date"));
			if (task.time) chips.push(jsxs(Fragment, { children: [jsx("span", { className: "msc-chip-key", children: t("time") }), jsx("span", { children: task.time })] }, "time"));
			chips.push(jsxs(Fragment, { children: [jsx("span", { className: "msc-chip-key", children: t("repeat") }), jsx("span", { children: boundT("repeat." + (REPEATS.has(task.repeat) ? task.repeat : "none")) })] }, "repeat"));
			if (!task.date && !task.time) chips.push(jsxs(Fragment, { children: [jsx("span", { className: "msc-chip-key", children: t("interval") }), jsx("span", { children: `${Number(task.intervalMinutes) || 5} ${t("minUnit")}` })] }, "interval"));
			if (nextText !== undefined) chips.push(jsxs(Fragment, { children: [jsx(ClockIcon, {}), jsx("span", { className: "msc-chip-accent", children: `${t("nextRun")} ${nextText}` })] }, "next"));
			return jsxs("div", { className: "msc-task", children: [
				jsxs("div", { className: "msc-task-head", children: [
					jsx("span", { className: "msc-task-dot" + (enabled ? " msc-task-dot-on" : "") }),
					jsx("span", { className: "msc-task-name", children: task.name }),
					jsxs("div", { className: "msc-task-actions", children: [
						jsx(Switch, { checked: enabled, onChange: () => onChange({ op: "toggle", id: task.id }) }),
						jsx(ConfirmButton, { label: t("delete"), confirmLabel: t("confirmDelete"), danger: true, onConfirm: () => onChange({ op: "remove", id: task.id }) })
					] })
				] }),
				chips.length > 0 ? jsx("div", { className: "msc-chiprow", children: chips }) : null,
				task.prompt
					? jsx("div", { className: "msc-prompt", children: task.prompt })
					: jsx("div", { className: "msc-prompt msc-prompt-empty", children: t("promptEmpty") }),
				editing ? jsxs("div", { className: "msc-fields", children: [
					jsx("div", { className: "msc-field msc-fwide", children: [
						jsx("span", { className: "msc-field-label", children: t("prompt") }),
						jsx(BlurInput, { value: task.prompt ?? "", placeholder: t("promptPlaceholder"), onCommit: (v) => onChange({ op: "update", id: task.id, patch: { prompt: v } }) })
					] }),
					jsx("div", { className: "msc-field", children: [
						jsx("span", { className: "msc-field-label", children: t("date") }),
						jsx(DateInput, { value: task.date, onCommit: (v) => onChange({ op: "update", id: task.id, patch: { date: v } }) })
					] }),
					jsx("div", { className: "msc-field", children: [
						jsx("span", { className: "msc-field-label", children: t("time") }),
						jsx(TimeInput, { value: task.time, onCommit: (v) => onChange({ op: "update", id: task.id, patch: { time: v } }) })
					] }),
					jsx("div", { className: "msc-field", children: [
						jsx("span", { className: "msc-field-label", children: t("repeat") }),
						jsx(RepeatSelect, { value: task.repeat, onCommit: (v) => onChange({ op: "update", id: task.id, patch: { repeat: v } }) })
					] }),
					jsx("div", { className: "msc-field", children: [
						jsx("span", { className: "msc-field-label", children: t("interval") }),
						jsx(BlurInput, { value: String(task.intervalMinutes ?? 5), className: "", onCommit: (v) => onChange({ op: "update", id: task.id, patch: { intervalMinutes: Number(v) || 5 } }) })
					] }),
					jsx("div", { className: "msc-field msc-fwide", children: [
						jsx("span", { className: "msc-field-label", children: t("command") }),
						jsx(BlurInput, { value: task.command ?? "", placeholder: t("commandPlaceholder"), onCommit: (v) => onChange({ op: "update", id: task.id, patch: { command: v } }) })
					] })
				] }) : jsx("button", { type: "button", className: "msc-edit-toggle", onClick: () => setEditing(true), children: t("edit") })
			] });
		}

		function SchedulerSection() {
			const t = boundT;
			const [tasks, setTasks] = useState([]);
			const [error, setError] = useState(undefined);
			const [notifyOpen, setNotifyOpen] = useState(false);
			const [name, setName] = useState("");
			const [prompt, setPrompt] = useState("");
			const [time, setTime] = useState("");
			const [date, setDate] = useState("");
			const [repeat, setRepeat] = useState("none");
			const [interval, setInterval] = useState("60");
			const [command, setCommand] = useState("");
			const snapshot = useSyncExternalStore(
				(cb) => { const off = scopeRef.subscribe(cb); return off; },
				() => scopeRef.getSnapshot()
			);
			const refresh = useCallback(async () => {
				try {
					const data = await fetchTasks();
					setTasks(Array.isArray(data.tasks) ? data.tasks : []);
					setError(undefined);
				} catch (err) {
					setError(err instanceof Error ? err.message : String(err));
				}
			}, []);
			useEffect(() => { void refresh(); }, [refresh]);
			const runOp = async (payload) => {
				try {
					const data = await postTask(payload);
					setTasks(Array.isArray(data.tasks) ? data.tasks : []);
					setError(undefined);
				} catch (err) {
					setError(err instanceof Error ? err.message : String(err));
				}
			};
			const value = snapshot.value;
			const notifyReady = snapshot.status === "ready" && value !== undefined;
			const writable = snapshot.writable !== false;
			const notifyConfig = {
				enabled: notifyReady ? value.enabled : true,
				notifyStart: notifyReady ? value.notifyStart : true,
				notifyDone: notifyReady ? value.notifyDone : true,
				notifySchedule: notifyReady ? value.notifySchedule : true
			};
			const setNotify = (field, v) => { if (writable) scopeRef.set(field, v); };
			const setRow = (title, desc, field, checked) => jsxs("div", { className: "msc-setrow", children: [
				jsxs("div", { className: "msc-setrow-label", children: [
					jsx("div", { className: "msc-setrow-title", children: title }),
					jsx("div", { className: "msc-setrow-desc", children: desc })
				] }),
				jsx(Switch, { checked, onChange: (v) => setNotify(field, v), disabled: !notifyReady || !writable })
			] });
			const addTask = async () => {
				if (name.trim() === "") { setError(t("nameRequired")); return; }
				await runOp({ op: "add", name, prompt, time, date, repeat, intervalMinutes: Number(interval) || 5, command });
				setName(""); setPrompt(""); setTime(""); setDate(""); setRepeat("none"); setInterval("60"); setCommand("");
			};
			return jsxs("div", { className: "msc-wrap", children: [
				jsx("p", { className: "msc-hint", children: t("hint") }),
				error !== undefined ? jsx("div", { className: "msc-error", children: error }) : null,
				jsxs("div", { className: "msc-card" + (notifyOpen ? " msc-open" : ""), children: [
					jsxs("button", { type: "button", className: "msc-card-head", onClick: () => setNotifyOpen(!notifyOpen), children: [
						jsx("span", { className: "msc-head-dot" }),
						jsx("span", { children: t("notify.title") }),
						jsx("span", { className: "msc-head-chevron", children: "▸" })
					] }),
					notifyOpen ? jsxs("div", { className: "msc-card-body", children: [
						setRow(t("notify.enabled"), t("notify.enabledDesc"), "enabled", notifyConfig.enabled),
						setRow(t("notify.start"), t("notify.startDesc"), "notifyStart", notifyConfig.notifyStart),
						setRow(t("notify.done"), t("notify.doneDesc"), "notifyDone", notifyConfig.notifyDone),
						setRow(t("notify.schedule"), t("notify.scheduleDesc"), "notifySchedule", notifyConfig.notifySchedule)
					] }) : null
				] }),
				jsxs("div", { className: "msc-card", children: [
					jsx("div", { className: "msc-card-head", children: [jsx("span", { className: "msc-head-dot" }), jsx("span", { children: t("tasks.title") })] }),
					jsx("div", { className: "msc-list", children: tasks.length === 0
						? jsx("div", { className: "msc-empty", children: t("tasks.empty") })
						: tasks.map((task) => jsx(TaskRow, { task, t, onChange: runOp }, task.id)) })
				] }),
				jsxs("div", { className: "msc-card", children: [
					jsx("div", { className: "msc-add-title", children: [jsx("span", { className: "msc-head-dot" }), jsx("span", { children: t("addTitle") })] }),
					jsxs("div", { className: "msc-add", children: [
						jsxs("div", { className: "msc-fields", children: [
							jsx("div", { className: "msc-field msc-fwide", children: [
								jsx("span", { className: "msc-field-label", children: t("name") }),
								jsx(BlurInput, { value: name, onCommit: (v) => setName(v), placeholder: t("namePlaceholder") })
							] }),
							jsx("div", { className: "msc-field msc-fwide", children: [
								jsx("span", { className: "msc-field-label", children: t("prompt") }),
								jsx(BlurInput, { value: prompt, onCommit: (v) => setPrompt(v), placeholder: t("promptPlaceholder") })
							] }),
							jsx("div", { className: "msc-field", children: [
								jsx("span", { className: "msc-field-label", children: t("date") }),
								jsx(DateInput, { value: date, onCommit: (v) => setDate(v) })
							] }),
							jsx("div", { className: "msc-field", children: [
								jsx("span", { className: "msc-field-label", children: t("time") }),
								jsx(TimeInput, { value: time, onCommit: (v) => setTime(v) })
							] }),
							jsx("div", { className: "msc-field", children: [
								jsx("span", { className: "msc-field-label", children: t("repeat") }),
								jsx(RepeatSelect, { value: repeat, onCommit: (v) => setRepeat(v) })
							] }),
							jsx("div", { className: "msc-field", children: [
								jsx("span", { className: "msc-field-label", children: t("interval") }),
								jsx(BlurInput, { value: interval, onCommit: (v) => setInterval(v) })
							] }),
							jsx("div", { className: "msc-field msc-fwide", children: [
								jsx("span", { className: "msc-field-label", children: t("command") }),
								jsx(BlurInput, { value: command, onCommit: (v) => setCommand(v), placeholder: t("commandPlaceholder") })
							] })
						] }),
						jsx("div", { className: "msc-add-row", children: jsx("button", { type: "button", className: "msc-btn msc-btn-primary", onClick: () => void addTask(), children: t("add") }) })
					] })
				] }),
				jsx("p", { className: "msc-note", children: t("note") })
			] });
		}
		//#endregion
		//#region plugin
		const NS = "settings.scheduler";
		const inject = ["slots", "locale", "settingsScope"];
		function apply(ctx) {
			scopeRef = ctx.settingsScope.bind({ namespace: "notify" });
			ctx.effect(() => ctx.locale.register(NS, {
				zh: {
					"nav": "定时任务",
					"hint": "设置任务通知与定时任务：AI 开始/完成任务的 Windows 通知，以及定时让 AI 执行的任务。",
					"notify.title": "通知设置",
					"notify.enabled": "启用通知",
					"notify.enabledDesc": "总开关：关闭后不再弹出任何 Windows 通知。",
					"notify.start": "任务开始通知",
					"notify.startDesc": "AI 开始处理任务时通知。",
					"notify.done": "任务完成通知",
					"notify.doneDesc": "AI 完成任务时通知。",
					"notify.schedule": "定时任务通知",
					"notify.scheduleDesc": "定时任务到点时通知。",
					"tasks.title": "已添加的定时任务",
					"tasks.empty": "暂无定时任务，可在下方添加。",
					"name": "名称",
					"namePlaceholder": "例如：每日总结",
					"nameRequired": "请填写任务名称",
					"prompt": "AI 指令",
					"promptPlaceholder": "到点时让 AI 执行的任务内容，如：整理今天的聊天要点",
					"promptEmpty": "（未设置 AI 指令）",
					"date": "日期",
					"dateNote": "留空则不限定日期",
					"time": "时间",
					"timePlaceholder": "如 14:00",
					"timeNote": "留空则按间隔执行",
					"repeat": "重复",
					"repeat.none": "不重复",
					"repeat.daily": "每天",
					"repeat.weekday": "工作日",
					"repeat.weekend": "周末",
					"interval": "间隔（分钟）",
					"minUnit": "分钟",
					"minNote": "至少 5 分钟",
					"nextRun": "下次",
					"command": "执行命令",
					"commandPlaceholder": "可选的 Windows 命令，如 notepad.exe",
					"add": "添加任务",
					"addTitle": "新建定时任务",
					"edit": "编辑设置",
					"delete": "删除",
					"confirmDelete": "确认删除？",
					"note": "指定日期+时间则在那一刻执行（可按重复方式循环）；只填时间则每天该时刻执行；只填间隔（分钟）则按间隔执行。到点弹出 Windows 通知，并让 AI 执行填写的指令；若填写了执行命令，会同时执行该命令。"
				},
				en: {
					"nav": "Scheduler",
					"hint": "Task notifications and scheduled tasks: Windows notifications when the AI starts/finishes a task, plus tasks the AI runs on a schedule.",
					"notify.title": "Notification settings",
					"notify.enabled": "Enable notifications",
					"notify.enabledDesc": "Master switch: turns off all Windows notifications.",
					"notify.start": "Task start",
					"notify.startDesc": "Notify when the AI starts handling a task.",
					"notify.done": "Task done",
					"notify.doneDesc": "Notify when the AI finishes a task.",
					"notify.schedule": "Scheduled tasks",
					"notify.scheduleDesc": "Notify when a scheduled task fires.",
					"tasks.title": "Scheduled tasks",
					"tasks.empty": "No scheduled tasks yet — add one below.",
					"name": "Name",
					"namePlaceholder": "e.g. Daily summary",
					"nameRequired": "Please enter a task name",
					"prompt": "AI instruction",
					"promptPlaceholder": "What the AI should do when the task fires, e.g. summarize today's chats",
					"promptEmpty": "(no AI instruction set)",
					"date": "Date",
					"dateNote": "leave empty for no date",
					"time": "Time",
					"timePlaceholder": "e.g. 14:00",
					"timeNote": "leave empty for interval",
					"repeat": "Repeat",
					"repeat.none": "Once",
					"repeat.daily": "Daily",
					"repeat.weekday": "Weekdays",
					"repeat.weekend": "Weekends",
					"interval": "Interval (min)",
					"minUnit": "min",
					"minNote": "at least 5 minutes",
					"nextRun": "next",
					"command": "Command",
					"commandPlaceholder": "Optional Windows command, e.g. notepad.exe",
					"add": "Add task",
					"addTitle": "New scheduled task",
					"edit": "Edit settings",
					"delete": "Delete",
					"confirmDelete": "Confirm?",
					"note": "A date + time fires at that moment (repeating per the repeat mode); a time alone fires every day; an interval alone fires every N minutes. It shows a Windows notification and runs the AI instruction; a command runs too when set."
				}
			}), "ui-scheduler: dictionaries");
			boundT = ctx.locale.bind(NS);
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "scheduler",
				order: 23,
				label: () => boundT("nav"),
				locale: NS
			}, SchedulerSection));
		}
		//#endregion
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});

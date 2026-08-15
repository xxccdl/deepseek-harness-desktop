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
			".mysch-wrap{display:flex;flex-direction:column;gap:14px;padding:4px 0 28px;max-width:760px}",
			".mysch-hint{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;margin:0}",
			".mysch-note{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
			".mysch-card{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;overflow:hidden;background:var(--dsw-alias-bg-module-platform)}",
			".mysch-card-head{display:flex;align-items:center;justify-content:space-between;width:100%;appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;font-weight:500;padding:10px 14px;cursor:pointer}",
			".mysch-card-head:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".mysch-chevron{color:var(--dsw-alias-label-secondary);font-size:12px;transition:transform .15s ease}",
			".mysch-open .mysch-chevron{transform:rotate(90deg)}",
			".mysch-card-body{display:flex;flex-direction:column;border-top:1px solid var(--dsw-alias-border-l1)}",
			".mysch-setrow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 14px}",
			".mysch-setrow + .mysch-setrow{border-top:1px solid var(--dsw-alias-border-l1)}",
			".mysch-setrow-label{display:flex;flex-direction:column;gap:1px;min-width:0}",
			".mysch-setrow-title{color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}",
			".mysch-setrow-desc{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
			".mysch-switch{appearance:none;border:0;background:var(--dsw-alias-border-l2);width:36px;height:20px;border-radius:10px;position:relative;cursor:pointer;transition:background .18s ease;flex:none;padding:0}",
			".mysch-switch::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2);transition:transform .18s ease}",
			".mysch-switch-on{background:var(--dsw-static-blue-600)}",
			".mysch-switch-on::after{transform:translateX(16px)}",
			".mysch-switch:disabled{opacity:.5;cursor:default}",
			".mysch-list{display:flex;flex-direction:column;gap:10px}",
			".mysch-task{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:12px 14px;background:var(--dsw-alias-bg-module-platform);display:flex;flex-direction:column;gap:8px}",
			".mysch-task-head{display:flex;align-items:center;gap:10px}",
			".mysch-task-name{flex:1;min-width:0;color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px;font-weight:500;word-break:break-word}",
			".mysch-task-fields{display:flex;flex-direction:column;gap:6px}",
			".mysch-field{display:flex;align-items:center;gap:8px}",
			".mysch-field-label{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;flex:none;width:64px}",
			".mysch-input{border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:30px;padding:0 10px;border-radius:8px;flex:1;min-width:0;transition:border-color .15s ease}",
			".mysch-input:focus{outline:0;border-color:var(--dsw-static-blue-600)}",
			".mysch-input-num{flex:none;width:80px;text-align:center}",
			".mysch-input-sm{flex:none;width:130px;text-align:center}",
			".mysch-select{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:30px;padding:0 10px;border-radius:8px;flex:none;transition:border-color .15s ease;cursor:pointer}",
			".mysch-select:focus{outline:0;border-color:var(--dsw-static-blue-600)}",
			".mysch-btn{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;padding:6px 14px;border-radius:10px;cursor:pointer;flex:none;transition:background .15s ease,border-color .15s ease}",
			".mysch-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
			".mysch-btn:disabled{opacity:.5;cursor:default}",
			".mysch-btn-primary{border-color:transparent;color:#fff;background:var(--dsw-static-blue-600)}",
			".mysch-btn-primary:hover:not(:disabled){background:var(--dsw-static-blue-600);filter:brightness(1.08)}",
			".mysch-btn-danger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger);border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}",
			".mysch-btn-confirm{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}",
			".mysch-empty{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;padding:20px 12px;text-align:center}",
			".mysch-error{color:var(--dsw-alias-state-error-primary);font-size:13px;line-height:20px;padding:12px 14px;background:var(--dsw-alias-interactive-bg-hover-danger);border:1px solid var(--dsw-alias-border-l2);border-radius:12px}",
			".mysch-add{border-top:1px solid var(--dsw-alias-border-l1);padding:12px 14px;display:flex;flex-direction:column;gap:8px}"
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
		//#region components
		let boundT = (key) => key;
		let scopeRef = undefined;

		function Switch({ checked, onChange, disabled }) {
			return jsx("button", {
				type: "button",
				role: "switch",
				"aria-checked": checked,
				className: "mysch-switch" + (checked ? " mysch-switch-on" : ""),
				onClick: () => { if (!disabled) onChange(!checked); },
				disabled
			});
		}

		function BlurInput({ value, onCommit, className, placeholder }) {
			const [draft, setDraft] = useState(value);
			useEffect(() => { setDraft(value); }, [value]);
			return jsx("input", {
				type: "text",
				className: "mysch-input" + (className ? ` ${className}` : ""),
				value: draft,
				placeholder,
				spellCheck: false,
				onChange: (e) => setDraft(e.target.value),
				onBlur: () => { if (draft !== value) onCommit(draft.trim()); }
			});
		}

		/** Native date input that commits on change (YYYY-MM-DD or empty). */
		function DateInput({ value, onCommit, className }) {
			return jsx("input", {
				type: "date",
				className: "mysch-input" + (className ? ` ${className}` : ""),
				value: value ?? "",
				onChange: (e) => onCommit(e.target.value)
			});
		}

		/** Native time input that commits on change (HH:MM or empty). */
		function TimeInput({ value, onCommit, className }) {
			return jsx("input", {
				type: "time",
				className: "mysch-input" + (className ? ` ${className}` : ""),
				value: value ?? "",
				onChange: (e) => onCommit(e.target.value)
			});
		}

		/** Select (repeat mode). */
		function RepeatSelect({ value, onCommit }) {
			return jsxs("select", {
				className: "mysch-select",
				value: value ?? "none",
				onChange: (e) => onCommit(e.target.value),
				children: [
					jsx("option", { value: "none", children: boundT("repeat.none") }),
					jsx("option", { value: "daily", children: boundT("repeat.daily") }),
					jsx("option", { value: "weekday", children: boundT("repeat.weekday") }),
					jsx("option", { value: "weekend", children: boundT("repeat.weekend") })
				]
			});
		}

		function ConfirmButton({ label, confirmLabel, onConfirm, danger }) {
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
				className: "mysch-btn" + (danger ? " mysch-btn-danger" : "") + (armed ? " mysch-btn-confirm" : ""),
				onClick: fire,
				children: armed ? confirmLabel : label
			});
		}

		function TaskRow({ task, t, onChange }) {
			return jsxs("div", { className: "mysch-task", children: [
				jsxs("div", { className: "mysch-task-head", children: [
					jsx("span", { className: "mysch-task-name", children: task.name }),
					jsx(Switch, { checked: task.enabled === true, onChange: (v) => onChange({ op: "toggle", id: task.id }) }),
					jsx(ConfirmButton, { label: t("delete"), confirmLabel: t("confirmDelete"), danger: true, onConfirm: () => onChange({ op: "remove", id: task.id }) })
				] }),
				jsxs("div", { className: "mysch-task-fields", children: [
					jsxs("div", { className: "mysch-field", children: [
						jsx("span", { className: "mysch-field-label", children: t("prompt") }),
						jsx(BlurInput, { value: task.prompt ?? "", placeholder: t("promptPlaceholder"), onCommit: (v) => onChange({ op: "update", id: task.id, patch: { prompt: v } }) })
					] }),
					jsxs("div", { className: "mysch-field", children: [
						jsx("span", { className: "mysch-field-label", children: t("date") }),
						jsx(DateInput, { value: task.date, className: "mysch-input-sm", onCommit: (v) => onChange({ op: "update", id: task.id, patch: { date: v } }) })
					] }),
					jsxs("div", { className: "mysch-field", children: [
						jsx("span", { className: "mysch-field-label", children: t("time") }),
						jsx(TimeInput, { value: task.time, className: "mysch-input-sm", onCommit: (v) => onChange({ op: "update", id: task.id, patch: { time: v } }) })
					] }),
					jsxs("div", { className: "mysch-field", children: [
						jsx("span", { className: "mysch-field-label", children: t("repeat") }),
						jsx(RepeatSelect, { value: task.repeat, onCommit: (v) => onChange({ op: "update", id: task.id, patch: { repeat: v } }) })
					] }),
					jsxs("div", { className: "mysch-field", children: [
						jsx("span", { className: "mysch-field-label", children: t("interval") }),
						jsx(BlurInput, { value: String(task.intervalMinutes ?? 5), className: "mysch-input-num", onCommit: (v) => onChange({ op: "update", id: task.id, patch: { intervalMinutes: Number(v) || 5 } }) })
					] }),
					jsxs("div", { className: "mysch-field", children: [
						jsx("span", { className: "mysch-field-label", children: t("command") }),
						jsx(BlurInput, { value: task.command ?? "", placeholder: t("commandPlaceholder"), onCommit: (v) => onChange({ op: "update", id: task.id, patch: { command: v } }) })
					] })
				] })
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
			const setRow = (title, desc, field, checked) => jsxs("div", { className: "mysch-setrow", children: [
				jsxs("div", { className: "mysch-setrow-label", children: [
					jsx("div", { className: "mysch-setrow-title", children: title }),
					jsx("div", { className: "mysch-setrow-desc", children: desc })
				] }),
				jsx(Switch, { checked, onChange: (v) => setNotify(field, v), disabled: !notifyReady || !writable })
			] });
			const addTask = async () => {
				if (name.trim() === "") { setError(t("nameRequired")); return; }
				await runOp({ op: "add", name, prompt, time, date, repeat, intervalMinutes: Number(interval) || 5, command });
				setName(""); setPrompt(""); setTime(""); setDate(""); setRepeat("none"); setInterval("60"); setCommand("");
			};
			return jsxs("div", { className: "mysch-wrap", children: [
				jsx("p", { className: "mysch-hint", children: t("hint") }),
				error !== undefined ? jsx("div", { className: "mysch-error", children: error }) : null,
				jsxs("div", { className: "mysch-card" + (notifyOpen ? " mysch-open" : ""), children: [
					jsxs("button", { type: "button", className: "mysch-card-head", onClick: () => setNotifyOpen(!notifyOpen), children: [
						jsx("span", { children: t("notify.title") }),
						jsx("span", { className: "mysch-chevron", children: "▸" })
					] }),
					notifyOpen ? jsxs("div", { className: "mysch-card-body", children: [
						setRow(t("notify.enabled"), t("notify.enabledDesc"), "enabled", notifyConfig.enabled),
						setRow(t("notify.start"), t("notify.startDesc"), "notifyStart", notifyConfig.notifyStart),
						setRow(t("notify.done"), t("notify.doneDesc"), "notifyDone", notifyConfig.notifyDone),
						setRow(t("notify.schedule"), t("notify.scheduleDesc"), "notifySchedule", notifyConfig.notifySchedule)
					] }) : null
				] }),
				jsxs("div", { className: "mysch-card", children: [
					jsx("div", { className: "mysch-card-head", children: jsx("span", { children: t("tasks.title") }) }),
					tasks.length === 0 ? jsx("div", { className: "mysch-empty", children: t("tasks.empty") })
						: jsx("div", { className: "mysch-card-body mysch-list", children: tasks.map((task) => jsx(TaskRow, { task, t, onChange: runOp }, task.id)) }),
					jsxs("div", { className: "mysch-add", children: [
						jsxs("div", { className: "mysch-field", children: [
							jsx("span", { className: "mysch-field-label", children: t("name") }),
							jsx(BlurInput, { value: name, onCommit: (v) => setName(v), placeholder: t("namePlaceholder") })
						] }),
						jsxs("div", { className: "mysch-field", children: [
							jsx("span", { className: "mysch-field-label", children: t("prompt") }),
							jsx(BlurInput, { value: prompt, onCommit: (v) => setPrompt(v), placeholder: t("promptPlaceholder") })
						] }),
						jsxs("div", { className: "mysch-field", children: [
							jsx("span", { className: "mysch-field-label", children: t("date") }),
							jsx(DateInput, { value: date, className: "mysch-input-sm", onCommit: (v) => setDate(v) }),
							jsx("span", { className: "mysch-note", children: t("dateNote") })
						] }),
						jsxs("div", { className: "mysch-field", children: [
							jsx("span", { className: "mysch-field-label", children: t("time") }),
							jsx(TimeInput, { value: time, className: "mysch-input-sm", onCommit: (v) => setTime(v) }),
							jsx("span", { className: "mysch-note", children: t("timeNote") })
						] }),
						jsxs("div", { className: "mysch-field", children: [
							jsx("span", { className: "mysch-field-label", children: t("repeat") }),
							jsx(RepeatSelect, { value: repeat, onCommit: (v) => setRepeat(v) })
						] }),
						jsxs("div", { className: "mysch-field", children: [
							jsx("span", { className: "mysch-field-label", children: t("interval") }),
							jsx(BlurInput, { value: interval, className: "mysch-input-num", onCommit: (v) => setInterval(v) }),
							jsx("span", { className: "mysch-note", children: t("minNote") })
						] }),
						jsxs("div", { className: "mysch-field", children: [
							jsx("span", { className: "mysch-field-label", children: t("command") }),
							jsx(BlurInput, { value: command, onCommit: (v) => setCommand(v), placeholder: t("commandPlaceholder") })
						] }),
						jsxs("div", { className: "mysch-field", children: [
							jsx("span", { className: "mysch-field-label", children: "" }),
							jsx("button", { type: "button", className: "mysch-btn mysch-btn-primary", onClick: () => void addTask(), children: t("add") })
						] })
					] })
				] }),
				jsx("p", { className: "mysch-note", children: t("note") })
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
					"minNote": "至少 5 分钟",
					"command": "执行命令",
					"commandPlaceholder": "可选的 Windows 命令，如 notepad.exe",
					"add": "添加任务",
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
					"minNote": "at least 5 minutes",
					"command": "Command",
					"commandPlaceholder": "Optional Windows command, e.g. notepad.exe",
					"add": "Add task",
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

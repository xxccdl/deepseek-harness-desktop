// World clock — the browser half.
//
// Two surfaces share one module: a live clock in the sidebar foot, and the
// world-clock panel it opens. They sit in different slots, so the open state
// lives in a module-level store both halves subscribe to.
//
// It keeps to the published plugin contract: a module-loader entry, two slot
// registrations, no dependencies beyond react and the host's own services.
window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-world-clock",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const react = require("react");

		const NS = "ui-world-clock";

		// ── storage ───────────────────────────────────────────────────────────
		/** Cities the panel starts with; the first entry follows the local zone. */
		const DEFAULT_CITIES = [
			{ id: "local", label: "本机", zone: "" },
			{ id: "Asia/Tokyo", label: "东京", zone: "Asia/Tokyo" },
			{ id: "Europe/London", label: "伦敦", zone: "Europe/London" },
			{ id: "America/New_York", label: "纽约", zone: "America/New_York" }
		];
		/** Zones the add-city picker offers. */
		const CITY_CHOICES = [
			["", "本机时区"],
			["Asia/Shanghai", "上海"],
			["Asia/Tokyo", "东京"],
			["Asia/Seoul", "首尔"],
			["Asia/Singapore", "新加坡"],
			["Asia/Kolkata", "孟买"],
			["Asia/Dubai", "迪拜"],
			["Europe/Moscow", "莫斯科"],
			["Europe/Berlin", "柏林"],
			["Europe/Paris", "巴黎"],
			["Europe/London", "伦敦"],
			["UTC", "UTC"],
			["America/Sao_Paulo", "圣保罗"],
			["America/New_York", "纽约"],
			["America/Chicago", "芝加哥"],
			["America/Denver", "丹佛"],
			["America/Los_Angeles", "洛杉矶"],
			["Pacific/Auckland", "奥克兰"],
			["Australia/Sydney", "悉尼"]
		];
		/** Countdown length of the start button, in seconds. */
		const DEFAULT_TIMER_SECONDS = 5 * 60;
		/** Extra countdown shortcuts, in minutes. */
		const TIMER_PRESETS = [15, 25];

		// ── styles ────────────────────────────────────────────────────────────
		const css = [
			".dwclock{display:flex;flex-direction:column;gap:1px;min-width:0;font-variant-numeric:tabular-nums}",
			".dwclock-trigger{display:block;width:100%;box-sizing:border-box;padding:3px 6px;border:1px solid transparent;border-radius:8px;background:transparent;color:inherit;text-align:left;font:inherit;cursor:pointer;overflow:hidden;transition:background .15s ease,border-color .15s ease}",
			".dwclock-trigger:hover{background:var(--dsw-alias-bg-layer-1);border-color:var(--dsw-alias-border-l1)}",
			".dwclock-time{display:block;font-size:15px;font-weight:600;line-height:1.15;letter-spacing:.02em;color:var(--dsw-alias-label-primary)}",
			".dwclock-date{display:block;font-size:10px;line-height:1.2;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
			".dwclock-solo{display:block;font-size:11px;font-weight:600;text-align:center;color:var(--dsw-alias-label-primary)}",
			".dwclock-panel{position:fixed;left:8px;bottom:84px;z-index:2147483000;box-sizing:border-box;width:288px;max-height:70vh;overflow-y:auto;padding:12px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);box-shadow:0 12px 32px rgba(0,0,0,.2);pointer-events:auto;font-variant-numeric:tabular-nums}",
			".dwclock-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}",
			".dwclock-title{font-size:13px;font-weight:600}",
			".dwclock-sub{font-size:11px;margin-top:2px;color:var(--dsw-alias-label-secondary)}",
			".dwclock-big{font-size:26px;font-weight:700;letter-spacing:.02em;margin:8px 0 0}",
			".dwclock-section{font-size:11px;margin:12px 0 2px;color:var(--dsw-alias-label-secondary)}",
			".dwclock-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}",
			".dwclock-row:last-child{border-bottom:none}",
			".dwclock-row-main{display:flex;flex-direction:column;gap:1px;flex:1;min-width:0}",
			".dwclock-row-city{font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
			".dwclock-row-zone{font-size:10px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
			".dwclock-row-right{display:flex;align-items:center;gap:7px;flex:none}",
			".dwclock-row-time{font-size:13px;font-weight:600}",
			".dwclock-row-day{font-size:10px;white-space:nowrap;color:var(--dsw-alias-label-secondary)}",
			".dwclock-icon{appearance:none;border:none;padding:2px 5px;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:1;cursor:pointer}",
			".dwclock-icon:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}",
			".dwclock-foot{display:flex;align-items:center;gap:6px;margin-top:6px}",
			".dwclock-select{flex:1;min-width:0;box-sizing:border-box;padding:5px 6px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer}",
			".dwclock-btn{appearance:none;padding:5px 9px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;white-space:nowrap;cursor:pointer}",
			".dwclock-btn:hover{border-color:var(--dsw-alias-border-l2)}",
			".dwclock-timer{flex:none;min-width:66px;font-size:22px;font-weight:700;letter-spacing:.04em}"
		].join("");
		const cssTag = "@deepseek-ai/dsh-client-ui-world-clock/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(cssTag) + "]") === null) {
			const style = document.createElement("style");
			style.dataset.plugin = "@deepseek-ai/dsh-client-ui-world-clock";
			style.dataset.pluginCss = cssTag;
			style.textContent = css;
			document.head.appendChild(style);
		}

		// ── open state, shared by the foot clock and the panel ────────────────
		const view = { open: false, listeners: new Set() };
		/** Subscribe a component to the panel's open state. */
		function subscribe(listener) {
			view.listeners.add(listener);
			return () => {
				view.listeners.delete(listener);
			};
		}
		/** The open state as an external-store snapshot. */
		function snapshot() {
			return view.open;
		}
		/** Show or hide the panel and wake every subscriber. */
		function setOpen(next) {
			if (view.open === next) return;
			view.open = next;
			for (const listener of Array.from(view.listeners)) listener();
		}

		// ── time helpers (all real zone math, via Intl) ───────────────────────
		/** Zero-pad a number to two digits. */
		function pad(value) {
			return String(value).padStart(2, "0");
		}
		/** The machine's IANA zone, or a readable stand-in. */
		function localZone() {
			try {
				return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
			} catch (error) {
				return "Local";
			}
		}
		/** Read the actionable fields of one instant inside one zone. */
		function zoneParts(at, zone) {
			const options = {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hourCycle: "h23",
				timeZoneName: "shortOffset",
				weekday: "short",
				month: "2-digit",
				day: "2-digit"
			};
			if (zone) options.timeZone = zone;
			const parts = {};
			try {
				for (const part of new Intl.DateTimeFormat("zh-CN", options).formatToParts(at)) parts[part.type] = part.value;
			} catch (error) {
				// An unknown zone falls back to a zeroed reading instead of throwing.
			}
			const rawHour = String(parts.hour || "00").replace(/\D/g, "");
			return {
				time: pad(rawHour === "" ? "00" : rawHour) + ":" + (parts.minute || "00") + ":" + (parts.second || "00"),
				weekday: parts.weekday || "",
				date: (parts.month || "") + "/" + (parts.day || ""),
				offset: parts.timeZoneName || ""
			};
		}
		/** Just the time part, for the collapsed rail. */
		function shortTime(at, zone) {
			return zoneParts(at, zone).time.slice(0, 5);
		}
		/** The calendar day of one instant inside one zone. */
		function dayKey(at, zone) {
			const options = { year: "numeric", month: "2-digit", day: "2-digit" };
			if (zone) options.timeZone = zone;
			const parts = {};
			try {
				for (const part of new Intl.DateTimeFormat("en-CA", options).formatToParts(at)) parts[part.type] = part.value;
			} catch (error) {
				return "";
			}
			return (parts.year || "") + "-" + (parts.month || "") + "-" + (parts.day || "");
		}
		/** The 昨天 / 明天 badge for a zone that is not on the local calendar day. */
		function dayTag(at, zone) {
			if (!zone) return "";
			const theirs = Date.parse(dayKey(at, zone) + "T00:00:00Z");
			const local = Date.parse(dayKey(at, "") + "T00:00:00Z");
			if (Number.isNaN(theirs) || Number.isNaN(local)) return "";
			const delta = Math.round((theirs - local) / 86400000);
			if (delta === 0) return "";
			if (delta === 1) return "明天";
			if (delta === -1) return "昨天";
			return delta > 0 ? "+" + delta + "天" : delta + "天";
		}
		/** The tail of an IANA zone, for a compact label. */
		function zoneLabel(zone) {
			const resolved = zone || localZone();
			const cut = resolved.lastIndexOf("/");
			return cut === -1 ? resolved : resolved.slice(cut + 1).replace(/_/g, " ");
		}

		// ── the foot clock ────────────────────────────────────────────────────
		/** A second-resolution clock in the sidebar foot; clicking it opens the panel. */
		function ClockFoot(props) {
			const state = react.useState(() => new Date());
			const now = state[0];
			const setNow = state[1];
			const open = react.useSyncExternalStore(subscribe, snapshot, snapshot);
			react.useEffect(() => {
				const timer = setInterval(() => {
					setNow(new Date());
				}, 1000);
				return () => {
					clearInterval(timer);
				};
			}, [setNow]);
			const reading = zoneParts(now, "");
			const title = `${props.t("title")} ${reading.time} · ${zoneLabel("")}`;
			if (props.wide === false) {
				return react.createElement("span", { className: "dwclock-solo", title }, shortTime(now, ""));
			}
			return react.createElement(
				"button",
				{
					type: "button",
					className: "dwclock",
					title,
					"aria-expanded": open,
					onClick: () => {
						setOpen(!view.open);
					}
				},
				react.createElement("span", { className: "dwclock-trigger" },
					react.createElement("span", { className: "dwclock-time" }, reading.time)),
				react.createElement("span", { className: "dwclock-trigger" },
					react.createElement("span", { className: "dwclock-date" },
						`${reading.weekday} ${reading.date} · ${zoneLabel("")}`))
			);
		}

		// ── the world-clock panel ─────────────────────────────────────────────
		/** One city row: its label, its real zone, the time there, and its day badge. */
		function CityRow(props) {
			const reading = zoneParts(props.now, props.city.zone);
			const tag = dayTag(props.now, props.city.zone);
			const zone = props.city.zone || localZone();
			return react.createElement(
				"div",
				{ className: "dwclock-row" },
				react.createElement("div", { className: "dwclock-row-main" },
					react.createElement("div", { className: "dwclock-row-city" }, props.city.label),
					react.createElement("div", { className: "dwclock-row-zone" }, `${zone} · ${reading.offset}`)),
				react.createElement("div", { className: "dwclock-row-right" },
					react.createElement("span", { className: "dwclock-row-time" }, reading.time),
					react.createElement("span", { className: "dwclock-row-day" }, tag === "" ? reading.date : `${reading.date} ${tag}`),
					props.city.id === "local" ? null : react.createElement("button", {
						type: "button",
						className: "dwclock-icon",
						title: props.t("remove"),
						onClick: () => {
							props.onRemove(props.city.id);
						}
					}, "×"))
			);
		}

		/** The panel body: local time, the city list, and a countdown. */
		function ClockPanel(props) {
			const nowState = react.useState(() => new Date());
			const now = nowState[0];
			const citiesState = react.useState(DEFAULT_CITIES);
			const cities = citiesState[0];
			const pickState = react.useState("Asia/Tokyo");
			const pick = pickState[0];
			const timerState = react.useState(null);
			const timer = timerState[0];
			const setTimer = timerState[1];
			const running = timer !== null && timer > 0;

			react.useEffect(() => {
				const tick = setInterval(() => {
					nowState[1](new Date());
				}, 1000);
				return () => {
					clearInterval(tick);
				};
			}, [nowState]);

			react.useEffect(() => {
				if (!running) return undefined;
				const tick = setInterval(() => {
					setTimer((current) => {
						if (current === null) return null;
						if (current <= 1) return 0;
						return current - 1;
					});
				}, 1000);
				return () => {
					clearInterval(tick);
				};
			}, [running, setTimer]);

			/** Append the picked zone, unless it is already listed. */
			function addCity() {
				if (pick === "") return;
				for (const city of cities) {
					if (city.id === pick) return;
				}
				let label = zoneLabel(pick);
				for (const choice of CITY_CHOICES) {
					if (choice[0] === pick) label = choice[1];
				}
				citiesState[1](cities.concat([{ id: pick, label, zone: pick }]));
				pickState[1]("");
			}
			/** Run, pause, or restart the countdown. */
			function toggleTimer() {
				if (running) {
					setTimer(0);
					return;
				}
				setTimer(timer !== null && timer > 0 ? timer : DEFAULT_TIMER_SECONDS);
			}

			const local = zoneParts(now, "");
			const remaining = timer === null ? 0 : Math.max(0, timer);
			const timerLabel = running ? props.t("pause") : remaining > 0 ? props.t("resume") : props.t("start");

			return react.createElement(
				"div",
				{ className: "dwclock-panel" },
				react.createElement("div", { className: "dwclock-head" },
					react.createElement("div", null,
						react.createElement("div", { className: "dwclock-title" }, props.t("panel")),
						react.createElement("div", { className: "dwclock-sub" }, `${props.t("localZone")} ${localZone()}`)),
					react.createElement("button", {
						type: "button",
						className: "dwclock-icon",
						title: props.t("close"),
						onClick: () => {
							setOpen(false);
						}
					}, "✕")),
				react.createElement("div", { className: "dwclock-big" }, local.time),
				react.createElement("div", { className: "dwclock-sub" }, `${local.weekday} ${local.date} · ${local.offset}`),
				react.createElement("div", { className: "dwclock-section" }, props.t("world")),
				cities.map((city) => react.createElement(CityRow, {
					key: city.id,
					city,
					now,
					t: props.t,
					onRemove: (id) => {
						citiesState[1](cities.filter((item) => item.id !== id));
					}
				})),
				react.createElement("div", { className: "dwclock-foot" },
					react.createElement("select", {
						className: "dwclock-select",
						value: pick,
						"aria-label": props.t("add"),
						onChange: (event) => {
							pickState[1](event.target.value);
						}
					}, CITY_CHOICES.map((choice) => react.createElement("option", {
						key: choice[0] === "" ? "local" : choice[0],
						value: choice[0]
					}, choice[1]))),
					react.createElement("button", { type: "button", className: "dwclock-btn", onClick: addCity }, props.t("add"))),
				react.createElement("div", { className: "dwclock-section" }, props.t("timer")),
				react.createElement("div", { className: "dwclock-foot" },
					react.createElement("span", { className: "dwclock-timer" }, `${pad(Math.floor(remaining / 60))}:${pad(remaining % 60)}`),
					react.createElement("button", { type: "button", className: "dwclock-btn", onClick: toggleTimer }, timerLabel),
					react.createElement("button", {
						type: "button",
						className: "dwclock-btn",
						onClick: () => {
							setTimer(null);
						}
					}, props.t("reset")),
					TIMER_PRESETS.map((minutes) => react.createElement("button", {
						key: minutes,
						type: "button",
						className: "dwclock-btn",
						onClick: () => {
							setTimer(minutes * 60);
						}
					}, `${minutes}${props.t("minutes")}`)))
			);
		}

		/** The frame-wide layer that hosts the panel while it is open. */
		function ClockPanelLayer(props) {
			const open = react.useSyncExternalStore(subscribe, snapshot, snapshot);
			if (!open) return null;
			return react.createElement(ClockPanel, { t: props.t });
		}

		// ── plugin ────────────────────────────────────────────────────────────
		/** Register the dictionaries and both surfaces. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh: {
					title: "当前时间（本机）",
					panel: "时间",
					localZone: "本机时区",
					world: "世界时钟",
					timer: "倒计时",
					add: "＋ 加城市",
					remove: "移除该城市",
					close: "关闭",
					start: "开始 5 分钟",
					pause: "暂停",
					resume: "继续",
					reset: "清零",
					minutes: "分"
				},
				en: {
					title: "Current time (local)",
					panel: "Time",
					localZone: "Local zone",
					world: "World clock",
					timer: "Countdown",
					add: "+ Add city",
					remove: "Remove this city",
					close: "Close",
					start: "Start 5 min",
					pause: "Pause",
					resume: "Resume",
					reset: "Reset",
					minutes: "m"
				}
			}), "ui-world-clock: dictionaries");
			ctx.slots.inject("sidebar.footer.status", () => ctx.slots.register({
				name: "sidebar.footer.status",
				id: "world-clock",
				order: 30,
				locale: NS
			}, ClockFoot));
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "world-clock-panel",
				order: 60,
				locale: NS
			}, ClockPanelLayer));
		}

		exports.apply = apply;
		exports.inject = ["slots", "locale"];
		return module.exports;
	}
});

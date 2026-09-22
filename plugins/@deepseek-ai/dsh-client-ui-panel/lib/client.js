// DeepSeek peak/off-peak pricing chip — the browser half.
//
// One surface, one control: `conversation.composer.dock` carries the chip that
// names the current billing period and the output price, and opens the price
// table. This package used to be a control panel: a drawer of the agent's live
// actions with a toggle in the bar, a second in the session header and a third
// in the toolbar, plus a PowerShell pane bridged by
// `@deepseek-ai/dsh-host-shellpanel`. Every one of those is gone — the panes,
// the toggles, the `jobs` subscription behind the drawer, and the header
// toolbar whose folder/menu/sidebar buttons repeated what the header already
// had. The model's persistent `pwsh` tool owns its PTY alone.
window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-panel",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const react = require("react");
		const react_jsx_runtime = require("react/jsx-runtime");
		const primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		const jsx = react_jsx_runtime.jsx;
		const jsxs = react_jsx_runtime.jsxs;
		//#region styles
		// One control, one scale: the dock lays its entries out in a row (the chat
		// stats strip is the entry before this one) and the chip sits on that line
		// at the same 28px height and 11.5px label size as the pills beside it.
		const css = [
			".dsp-root{display:flex;align-items:center;min-width:0;font:12px/1.5 inherit;color:var(--dsw-alias-label-secondary)}",
			".dsp-bar{display:flex;align-items:center;gap:8px}",
			".dsp-price-trigger:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}",
			/* ── the price chip + its popover ── */
			/* ── price chip + popover ── */
			// The chip is the panel's one always-on control, so it is built like a
			// real button: its own surface, a live period lamp, a hairline between
			// the period and the number, and a chevron that turns over while the
			// table is open — press, hover and open all read differently.
			".dsp-price{position:relative;display:inline-flex;align-items:center;flex:none}",
			".dsp-price-trigger{all:unset;display:inline-flex;align-items:center;gap:7px;height:28px;padding:0 8px 0 9px;box-sizing:border-box;border-radius:9px;cursor:pointer;color:var(--dsw-alias-label-tertiary);font-size:11.5px;background:var(--dsw-alias-bg-layer-1);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l1);transition:background .18s ease,color .18s ease,box-shadow .18s ease,transform .12s ease}",
			".dsp-price-trigger:hover{color:var(--dsw-alias-label-secondary);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l2)}",
			".dsp-price-trigger:active{transform:scale(.975);background:var(--dsw-alias-interactive-bg-hover)}",
			".dsp-price-trigger[aria-expanded='true']{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l2)}",
			".dsp-price-dot{width:6px;height:6px;border-radius:50%;flex:none;transition:background .3s ease,box-shadow .3s ease}",
			".dsp-price-dot[data-peak='false']{background:var(--dsw-alias-state-success-primary);box-shadow:0 0 0 3px rgba(34,173,102,.16)}",
			// Peak is the period that costs more, so its lamp breathes rather than
			// merely switching colour.
			".dsp-price-dot[data-peak='true']{background:var(--dsw-alias-state-warn-label);animation:dspLamp 2.4s ease-in-out infinite}",
			"@keyframes dspLamp{0%,100%{box-shadow:0 0 0 3px rgba(214,146,26,.14)}50%{box-shadow:0 0 0 5px rgba(214,146,26,.24)}}",
			".dsp-price-sep{flex:none;width:1px;height:11px;background:var(--dsw-alias-border-l2)}",
			".dsp-price-price{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;transition:color .18s ease}",
			".dsp-price-trigger[aria-expanded='true'] .dsp-price-price{color:var(--dsw-alias-label-primary)}",
			".dsp-price-chev{flex:none;color:var(--dsw-alias-label-dimmed);transition:transform .3s cubic-bezier(.22,1,.36,1),color .18s ease}",
			".dsp-price-trigger:hover .dsp-price-chev{color:var(--dsw-alias-label-tertiary)}",
			".dsp-price-trigger[aria-expanded='true'] .dsp-price-chev{transform:rotate(180deg);color:var(--dsw-alias-label-tertiary)}",
			".dsp-pop{position:absolute;z-index:40;box-sizing:border-box;width:298px;padding:13px 15px;border-radius:14px;box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l1),0 18px 44px -14px rgba(16,20,32,.24),0 2px 8px rgba(16,20,32,.06);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);animation:dspPop .18s cubic-bezier(.22,1,.36,1)}",
			".dsp-pop[data-side='up']{bottom:calc(100% + 8px);transform-origin:bottom right}",
			".dsp-pop[data-align='end']{right:0}",
			"@keyframes dspPop{from{opacity:0;transform:translateY(4px) scale(.985)}to{opacity:1;transform:none}}",
			".dsp-pop-head{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:500;color:var(--dsw-alias-label-primary)}",
			".dsp-pop-head svg{width:15px;height:15px;flex:none;color:var(--dsw-alias-label-tertiary)}",
			".dsp-pop-sub{margin-top:3px;color:var(--dsw-alias-label-tertiary);font-size:11.5px;font-variant-numeric:tabular-nums}",
			".dsp-price-table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}",
			// The table arrives in reading order — head, then one row after the
			// next — so the numbers feel laid down rather than flipped on.
			".dsp-pop-head,.dsp-pop-sub{animation:dspRise .34s cubic-bezier(.22,1,.36,1) backwards}",
			".dsp-price-table tbody tr{animation:dspRise .34s cubic-bezier(.22,1,.36,1) backwards}",
			".dsp-price-table tbody tr:nth-child(1){animation-delay:.04s}",
			".dsp-price-table tbody tr:nth-child(2){animation-delay:.07s}",
			".dsp-price-table tbody tr:nth-child(3){animation-delay:.1s}",
			".dsp-price-table tbody tr:nth-child(4){animation-delay:.13s}",
			".dsp-price-table tbody tr:nth-child(5){animation-delay:.16s}",
			".dsp-price-table tbody tr:nth-child(6){animation-delay:.19s}",
			".dsp-price-table tbody tr:nth-child(7){animation-delay:.22s}",
			".dsp-price-table tbody tr:nth-child(n+8){animation-delay:.25s}",
			".dsp-price-table th,.dsp-price-table td{padding:3px 0;font-size:11.5px;white-space:nowrap}",
			".dsp-price-table th{font-weight:400;color:var(--dsw-alias-label-caption);text-align:right}",
			".dsp-price-table th:first-child,.dsp-price-table td:first-child{text-align:left;color:var(--dsw-alias-label-tertiary)}",
			".dsp-price-table td:not(:first-child){width:62px;text-align:right}",
			".dsp-price-table tr+tr td{box-shadow:inset 0 1px 0 0 var(--dsw-alias-border-l1)}",
			".dsp-price-table tr[data-group='true'] td{padding-top:10px;box-shadow:inset 0 1px 0 0 var(--dsw-alias-border-l1);color:var(--dsw-alias-label-caption);font-size:10.5px;letter-spacing:.05em}",
			".dsp-price-table [data-now='true']{color:var(--dsw-alias-label-primary);font-weight:600}",
			".dsp-price-note{margin-top:11px;padding-top:9px;box-shadow:inset 0 1px 0 0 var(--dsw-alias-border-l1);color:var(--dsw-alias-label-caption);font-size:10.5px;line-height:1.55;animation:dspRise .34s cubic-bezier(.22,1,.36,1) .26s backwards}",
			// Everything above is decoration: with reduced motion the panel keeps
			// its states and drops only the travel.
			"@media (prefers-reduced-motion: reduce){.dsp-price-trigger{transition:none}.dsp-price-chev{transition:none}.dsp-pop,.dsp-pop-head,.dsp-pop-sub,.dsp-price-table tbody tr,.dsp-price-note{animation:none}.dsp-price-dot{animation:none}}",
			/* ── the composer's queue panel ── */
			// Sending a message parks it in `inbox.next-turn` for the ~90ms the host
			// takes to start the turn, and the queue panel lives in the composer
			// stack's flow — so the card below it, bottom-anchored to the viewport,
			// jumped ~37px up and back on every send (measured frame by frame). Two
			// rules take the queue out of that equation, both keyed on the panel's
			// own `data-queue-dock` hook rather than its hashed class:
			//   · absolutely positioned on the seat, so its height never reaches the
			//     stack and the card cannot move — the panel still draws on the
			//     card's top edge, overlapping it by the same 9px its negative
			//     margin always did, so the look is unchanged;
			//   · held invisible for 180ms, longer than that transient, so a queue
			//     that drains on its own is never painted at all. A queue that
			//     outlives the delay fades in as usual.
			"[data-composer-seat]{position:relative}",
			"[data-queue-dock]{position:absolute;bottom:100%;left:0;right:0;animation:dspQueueIn .16s ease .18s backwards}",
			"@keyframes dspQueueIn{from{opacity:0;transform:translateY(3px)}}"
		].join("");
		const tagId = "@deepseek-ai/dsh-client-ui-panel/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-panel";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region icons
		// Names follow the primitives' 0.1.7 catalogue (`...OutlineRegular`): the
		// rc.6 `...Outline16` spellings no longer resolve, and a blank button is
		// what a missing icon looks like.
		/** Resolve a primitive icon once, tolerating one that is absent from this build. */
		function icon(name) {
			const resolved = primitives[name];
			if (typeof resolved === "function") return resolved;
			return function IconAbsent() {
				return null;
			};
		}
		const IconChevronDown = icon("IconChevronDownOutlineRegular");
		const IconClock = icon("IconClockOutlineRegular");
		//#endregion
		//#region pricing
		// DeepSeek publishes one price per model and token kind with an off-peak
		// half: peak is Beijing time Monday–Friday 09:00–12:00 and 14:00–18:00.
		const PEAK_WINDOWS = [[540, 720], [840, 1080]];
		const PRICE_TIERS = [
			{
				id: "flash",
				name: "DeepSeek-V4.1-Flash",
				cacheHit: [0.02, 0.04],
				cacheMiss: [1, 2],
				output: [4, 8]
			},
			{
				id: "pro",
				name: "DeepSeek-V4-Pro-0813",
				cacheHit: [0.15, 0.3],
				cacheMiss: [4.5, 9],
				output: [13.5, 27]
			}
		];
		/**
		* Which published price list the addressed Session bills against. A route
		* outside the DeepSeek provider has no entry in this table, so the hint
		* hides rather than quoting a price that does not apply.
		* @param selection - the Session's projected model selection, if any.
		* @returns the tier id, or null when this route is not DeepSeek's.
		*/
		function tierOf(selection) {
			if (selection === undefined || selection === null) return "flash";
			const provider = selection.provider;
			if (typeof provider === "string" && provider.length > 0 && !/deepseek/i.test(provider)) return null;
			const model = typeof selection.model === "string" ? selection.model : "";
			return /pro/i.test(model) ? "pro" : "flash";
		}
		/** Beijing-time weekday index (0 = Monday) and minute-of-day for one instant. */
		function beijingClock(now) {
			const shifted = new Date(now + 8 * 3600 * 1000);
			const day = shifted.getUTCDay();
			const minutes = shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
			return {
				weekday: (day + 6) % 7,
				minutes
			};
		}
		/** Whether one weekday/minute pair sits inside a peak window. */
		function isPeak(weekday, minutes) {
			if (weekday > 4) return false;
			return PEAK_WINDOWS.some(([start, end]) => minutes >= start && minutes < end);
		}
		/**
		* The transition ahead of one Beijing instant. While peak is on, that is the
		* end of the current window; otherwise it is the next weekday peak start.
		* Weekends contribute no boundary at all — the whole weekend is off-peak, so
		* Saturday 09:00 and 14:00 begin and end nothing, and a countdown that
		* treated them as edges promised a peak that never arrives.
		* @param weekday - Beijing weekday index (0 = Monday).
		* @param minutes - Beijing minute of day.
		* @returns minutes until the transition, its direction, and where it lands,
		*   or null when no peak opens within the week.
		*/
		function nextTransition(weekday, minutes) {
			if (isPeak(weekday, minutes)) {
				const end = minutes < PEAK_WINDOWS[0][1] ? PEAK_WINDOWS[0][1] : PEAK_WINDOWS[1][1];
				return {
					delta: end - minutes,
					toPeak: false,
					weekday,
					minutes: end
				};
			}
			for (let offset = 0; offset < 8; offset += 1) {
				const day = (weekday + offset) % 7;
				if (day > 4) continue;
				for (const [start] of PEAK_WINDOWS) {
					const at = offset * 1440 + start;
					if (at > minutes) return {
						delta: at - minutes,
						toPeak: true,
						weekday: day,
						minutes: start
					};
				}
			}
			return null;
		}
		/** Human countdown from one minute count. */
		function formatCountdown(minutes) {
			if (minutes < 1) return "不到 1 分钟";
			const total = Math.round(minutes);
			const days = Math.floor(total / 1440);
			const hours = Math.floor(total % 1440 / 60);
			const mins = total % 60;
			if (days > 0) return days + " 天 " + hours + " 小时";
			if (hours > 0) return hours + " 小时 " + mins + " 分钟";
			return mins + " 分钟";
		}
		/** Beijing wall clock of one minute-of-day, as HH:MM. */
		function formatClock(minutes) {
			return String(Math.floor(minutes / 60)).padStart(2, "0") + ":" + String(minutes % 60).padStart(2, "0");
		}
		/** Format one price for the table. */
		function formatPrice(value) {
			return "¥" + (Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0$/, ""));
		}
		/** Live Beijing clock, refreshed only while a price surface is visible. */
		function usePeakClock(active) {
			const [now, setNow] = react.useState(() => Date.now());
			react.useEffect(() => {
				if (!active) return undefined;
				setNow(Date.now());
				const timer = setInterval(() => {
					setNow(Date.now());
				}, 30000);
				return () => {
					clearInterval(timer);
				};
			}, [active]);
			const { weekday, minutes } = beijingClock(now);
			const peak = isPeak(weekday, minutes);
			const transition = nextTransition(weekday, minutes);
			return {
				peak,
				transition: transition === null ? null : {
					...transition,
					clock: formatClock(transition.minutes),
					duration: formatCountdown(transition.delta)
				}
			};
		}
		/** The price hint: current period, countdown, and the published table. */
		function PriceHint({ t, tier }) {
			const [open, setOpen] = react.useState(false);
			const rootRef = react.useRef(null);
			const clock = usePeakClock(true);
			primitives.useDismissOnOutsidePointer(rootRef, open, setOpen);
			const index = clock.peak ? 1 : 0;
			const headline = t(clock.peak ? "pricing.peak" : "pricing.idle");
			const current = PRICE_TIERS.find((entry) => entry.id === tier) ?? PRICE_TIERS[0];
			const kinds = [
				["pricing.cacheHit", "cacheHit"],
				["pricing.cacheMiss", "cacheMiss"],
				["pricing.output", "output"]
			];
			return jsxs("div", {
				className: "dsp-price",
				ref: rootRef,
				children: [jsxs("button", {
					type: "button",
					className: "dsp-price-trigger",
					"aria-expanded": open,
					title: t("pricing.title"),
					onClick: () => {
						setOpen((value) => !value);
					},
					children: [jsx("span", {
						className: "dsp-price-dot",
						"data-peak": String(clock.peak)
					}), jsx("span", { children: headline }), jsx("span", { className: "dsp-price-sep" }), jsx("span", {
						className: "dsp-price-price",
						children: t("pricing.outputAt", { price: formatPrice(current.output[index]) })
					}), jsx(IconChevronDown, {
						className: "dsp-price-chev",
						"aria-hidden": true
					})]
				}), open ? jsxs("div", {
					className: "dsp-pop",
					"data-side": "up",
					"data-align": "end",
					children: [
						jsxs("div", {
							className: "dsp-pop-head",
							children: [jsx(IconClock, {}), jsx("span", { children: headline })]
						}),
						jsx("div", {
							className: "dsp-pop-sub",
							children: clock.transition === null ? t("pricing.window") : clock.transition.toPeak ? t("pricing.untilPeak", {
								duration: clock.transition.duration,
								weekday: t("pricing.weekday." + String(clock.transition.weekday)),
								clock: clock.transition.clock
							}) : t("pricing.untilIdle", { duration: clock.transition.duration })
						}),
						jsxs("table", {
							className: "dsp-price-table",
							style: { marginTop: 10 },
							children: [
								jsx("thead", { children: jsxs("tr", { children: [
									jsx("th", { children: t("pricing.kind") }),
									jsx("th", { children: t("pricing.idle") }),
									jsx("th", { children: t("pricing.peak") })
								] }) }),
								jsx("tbody", { children: PRICE_TIERS.flatMap((entry) => [
									jsx("tr", {
										"data-group": "true",
										children: jsx("td", {
											colSpan: 3,
											children: entry.name + (entry.id === tier ? " · " + t("pricing.current") : "")
										})
									}, entry.id + "-group"),
									...kinds.map(([key, field]) => jsxs("tr", {
										children: [
											jsx("td", { children: t(key) }),
											jsx("td", {
												"data-now": String(index === 0),
												children: formatPrice(entry[field][0])
											}),
											jsx("td", {
												"data-now": String(index === 1),
												children: formatPrice(entry[field][1])
											})
										]
									}, entry.id + "-" + field))
								]) })
							]
						}),
						jsx("div", {
							className: "dsp-price-note",
							children: t("pricing.unit")
						})
					]
				}) : null]
			});
		}
		//#endregion
		//#endregion
		//#region pricing bar
		/**
		* The panel's whole surface: the pricing chip the composer dock carries.
		*
		* It used to open onto a drawer of the agent's live actions, with a toggle in
		* this bar, a second one in the session header and a third in the toolbar. All
		* three toggles and the drawer are gone; the chip is what the panel is.
		* @param props - the slot entry's share: the projection hook and the locale seat.
		*/
		function PriceBar({ useProjection, t }) {
			const tier = tierOf(useProjection("modelSelection"));
			return jsx("div", {
				className: "dsp-root",
				children: jsx("div", {
					className: "dsp-bar",
					children: tier === null ? null : jsx(PriceHint, { t, tier })
				})
			});
		}
		//#region locales
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"pricing.title": "DeepSeek 峰谷定价",
			"pricing.idle": "空闲时段",
			"pricing.peak": "高峰时段",
			"pricing.current": "当前使用",
			"pricing.window": "高峰：北京时间周一至周五 09:00–12:00、14:00–18:00",
			"pricing.untilPeak": "距高峰还有 {duration} · {weekday} {clock} 起",
			"pricing.untilIdle": "高峰中，距空闲还有 {duration}",
			"pricing.weekday.0": "周一",
			"pricing.weekday.1": "周二",
			"pricing.weekday.2": "周三",
			"pricing.weekday.3": "周四",
			"pricing.weekday.4": "周五",
			"pricing.weekday.5": "周六",
			"pricing.weekday.6": "周日",
			"pricing.kind": "元 / 百万 tokens",
			"pricing.cacheHit": "缓存命中输入",
			"pricing.cacheMiss": "缓存未命中输入",
			"pricing.output": "输出",
			"pricing.outputAt": "输出 {price}/M",
			"pricing.unit": "空闲价格为高峰价格的一半，以 DeepSeek 官方价目为准。"
		};
		/** English dictionary, key-identical to the Chinese source of truth. */
		const en = {
			"pricing.title": "DeepSeek peak / off-peak pricing",
			"pricing.idle": "Off-peak",
			"pricing.peak": "Peak",
			"pricing.current": "in use",
			"pricing.window": "Peak: Beijing time Mon–Fri 09:00–12:00 and 14:00–18:00",
			"pricing.untilPeak": "Peak starts in {duration} · {weekday} {clock}",
			"pricing.untilIdle": "Off-peak starts in {duration}",
			"pricing.weekday.0": "Mon",
			"pricing.weekday.1": "Tue",
			"pricing.weekday.2": "Wed",
			"pricing.weekday.3": "Thu",
			"pricing.weekday.4": "Fri",
			"pricing.weekday.5": "Sat",
			"pricing.weekday.6": "Sun",
			"pricing.kind": "CNY / million tokens",
			"pricing.cacheHit": "cache hit input",
			"pricing.cacheMiss": "cache miss input",
			"pricing.output": "output",
			"pricing.outputAt": "output {price}/M",
			"pricing.unit": "Off-peak is half the peak price; the official DeepSeek price list prevails."
		};
		//#endregion
		//#region plugin
		/** Locale namespace the chip binds its labels to. */
		const NS = "ui-panel";
		/** Client services required by the chip. */
		const inject = ["slots", "locale"];
		/** Projection hook that answers nothing when the slot supplies no store. */
		function useNoProjection() {
			return undefined;
		}
		/** Bind the projection store and the locale seat into the bar. */
		function BarEntry(props) {
			return jsx(PriceBar, {
				useProjection: props.useProjection ?? useNoProjection,
				t: props.t
			});
		}
		/**
		* Client plugin body: register the dictionaries and the pricing bar.
		* `conversation.composer.dock` order 20 keeps the chip after the chat stats
		* strip that occupies order 0.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-panel: dictionaries");
			ctx.slots.inject("conversation.composer.dock", () => ctx.slots.register({
				name: "conversation.composer.dock",
				id: "control-panel",
				order: 20,
				locale: NS
			}, BarEntry));
		}
		//#endregion
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});

// Desktop control panel — the browser half.
//
// Three surfaces, one package:
//   1. `conversation.composer.dock` — the bottom drawer. Its always-visible bar
//      holds the pane tabs and the DeepSeek peak/off-peak pricing hint; the
//      drawer under it shows the agent's live actions (background jobs and
//      delegated subagents) and the PowerShell terminal the model itself runs
//      in, served by `@deepseek-ai/dsh-host-shellpanel` over /api/shellpanel.
//   2. `conversation.session.header.utilities` — the right-aligned session
//      toolbar (workspace folder, terminal actions, drawer toggle, sidebar).
//   3. `conversation.composer.dock` again, at a later order, is not used: the
//      pricing hint rides inside the drawer bar above.
//
// The terminal is genuinely shared: the host bridge and the model's persistent
// `pwsh` tool drive one owner-scoped PTY session, so this pane is a window onto
// the model's own shell rather than a second one.
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
		// A single type and spacing scale for both surfaces: 11/11.5/12px labels,
		// 8/10/14px radii, one border token, one shadow token. Sections are ruled
		// rather than boxed, so the drawer reads as one surface instead of a stack
		// of cards.
		const css = [
			// The dock column keeps the width the harness gives its own dock
			// entries (`--dsh-chat-content-width`: the composer card minus the
			// dock inset on both sides). A full-bleed bar sprawled past the card
			// and ran underneath its bottom-left corner, where the composer keeps
			// its "+" (commands) button — the bar looked like it was covering it.
			".dsp-root{width:100%;max-width:var(--dsh-chat-content-width,680px);margin:0 auto;box-sizing:border-box;display:flex;flex-direction:column;font:12px/1.5 inherit;color:var(--dsw-alias-label-secondary)}",
			/* ── the always-visible control bar ── */
			".dsp-bar{display:flex;align-items:center;gap:8px;min-height:32px;margin-top:8px;padding:2px 0 0}",
			/* tabs: one inset track, one thumb that glides between the two panes.
			   While the agent is working a soft sweep runs under the track instead
			   of a spinner — the bar keeps its calm, but it is never still. */
			".dsp-tabs{position:relative;display:flex;flex:none;box-sizing:border-box;width:208px;height:30px;padding:3px;border-radius:11px;background:var(--dsw-alias-bg-module-platform);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l1)}",
			".dsp-tabs:after{content:'';position:absolute;left:6px;right:6px;bottom:-6px;height:1.5px;border-radius:2px;opacity:0;background:linear-gradient(90deg,transparent,var(--dsw-alias-brand-primary),transparent) no-repeat;background-size:36% 100%;background-position:-40% 0;transition:opacity .3s ease}",
			".dsp-tabs[data-live='true']:after{opacity:.75;animation:dspSweep 1.9s cubic-bezier(.45,.05,.55,.95) infinite}",
			"@keyframes dspSweep{from{background-position:-40% 0}to{background-position:140% 0}}",
			".dsp-tabs-thumb{position:absolute;top:3px;left:3px;width:calc(50% - 3px);height:calc(100% - 6px);border-radius:8px;background:var(--dsw-alias-bg-layer-1);box-shadow:0 1px 2px rgba(16,20,32,.09),0 0 0 1px rgba(16,20,32,.04);transition:transform .42s cubic-bezier(.22,1,.36,1)}",
			".dsp-tab{all:unset;position:relative;z-index:1;flex:1 1 0;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:100%;box-sizing:border-box;cursor:pointer;font-size:12px;color:var(--dsw-alias-label-tertiary);transition:color .2s ease,transform .12s ease}",
			".dsp-tab:hover{color:var(--dsw-alias-label-secondary)}",
			".dsp-tab:active{transform:scale(.96)}",
			".dsp-tab[data-active='true']{color:var(--dsw-alias-label-primary);font-weight:500}",
			".dsp-tab-count{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 5px;box-sizing:border-box;border-radius:8px;background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:1;font-variant-numeric:tabular-nums;transition:color .2s ease;animation:dspBadge .34s cubic-bezier(.22,1,.36,1) backwards}",
			"@keyframes dspBadge{from{opacity:0;transform:scale(.65)}to{opacity:1;transform:none}}",
			".dsp-tab[data-active='true'] .dsp-tab-count{color:var(--dsw-alias-label-secondary)}",
			".dsp-spacer{flex:1 1 auto;min-width:6px}",
			".dsp-bar-actions{display:flex;align-items:center;gap:2px}",
			".dsp-icon-btn{all:unset;display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:8px;cursor:pointer;color:var(--dsw-alias-label-tertiary);transition:background .16s ease,color .16s ease,transform .12s ease}",
			".dsp-icon-btn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".dsp-icon-btn:active{transform:scale(.9)}",
			".dsp-icon-btn[data-active='true']{color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover)}",
			".dsp-icon-btn[data-accent='true']{color:var(--dsw-alias-brand-primary)}",
			".dsp-icon-btn:disabled{opacity:.4;cursor:default;background:0 0;transform:none}",
			".dsp-icon-btn svg{width:16px;height:16px;display:block}",
			".dsp-chevron{transition:transform .3s cubic-bezier(.22,1,.36,1)}",
			".dsp-chevron[data-open='true']{transform:rotate(180deg)}",
			/* one keyboard ring for every control in the panel */
			".dsp-tab:focus-visible,.dsp-icon-btn:focus-visible,.dsp-btn:focus-visible,.dsp-menu-item:focus-visible,.dsp-price-trigger:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}",
			/* ── the drawer ── */
			// Opening reads as the pane unfolding out of the bar: height, opacity
			// and a small lift travel together on one spring-ish curve, and the
			// contents rise in behind them.
			".dsp-body{overflow:hidden;max-height:0;opacity:0;transform:translateY(-6px);transition:max-height .42s cubic-bezier(.22,1,.36,1),opacity .26s ease,margin-top .42s cubic-bezier(.22,1,.36,1),transform .42s cubic-bezier(.22,1,.36,1)}",
			".dsp-body[data-open='true']{max-height:302px;opacity:1;margin-top:8px;transform:none}",
			".dsp-pane{max-height:294px;overflow:auto;box-sizing:border-box;padding:10px 12px;border-radius:14px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);box-shadow:0 1px 2px rgba(16,20,32,.04);scrollbar-width:thin;animation:dspPaneIn .32s cubic-bezier(.22,1,.36,1) backwards}",
			"@keyframes dspPaneIn{from{opacity:0;transform:translateY(3px) scale(.995)}to{opacity:1;transform:none}}",
			".dsp-group+.dsp-group{margin-top:14px}",
			".dsp-group{animation:dspRise .38s cubic-bezier(.22,1,.36,1) backwards}",
			".dsp-group-title{display:flex;align-items:center;gap:8px;margin:0 0 4px;font-size:10.5px;font-weight:500;letter-spacing:.07em;text-transform:uppercase;color:var(--dsw-alias-label-caption)}",
			".dsp-group-title:after{content:'';flex:1 1 auto;height:1px;background:var(--dsw-alias-border-l1)}",
			".dsp-row{display:flex;align-items:center;gap:10px;min-width:0;padding:6px 8px;border-radius:9px;transition:background .2s ease,transform .2s cubic-bezier(.22,1,.36,1);animation:dspRise .38s cubic-bezier(.22,1,.36,1) backwards}",
			".dsp-row:hover{background:var(--dsw-alias-interactive-bg-hover);transform:translateX(1.5px)}",
			// A running job keeps a faint brand wash that breathes, so the eye can
			// find live work without a spinner in every row.
			".dsp-row[data-live='true']{background:color-mix(in srgb, var(--dsw-alias-brand-primary) 7%, transparent);animation:dspLive 2.8s ease-in-out infinite}",
			"@keyframes dspLive{0%,100%{background-color:color-mix(in srgb, var(--dsw-alias-brand-primary) 5%, transparent)}50%{background-color:color-mix(in srgb, var(--dsw-alias-brand-primary) 11%, transparent)}}",
			"@keyframes dspRise{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}",
			".dsp-row-label{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary)}",
			".dsp-row-meta{flex:none;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}",
			".dsp-row-tag{flex:none;padding:1px 7px;box-sizing:border-box;border-radius:6px;background:var(--dsw-alias-bg-module-platform);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l1);color:var(--dsw-alias-label-tertiary);font-size:10.5px;line-height:16px}",
			".dsp-empty{padding:26px 8px;text-align:center;color:var(--dsw-alias-label-dimmed);animation:dspRise .42s cubic-bezier(.22,1,.36,1) backwards}",
			/* ── the shared shell ── */
			// The shell strip: one chip per open shell plus the "+" that opens
			// another. Chips are pills rather than tabs because the pane below is
			// already tabbed at the drawer level; two tab rows would read as one.
			".dsp-shells{display:flex;align-items:center;gap:4px;margin:0 0 8px;flex-wrap:wrap}",
			".dsp-shell{display:inline-flex;align-items:center;height:24px;box-sizing:border-box;border-radius:999px;background:var(--dsw-alias-bg-layer-1);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l1);transition:background .16s ease,box-shadow .16s ease}",
			".dsp-shell:hover{box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l2)}",
			".dsp-shell[data-active='true']{background:var(--dsw-alias-interactive-bg-hover);box-shadow:inset 0 0 0 1px var(--dsw-alias-brand-primary)}",
			".dsp-shell-pick{all:unset;display:inline-flex;align-items:center;gap:5px;height:100%;padding:0 9px;cursor:pointer;color:var(--dsw-alias-label-tertiary);font-size:11.5px;font-variant-numeric:tabular-nums;transition:color .16s ease}",
			".dsp-shell[data-active='true'] .dsp-shell-pick{color:var(--dsw-alias-label-primary)}",
			".dsp-shell-dot{width:5px;height:5px;border-radius:50%;flex:none;background:var(--dsw-alias-state-success-primary)}",
			".dsp-shell-dot[data-dead='true']{background:var(--dsw-alias-label-dimmed)}",
			".dsp-shell-x{all:unset;display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;margin-right:4px;border-radius:50%;cursor:pointer;color:var(--dsw-alias-label-dimmed);font-size:11px;line-height:1;transition:background .16s ease,color .16s ease}",
			".dsp-shell-x:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".dsp-shell-add{all:unset;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:999px;cursor:pointer;color:var(--dsw-alias-label-tertiary);font-size:14px;line-height:1;box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l1);transition:background .16s ease,color .16s ease,box-shadow .16s ease,transform .12s ease}",
			".dsp-shell-add:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l2)}",
			".dsp-shell-add:active{transform:scale(.94)}",
			".dsp-shell-add:disabled{opacity:.4;cursor:default;background:0 0;transform:none}",
			".dsp-term-head{display:flex;align-items:center;gap:8px;margin:0 0 8px}",
			".dsp-term-status{display:flex;align-items:center;gap:7px;min-width:0;color:var(--dsw-alias-label-tertiary);font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
			".dsp-term-body{margin:0;box-sizing:border-box;max-height:170px;overflow:auto;padding:10px 12px;border-radius:10px;box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);font:11.5px/1.65 ui-monospace,'Cascadia Mono',Consolas,'Courier New',monospace;white-space:pre-wrap;word-break:break-word;scrollbar-width:thin}",
			".dsp-cmd{display:flex;align-items:center;flex:1 1 auto;min-width:0;gap:8px;height:32px;padding:0 10px;box-sizing:border-box;border-radius:10px;box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);transition:box-shadow .2s ease}",
			".dsp-cmd:focus-within{box-shadow:inset 0 0 0 1px var(--dsw-alias-brand-primary),0 0 0 3px rgba(74,108,247,.14)}",
			".dsp-cmd-glyph{flex:none;color:var(--dsw-alias-label-dimmed);font:12px/1 ui-monospace,Consolas,monospace;transition:color .2s ease}",
			".dsp-cmd:focus-within .dsp-cmd-glyph{color:var(--dsw-alias-brand-primary)}",
			".dsp-input{all:unset;flex:1 1 auto;min-width:0;height:100%;color:var(--dsw-alias-label-primary);font:12px/1.4 ui-monospace,'Cascadia Mono',Consolas,monospace}",
			".dsp-input::placeholder{color:var(--dsw-alias-label-dimmed)}",
			".dsp-term-line{display:flex;align-items:center;gap:8px;margin-top:8px}",
			".dsp-btn{all:unset;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:28px;padding:0 12px;border-radius:9px;color:var(--dsw-alias-label-primary);cursor:pointer;white-space:nowrap;font-size:12px;box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l1);transition:background .16s ease,box-shadow .16s ease,transform .12s ease}",
			".dsp-btn:hover{background:var(--dsw-alias-interactive-bg-hover);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l2)}",
			".dsp-btn:active{transform:scale(.97)}",
			".dsp-btn:disabled{opacity:.4;cursor:default;background:0 0;transform:none}",
			".dsp-error{margin:8px 2px 0;color:var(--dsw-alias-state-error-primary);font-size:11px}",
			/* ── price chip + popovers ── */
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
			".dsp-pop[data-kind='menu']{width:auto;min-width:198px;padding:5px}",
			".dsp-pop[data-side='down']{top:calc(100% + 8px);transform-origin:top right}",
			".dsp-pop[data-side='up']{bottom:calc(100% + 8px);transform-origin:bottom right}",
			".dsp-pop[data-align='start']{left:0;transform-origin:top left}",
			".dsp-pop[data-align='end']{right:0}",
			"@keyframes dspPop{from{opacity:0;transform:translateY(4px) scale(.985)}to{opacity:1;transform:none}}",
			".dsp-pop-title{font-size:12px;font-weight:500;color:var(--dsw-alias-label-primary)}",
			".dsp-pop-head{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:500;color:var(--dsw-alias-label-primary)}",
			".dsp-pop-head svg{width:15px;height:15px;flex:none;color:var(--dsw-alias-label-tertiary)}",
			".dsp-pop-sub{margin-top:3px;color:var(--dsw-alias-label-tertiary);font-size:11.5px;font-variant-numeric:tabular-nums}",
			".dsp-price-table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}",
			// The table arrives in reading order — head, then one row after the
			// next — so the numbers feel laid down rather than flipped on.
			".dsp-pop-head,.dsp-pop-title,.dsp-pop-sub,.dsp-path{animation:dspRise .34s cubic-bezier(.22,1,.36,1) backwards}",
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
			/* ── header menus ── */
			".dsp-menu{display:flex;flex-direction:column;gap:1px}",
			".dsp-menu-item{all:unset;display:flex;align-items:center;gap:9px;height:30px;padding:0 9px;box-sizing:border-box;border-radius:8px;cursor:pointer;color:var(--dsw-alias-label-primary);font-size:12px;transition:background .16s ease,transform .12s ease;animation:dspRise .3s cubic-bezier(.22,1,.36,1) backwards}",
			".dsp-menu-item:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".dsp-menu-item:active{transform:scale(.985)}",
			".dsp-menu-item:disabled{opacity:.4;cursor:default;background:0 0;transform:none}",
			".dsp-menu-item svg{width:16px;height:16px;flex:none;color:var(--dsw-alias-label-tertiary);transition:color .16s ease}",
			".dsp-menu-item:hover svg{color:var(--dsw-alias-label-secondary)}",
			".dsp-menu-item:nth-child(2){animation-delay:.03s}",
			".dsp-menu-item:nth-child(3){animation-delay:.06s}",
			".dsp-menu-item:nth-child(4){animation-delay:.09s}",
			".dsp-menu-item:nth-child(n+5){animation-delay:.12s}",
			".dsp-path{margin:7px 0 10px;padding:7px 9px;border-radius:9px;background:var(--dsw-alias-bg-module-platform);font:11.5px/1.55 ui-monospace,'Cascadia Mono',Consolas,monospace;word-break:break-all;color:var(--dsw-alias-label-secondary)}",
			".dsp-hint{display:inline-flex;align-items:center;height:26px;padding:0 6px;color:var(--dsw-alias-label-tertiary);font-size:11.5px;animation:dspPop .18s ease}",
			".dsp-hint-dot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-success-primary);animation:dspPulse 1.9s ease-in-out infinite}",
			"@keyframes dspPulse{0%,100%{opacity:.32}50%{opacity:1}}",
			// Everything above is decoration: with reduced motion the panel keeps
			// its states and drops only the travel.
			"@media (prefers-reduced-motion: reduce){.dsp-tab,.dsp-icon-btn,.dsp-price-trigger,.dsp-menu-item,.dsp-btn,.dsp-row,.dsp-body,.dsp-shell,.dsp-shell-pick,.dsp-shell-x,.dsp-shell-add{transition:none}.dsp-tabs-thumb,.dsp-chevron,.dsp-price-chev{transition:none}.dsp-pop,.dsp-pane,.dsp-group,.dsp-row,.dsp-menu-item,.dsp-pop-head,.dsp-pop-title,.dsp-pop-sub,.dsp-path,.dsp-price-table tbody tr,.dsp-price-note,.dsp-tab-count,.dsp-hint{animation:none}.dsp-tabs:after,.dsp-hint-dot,.dsp-price-dot{animation:none}.dsp-row[data-live='true']{animation:none}}"
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
		/** Resolve a primitive icon once, tolerating one that is absent from this build. */
		function icon(name) {
			const resolved = primitives[name];
			if (typeof resolved === "function") return resolved;
			return function IconAbsent() {
				return null;
			};
		}
		const IconFolder = icon("IconFolderOpenOutline16");
		const IconEllipsis = icon("IconEllipsisOutline16");
		const IconPanel = icon("IconFullscreenOutline16");
		const IconSidebar = icon("IconPanelLeftOutline16");
		const IconChevronDown = icon("IconChevronDownOutline14");
		const IconRefresh = icon("IconRefreshOutline16");
		const IconStop = icon("IconStopFill16");
		const IconCopy = icon("IconCopyOutline16");
		const IconClock = icon("IconClockOutline16");
		const IconList = icon("IconListPenOutline16");
		const IconSend = icon("IconSendOutline16");
		const IconCode = icon("IconCodeOutline16");
		const IconDownload = icon("IconDownloadOutline16");
		//#endregion
		//#region drawer state
		// The header toolbar and the drawer bar both drive one drawer; a tiny
		// module-level store keeps them in sync without threading props through
		// two unrelated slots.
		let drawer = {
			open: false,
			pane: "tasks"
		};
		const drawerListeners = new Set();
		/** Publish one drawer change to every mounted surface. */
		function setDrawer(patch) {
			drawer = {
				...drawer,
				...patch
			};
			for (const listener of drawerListeners) listener();
		}
		/** Subscribe one surface to the shared drawer state. */
		function useDrawer() {
			const [, force] = react.useState(0);
			react.useEffect(() => {
				const listener = () => {
					force((value) => value + 1);
				};
				drawerListeners.add(listener);
				return () => {
					drawerListeners.delete(listener);
				};
			}, []);
			return drawer;
		}
		//#endregion
		//#region shellpanel transport
		/** One shellpanel request; failures arrive as JSON with `ok: false`. */
		async function shellpanel(path, body) {
			const response = await fetch(path, body === undefined ? {
				method: "GET"
			} : {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body)
			});
			if (!response.ok) throw new Error("HTTP " + String(response.status));
			const payload = await response.json();
			if (payload?.ok !== true) throw new Error(payload?.reason ?? "终端请求失败");
			return payload;
		}
		const statePath = (sessionId, open, shell) => "/api/shellpanel/state?sessionId=" + encodeURIComponent(sessionId) + (open ? "&open=1" : "") + (shell === null || shell === undefined ? "" : "&shell=" + encodeURIComponent(shell));
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
		//#region task pane
		/** Status dot for one job status. */
		function jobDot(status) {
			switch (status) {
				case "running": return "ongoing";
				case "stopping": return "warning";
				case "completed": return "done";
				case "killed": return "warning";
				case "failed": return "error";
				default: return "done";
			}
		}
		/** Elapsed time of one job, live for as long as it runs. */
		function jobDuration(job, now, t) {
			const start = job.startedAt ?? now;
			const end = job.finishedAt ?? now;
			const seconds = Math.max(0, Math.round((end - start) / 1000));
			if (seconds < 60) return t("duration.seconds", { seconds });
			if (seconds < 3600) return t("duration.minutes", { minutes: Math.floor(seconds / 60), seconds: seconds % 60 });
			return t("duration.hours", { hours: Math.floor(seconds / 3600), minutes: Math.floor(seconds % 3600 / 60) });
		}
		/** One labelled group of action rows. */
		function ActionGroup({ title, children }) {
			return jsxs("div", {
				className: "dsp-group",
				children: [jsx("div", {
					className: "dsp-group-title",
					children: title
				}), children]
			});
		}
		/**
		* The agent's live actions: background jobs it started and the subagents it
		* delegated to. Both come from the client session store, so the pane needs
		* no round trip and updates as the model works.
		*/
		function TasksPane({ sessionId, useSessions, t }) {
			const [now, setNow] = react.useState(() => Date.now());
			const jobs = useSessions((state) => sessionId === null ? undefined : state.jobsBySession[sessionId]) ?? [];
			const summaries = useSessions((state) => state.byId) ?? {};
			const children = react.useMemo(() => Object.values(summaries).filter((summary) => summary.origin === "subagent" && summary.parentId === sessionId), [summaries, sessionId]);
			const live = jobs.some((job) => job.status === "running" || job.status === "stopping");
			react.useEffect(() => {
				if (!live) return undefined;
				const timer = setInterval(() => {
					setNow(Date.now());
				}, 1000);
				return () => {
					clearInterval(timer);
				};
			}, [live]);
			if (jobs.length === 0 && children.length === 0) return jsx("div", {
				className: "dsp-empty",
				children: t("tasks.empty")
			});
			return jsxs(react.Fragment, { children: [
				jobs.length === 0 ? null : jsx(ActionGroup, {
					title: t("tasks.jobs"),
					children: jobs.map((job, index) => jsxs("div", {
						className: "dsp-row",
						title: job.detail ?? job.label,
						"data-live": String(job.status === "running" || job.status === "stopping"),
						style: { animationDelay: String(Math.min(index, 9) * 0.035) + "s" },
						children: [
							jsx(primitives.StateDot, { state: jobDot(job.status) }),
							jsx("span", {
								className: "dsp-row-label",
								children: job.label ?? job.kind
							}),
							jsx("span", {
								className: "dsp-row-meta",
								children: jobDuration(job, now, t)
							}),
							jsx("span", {
								className: "dsp-row-tag",
								children: t("tasks.status." + String(job.status))
							})
						]
					}, job.id))
				}),
				children.length === 0 ? null : jsx(ActionGroup, {
					title: t("tasks.subagents"),
					children: children.map((summary, index) => jsxs("div", {
						className: "dsp-row",
						title: summary.displayTitle ?? summary.id,
						"data-live": String(summary.running === true),
						style: { animationDelay: String(Math.min(jobs.length + index, 9) * 0.035) + "s" },
						children: [
							jsx(primitives.StateDot, { state: summary.running === true ? "ongoing" : "done" }),
							jsx("span", {
								className: "dsp-row-label",
								children: summary.displayTitle ?? summary.id
							}),
							jsx("span", {
								className: "dsp-row-meta",
								children: summary.running === true ? t("tasks.running") : t("tasks.settled")
							})
						]
					}, summary.id))
				})
			] });
		}
		//#endregion
		//#region terminal pane
		// The model's own prompt literal, replaced for display only so the pane
		// reads like a shell instead of leaking the tool's marker.
		const PROMPT_LITERAL = "__DSH_PERSISTENT_PWSH_PROMPT__ ";
		/** Fragments of the persistent tool's command wrapper, shown as nothing. */
		const WRAPPER_NOISE = [
			"__DSH_PERSISTENT_PWSH_START_",
			"__DSH_PERSISTENT_PWSH_END_",
			"$__ok = $?",
			"$__s = [int]$LASTEXITCODE",
			"$__s = if ($__ok)",
			"[Console]::OutputEncoding",
			"function prompt {"
		];
		/** Undo the wrapper's backtick quoting so the model's command reads as authored. */
		function unescapePwsh(value) {
			return value.replaceAll("``", "\u0001").replaceAll("`\"", "\"").replaceAll("`$", "$").replaceAll("`n", " ").replaceAll("`e", "").replaceAll("\u0001", "`");
		}
		/**
		* Turn the raw shared-shell transcript into what a person watching the
		* agent work needs: the command the model ran, and its output. The tool's
		* wrapper (markers, exit-code bookkeeping, the prompt override) is
		* machinery, not activity, so it never reaches the pane.
		* @param text - sanitized scrollback from the shared PTY.
		* @returns the display transcript.
		*/
		function readable(text) {
			const lines = [];
			for (const raw of text.split("\n")) {
				const at = raw.indexOf("Invoke-Expression \"");
				if (at >= 0 && raw.includes("__DSH_PERSISTENT_PWSH_START_")) {
					const rest = raw.slice(at + 19);
					const end = rest.indexOf("\"");
					lines.push("dsh> " + unescapePwsh(end < 0 ? rest : rest.slice(0, end)));
					continue;
				}
				if (WRAPPER_NOISE.some((needle) => raw.includes(needle))) continue;
				lines.push(raw);
			}
			return lines.join("\n").split(PROMPT_LITERAL).join("dsh> ").split("dsh> > ").join("dsh> ");
		}
		/**
		* The panel's shells. The first one is the shared PowerShell: the same PTY
		* session the model's `pwsh` tool runs in, polled while the drawer is open so
		* its output is what the person sees the agent doing. The ones opened with
		* "+" are the person's own — the host bridges them under their own names, so
		* a second terminal can never be adopted by the model's tool.
		*/
		function TerminalPane({ sessionId, active, t }) {
			const [state, setState] = react.useState(null);
			const [error, setError] = react.useState(null);
			const [draft, setDraft] = react.useState("");
			const [sending, setSending] = react.useState(false);
			const [picked, setPicked] = react.useState(null);
			const [creating, setCreating] = react.useState(false);
			const historyRef = react.useRef([]);
			const cursorRef = react.useRef(-1);
			const bodyRef = react.useRef(null);
			const stickRef = react.useRef(true);
			const [tick, setTick] = react.useState(0);
			react.useEffect(() => {
				if (!active || sessionId === null) return undefined;
				let cancelled = false;
				let timer = null;
				const poll = async () => {
					try {
						const next = await shellpanel(statePath(sessionId, true, picked));
						if (cancelled) return;
						setState(next);
						setError(null);
					} catch (failure) {
						if (!cancelled) setError(failure instanceof Error ? failure.message : String(failure));
					}
					if (!cancelled) timer = setTimeout(() => {
						void poll();
					}, 800);
				};
				void poll();
				return () => {
					cancelled = true;
					if (timer !== null) clearTimeout(timer);
				};
			}, [active, sessionId, tick, picked]);
			const text = state === null ? "" : readable(state.text ?? "");
			react.useEffect(() => {
				const body = bodyRef.current;
				if (body === null || !stickRef.current) return;
				body.scrollTop = body.scrollHeight;
			}, [text]);
			if (sessionId === null) return jsx("div", {
				className: "dsp-empty",
				children: t("term.noSession")
			});
			const shell = state?.shell ?? null;
			const running = shell !== null && shell.status === "running";
			/** The host-side name this pane is addressing; the shared shell has none. */
			const want = picked ?? "panel";
			const roster = state?.shells ?? [];
			const shared = want === "panel";
			/** Follow one failure to the inline error line, never the console. */
			const fail = (failure) => {
				setError(failure instanceof Error ? failure.message : String(failure));
			};
			/** Switch shells: the scrollback, draft and history belong to one shell. */
			const pick = (name) => {
				if (name === want) return;
				setState(null);
				setError(null);
				historyRef.current = [];
				cursorRef.current = -1;
				setDraft("");
				stickRef.current = true;
				setPicked(name === "panel" ? null : name);
			};
			const addShell = async () => {
				if (sessionId === null || creating) return;
				setCreating(true);
				setError(null);
				try {
					const payload = await shellpanel("/api/shellpanel/new", { sessionId });
					setState(null);
					historyRef.current = [];
					cursorRef.current = -1;
					setDraft("");
					stickRef.current = true;
					setPicked(payload.shell?.name ?? null);
				} catch (failure) {
					fail(failure);
				} finally {
					setCreating(false);
				}
			};
			const dropShell = async (name) => {
				setError(null);
				try {
					await shellpanel("/api/shellpanel/close", {
						sessionId,
						shell: name
					});
					if (name === want) {
						setState(null);
						setPicked(null);
					} else {
						setTick((value2) => value2 + 1);
					}
				} catch (failure) {
					fail(failure);
				}
			};
			const send = async (value) => {
				const command = value.trim();
				if (command.length === 0 || sending) return;
				setSending(true);
				setError(null);
				try {
					await shellpanel("/api/shellpanel/input", {
						sessionId,
						shell: want,
						text: command,
						submit: true
					});
					historyRef.current = [command, ...historyRef.current.filter((entry) => entry !== command)].slice(0, 50);
					cursorRef.current = -1;
					setDraft("");
					stickRef.current = true;
					setTick((value2) => value2 + 1);
				} catch (failure) {
					fail(failure);
				} finally {
					setSending(false);
				}
			};
			const signal = async () => {
				setError(null);
				try {
					await shellpanel("/api/shellpanel/signal", {
						sessionId,
						shell: want,
						signal: "SIGINT"
					});
				} catch (failure) {
					fail(failure);
				}
			};
			const restart = async () => {
				setError(null);
				try {
					await shellpanel("/api/shellpanel/reset", {
						sessionId,
						shell: want
					});
					setState(null);
					setTick((value2) => value2 + 1);
				} catch (failure) {
					fail(failure);
				}
			};
			const onKeyDown = (event) => {
				if (event.key === "Enter") {
					event.preventDefault();
					void send(draft);
					return;
				}
				if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
				const history = historyRef.current;
				if (history.length === 0) return;
				event.preventDefault();
				const next = event.key === "ArrowUp" ? Math.min(history.length - 1, cursorRef.current + 1) : cursorRef.current - 1;
				cursorRef.current = next;
				setDraft(next < 0 ? "" : history[next]);
			};
			return jsxs(react.Fragment, { children: [
				jsxs("div", {
					className: "dsp-shells",
					children: [roster.map((entry, index) => jsxs("span", {
						className: "dsp-shell",
						"data-active": String(entry.name === want),
						children: [jsxs("button", {
							type: "button",
							className: "dsp-shell-pick",
							title: t("shell.tab", { index: String(index + 1) }),
							"aria-label": t("shell.tab", { index: String(index + 1) }),
							"aria-pressed": entry.name === want,
							onClick: () => {
								pick(entry.name);
							},
							children: [jsx("span", {
								className: "dsp-shell-dot",
								"data-dead": String(entry.status !== "running")
							}), jsx("span", { children: String(index + 1) })]
						}), entry.shared ? null : jsx("button", {
							type: "button",
							className: "dsp-shell-x",
							title: t("shell.close"),
							"aria-label": t("shell.close"),
							onClick: () => {
								void dropShell(entry.name);
							},
							children: "\u00d7"
						})]
					}, entry.name)), jsx(primitives.Tooltip, {
						label: t("shell.add"),
						side: "top",
						children: jsx("button", {
							type: "button",
							className: "dsp-shell-add",
							disabled: creating,
							"aria-label": t("shell.add"),
							onClick: () => {
								void addShell();
							},
							children: "+"
						})
					})]
				}),
				jsxs("div", {
					className: "dsp-term-head",
					children: [
						jsxs("span", {
							className: "dsp-term-status",
							children: [
								shell === null || running ? jsx("span", { className: "dsp-hint-dot" }) : jsx(primitives.StateDot, { state: "error" }),
								jsx("span", { children: shell === null ? t("term.starting") : !running ? t("term.exited") : shared ? typeof shell.pid === "number" && shell.pid > 0 ? t("term.shared", { pid: shell.pid }) : t("term.sharedNoPid") : t("term.standalone") })
							]
						}),
						jsx("span", { className: "dsp-spacer" }),
						jsx(primitives.Tooltip, {
							label: t("term.interruptHint"),
							side: "top",
							children: jsx("button", {
								type: "button",
								className: "dsp-icon-btn",
								disabled: !running,
								"aria-label": t("term.interrupt"),
								onClick: () => {
									void signal();
								},
								children: jsx(IconStop, {})
							})
						}),
						jsx(primitives.Tooltip, {
							label: t("term.restartHint"),
							side: "top",
							children: jsx("button", {
								type: "button",
								className: "dsp-icon-btn",
								disabled: sending,
								"aria-label": t("term.restart"),
								onClick: () => {
									void restart();
								},
								children: jsx(IconRefresh, {})
							})
						})
					]
				}),
				jsx("pre", {
					className: "dsp-term-body",
					ref: bodyRef,
					onScroll: (event) => {
						const body = event.currentTarget;
						stickRef.current = body.scrollHeight - body.scrollTop - body.clientHeight < 24;
					},
					children: text.length === 0 ? t("term.empty") : text
				}),
				jsxs("div", {
					className: "dsp-term-line",
					children: [
						jsxs("div", {
							className: "dsp-cmd",
							children: [
								jsx("span", { className: "dsp-cmd-glyph", children: "›" }),
								jsx("input", {
									className: "dsp-input",
									value: draft,
									placeholder: shared ? t("term.placeholder") : t("term.placeholderOwn"),
									spellCheck: false,
									autoComplete: "off",
									onChange: (event) => {
										setDraft(event.target.value);
										cursorRef.current = -1;
									},
									onKeyDown
								})
							]
						}),
						jsx(primitives.Tooltip, {
							label: t("term.send"),
							side: "top",
							children: jsx("button", {
								type: "button",
								className: "dsp-icon-btn",
								"data-accent": String(draft.trim().length > 0),
								disabled: sending || draft.trim().length === 0,
								"aria-label": t("term.send"),
								onClick: () => {
									void send(draft);
								},
								children: jsx(IconSend, {})
							})
						})
					]
				}),
				error === null ? null : jsx("div", {
					className: "dsp-error",
					children: error
				})
			] });
		}
		//#endregion
		//#region drawer
		/** The bottom drawer: pane tabs and the pricing hint in the bar, panes below. */
		function BottomDrawer({ sessionId, useSessions, useProjection, t }) {
			const current = useDrawer();
			const jobs = useSessions((state) => sessionId === null ? undefined : state.jobsBySession[sessionId]) ?? [];
			const live = jobs.filter((job) => job.status === "running" || job.status === "stopping").length;
			const tier = tierOf(useProjection("modelSelection"));
			const openPane = (pane) => {
				setDrawer(drawer.open && drawer.pane === pane ? { open: false } : {
					open: true,
					pane
				});
			};
			const pane = current.pane === "terminal" ? "terminal" : "tasks";
			return jsxs("div", {
				className: "dsp-root",
				children: [jsxs("div", {
					className: "dsp-bar",
					children: [
						jsxs("div", {
							className: "dsp-tabs",
							role: "tablist",
							"data-live": String(live > 0),
							children: [
								jsx("span", {
									className: "dsp-tabs-thumb",
									style: { transform: pane === "terminal" ? "translateX(100%)" : "none" }
								}),
								jsxs("button", {
									type: "button",
									role: "tab",
									className: "dsp-tab",
									"data-active": String(current.open && pane === "tasks"),
									"aria-selected": current.open && pane === "tasks",
									onClick: () => {
										openPane("tasks");
									},
									children: [jsx("span", { children: t("tab.tasks") }), live > 0 ? jsx("span", {
										className: "dsp-tab-count",
										key: String(live),
										children: String(live)
									}) : null]
								}),
								jsx("button", {
									type: "button",
									role: "tab",
									className: "dsp-tab",
									"data-active": String(current.open && pane === "terminal"),
									"aria-selected": current.open && pane === "terminal",
									onClick: () => {
										openPane("terminal");
									},
									children: jsx("span", { children: t("tab.terminal") })
								})
							]
						}),
						jsx("span", { className: "dsp-spacer" }),
						tier === null ? null : jsx(PriceHint, { t, tier }),
						jsx("div", {
							className: "dsp-bar-actions",
							children: jsx(primitives.Tooltip, {
								label: current.open ? t("bar.collapse") : t("bar.expand"),
								side: "top",
								children: jsx("button", {
									type: "button",
									className: "dsp-icon-btn",
									"data-active": String(current.open),
									"aria-label": current.open ? t("bar.collapse") : t("bar.expand"),
									onClick: () => {
										setDrawer({ open: !current.open });
									},
									children: jsx(IconChevronDown, { className: "dsp-chevron", "data-open": String(current.open) })
								})
							})
						})
					]
				}), jsx("div", {
					className: "dsp-body",
					"data-open": String(current.open),
					children: jsx("div", {
						className: "dsp-pane",
						// The action list is remounted per open so its rows rise in
						// sequence every time the drawer unfolds; the shell keeps its
						// session, draft and history across toggles.
						children: pane === "terminal" ? jsx(TerminalPane, {
							sessionId,
							active: current.open,
							t
						}) : jsx(TasksPane, {
							key: current.open ? "open" : "closed",
							sessionId,
							useSessions,
							t
						})
					})
				})]
			});
		}
		//#endregion
		//#region header toolbar
		/** A popover anchored to its trigger, dismissed on any outside pointer. */
		function Popover({ open, setOpen, side, align, kind, trigger, children }) {
			const rootRef = react.useRef(null);
			primitives.useDismissOnOutsidePointer(rootRef, open, setOpen);
			return jsxs("div", {
				style: {
					position: "relative",
					display: "inline-flex"
				},
				ref: rootRef,
				children: [trigger, open ? jsx("div", {
					className: "dsp-pop",
					"data-side": side ?? "down",
					"data-align": align ?? "end",
					"data-kind": kind ?? "panel",
					children
				}) : null]
			});
		}
		/** One header icon button with its tooltip. */
		function HeaderButton({ label, active, onClick, children }) {
			return jsx(primitives.Tooltip, {
				label,
				side: "top",
				children: jsx("button", {
					type: "button",
					className: "dsp-icon-btn",
					"data-active": String(active === true),
					"aria-label": label,
					onClick,
					children
				})
			});
		}
		/** Copy text through the clipboard seam the harness already ships. */
		async function copyText(value) {
			try {
				await primitives.writeClipboard(value);
				return true;
			} catch {
				return false;
			}
		}
		/**
		* The right-aligned session toolbar: workspace folder, terminal actions,
		* drawer toggle, and the sidebar toggle the layout service owns.
		*/
		function HeaderToolbar({ sessionId, t }) {
			const current = useDrawer();
			const [folderOpen, setFolderOpen] = react.useState(false);
			const [menuOpen, setMenuOpen] = react.useState(false);
			const [cwd, setCwd] = react.useState(null);
			const [notice, setNotice] = react.useState(null);
			react.useEffect(() => {
				if (!folderOpen || sessionId === null || cwd !== null) return undefined;
				let cancelled = false;
				shellpanel(statePath(sessionId, false)).then((payload) => {
					if (!cancelled) setCwd(payload.cwd ?? "");
				}, () => {
					if (!cancelled) setCwd("");
				});
				return () => {
					cancelled = true;
				};
			}, [folderOpen, sessionId, cwd]);
			react.useEffect(() => {
				if (notice === null) return undefined;
				const timer = setTimeout(() => {
					setNotice(null);
				}, 2200);
				return () => {
					clearTimeout(timer);
				};
			}, [notice]);
			const desktop = typeof window !== "undefined" && typeof window.dshDesktop === "object" && window.dshDesktop !== null ? window.dshDesktop : undefined;
			/** Run one terminal action and surface its failure inline. */
			const terminalAction = async (path, body, done) => {
				if (sessionId === null) return;
				try {
					await shellpanel(path, {
						sessionId,
						...body
					});
					setNotice(done);
				} catch (failure) {
					setNotice(failure instanceof Error ? failure.message : String(failure));
				}
			};
			const reveal = () => {
				if (desktop === undefined || typeof cwd !== "string" || cwd.length === 0) return;
				void desktop.showItemInFolder(cwd);
				setFolderOpen(false);
			};
			const copyPath = async () => {
				const copied = typeof cwd === "string" && cwd.length > 0 ? await copyText(cwd) : false;
				setNotice(copied ? t("toolbar.pathCopied") : t("toolbar.pathUnavailable"));
				setFolderOpen(false);
			};
			return jsxs(react.Fragment, { children: [
				jsx(Popover, {
					open: folderOpen,
					setOpen: setFolderOpen,
					trigger: jsx(HeaderButton, {
						label: t("toolbar.folder"),
						active: folderOpen,
						onClick: () => {
							setMenuOpen(false);
							setFolderOpen((value) => !value);
						},
						children: jsx(IconFolder, {})
					}),
					children: jsxs(react.Fragment, { children: [
						jsx("div", {
							className: "dsp-pop-title",
							children: t("toolbar.folder")
						}),
						jsx("div", {
							className: "dsp-path",
							children: cwd === null ? t("toolbar.loading") : cwd.length === 0 ? t("toolbar.noWorkspace") : cwd
						}),
						jsxs("div", {
							style: { display: "flex", gap: 6 },
							children: [
								jsx("button", {
									type: "button",
									className: "dsp-btn",
									disabled: desktop === undefined || typeof cwd !== "string" || cwd.length === 0,
									onClick: reveal,
									children: t("toolbar.reveal")
								}),
								jsx("button", {
									type: "button",
									className: "dsp-btn",
									disabled: typeof cwd !== "string" || cwd.length === 0,
									onClick: () => void copyPath(),
									children: t("toolbar.copyPath")
								})
							]
						})
					] })
				}),
				jsx(Popover, {
					open: menuOpen,
					setOpen: setMenuOpen,
					kind: "menu",
					trigger: jsx(HeaderButton, {
						label: t("toolbar.more"),
						active: menuOpen,
						onClick: () => {
							setFolderOpen(false);
							setMenuOpen((value) => !value);
						},
						children: jsx(IconEllipsis, {})
					}),
					children: jsxs("div", {
						className: "dsp-menu",
						children: [
							jsxs("button", {
								type: "button",
								className: "dsp-menu-item",
								onClick: () => {
									setMenuOpen(false);
									setDrawer({ open: true, pane: "terminal" });
								},
								children: [jsx(IconCode, {}), jsx("span", { children: t("toolbar.showShell") })]
							}),
							jsxs("button", {
								type: "button",
								className: "dsp-menu-item",
								onClick: () => {
									setMenuOpen(false);
									setDrawer({ open: true, pane: "tasks" });
								},
								children: [jsx(IconList, {}), jsx("span", { children: t("toolbar.showTasks") })]
							}),
							jsxs("button", {
								type: "button",
								className: "dsp-menu-item",
								onClick: () => {
									setMenuOpen(false);
									void terminalAction("/api/shellpanel/signal", { signal: "SIGINT" }, t("toolbar.interrupted"));
								},
								children: [jsx(IconStop, {}), jsx("span", { children: t("toolbar.interrupt") })]
							}),
							jsxs("button", {
								type: "button",
								className: "dsp-menu-item",
								onClick: () => {
									setMenuOpen(false);
									void terminalAction("/api/shellpanel/reset", {}, t("toolbar.restarted"));
								},
								children: [jsx(IconRefresh, {}), jsx("span", { children: t("toolbar.restart") })]
							}),
							jsxs("button", {
								type: "button",
								className: "dsp-menu-item",
								onClick: () => {
									setMenuOpen(false);
									void copyPath();
								},
								children: [jsx(IconCopy, {}), jsx("span", { children: t("toolbar.copyPath") })]
							}),
							sessionLogExport() === undefined ? null : jsxs("button", {
								type: "button",
								className: "dsp-menu-item",
								onClick: () => {
									setMenuOpen(false);
									const exportLog = sessionLogExport();
									if (exportLog !== undefined && sessionId !== null) exportLog.download(sessionId);
								},
								children: [jsx(IconDownload, {}), jsx("span", { children: t("toolbar.exportLog") })]
							})
						]
					})
				}),
				jsx(HeaderButton, {
					label: current.open ? t("bar.collapse") : t("bar.expand"),
					active: current.open,
					onClick: () => {
						setDrawer({ open: !current.open });
					},
					children: jsx(IconPanel, {})
				}),
				jsx(HeaderButton, {
					label: t("toolbar.sidebar"),
					onClick: () => {
						rootContext?.get?.("layout", false)?.toggleSidebar?.();
					},
					children: jsx(IconSidebar, {})
				}),
				notice === null ? null : jsx("span", {
					className: "dsp-hint",
					children: notice
				})
			] });
		}
		//#endregion
		//#region locales
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"tab.tasks": "任务管理",
			"tab.terminal": "PowerShell",
			"bar.expand": "展开底部面板",
			"bar.collapse": "收起底部面板",
			"tasks.empty": "AI 暂时没有动作",
			"tasks.jobs": "后台任务",
			"tasks.subagents": "子代理",
			"tasks.running": "进行中",
			"tasks.settled": "已完成",
			"tasks.status.running": "运行中",
			"tasks.status.stopping": "正在停止",
			"tasks.status.completed": "已完成",
			"tasks.status.killed": "已取消",
			"tasks.status.failed": "已失败",
			"duration.seconds": "{seconds} 秒",
			"duration.minutes": "{minutes} 分 {seconds} 秒",
			"duration.hours": "{hours} 小时 {minutes} 分",
			"term.noSession": "先打开一个会话",
			"term.starting": "正在启动共享终端…",
			"term.shared": "共享终端 · PID {pid}",
			"term.sharedNoPid": "共享终端 · 与 AI 同一个进程",
			"term.standalone": "独立终端 · 只属于你",
			"shell.tab": "PowerShell {index}",
			"shell.add": "新建终端",
			"shell.close": "关闭这个终端",
			"term.exited": "终端已退出，可重启",
			"term.empty": "等待 AI 或你的第一条命令…",
			"term.placeholder": "输入命令后回车，与 AI 共用同一个终端",
			"term.placeholderOwn": "输入命令后回车",
			"term.send": "发送",
			"term.interrupt": "中断",
			"term.interruptHint": "向当前命令发送 Ctrl+C",
			"term.restart": "重启",
			"term.restartHint": "结束当前终端，下一条命令会开一个新的",
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
			"pricing.unit": "空闲价格为高峰价格的一半，以 DeepSeek 官方价目为准。",
			"toolbar.folder": "工作目录",
			"toolbar.more": "更多终端操作",
			"toolbar.sidebar": "折叠 / 展开侧栏",
			"toolbar.loading": "读取中…",
			"toolbar.noWorkspace": "当前会话还没有工作目录",
			"toolbar.reveal": "在资源管理器中打开",
			"toolbar.copyPath": "复制路径",
			"toolbar.exportLog": "Session 日志",
			"toolbar.interrupt": "中断当前命令",
			"toolbar.restart": "重启共享终端",
			"toolbar.showTasks": "查看 AI 动作",
			"toolbar.showShell": "打开 PowerShell 面板",
			"toolbar.pathCopied": "已复制路径",
			"toolbar.pathUnavailable": "还没有可复制的工作目录",
			"toolbar.interrupted": "已发送 Ctrl+C",
			"toolbar.restarted": "终端已重启"
		};
		/** English dictionary, key-identical to the Chinese source of truth. */
		const en = {
			"tab.tasks": "Actions",
			"tab.terminal": "PowerShell",
			"bar.expand": "Expand bottom panel",
			"bar.collapse": "Collapse bottom panel",
			"tasks.empty": "No agent activity yet",
			"tasks.jobs": "Background jobs",
			"tasks.subagents": "Subagents",
			"tasks.running": "running",
			"tasks.settled": "settled",
			"tasks.status.running": "running",
			"tasks.status.stopping": "stopping",
			"tasks.status.completed": "completed",
			"tasks.status.killed": "cancelled",
			"tasks.status.failed": "failed",
			"duration.seconds": "{seconds}s",
			"duration.minutes": "{minutes}m {seconds}s",
			"duration.hours": "{hours}h {minutes}m",
			"term.noSession": "Open a session first",
			"term.starting": "Starting the shared shell…",
			"term.shared": "Shared shell · PID {pid}",
			"term.sharedNoPid": "Shared shell · same process as the model",
			"term.standalone": "Standalone shell · yours alone",
			"shell.tab": "PowerShell {index}",
			"shell.add": "New terminal",
			"shell.close": "Close this terminal",
			"term.exited": "Shell exited — restart it",
			"term.empty": "Waiting for the first command from you or the model…",
			"term.placeholder": "Type a command and press Enter — the model shares this shell",
			"term.placeholderOwn": "Type a command and press Enter",
			"term.send": "Send",
			"term.interrupt": "Interrupt",
			"term.interruptHint": "Send Ctrl+C to the foreground command",
			"term.restart": "Restart",
			"term.restartHint": "End this shell; the next command starts a fresh one",
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
			"pricing.unit": "Off-peak is half the peak price; the official DeepSeek price list prevails.",
			"toolbar.folder": "Working directory",
			"toolbar.more": "More terminal actions",
			"toolbar.sidebar": "Toggle sidebar",
			"toolbar.loading": "Reading…",
			"toolbar.noWorkspace": "This session has no working directory yet",
			"toolbar.reveal": "Reveal in file manager",
			"toolbar.copyPath": "Copy path",
			"toolbar.exportLog": "Session log",
			"toolbar.interrupt": "Interrupt command",
			"toolbar.restart": "Restart shared shell",
			"toolbar.showTasks": "Show agent actions",
			"toolbar.showShell": "Open the PowerShell pane",
			"toolbar.pathCopied": "Path copied",
			"toolbar.pathUnavailable": "No working directory to copy yet",
			"toolbar.interrupted": "Sent Ctrl+C",
			"toolbar.restarted": "Shell restarted"
		};
		//#endregion
		//#region plugin
		/** Locale namespace both surfaces bind their labels to. */
		const NS = "ui-panel";
		/** Client services required by both surfaces. */
		const inject = ["slots", "locale"];
		/** Root client context, resolved for the sidebar toggle the layout service owns. */
		let rootContext = undefined;
		/**
		* The Session-log export controller, owned by `@deepseek-ai/dsh-session-log-export`.
		* Looked up lazily through the root context rather than injected: this panel
		* does not depend on that package, so an installation without it simply loses
		* the menu entry instead of failing to mount.
		* @returns the controller, or undefined when that plugin is not mounted.
		*/
		function sessionLogExport() {
			const service = rootContext?.get("sessionLogDownload", false);
			return typeof service?.download === "function" ? service : undefined;
		}
		/** Selector hook that answers nothing when the slot supplies no store. */
		function useNoSessions() {
			return undefined;
		}
		/** Projection hook that answers nothing when the slot supplies no store. */
		function useNoProjection() {
			return undefined;
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
		/** Bind the addressed Session and the stores into the drawer. */
		function DrawerEntry(props) {
			return jsx(BottomDrawer, {
				sessionId: sessionIdOf(props),
				useSessions: props.useSessions ?? useNoSessions,
				useProjection: props.useProjection ?? useNoProjection,
				t: props.t
			});
		}
		/** Bind the addressed Session into the header toolbar. */
		function ToolbarEntry(props) {
			return jsx(HeaderToolbar, {
				sessionId: sessionIdOf(props),
				t: props.t
			});
		}
		/**
		* Client plugin body: register the dictionaries, the drawer, and the header
		* toolbar. `conversation.composer.dock` order 20 keeps the drawer below the
		* chat stats strip that occupies order 0.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			rootContext = ctx;
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-panel: dictionaries");
			ctx.slots.inject("conversation.composer.dock", () => ctx.slots.register({
				name: "conversation.composer.dock",
				id: "control-panel",
				order: 20,
				locale: NS
			}, DrawerEntry));
			ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
				name: "conversation.session.header.utilities",
				id: "control-panel-toolbar",
				order: 15,
				locale: NS
			}, ToolbarEntry));
		}
		//#endregion
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});

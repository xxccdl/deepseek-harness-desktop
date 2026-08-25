window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-onboarding",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let jsxRuntime = require("react/jsx-runtime");
		const { jsx, jsxs, Fragment } = jsxRuntime;
		const { useState, useEffect, useCallback } = react;
		//#region styles
		const css = [
			/* wizard — restrained monochrome, silk-smooth motion */
			".dsob-overlay{position:fixed;inset:0;z-index:9995;display:flex;align-items:center;justify-content:center;background:rgba(8,10,14,.55);backdrop-filter:blur(10px) saturate(1.15);-webkit-backdrop-filter:blur(10px) saturate(1.15);animation:dsobFade .32s cubic-bezier(.2,.8,.3,1)}",
			"@keyframes dsobFade{from{opacity:0}to{opacity:1}}",
			".dsob-overlay.dsob-closing{animation:dsobFadeOut .26s cubic-bezier(.5,0,.8,.4) forwards}",
			"@keyframes dsobFadeOut{to{opacity:0}}",
			".dsob-card{width:min(580px,92vw);max-height:86vh;display:flex;flex-direction:column;background:rgba(22,24,31,.92);border:1px solid rgba(255,255,255,.09);border-radius:18px;box-shadow:0 32px 90px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.03) inset;overflow:hidden;color:#e6e9f0;font:14px/1.6 system-ui,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;transform-origin:center 38%;animation:dsobCardIn .5s cubic-bezier(.22,1.24,.36,1) .02s backwards}",
			"@keyframes dsobCardIn{from{opacity:0;transform:translateY(26px) scale(.96);filter:blur(4px)}to{opacity:1;transform:none;filter:blur(0)}}",
			".dsob-overlay.dsob-closing .dsob-card{animation:dsobCardOut .26s cubic-bezier(.5,0,.8,.4) forwards}",
			"@keyframes dsobCardOut{to{opacity:0;transform:translateY(14px) scale(.975);filter:blur(2px)}}",
			".dsob-head{display:flex;align-items:center;gap:12px;padding:20px 24px 0;animation:dsobRise .5s cubic-bezier(.2,.9,.3,1) .12s backwards}",
			".dsob-brand{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;color:rgba(238,240,245,.92);letter-spacing:.01em}",
			".dsob-brand-badge{width:27px;height:27px;border-radius:8px;border:1px solid rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:700;color:rgba(238,240,245,.85);letter-spacing:.04em;background:rgba(255,255,255,.04)}",
			".dsob-skip{margin-left:auto;font-size:12px;color:rgba(230,233,240,.42);background:transparent;border:none;cursor:pointer;padding:5px 9px;border-radius:7px;transition:color .16s,background .16s}",
			".dsob-skip:hover{color:rgba(230,233,240,.9);background:rgba(255,255,255,.06)}",
			".dsob-body{padding:14px 24px 8px;overflow-y:auto;flex:1;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.14) transparent}",
			".dsob-body::-webkit-scrollbar{width:8px}",
			".dsob-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:4px}",
			/* per-step body transition */
			".dsob-body.dsob-out .dsob-anim{animation:dsobStepOut .18s cubic-bezier(.55,.06,.68,.19) forwards}",
			"@keyframes dsobStepOut{to{opacity:0;transform:translateY(-10px);filter:blur(2px)}}",
			"@keyframes dsobRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}",
			".dsob-anim{animation:dsobRise .45s cubic-bezier(.2,.9,.3,1) backwards}",
			".dsob-anim.dsob-d1{animation-delay:.04s}",
			".dsob-anim.dsob-d2{animation-delay:.1s}",
			".dsob-anim.dsob-d3{animation-delay:.16s}",
			".dsob-anim.dsob-d4{animation-delay:.22s}",
			".dsob-title{font-size:20px;font-weight:600;letter-spacing:.01em;margin:4px 0 4px;color:#eef0f5}",
			".dsob-sub{color:rgba(230,233,240,.52);font-size:13px;margin-bottom:14px}",
			".dsob-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:10px;margin:10px 0}",
			".dsob-tile{padding:12px 13px;border:1px solid rgba(255,255,255,.07);border-radius:11px;background:rgba(255,255,255,.02);transition:transform .18s cubic-bezier(.2,.8,.3,1),background .18s,border-color .18s}",
			".dsob-tile:hover{transform:translateY(-2px);background:rgba(255,255,255,.045);border-color:rgba(255,255,255,.13)}",
			".dsob-tile-head{display:flex;align-items:center;gap:8px;margin-bottom:3px}",
			".dsob-tile-head svg{width:15px;height:15px;flex:none;color:rgba(238,240,245,.66)}",
			".dsob-tile b{display:block;font-size:13px;color:rgba(238,240,245,.92);font-weight:600}",
			".dsob-tile span{font-size:12px;color:rgba(230,233,240,.48);line-height:1.55;display:block}",
			".dsob-keytable{width:100%;border-collapse:collapse;margin:8px 0;font-size:13px}",
			".dsob-keytable tr{transition:background .14s}",
			".dsob-keytable tr:hover{background:rgba(255,255,255,.03)}",
			".dsob-keytable td{padding:7.5px 8px;border-bottom:1px solid rgba(255,255,255,.055)}",
			".dsob-keytable td:first-child{white-space:nowrap;width:1%}",
			".dsob-kbd{display:inline-block;font:11px/1 ui-monospace,Consolas,monospace;padding:3px 8px;border:1px solid rgba(255,255,255,.14);border-radius:5px;color:rgba(238,240,245,.8);background:rgba(255,255,255,.045);margin-right:4px}",
			".dsob-keydesc{color:rgba(230,233,240,.68)}",
			".dsob-state{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:11px;margin:10px 0;font-size:13.5px;border:1px solid rgba(255,255,255,.09);color:rgba(238,240,245,.85);background:rgba(255,255,255,.03);transition:color .25s,border-color .25s,background .25s}",
			".dsob-ok{color:#8fd4a6;border-color:rgba(143,212,166,.3);background:rgba(143,212,166,.06)}",
			".dsob-warn{color:#e0b880;border-color:rgba(224,184,128,.28);background:rgba(224,184,128,.05)}",
			".dsob-loading{color:rgba(230,233,240,.55)}",
			".dsob-loading::before{content:'';width:12px;height:12px;border-radius:50%;border:1.5px solid rgba(255,255,255,.18);border-top-color:rgba(238,240,245,.8);animation:dsobSpin .8s linear infinite;flex:none}",
			"@keyframes dsobSpin{to{transform:rotate(360deg)}}",
			".dsob-steps{display:flex;gap:6px;padding:2px 24px 18px;align-items:center}",
			".dsob-dot{width:6px;height:6px;border-radius:99px;background:rgba(255,255,255,.15);transition:width .3s cubic-bezier(.2,.9,.3,1),background .3s,opacity .3s}",
			".dsob-dot.dsob-cur{width:20px;background:rgba(238,240,245,.85)}",
			".dsob-nav{margin-left:auto;display:flex;gap:8px}",
			".dsob-btn{font-size:13px;padding:8px 18px;border-radius:9px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:rgba(238,240,245,.85);cursor:pointer;transition:background .16s,border-color .16s,transform .16s,box-shadow .16s}",
			".dsob-btn:hover:not(:disabled){background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.24);transform:translateY(-1px)}",
			".dsob-btn:active:not(:disabled){transform:translateY(0)}",
			".dsob-btn:disabled{opacity:.3;cursor:default}",
			".dsob-btn-primary{background:rgba(240,242,247,.95);color:#14161c;border-color:transparent;font-weight:600;box-shadow:0 4px 18px rgba(0,0,0,.25)}",
			".dsob-btn-primary:hover:not(:disabled){background:#fff;border-color:transparent;box-shadow:0 6px 22px rgba(0,0,0,.32)}",
			".dsob-recheck{font-size:12px;color:rgba(238,240,245,.75);background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.13);border-radius:8px;padding:5px 12px;cursor:pointer;margin-top:4px;transition:background .16s,border-color .16s}",
			".dsob-recheck:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.24)}",
			/* tutorial section */
			".dsob-tut{display:flex;flex-direction:column;gap:12px;padding:4px 0 28px;max-width:760px}",
			".dsob-tut-hint{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;margin:0}",
			".dsob-tut-run{align-self:flex-start;font-size:13px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-module-platform);border:1px solid var(--dsw-alias-border-l2);border-radius:9px;padding:7px 18px;cursor:pointer;transition:border-color .16s,transform .16s}",
			".dsob-tut-run:hover{border-color:var(--dsw-alias-label-secondary);transform:translateY(-1px)}",
			".dsob-tut-ch{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-module-platform);overflow:hidden;transition:border-color .18s}",
			".dsob-tut-ch:hover{border-color:var(--dsw-alias-border-l1)}",
			".dsob-tut-ch summary{list-style:none;cursor:pointer;padding:13px 16px;font-size:14px;color:var(--dsw-alias-label-primary);display:flex;align-items:center;gap:8px;user-select:none;transition:background .15s}",
			".dsob-tut-ch summary:hover{background:rgba(127,127,127,.05)}",
			".dsob-tut-ch summary::-webkit-details-marker{display:none}",
			".dsob-tut-ch summary::after{content:'▾';margin-left:auto;color:var(--dsw-alias-label-secondary);transition:transform .22s cubic-bezier(.2,.9,.3,1);font-size:12px}",
			".dsob-tut-ch[open] summary::after{transform:rotate(180deg)}",
			".dsob-tut-body{padding:2px 16px 15px;border-top:1px solid var(--dsw-alias-border-l1)}",
			".dsob-tut-body p{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:21px;margin:10px 0}",
			".dsob-tut-body ul{margin:8px 0;padding-left:20px}",
			".dsob-tut-body li{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:22px}",
			".dsob-tut-body code{font-family:ui-monospace,Consolas,monospace;font-size:12px;background:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);padding:1px 6px;border-radius:5px}"
		].join("");
		const tagId = "@deepseek-ai/dsh-client-ui-onboarding/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-onboarding";
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
				body: JSON.stringify({ type: "client-request", rpcId: "dsob-" + String(++rpcSeq), method, payload })
			});
			if (!res.ok) throw new Error("HTTP " + String(res.status));
			const envelope = await res.json();
			const result = envelope?.result;
			if (result === undefined || result.ok !== true) throw new Error(result?.error?.message ?? method + " 调用失败");
			return result.value;
		}
		/** Check whether the DeepSeek API key credential is configured. */
		async function checkApiKey() {
			const value = await rpc("credentials.describe", { refs: ["DEEPSEEK_API_KEY"] });
			const entry = value?.credentials?.DEEPSEEK_API_KEY;
			return entry?.configured === true;
		}
		//#endregion
		//#region wizard content
		const FEATURE_TILES = [
			{ icon: "chat", title: "智能会话", text: "编程、写文档、分析数据——像和一位工程师结对一样对话，AI 会自己调用工具完成操作。" },
			{ icon: "tool", title: "AI 工具箱", text: "网页抓取、文件搜索、剪贴板读写、定时提醒，AI 都能直接执行。" },
			{ icon: "www", title: "浏览器控制", text: "在设置中启用后，AI 可以驱动 Edge/Chrome 自动打开网页、点击、填表。" },
			{ icon: "time", title: "定时任务", text: "设置→定时任务：定时提醒与重复任务，到点弹系统通知。" },
			{ icon: "memo", title: "长期记忆", text: "AI 记得住你的偏好与项目约定，跨会话不遗忘。" },
			{ icon: "clip", title: "快捷短语", text: "常用提示词存成片段，Ctrl+/ 一键插入输入框。" }
		];
		/** Monochrome 24×24 stroke icons (single <path>/<circle> set, currentColor). */
		const FEATURE_ICONS = {
			chat: '<path d="M12 3a9 9 0 0 0-8.6 12L2 21l6-1.4A9 9 0 1 0 12 3z"/>',
			tool: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2.4-2.4z"/>',
			www: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.5 2.5 3.5 5 3.5 8s-1 5.5-3.5 8c-2.5-2.5-3.5-5-3.5-8S9.5 6.5 12 4z"/>',
			time: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2"/>',
			memo: '<path d="M6 3h12v18l-6-4-6 4z"/>',
			clip: '<path d="M20 11.5l-8.5 8.5a5 5 0 0 1-7-7L13 5.5a3.3 3.3 0 0 1 4.7 4.7L10 18a1.8 1.8 0 0 1-2.6-2.6l7.6-7.6"/>'
		};
		function featureIcon(name) {
			const inner = FEATURE_ICONS[name] ?? FEATURE_ICONS.chat;
			return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
		}
		function buildTile(tile) {
			const el = document.createElement("div");
			el.className = "dsob-tile";
			const head = document.createElement("div");
			head.className = "dsob-tile-head";
			head.innerHTML = featureIcon(tile.icon);
			const b = document.createElement("b");
			b.textContent = tile.title;
			const s = document.createElement("span");
			s.textContent = tile.text;
			head.appendChild(b);
			el.appendChild(head);
			el.appendChild(s);
			return el;
		}
		const SHORTCUTS = [
			{ keys: ["Ctrl", "K"], desc: "快速搜索并跳转到任意会话" },
			{ keys: ["Ctrl", "/"], desc: "快捷短语：插入保存的提示词片段" },
			{ keys: ["Ctrl", "Shift", "V"], desc: "剪贴板历史：粘贴最近 50 条复制内容" },
			{ keys: ["Ctrl", "E"], desc: "把当前会话导出为 Markdown 文件" },
			{ keys: ["F1"], desc: "快捷键帮助面板" },
			{ keys: ["Ctrl", "D", "S"], desc: "全局呼出快捷输入条（任意应用内）" },
			{ keys: ["Ctrl", "Alt", "B"], desc: "老板键：立即隐藏整个应用" },
			{ keys: ["Ctrl", "Alt", "T"], desc: "窗口置顶开关" },
			{ keys: ["Ctrl", "+/-/0"], desc: "界面缩放 放大/缩小/重置" }
		];
		//#endregion
		//#region wizard
	const DONE_KEY = "dsh.onboarding.done";
	/**
	* Durable settings home for the finished marker. The desktop shell boots the
	* SPA on a fresh loopback port each launch, so the localStorage origin (and
	* with it the done flag) changes between runs. Persisting here survives that.
	*/
	const PERSIST_NS = "ui-onboarding";
	const PERSIST_FIELD = "dshOnboardingDone";
	/** Whether the durable settings marker says onboarding is finished. */
	let donePersisted = false;
	/** Read the durable finished marker through the settings wire. */
	async function readPersistedDone() {
		try {
			const value = await rpc("settings.describe", {});
			const view = value?.namespaces?.find((candidate) => candidate.ns === PERSIST_NS);
			if (view?.value?.[PERSIST_FIELD] === true) donePersisted = true;
		} catch { /* fall back to local storage only */ }
	}
	/** Persist the finished marker durably so it survives origin changes. */
	async function persistDone() {
		try {
			await rpc("settings.mutate", {
				ns: PERSIST_NS,
				ops: [{ op: "set", path: [PERSIST_FIELD], value: true }]
			});
		} catch { /* non-fatal: local storage still covers the same-origin case */ }
	}
	let wizardEl = undefined;
	function markDone() {
		donePersisted = true;
		try { localStorage.setItem(DONE_KEY, "1"); } catch { /* storage unavailable */ }
		void persistDone();
	}
		function closeWizard() {
			if (wizardEl === undefined) return;
			const el = wizardEl;
			wizardEl = undefined;
			el.classList.add("dsob-closing");
			setTimeout(() => el.remove(), 260);
		}
		function kbdRow({ keys, desc }) {
			const tr = document.createElement("tr");
			const tdKeys = document.createElement("td");
			for (const key of keys) {
				const k = document.createElement("span");
				k.className = "dsob-kbd";
				k.textContent = key;
				tdKeys.appendChild(k);
			}
			const tdDesc = document.createElement("td");
			tdDesc.className = "dsob-keydesc";
			tdDesc.textContent = desc;
			tr.appendChild(tdKeys);
			tr.appendChild(tdDesc);
			return tr;
		}
		/** Run the first-use wizard. `force` skips the done-flag check. */
		function runWizard(force = false) {
			if (!force) {
				try {
					if (localStorage.getItem(DONE_KEY) === "1" || donePersisted) return;
				} catch { /* run anyway */ }
			}
			if (wizardEl !== undefined) return;
			const STEP_COUNT = 5;
			let step = 0;
			wizardEl = document.createElement("div");
			wizardEl.className = "dsob-overlay";
			const card = document.createElement("div");
			card.className = "dsob-card";
			// header
			const head = document.createElement("div");
			head.className = "dsob-head";
			const brand = document.createElement("div");
			brand.className = "dsob-brand";
			const badge = document.createElement("span");
			badge.className = "dsob-brand-badge";
			badge.textContent = "DS";
			const brandText = document.createElement("span");
			brandText.textContent = "DeepSeek Harness Desktop";
			brand.appendChild(badge);
			brand.appendChild(brandText);
			const skip = document.createElement("button");
			skip.type = "button";
			skip.className = "dsob-skip";
			skip.textContent = "跳过向导 ×";
			head.appendChild(brand);
			head.appendChild(skip);
			// body
			const body = document.createElement("div");
			body.className = "dsob-body";
			// dots + nav
			const steps = document.createElement("div");
			steps.className = "dsob-steps";
			const dots = [];
			for (let i = 0; i < STEP_COUNT; i += 1) {
				const dot = document.createElement("span");
				dot.className = "dsob-dot";
				dots.push(dot);
				steps.appendChild(dot);
			}
			const nav = document.createElement("div");
			nav.className = "dsob-nav";
			const prev = document.createElement("button");
			prev.type = "button";
			prev.className = "dsob-btn";
			prev.textContent = "上一步";
			const next = document.createElement("button");
			next.type = "button";
			next.className = "dsob-btn dsob-btn-primary";
			nav.appendChild(prev);
			nav.appendChild(next);
			steps.appendChild(nav);
			card.appendChild(head);
			card.appendChild(body);
			card.appendChild(steps);
			wizardEl.appendChild(card);
			document.body.appendChild(wizardEl);
			skip.addEventListener("click", () => { markDone(); closeWizard(); });
			wizardEl.addEventListener("mousedown", (event) => {
				if (event.target === wizardEl) { markDone(); closeWizard(); }
			});
			const finish = () => { markDone(); closeWizard(); };
			const goTo = (nextStep) => {
				if (nextStep === step) return;
				body.classList.add("dsob-out");
				setTimeout(() => {
					step = nextStep;
					body.classList.remove("dsob-out");
					render();
				}, 180);
			};
			prev.addEventListener("click", () => goTo(Math.max(0, step - 1)));
			next.addEventListener("click", () => {
				if (step === STEP_COUNT - 1) { finish(); return; }
				goTo(Math.min(STEP_COUNT - 1, step + 1));
			});
			const keyHandler = (event) => {
				if (wizardEl === undefined) {
					window.removeEventListener("keydown", keyHandler, true);
					return;
				}
				if (event.key === "Enter" && !(event.target instanceof HTMLTextAreaElement)) {
					event.preventDefault();
					if (step === STEP_COUNT - 1) finish();
					else goTo(step + 1);
				}
			};
			window.addEventListener("keydown", keyHandler, true);
			// ── step renderers ──
			const title = (text) => {
				const h = document.createElement("div");
				h.className = "dsob-title dsob-anim dsob-d1";
				h.textContent = text;
				body.appendChild(h);
			};
			const sub = (text) => {
				const s = document.createElement("div");
				s.className = "dsob-sub dsob-anim dsob-d2";
				s.textContent = text;
				body.appendChild(s);
			};
			const renderStep0 = () => {
				title("欢迎，初次见面");
				sub("这是 DeepSeek Harness 的桌面版——把一个会自主干活的 AI 编程助手装进原生窗口。");
				const grid = document.createElement("div");
				grid.className = "dsob-grid dsob-anim dsob-d3";
				for (const tile of FEATURE_TILES.slice(0, 3)) grid.appendChild(buildTile(tile));
				body.appendChild(grid);
				const note = document.createElement("div");
				note.className = "dsob-sub dsob-anim dsob-d4";
				note.style.marginTop = "6px";
				note.textContent = "接下来 1 分钟：检查 API Key → 认识功能 → 记住几个顺手的快捷键。";
				body.appendChild(note);
			};
			const renderStep1 = () => {
				title("第 1 步 · 连接 DeepSeek");
				sub("AI 需要 API Key 才能工作；没有也能先逛逛界面，但发不了消息。");
				const state = document.createElement("div");
				state.className = "dsob-state dsob-loading dsob-anim dsob-d3";
				state.textContent = "正在检测 DEEPSEEK_API_KEY…";
				body.appendChild(state);
				const recheck = document.createElement("button");
				recheck.type = "button";
				recheck.className = "dsob-recheck dsob-anim dsob-d4";
				recheck.textContent = "我已配置，重新检测";
				const paint = (configured) => {
					state.className = "dsob-state dsob-anim dsob-d3 " + (configured ? "dsob-ok" : "dsob-warn");
					state.textContent = configured
						? "API Key 已配置，一切就绪。"
						: "尚未检测到 API Key。打开左侧 设置 → 模型，把 DeepSeek API Key 填进去即可。";
				};
				const check = () => {
					state.className = "dsob-state dsob-anim dsob-d3 dsob-loading";
					state.textContent = "正在检测 DEEPSEEK_API_KEY…";
					checkApiKey().then(paint).catch(() => paint(false));
				};
				recheck.addEventListener("click", check);
				body.appendChild(recheck);
				const tip = document.createElement("div");
				tip.className = "dsob-sub dsob-anim dsob-d4";
				tip.style.marginTop = "8px";
				tip.append("获取 Key：");
				const link = document.createElement("a");
				link.href = "https://platform.deepseek.com";
				link.target = "_blank";
				link.rel = "noopener";
				link.textContent = "platform.deepseek.com";
				link.style.color = "rgba(230,233,240,.85)";
				link.style.textDecoration = "underline";
				tip.appendChild(link);
				tip.append(" → API Keys 页面创建，几秒即得。");
				body.appendChild(tip);
				check();
			};
			const renderStep2 = () => {
				title("第 2 步 · 它能做什么");
				sub("六大能力，覆盖从写代码到管电脑的大部分场景。");
				const grid = document.createElement("div");
				grid.className = "dsob-grid dsob-anim dsob-d3";
				for (const tile of FEATURE_TILES) grid.appendChild(buildTile(tile));
				body.appendChild(grid);
			};
			const renderStep3 = () => {
				title("第 3 步 · 顺手的快捷键");
				sub("记住前三个，效率翻倍；完整的表随时按 F1 查看。");
				const table = document.createElement("table");
				table.className = "dsob-keytable dsob-anim dsob-d3";
				const tbody = document.createElement("tbody");
				for (const row of SHORTCUTS) tbody.appendChild(kbdRow(row));
				table.appendChild(tbody);
				body.appendChild(table);
			};
			const renderStep4 = () => {
				title("一切就绪");
				sub("直接开始：新建一个会话，用一句话描述你要做的事——剩下的交给 AI。");
				const grid = document.createElement("div");
				grid.className = "dsob-grid dsob-anim dsob-d3";
				for (const tile of [
					{ icon: "chat", title: "试试这样开头", text: "“帮我看看这个项目的结构，然后写一个 README”" },
					{ icon: "memo", title: "遇到问题", text: "设置 → 使用教程，随时回来看这份完整指南。" },
					{ icon: "time", title: "保持更新", text: "设置 → 更新，一键检查并升级到最新版本。" }
				]) grid.appendChild(buildTile(tile));
				body.appendChild(grid);
			};
			const renderers = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4];
			const render = () => {
				body.textContent = "";
				body.scrollTop = 0;
				dots.forEach((dot, index) => dot.classList.toggle("dsob-cur", index === step));
				prev.disabled = step === 0;
				next.textContent = step === STEP_COUNT - 1 ? "开始使用" : "下一步";
				renderers[step]();
			};
			render();
		}
		// Public handle: the tutorial section's rerun button (and the console).
		window.__dshOnboarding = { run: () => runWizard(true) };
		const bootWizard = () => {
			// Resolve the durable marker first: the shell SPA changes its loopback
			// origin between launches, so local-only state cannot gate the wizard.
			// A user who already has a DeepSeek key was configured before the durable
			// marker existed — treat them as done rather than re-showing the wizard.
			void readPersistedDone()
				.then(() => {
					if (donePersisted) return;
					return checkApiKey().then((configured) => {
						if (configured) markDone();
					}).catch(() => { /* detection failed: show the wizard as usual */ });
				})
				.finally(() => setTimeout(() => runWizard(false), 1400));
		};
		if (document.readyState === "complete" || document.readyState === "interactive") bootWizard();
		else document.addEventListener("DOMContentLoaded", bootWizard, { once: true });
		//#endregion
		//#region tutorial section
		const CHAPTERS = [
			{
				title: "1 · 入门：和 AI 的第一次对话",
				body: (jsx, jsxs) => jsxs("div", { className: "dsob-tut-body", children: [
					jsx("p", { children: "点击左上角「新建会话」，用一句话说清你要什么——不用学任何指令语法。" }),
					jsxs("ul", { children: [
						jsx("li", { children: "具体一点更好：“把 src/utils.js 里的重复代码抽成函数” 优于 “优化代码”。" }),
						jsx("li", { children: "AI 会自己读文件、改代码、跑命令；每个危险操作都会先征求你的同意。" }),
						jsx("li", { children: "回复中的代码块右上角有 复制 / 保存 / 折叠 按钮；Mermaid 流程图会自动渲染成图。" })
					] })
				] })
			},
			{
				title: "2 · 会话与工作区",
				body: (jsx, jsxs) => jsxs("div", { className: "dsob-tut-body", children: [
					jsxs("ul", { children: [
						jsx("li", { children: "会话按工作区（文件夹）分组；切换工作区后 AI 的工作目录跟着切换。" }),
						jsx("li", { children: "置顶：会话行的 pin 图标，常驻列表顶部。" }),
						jsx("li", { children: ["搜索：", jsx("code", { children: "Ctrl+K" }), " 弹出全局搜索框，方向键选择、回车直达。"] }),
						jsx("li", { children: ["导出：", jsx("code", { children: "Ctrl+E" }), " 把当前对话（含代码块与工具调用摘要）存成 Markdown 文件。"] }),
						jsx("li", { children: ["归档/删除：会话右键菜单，长草的对话定期清理。"] })
					] })
				] })
			},
			{
				title: "3 · 输入提效：短语与剪贴板",
				body: (jsx, jsxs) => jsxs("div", { className: "dsob-tut-body", children: [
					jsx("p", { children: "重复的话不值得打第二遍。" }),
					jsxs("ul", { children: [
						jsx("li", { children: [jsx("code", { children: "Ctrl+/" }), " 打开快捷短语：回车插入；右上角可把当前输入框内容存成片段。AI 用 snippet_save 存的片段也出现在这里——人与 AI 共用一个库。"] }),
						jsx("li", { children: [jsx("code", { children: "Ctrl+Shift+V" }), " 剪贴板历史：最近 50 条复制记录，过滤后一键插入，跨应用也能找回。"] })
					] })
				] })
			},
			{
				title: "4 · AI 的长本事：工具、记忆、提醒",
				body: (jsx, jsxs) => jsxs("div", { className: "dsob-tut-body", children: [
					jsxs("ul", { children: [
						jsx("li", { children: "网页阅读：直接说“帮我读一下这篇文章 <链接> 总结要点”，AI 用 web_fetch 抓正文。" }),
						jsx("li", { children: "定时提醒：“30 分钟后提醒我检查构建”，AI 调 remind，到点弹系统通知+音效。" }),
						jsx("li", { children: "文件定位：“那个 webpack 配置文件在哪”，AI 用 file_name_search 秒搜文件名。" }),
						jsx("li", { children: "剪贴板：“把我刚才复制的日志贴出来分析”，AI 能直接读系统剪贴板。" }),
						jsx("li", { children: "长期记忆：设置 → 记忆 可查看 AI 记住的偏好/约定；它跨会话生效。" })
					] })
				] })
			},
			{
				title: "5 · 浏览器控制（Edge / Chrome）",
				body: (jsx, jsxs) => jsxs("div", { className: "dsob-tut-body", children: [
					jsx("p", { children: "设置 → 浏览器控制：选择 Edge 或 Chrome 并启用（首次会拉起带调试端口的浏览器实例）。" }),
					jsxs("ul", { children: [
						jsx("li", { children: "之后直接说：“打开 GitHub 搜索 electron，把第一个仓库的 star 数告诉我”。" }),
						jsx("li", { children: "AI 能导航、点击、输入、切标签页、截图、执行页面 JS。" }),
						jsx("li", { children: "担心隐私时随时在设置里一键停用。" })
					] })
				] })
			},
			{
				title: "6 · 定时任务与桌面增强",
				body: (jsx, jsxs) => jsxs("div", { className: "dsob-tut-body", children: [
					jsxs("ul", { children: [
						jsx("li", { children: "定时任务（设置 → 定时任务）：一次性/重复任务，可只提醒或让 AI 无人值守执行。" }),
						jsx("li", { children: "老板键 Ctrl+Alt+B：任何界面一键隐藏；有托盘则藏进托盘。" }),
						jsx("li", { children: "窗口置顶 Ctrl+Alt+T / 标题栏图钉；缩放 Ctrl+±0。" }),
						jsx("li", { children: "静默启动：开机自启不弹窗，托盘待命——见 设置 → 桌面。" }),
						jsx("li", { children: "更新：设置 → 更新 检查新版本，多线程+镜像加速下载一键升级。" })
					] })
				] })
			},
			{
				title: "7 · 快捷键总表",
				body: (jsx, jsxs) => jsxs("div", { className: "dsob-tut-body", children: jsx("table", { className: "dsob-keytable", children: jsx("tbody", { children: SHORTCUTS.map((row) => jsxs("tr", { children: [
					jsx("td", { children: row.keys.map((key) => jsx("span", { className: "dsob-kbd", children: key }, key)) }),
					jsx("td", { className: "dsob-keydesc", children: row.desc })
				] }, row.desc)) }) }) })
			}
		];
		let boundT = (key) => key;
		function TutorialSection() {
			const t = boundT;
			const [open, setOpen] = useState(-1);
			const rerun = useCallback(() => {
				const handle = window.__dshOnboarding;
				if (handle !== undefined) handle.run();
			}, []);
			return jsxs("div", { className: "dsob-tut", children: [
				jsx("p", { className: "dsob-tut-hint", children: t("hint") }),
				jsx("button", { type: "button", className: "dsob-tut-run", onClick: rerun, children: t("rerun") }),
				CHAPTERS.map((chapter, index) => jsx("details", {
					className: "dsob-tut-ch",
					open: open === index,
					onToggle: (event) => { if (event.target.open) setOpen(index); else if (open === index) setOpen(-1); },
					children: [
						jsx("summary", { children: chapter.title }),
						chapter.body(jsx, jsxs)
					]
				}, chapter.title))
			] });
		}
		//#endregion
		//#region plugin
		const NS = "settings.tutorial";
		const inject = ["slots", "locale"];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh: {
					"nav": "使用教程",
					"hint": "第一次使用建议跟着向导走一遍；遇到任何功能问题，回来翻对应章节。",
					"rerun": "重新运行新手向导"
				},
				en: {
					"nav": "Tutorial",
					"hint": "New here? Run the wizard once. Come back to these chapters whenever a feature needs explaining.",
					"rerun": "▶ Run the first-use wizard again"
				}
			}), "ui-onboarding: dictionaries");
			boundT = ctx.locale.bind(NS);
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "tutorial",
				order: 20,
				label: () => boundT("nav"),
				locale: NS
			}, TutorialSection));
		}
		//#endregion
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});

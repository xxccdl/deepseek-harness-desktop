window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-updatecheck",
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
			".uc-wrap{display:flex;flex-direction:column;gap:18px;padding:6px 0 32px;max-width:780px}",
			".uc-hint{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:22px;margin:0}",
			".uc-card{border:1px solid var(--dsw-alias-border-l2);border-radius:14px;overflow:hidden;background:var(--dsw-alias-bg-module-platform);box-shadow:0 1px 2px rgba(0,0,0,.04)}",
			".uc-setrow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 16px}",
			".uc-setrow + .uc-setrow{border-top:1px solid var(--dsw-alias-border-l1)}",
			".uc-setrow-label{display:flex;flex-direction:column;gap:2px;min-width:0}",
			".uc-setrow-title{color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}",
			".uc-setrow-desc{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
			".uc-ver{flex:none;font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}",
			".uc-btn{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;padding:7px 16px;border-radius:10px;cursor:pointer;flex:none;transition:background .15s ease,border-color .15s ease}",
			".uc-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
			".uc-btn:disabled{opacity:.5;cursor:default}",
			".uc-btn-primary{border-color:transparent;color:#fff;background:var(--dsw-static-blue-600)}",
			".uc-btn-primary:hover:not(:disabled){background:var(--dsw-static-blue-600);filter:brightness(1.08)}",
			".uc-result{border-top:1px solid var(--dsw-alias-border-l1);padding:14px 16px;display:flex;flex-direction:column;gap:10px}",
			".uc-new{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--dsw-static-green-600)}",
			".uc-dot{width:7px;height:7px;border-radius:50%;background:var(--dsw-static-green-600);flex:none}",
			".uc-latest{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".uc-err{font-size:12px;line-height:19px;color:var(--dsw-alias-state-error-primary);word-break:break-word}",
			".uc-body{font-size:12px;line-height:19px;color:var(--dsw-alias-label-secondary);word-break:break-word;white-space:pre-wrap;max-height:180px;overflow:auto;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:10px;padding:9px 12px}"
		].join("");
		const tagId = "@deepseek-ai/dsh-client-ui-updatecheck/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-updatecheck";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region api
		const LOCAL_URL = "http://127.0.0.1:3090";
		const GH_REPO = "xxccdl/DeepSeek-Harness-Mobile";
		const GH_LATEST_URL = "https://api.github.com/repos/" + GH_REPO + "/releases/latest";

		async function getLocalVersion() {
			const res = await fetch(LOCAL_URL + "/api/version", { method: "GET", cache: "no-store" });
			if (!res.ok) throw new Error("HTTP " + res.status);
			return res.json();
		}

		async function getLatestRelease() {
			const res = await fetch(GH_LATEST_URL, {
				method: "GET",
				headers: { Accept: "application/vnd.github+json" },
				cache: "no-store",
			});
			if (res.status === 404) throw new Error("no-release");
			if (!res.ok) throw new Error("HTTP " + res.status);
			return res.json();
		}

		function normalize(v) {
			return String(v || "").trim().replace(/^v/i, "").split(".").map((n) => parseInt(n, 10) || 0);
		}

		function isNewer(a, b) {
			const x = normalize(a);
			const y = normalize(b);
			const len = Math.max(x.length, y.length);
			for (let i = 0; i < len; i++) {
				const xv = x[i] || 0;
				const yv = y[i] || 0;
				if (xv !== yv) return xv > yv;
			}
			return false;
		}

		function postToNative(msg) {
			const bridge = window.ReactNativeWebView;
			if (bridge && typeof bridge.postMessage === "function") {
				bridge.postMessage(JSON.stringify(msg));
			}
		}
		//#endregion
		//#region components
		let boundT = (key) => key;

		function UpdateSection() {
			// idle | checking | ok | updating | error
			const [state, setState] = useState("idle");
			const [current, setCurrent] = useState(null);
			const [latest, setLatest] = useState(null);
			const [msg, setMsg] = useState(null);

			const check = useCallback(async () => {
				setState("checking");
				setMsg(null);
				try {
					const [local, rel] = await Promise.all([getLocalVersion(), getLatestRelease()]);
					setCurrent(local.versionName || "");
					setLatest(rel);
					setState(isNewer(rel.tag_name, local.versionName) ? "updating" : "ok");
				} catch (e) {
					setState("error");
					setMsg(e instanceof Error ? e.message : String(e));
				}
			}, []);

			useEffect(() => {
				check();
			}, [check]);

			const latestTag = latest ? normalize(latest.tag_name).join(".") : null;

			return jsxs("div", {
				className: "uc-wrap",
				children: [
					jsx("p", { className: "uc-hint", children: boundT("hint") }),
					jsx("div", {
						className: "uc-card",
						children: [
							jsxs("div", { className: "uc-setrow", children: [
								jsxs("div", { className: "uc-setrow-label", children: [
									jsx("span", { className: "uc-setrow-title", children: boundT("cur.title") }),
									jsx("span", { className: "uc-setrow-desc", children: boundT("cur.desc") })
								] }),
								jsx("span", { className: "uc-ver", children: current || "…" })
							] }),
							jsxs("div", { className: "uc-setrow", children: [
								jsxs("div", { className: "uc-setrow-label", children: [
									jsx("span", { className: "uc-setrow-title", children: boundT("latest.title") }),
									jsx("span", { className: "uc-setrow-desc", children: latestTag ? boundT("latest.desc") : boundT("latest.unknown") })
								] }),
								jsx("span", { className: "uc-ver", children: latestTag || "…" })
							] }),
							jsxs("div", { className: "uc-setrow", children: [
								jsx("div", { className: "uc-setrow-label", children: [
									jsx("button", {
										type: "button",
										className: "uc-btn",
										disabled: state === "checking",
										onClick: check,
										children: state === "checking" ? boundT("btn.checking") : boundT("btn.check")
									})
								] })
							] }),
							state === "ok" && jsx("div", { className: "uc-result", children: [
								jsxs("div", { className: "uc-latest", children: [
									jsx("span", { className: "uc-dot", style: { background: "var(--dsw-static-green-600)" } }),
									boundT("ok.text")
								] })
							] }),
							state === "updating" && latest && jsx("div", { className: "uc-result", children: [
								jsxs("div", { className: "uc-new", children: [
									jsx("span", { className: "uc-dot" }),
									boundT("new.text") + " v" + latestTag
								] }),
								typeof latest.body === "string" && latest.body.length > 0 && jsx("div", { className: "uc-body", children: latest.body }),
								jsx("div", { children: [
									jsx("button", {
										type: "button",
										className: "uc-btn uc-btn-primary",
										onClick: () => postToNative({ type: "open-url", url: latest.html_url || ("https://github.com/" + GH_REPO + "/releases") }),
										children: boundT("btn.download")
									})
								] })
							] }),
							state === "error" && jsx("div", { className: "uc-result", children: [
								jsx("div", { className: "uc-err", children: boundT("err." + (msg === "no-release" ? "norelease" : "other")) }),
								msg && msg !== "no-release" && jsx("div", { className: "uc-err", children: msg })
							] })
						]
					})
				]
			});
		}
		//#endregion
		//#region plugin
		const NS = "settings.updatecheck";
		const inject = ["slots", "locale"];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh: {
					"nav": "检查更新",
					"hint": "从 GitHub Release 检查最新版本。发现新版本时仅提示您前往 GitHub 下载，不在应用内自动下载更新。",
					"cur.title": "当前版本",
					"cur.desc": "本机安装的 App 版本",
					"latest.title": "最新版本",
					"latest.desc": "GitHub 最新 Release",
					"latest.unknown": "尚未获取",
					"btn.check": "检查更新",
					"btn.checking": "检查中…",
					"btn.download": "去 GitHub 下载",
					"ok.text": "已是最新版本",
					"new.text": "发现新版本 v",
					"err.norelease": "该仓库暂无 Release，无法检查更新",
					"err.other": "检查更新失败（网络不可达或已被限流），请稍后重试"
				},
				en: {
					"nav": "Check updates",
					"hint": "Check the latest version from GitHub Releases. When a new version is found, you will be prompted to download it from GitHub; no in-app auto-download.",
					"cur.title": "Current version",
					"cur.desc": "Installed app version",
					"latest.title": "Latest version",
					"latest.desc": "Latest GitHub release",
					"latest.unknown": "Not fetched",
					"btn.check": "Check updates",
					"btn.checking": "Checking…",
					"btn.download": "Download from GitHub",
					"ok.text": "You are up to date",
					"new.text": "New version found: v",
					"err.norelease": "This repository has no releases yet",
					"err.other": "Update check failed (network unreachable or rate-limited), please retry later"
				}
			}), "ui-updatecheck: dictionaries");
			boundT = ctx.locale.bind(NS);
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "update-check",
				order: 24,
				label: () => boundT("nav"),
				locale: NS
			}, UpdateSection));
		}
		//#endregion
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});

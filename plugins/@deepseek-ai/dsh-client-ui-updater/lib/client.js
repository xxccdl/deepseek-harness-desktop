window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-updater",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let jsxRuntime = require("react/jsx-runtime");
		const { jsx, jsxs, Fragment } = jsxRuntime;
		const { useState, useEffect, useRef, useCallback } = react;
		//#region styles
		const css = [
			".mupd-wrap{display:flex;flex-direction:column;gap:16px;padding:6px 0 32px;max-width:760px}",
			".mupd-hint{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:22px;margin:0}",
			".mupd-note{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:19px}",
			".mupd-card{border:1px solid var(--dsw-alias-border-l2);border-radius:14px;overflow:hidden;background:var(--dsw-alias-bg-module-platform);box-shadow:0 1px 2px rgba(0,0,0,.04)}",
			".mupd-card-head{display:flex;align-items:center;gap:10px;padding:14px 16px;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".mupd-head-dot{width:7px;height:7px;border-radius:50%;background:var(--dsw-static-blue-600);flex:none}",
			".mupd-body{padding:4px 16px 16px;display:flex;flex-direction:column;gap:12px}",
			".mupd-verrow{display:flex;align-items:center;gap:10px;flex-wrap:wrap}",
			".mupd-verlabel{color:var(--dsw-alias-label-secondary);font-size:13px}",
			".mupd-ver{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".mupd-ver-new{color:var(--dsw-static-blue-600)}",
			".mupd-verarrow{color:var(--dsw-alias-label-tertiary);font-size:14px}",
			".mupd-badge{font-size:12px;line-height:20px;color:#fff;background:var(--dsw-static-blue-600);border-radius:999px;padding:1px 10px;font-weight:600}",
			".mupd-badge-ok{color:var(--dsw-alias-state-success-primary);background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 14%,transparent)}",
			".mupd-btn{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;padding:7px 16px;border-radius:10px;cursor:pointer;flex:none;transition:background .15s ease,border-color .15s ease;display:inline-flex;align-items:center;gap:6px}",
			".mupd-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
			".mupd-btn:disabled{opacity:.55;cursor:default}",
			".mupd-btn-primary{border-color:transparent;color:#fff;background:var(--dsw-static-blue-600)}",
			".mupd-btn-primary:hover:not(:disabled){filter:brightness(1.08)}",
			".mupd-btn-success{border-color:transparent;color:#fff;background:var(--dsw-alias-state-success-primary)}",
			".mupd-btn-success:hover:not(:disabled){filter:brightness(1.06)}",
			".mupd-link{color:var(--dsw-alias-label-secondary)}",
			".mupd-status{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:22px;display:flex;align-items:center;gap:8px}",
			".mupd-status-ok{color:var(--dsw-alias-state-success-primary)}",
			".mupd-dots{display:inline-flex;align-items:center;gap:4px;height:14px}",
			".mupd-dots span{width:5px;height:5px;border-radius:50%;background:var(--dsw-alias-label-tertiary);animation:mupd-dot 1.1s ease-in-out infinite;flex:none}",
			".mupd-dots span:nth-child(2){animation-delay:.16s}",
			".mupd-dots span:nth-child(3){animation-delay:.32s}",
			".mupd-shimmer{position:relative;height:3px;border-radius:999px;background:var(--dsw-alias-border-l2);overflow:hidden}",
			".mupd-shimmer::after{content:'';position:absolute;inset:0;border-radius:999px;background:linear-gradient(90deg,transparent 20%,var(--dsw-static-blue-600) 50%,transparent 80%);transform:translateX(-100%);animation:mupd-shimmer 1.5s ease-in-out infinite}",
			".mupd-error{color:var(--dsw-alias-state-error-primary);font-size:13px;line-height:20px;padding:10px 14px;background:var(--dsw-alias-interactive-bg-hover-danger);border:1px solid var(--dsw-alias-border-l2);border-radius:12px}",
			".mupd-cl-head{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary);margin-top:2px}",
			".mupd-changelog{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:12px;padding:12px 14px;font-size:13px;line-height:21px;color:var(--dsw-alias-label-primary);white-space:pre-wrap;word-break:break-word;max-height:320px;overflow-y:auto;scrollbar-width:thin}",
			".mupd-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}",
			".mupd-progress{display:flex;flex-direction:column;gap:6px}",
			".mupd-bar{height:8px;border-radius:999px;background:var(--dsw-alias-border-l2);overflow:hidden}",
			".mupd-bar-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,var(--dsw-static-blue-600),color-mix(in srgb,var(--dsw-static-blue-600) 55%,#7c5cff));transition:width .15s ease}",
			".mupd-meta{display:flex;justify-content:space-between;gap:10px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}",
			".mupd-meta b{font-weight:600;color:var(--dsw-alias-label-primary)}",
			".mupd-mirrors{box-sizing:border-box;width:100%;min-height:120px;resize:vertical;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:20px;padding:10px 12px;border-radius:12px;transition:border-color .15s ease}",
			".mupd-mirrors:focus{outline:0;border-color:var(--dsw-static-blue-600)}",
			"@keyframes mupd-dot{0%,60%,100%{transform:scale(.55);opacity:.35}30%{transform:scale(1);opacity:1}}",
			"@keyframes mupd-shimmer{100%{transform:translateX(100%)}}"
		].join("");
		const tagId = "@deepseek-ai/dsh-client-ui-updater/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-updater";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region bridge
		const desktop = typeof window !== "undefined" && typeof window.dshDesktop === "object" && window.dshDesktop !== null
			? window.dshDesktop
			: undefined;
		//#endregion
		//#region helpers
		function fmtSize(n) {
			if (!(n > 0)) return "0 B";
			if (n < 1024) return `${n} B`;
			if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
			return `${(n / 1024 / 1024).toFixed(1)} MB`;
		}
		function fmtEta(ms) {
			const s = Math.max(0, Math.round(ms / 1000));
			if (s < 60) return `${s}s`;
			if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
			return `${Math.floor(s / 3600)}h ${Math.floor(s % 3600 / 60)}m`;
		}
		function fmtDate(s) {
			if (!s) return "";
			const d = new Date(s);
			if (Number.isNaN(d.getTime())) return "";
			const pad = (v) => String(v).padStart(2, "0");
			return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
		}
		//#endregion
		//#region components
		let boundT = (key) => key;

		function UpdaterSection() {
			const t = boundT;
			const [phase, setPhase] = useState("idle"); // idle | checking | ready | error
			const [info, setInfo] = useState(undefined);
			const [appVersion, setAppVersion] = useState("");
			const [checkError, setCheckError] = useState(undefined);
			const [dl, setDl] = useState({ status: "idle", percent: 0, received: 0, total: 0, speed: 0, active: 0, etaMs: 0, source: undefined, filePath: undefined, error: undefined });
			const [mirrors, setMirrors] = useState({ list: [], customized: false, draft: "", loaded: false, saving: false, saved: false });
			const speedRef = useRef({ time: 0, received: 0 });
			// Show the current app version immediately, independent of the check result.
			useEffect(() => {
				if (desktop !== undefined && typeof desktop.getAppInfo === "function") {
					desktop.getAppInfo().then((appInfo) => {
						if (appInfo && typeof appInfo.appVersion === "string") setAppVersion(appInfo.appVersion);
					}).catch(() => {});
				}
			}, []);
			// Load the mirror-source list (customized or defaults).
			useEffect(() => {
				if (desktop === undefined || typeof desktop.getUpdateMirrors !== "function") return;
				desktop.getUpdateMirrors().then((res) => {
					if (res && Array.isArray(res.mirrors)) {
						setMirrors((s) => ({ ...s, list: res.mirrors, customized: res.customized === true, draft: res.mirrors.join("\n"), loaded: true }));
					}
				}).catch(() => {});
			}, []);
			const onProgress = useCallback((p) => {
				// Prefer the engine-reported throughput/ETA when present; fall back to
				// a client-side sample for older bridges that only send received/total.
				let speed = typeof p.speed === "number" && p.speed > 0 ? p.speed : 0;
				if (speed === 0) {
					const now = Date.now();
					const prev = speedRef.current;
					if (prev.time > 0 && now > prev.time) {
						speed = ((p.received ?? 0) - prev.received) * 1000 / (now - prev.time);
					}
					speedRef.current = { time: now, received: p.received ?? 0 };
				}
				setDl((s) => ({
					...s,
					status: "downloading",
					received: p.received ?? 0,
					total: p.total ?? 0,
					speed,
					active: p.active ?? 0,
					etaMs: p.etaMs ?? 0,
					source: p.source,
					percent: p.total > 0 ? Math.min(100, Math.round((p.received ?? 0) * 100 / p.total)) : 0
				}));
			}, []);
			const check = async () => {
				if (desktop === undefined || typeof desktop.checkUpdate !== "function") {
					setCheckError(t("bridgeMissing"));
					setPhase("error");
					return;
				}
				setPhase("checking");
				setCheckError(undefined);
				setInfo(undefined);
				setDl({ status: "idle", percent: 0, received: 0, total: 0, speed: 0, filePath: undefined, error: undefined });
				try {
					const result = await desktop.checkUpdate();
					if (result?.ok !== true) {
						setCheckError(result?.error ?? t("checkFailed"));
						setPhase("error");
						return;
					}
					setInfo(result);
					setPhase("ready");
				} catch (err) {
					setCheckError(err instanceof Error ? err.message : String(err));
					setPhase("error");
				}
			};
			const download = async () => {
				if (desktop === undefined || typeof desktop.downloadUpdate !== "function" || info === undefined) return;
				const asset = (info.assets ?? [])[0];
				if (asset === undefined) {
					setDl((s) => ({ ...s, status: "error", error: t("noAsset") }));
					return;
				}
				setDl({ status: "downloading", percent: 0, received: 0, total: asset.size ?? 0, speed: 0, filePath: undefined, error: undefined });
				speedRef.current = { time: 0, received: 0 };
				try {
					const result = await desktop.downloadUpdate({ url: asset.url, name: asset.name }, onProgress);
					if (result?.ok !== true) {
						setDl((s) => ({ ...s, status: "error", error: result?.error ?? t("downloadFailed") }));
						return;
					}
					setDl((s) => ({ ...s, status: "done", percent: 100, filePath: result.filePath }));
				} catch (err) {
					setDl((s) => ({ ...s, status: "error", error: err instanceof Error ? err.message : String(err) }));
				}
			};
			const install = async () => {
				if (desktop === undefined || typeof desktop.installUpdate !== "function" || dl.filePath === undefined) return;
				try {
					await desktop.installUpdate(dl.filePath);
					setDl((s) => ({ ...s, status: "installing" }));
				} catch (err) {
					setDl((s) => ({ ...s, status: "error", error: err instanceof Error ? err.message : String(err) }));
				}
			};
			const saveMirrors = async () => {
				if (desktop === undefined || typeof desktop.setUpdateMirrors !== "function") return;
				const list = mirrors.draft.split(/\r?\n/).map((m) => m.trim()).filter((m) => m !== "");
				setMirrors((s) => ({ ...s, saving: true, saved: false }));
				try {
					const res = await desktop.setUpdateMirrors(list);
					if (res && Array.isArray(res.mirrors)) {
						setMirrors((s) => ({ ...s, list: res.mirrors, customized: true, saving: false, saved: true }));
					}
				} catch {
					setMirrors((s) => ({ ...s, saving: false, saved: false }));
				}
			};
			const resetMirrors = async () => {
				if (desktop === undefined || typeof desktop.resetUpdateMirrors !== "function") return;
				setMirrors((s) => ({ ...s, saving: true, saved: false }));
				try {
					const res = await desktop.resetUpdateMirrors();
					if (res && Array.isArray(res.mirrors)) {
						setMirrors((s) => ({ ...s, list: res.mirrors, customized: false, draft: res.mirrors.join("\n"), saving: false, saved: true }));
					}
				} catch {
					setMirrors((s) => ({ ...s, saving: false, saved: false }));
				}
			};
			const hasUpdate = info?.hasUpdate === true;
			const downloading = dl.status === "downloading";
			const asset = (info?.assets ?? [])[0];
			const downloadLabel = hasUpdate
				? (asset?.size > 0 ? `${t("download")} · ${fmtSize(asset.size)}` : t("download"))
				: t("download");
			return jsxs("div", { className: "mupd-wrap", children: [
				jsx("p", { className: "mupd-hint", children: t("hint") }),
				jsxs("div", { className: "mupd-card", children: [
					jsx("div", { className: "mupd-card-head", children: [jsx("span", { className: "mupd-head-dot" }), jsx("span", { children: t("title") })] }),
					jsxs("div", { className: "mupd-body", children: [
						jsxs("div", { className: "mupd-verrow", children: [
							jsx("span", { className: "mupd-verlabel", children: t("current") }),
							jsx("span", { className: "mupd-ver", children: `v${appVersion || info?.current || ""}` }),
							hasUpdate ? jsxs(Fragment, { children: [
								jsx("span", { className: "mupd-verarrow", children: "→" }),
								jsx("span", { className: "mupd-ver mupd-ver-new", children: `v${info?.latest ?? ""}` }),
								jsx("span", { className: "mupd-badge", children: t("newVersionBadge") }),
								jsx("span", { className: "mupd-note", children: t("published", { date: fmtDate(info?.publishedAt) }) })
							] }) : null,
							phase === "ready" && !hasUpdate ? jsx("span", { className: "mupd-badge mupd-badge-ok", children: t("upToDate") }) : null
						] }),
						jsxs("div", { className: "mupd-actions", children: [
							jsx("button", { type: "button", className: "mupd-btn" + (dl.status === "done" || dl.status === "installing" ? " mupd-btn-success" : " mupd-btn-primary"), disabled: phase === "checking" || downloading || dl.status === "installing", onClick: () => {
								if (dl.status === "done" || dl.status === "installing") void install();
								else if (dl.status === "downloading") return;
								else if (hasUpdate) void download();
								else void check();
							}, children: phase === "checking" ? jsxs(Fragment, { children: [jsx("span", { className: "mupd-dots", children: [jsx("span", {}), jsx("span", {}), jsx("span", {})] }), jsx("span", { children: t("checking") })] })
								: downloading ? jsx("span", { children: `${t("downloading")} ${dl.percent}%` })
									: dl.status === "done" || dl.status === "installing" ? jsx("span", { children: dl.status === "installing" ? t("installing") : t("installNow") })
										: jsx("span", { children: downloadLabel }) }),
							phase === "idle" || phase === "error" ? jsx("button", { type: "button", className: "mupd-btn", onClick: () => void check(), children: t("recheck") }) : null,
							hasUpdate && info?.url ? jsx("button", { type: "button", className: "mupd-btn mupd-link", onClick: () => { if (desktop !== undefined && typeof desktop.openExternal === "function") void desktop.openExternal(info.url); }, children: t("viewOnGithub") }) : null
						] }),
						phase === "checking" ? jsxs(Fragment, { children: [
							jsx("div", { className: "mupd-shimmer" }),
							jsx("div", { className: "mupd-status", children: [jsx("span", { className: "mupd-dots", children: [jsx("span", {}), jsx("span", {}), jsx("span", {})] }), jsx("span", { children: t("checking") })] })
						] }) : null,
						phase === "error" && checkError !== undefined ? jsx("div", { className: "mupd-error", children: checkError }) : null,
						hasUpdate ? jsxs(Fragment, { children: [
							jsx("div", { className: "mupd-cl-head", children: [jsx("span", { className: "mupd-head-dot" }), jsx("span", { children: t("changelog") })] }),
							jsx("div", { className: "mupd-changelog", children: info?.changelog || t("noChangelog") })
						] }) : null,
						downloading ? jsxs("div", { className: "mupd-progress", children: [
							jsx("div", { className: "mupd-bar", children: jsx("div", { className: "mupd-bar-fill", style: { width: `${dl.percent}%` } }) }),
							jsxs("div", { className: "mupd-meta", children: [
								jsx("span", { children: jsxs(Fragment, { children: [jsx("b", { children: t("threads", { n: "16" }) }), jsx("span", { children: " · " }), jsx("b", { children: fmtSize(dl.received) }), jsx("span", { children: " / " + fmtSize(dl.total) })] }) }),
								jsx("span", { children: dl.speed > 0 ? `${fmtSize(dl.speed)}/s` : "" }),
								dl.etaMs > 0 ? jsx("span", { children: ` · ${fmtEta(dl.etaMs)}` }) : null,
								dl.active > 0 ? jsx("span", { children: ` · ${dl.active} ${t("activeThreads")}` }) : null,
								dl.source !== undefined ? jsx("span", { children: ` · ${t(dl.source === "mirror" ? "source.mirror" : "source.direct")}` }) : null
							] })
						] }) : null,
						dl.status === "done" ? jsx("div", { className: "mupd-status mupd-status-ok", children: t("downloadDone") }) : null,
						dl.status === "installing" ? jsx("div", { className: "mupd-status", children: t("installingHint") }) : null,
						dl.status === "error" && dl.error !== undefined ? jsx("div", { className: "mupd-error", children: dl.error }) : null
					] })
				] }),
				jsxs("div", { className: "mupd-card", children: [
					jsx("div", { className: "mupd-card-head", children: [jsx("span", { className: "mupd-head-dot" }), jsx("span", { children: t("mirrors.title") })] }),
					jsxs("div", { className: "mupd-body", children: [
						jsx("p", { className: "mupd-hint", children: t("mirrors.hint") }),
						jsx("textarea", { className: "mupd-mirrors", rows: 6, spellCheck: false, value: mirrors.draft, placeholder: t("mirrors.placeholder"), onChange: (e) => setMirrors((s) => ({ ...s, draft: e.target.value, saved: false })) }),
						jsxs("div", { className: "mupd-actions", children: [
							jsx("button", { type: "button", className: "mupd-btn mupd-btn-primary", disabled: mirrors.saving || !mirrors.loaded, onClick: () => void saveMirrors(), children: mirrors.saving ? t("mirrors.saving") : t("mirrors.save") }),
							jsx("button", { type: "button", className: "mupd-btn", disabled: mirrors.saving || !mirrors.loaded, onClick: () => void resetMirrors(), children: t("mirrors.reset") }),
							mirrors.saved ? jsx("span", { className: "mupd-status-ok mupd-note", children: t("mirrors.saved") }) : null,
							mirrors.customized ? jsx("span", { className: "mupd-note", children: t("mirrors.custom") }) : jsx("span", { className: "mupd-note", children: t("mirrors.default") })
						] })
					] })
				] }),
				jsx("p", { className: "mupd-note", children: t("note") })
			] });
		}
		//#endregion
		//#region plugin
		const NS = "settings.updater";
		const inject = ["slots", "locale"];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh: {
					"nav": "更新",
					"title": "检查更新",
					"hint": "从 GitHub 检测最新版本，查看更新日志，并一键下载安装（50 线程多线程加速）。",
					"current": "当前版本",
					"check": "检查更新",
					"recheck": "重新检查",
					"checking": "正在检查…",
					"checkFailed": "检查更新失败",
					"bridgeMissing": "当前环境不支持更新功能（仅桌面版可用）。",
					"upToDate": "已是最新版本",
					"newVersionBadge": "有新版本",
					"published": "发布于 {date}",
					"changelog": "更新日志",
					"viewOnGithub": "在 GitHub 查看",
					"noChangelog": "（该版本未提供更新日志）",
					"download": "下载安装包",
					"downloading": "下载中",
					"threads": "{n} 线程加速",
					"activeThreads": "线程",
					"source.direct": "直连",
					"source.mirror": "加速镜像",
					"mirrors.title": "加速镜像源",
					"mirrors.hint": "每行一个加速镜像地址（URL 前缀代理）。下载时引擎会并行测速，自动选择最快的镜像；留空或使用默认列表走直连。注意：镜像为第三方代理，仅用于公开安装包下载。",
					"mirrors.placeholder": "https://ghproxy.net/\nhttps://gh-proxy.com/",
					"mirrors.save": "保存",
					"mirrors.saving": "保存中…",
					"mirrors.saved": "已保存",
					"mirrors.reset": "恢复默认",
					"mirrors.custom": "正在使用自定义镜像",
					"mirrors.default": "正在使用默认镜像",
					"downloadFailed": "下载失败",
					"downloadDone": "下载完成，可以开始安装。",
					"installNow": "安装更新",
					"installing": "正在安装…",
					"installingHint": "正在启动安装程序，应用将自动退出。",
					"noAsset": "该版本未提供可下载的安装包。",
					"note": "安装程序下载完成后将自动启动；安装完成后请手动运行新版应用。"
				},
				en: {
					"nav": "Update",
					"title": "Check for updates",
					"hint": "Detect the latest version on GitHub, read the changelog, and install with a one-click 50-thread parallel download.",
					"current": "Current version",
					"check": "Check for updates",
					"recheck": "Check again",
					"checking": "Checking…",
					"checkFailed": "Update check failed",
					"bridgeMissing": "Update support is unavailable in this environment (desktop only).",
					"upToDate": "Up to date",
					"newVersionBadge": "Update available",
					"published": "Released {date}",
					"changelog": "Changelog",
					"viewOnGithub": "View on GitHub",
					"noChangelog": "(this release has no changelog)",
					"download": "Download installer",
					"downloading": "Downloading",
					"threads": "{n}-thread accelerated",
					"activeThreads": "threads",
					"source.direct": "direct",
					"source.mirror": "accelerated mirror",
					"mirrors.title": "Mirror sources",
					"mirrors.hint": "One mirror URL per line (URL-prefix proxy). The engine probes every candidate and picks the fastest. Leave empty / use defaults for direct downloads. Note: mirrors are third-party proxies, used only for public installer downloads.",
					"mirrors.placeholder": "https://ghproxy.net/\nhttps://gh-proxy.com/",
					"mirrors.save": "Save",
					"mirrors.saving": "Saving…",
					"mirrors.saved": "Saved",
					"mirrors.reset": "Restore defaults",
					"mirrors.custom": "Using custom mirrors",
					"mirrors.default": "Using default mirrors",
					"downloadFailed": "Download failed",
					"downloadDone": "Download complete. You can install now.",
					"installNow": "Install update",
					"installing": "Installing…",
					"installingHint": "Launching the installer; the app will quit.",
					"noAsset": "This release has no downloadable installer.",
					"note": "The installer starts automatically after downloading; run the new version once the install finishes."
				}
			}), "ui-updater: dictionaries");
			boundT = ctx.locale.bind(NS);
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "updater",
				order: 24,
				label: () => boundT("nav"),
				locale: NS
			}, UpdaterSection));
		}
		//#endregion
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});

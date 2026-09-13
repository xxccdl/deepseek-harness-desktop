window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-model-selection",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_cordis = require("@deepseek-ai/cordis");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let react_dom = require("react-dom");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region lib/types/client/catalog.js
		/** One Host-generation model catalog shared by every Session selector. */
		/** Loads at most one model catalog for the current Host generation. */
		var ModelCatalogDirectory = class {
			ctx;
			/** Current shared catalog value and load lifecycle. */
			store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
				value: null,
				status: "idle",
				error: null
			});
			generation = 0;
			inflight;
			/**
			* @param ctx - the providing plugin's context, whose `remote.session`
			* namespace carries the Host-generation catalog.
			*/
			constructor(ctx) {
				this.ctx = ctx;
			}
			/**
			* Return the current generation's catalog, sharing its one in-flight load.
			* @returns the loaded global catalog.
			*/
			load() {
				const state = this.store.getSnapshot();
				if (state.status === "ready" && state.value !== null) return Promise.resolve(state.value);
				if (this.inflight !== void 0) return this.inflight;
				const generation = this.generation;
				this.store.update((draft) => {
					draft.status = "loading";
					draft.error = null;
				});
				const operation = this.ctx.remote.session.modelCatalog().then((response) => {
					if (!response.ok) throw new Error(`${response.error.code}: ${response.error.message}`);
					if (generation === this.generation) this.store.set({
						value: response.value,
						status: "ready",
						error: null
					});
					return response.value;
				}).catch((error) => {
					if (generation === this.generation) this.store.update((draft) => {
						draft.status = "error";
						draft.error = error instanceof Error ? error.message : String(error);
					});
					throw error;
				}).finally(() => {
					if (generation === this.generation && this.inflight === operation) this.inflight = void 0;
				});
				this.inflight = operation;
				return operation;
			}
			/**
			* Invalidate the loaded catalog; the next explicit menu read reloads it.
			* @param clear - whether values from the previous Host generation must be hidden.
			*/
			invalidate(clear = false) {
				this.generation += 1;
				this.inflight = void 0;
				const value = clear ? null : this.store.getSnapshot().value;
				this.store.set({
					value,
					status: "idle",
					error: null
				});
			}
			/** Invalidate and reload the catalog after a Host-side model input changes. */
			refresh() {
				this.invalidate();
				this.load().catch(() => {});
			}
			/** Clear Host-specific values and load the replacement Host generation. */
			resetGeneration() {
				this.invalidate(true);
				this.load().catch(() => {});
			}
		};
		//#endregion
		//#region lib/types/client/directory.js
		/** One session's shared directory controller; disposed with the session scope. */
		var ModelDirectory = class {
			sessions;
			sessionId;
			available;
			catalog;
			projected;
			/** The shared snapshot both entries render from (uSES-safe store). */
			store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
				current: null,
				routable: null,
				groups: [],
				failures: [],
				status: "idle",
				error: null
			});
			/** Latest selection operation wins; an older response never overwrites a newer one. */
			generation = 0;
			disposed = false;
			resolved = false;
			unsubscribeCatalog;
			unsubscribeSelection;
			/**
			* @param sessions - the session wire face (captured from the plugin's root connection).
			* @param sessionId - the owning session.
			* @param available - whether this session may use Agent-bound model RPCs.
			* @param catalog - Host-generation catalog shared by every Session.
			* @param projected - durable model selection projected from Session history.
			*/
			constructor(sessions, sessionId, available, catalog, projected) {
				this.sessions = sessions;
				this.sessionId = sessionId;
				this.available = available;
				this.catalog = catalog;
				this.projected = projected;
				this.unsubscribeCatalog = catalog.store.subscribe(() => {
					this.syncInputs();
				});
				this.unsubscribeSelection = projected.subscribe(() => {
					this.syncInputs();
				});
				this.syncInputs();
			}
			/**
			* Ensure the Host generation's shared advisory catalog is loaded.
			* @returns the fresh directory value.
			*/
			async load() {
				this.assertAvailable();
				await this.catalog.load();
				this.syncInputs();
				return this.store.getSnapshot();
			}
			/**
			* Select the complete provider/model/reasoning selection. The durable
			* projection frame updates the shared current; failures surface on the store
			* and throw so each entry's own retry surface engages.
			* @param selection - provider, provider-owned model id, and optional adapter-owned effort.
			*/
			async select(selection) {
				this.assertAvailable();
				const generation = ++this.generation;
				this.store.update((s) => {
					s.status = "selecting";
					s.error = null;
				});
				const result = await this.sessions.selectModel({
					sessionId: this.sessionId,
					provider: selection.provider,
					model: selection.model,
					...selection.reasoningEffort === void 0 ? {} : { reasoningEffort: selection.reasoningEffort }
				});
				if (this.disposed || generation !== this.generation) {
					if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
					return;
				}
				if (!result.ok) {
					this.store.update((s) => {
						s.status = "error";
						s.error = `${result.error.code}: ${result.error.message}`;
					});
					throw new Error(`session.selectModel failed: ${result.error.code}: ${result.error.message}`);
				}
				this.store.update((s) => {
					s.status = "ready";
					s.error = null;
				});
				this.syncInputs();
			}
			/**
			* Invalidate an in-flight selection response from the previous Host generation.
			*/
			resetConnected() {
				if (this.disposed) return;
				++this.generation;
				this.store.update((state) => {
					if (state.status === "selecting") state.status = "idle";
					state.error = null;
				});
				this.syncInputs();
			}
			/** Scope teardown: late settlements lose write access to the store. */
			dispose() {
				this.disposed = true;
				this.unsubscribeSelection();
				this.unsubscribeCatalog();
			}
			assertAvailable() {
				if (!this.available()) throw new Error("model selection is unavailable for addressed subagent sessions");
			}
			syncInputs() {
				if (this.disposed) return;
				const catalog = this.catalog.store.getSnapshot();
				const projected = modelSelectionProjection(this.projected.getSnapshot());
				if (catalog.status !== "ready" || catalog.value === null || projected === void 0) {
					if (this.resolved) {
						if (catalog.status === "error") this.store.update((state) => {
							state.status = "error";
							state.error = catalog.error;
						});
						return;
					}
					this.store.set({
						current: null,
						routable: null,
						groups: [],
						failures: [],
						status: catalog.status === "error" ? "error" : "loading",
						error: catalog.error
					});
					return;
				}
				const current = projected.next ?? catalog.value.default;
				this.resolved = true;
				this.store.set({
					current,
					routable: catalog.value.routableProviders.includes(current.provider),
					groups: catalog.value.groups,
					failures: catalog.value.failures,
					status: this.store.getSnapshot().status === "selecting" ? "selecting" : "ready",
					error: null
				});
			}
		};
		function modelSelectionProjection(value) {
			return value === void 0 ? void 0 : value;
		}
		//#endregion
		//#region lib/types/client/service.js
		/**
		* ModelDirectoryResolver (`ctx.modelDirectories`): the root owner of per-session
		* {@link ModelDirectory} instances. Both selection entries (the /model popup
		* and the composer model seat) resolve their session's directory through
		* this service, which is what makes the dual entry one shared state.
		*
		* Per-session storage follows the client service pattern (InputTriggerService /
		* CommandUiRuntime): a lazy service-internal map whose entry is deleted by the
		* owning scope's disposer. The host `dsh-scope` ScopedLayers registry does
		* does not belong here: it derives scope from the host carrier mechanism
		* (object-keyed), while client scopes tag contexts with branded SessionId
		* strings, and it models global+shadow named registries — this is a
		* per-session singleton with no global layer to merge.
		*/
		/** The `ctx.modelDirectories` session model-selection service. */
		var ModelDirectoryResolver = class extends _deepseek_ai_cordis.Service {
			static inject = [
				"sessions",
				"remote",
				"remote.session"
			];
			live = { directories: /* @__PURE__ */ new Map() };
			catalog;
			/** Localized composer-block copy; this plugin owns the string it raises. */
			blockReason;
			/**
			* @param ctx - owning root context (the service registers itself as `models`).
			* @param config - the bound translator for this plugin's own dictionary.
			*/
			constructor(ctx, config) {
				super(ctx, "modelDirectories");
				this.blockReason = config.blockReason;
				this.catalog = new ModelCatalogDirectory(ctx);
				this.catalog.load().catch(() => {});
				ctx.on("connection/reset", () => {
					this.catalog.resetGeneration();
					for (const directory of this.live.directories.values()) directory.resetConnected();
				});
				ctx.remote.$on("llm/adapters-updated", () => {
					this.catalog.refresh();
				});
				ctx.remote.$on("settings/document-updated", () => {
					this.catalog.refresh();
				});
				ctx.remote.$on("credentials/reference-updated", () => {
					this.catalog.refresh();
				});
			}
			/**
			* Resolve the per-session shared directory (lazy; the scope disposer
			* removes and disposes it). Unknown sessions fail loud.
			* @param sessionId - the owning session.
			* @returns the resident directory both entries share.
			*/
			directoryFor(sessionId) {
				const { live } = this;
				const existing = live.directories.get(sessionId);
				if (existing !== void 0) return existing;
				const sessions = this.ctx.sessions;
				const actx = sessions.scope(sessionId);
				if (actx === void 0) throw new Error(`ui-model-selection: session "${String(sessionId)}" resolved no scope`);
				const binding = sessions.binding(sessionId);
				if (binding === void 0) throw new Error(`ui-model-selection: session "${String(sessionId)}" resolved no binding`);
				const directory = new ModelDirectory(this.ctx.remote.session, sessionId, () => sessions.subagentAddress(sessionId) === void 0, this.catalog, binding.session.projections.faceOf("modelSelection"));
				live.directories.set(sessionId, directory);
				const conversation = this.ctx.get("conversation");
				if (conversation !== void 0) {
					const publish = () => {
						conversation.blocks.set(sessionId, directory.store.getSnapshot().routable === false ? { reason: this.blockReason() } : void 0);
					};
					publish();
					actx.effect(() => {
						const stop = directory.store.subscribe(publish);
						return () => {
							stop();
							conversation.blocks.set(sessionId, void 0);
						};
					}, "ui-model-selection: composer block");
				}
				actx.effect(() => () => {
					directory.dispose();
					live.directories.delete(sessionId);
				}, "ui-model-selection: session directory");
				return directory;
			}
		};
		//#endregion
		//#region ../../../node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
		function r(e) {
			var t, f, n = "";
			if ("string" == typeof e || "number" == typeof e) n += e;
			else if ("object" == typeof e) if (Array.isArray(e)) {
				var o = e.length;
				for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
			} else for (f in e) e[f] && (n && (n += " "), n += f);
			return n;
		}
		function clsx() {
			for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
			return n;
		}
		//#endregion
		//#region \0dsh-css:/home/runner/work/deepseek-harness/deepseek-harness/packages/client/ui-model-selection/src/client/ModelSelect.module.css.mjs
		const css = "._7KE1Ra_root{min-width:0;position:relative}._7KE1Ra_trigger{min-width:0;max-width:min(360px,45cqw);height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:24px;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:flex}._7KE1Ra_trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}._7KE1Ra_trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}._7KE1Ra_trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}._7KE1Ra_triggerLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}._7KE1Ra_triggerEffort{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-caption);flex-shrink:1000;overflow:hidden}._7KE1Ra_triggerIcon{flex:none;display:none}@container (width<=360px){._7KE1Ra_triggerIcon{display:block}._7KE1Ra_triggerLabel,._7KE1Ra_triggerEffort{display:none}}._7KE1Ra_chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s}._7KE1Ra_chevronOpen{transform:rotate(180deg)}._7KE1Ra_menu{z-index:1100;background:var(--dsw-specific-menu);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);width:max-content;min-width:min(240px,100vw - 32px);max-width:min(420px,100vw - 32px);max-height:min(360px,100vh - 96px);box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border:0;border-radius:20px;flex-direction:column;padding:4px;display:flex;position:fixed;overflow:hidden}._7KE1Ra_status,._7KE1Ra_empty{color:var(--dsw-alias-label-tertiary);padding:10px;font-size:13px;line-height:20px}._7KE1Ra_error,._7KE1Ra_warning{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);border-radius:8px;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;padding:7px 8px;font-size:12px;line-height:18px;display:flex}._7KE1Ra_warning{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-state-warn-label)}._7KE1Ra_retry{color:inherit;font:inherit;cursor:pointer;background:0 0;border:none;flex:none;padding:0;font-weight:600}._7KE1Ra_groups{min-height:0;overflow-y:auto}._7KE1Ra_group+._7KE1Ra_group{margin-top:4px}._7KE1Ra_groupTitle{z-index:1;background:var(--dsw-specific-menu);color:var(--dsw-alias-label-tertiary);padding:5px 8px 3px;font-size:12px;font-weight:500;line-height:18px;position:sticky;top:0}._7KE1Ra_option{box-sizing:border-box;width:auto;min-width:100%;min-height:38px;color:inherit;text-align:left;cursor:pointer;background:0 0;border:none;border-radius:10px;outline:none;align-items:center;gap:8px;padding:6px 8px;display:flex}._7KE1Ra_option:hover:not(:disabled),._7KE1Ra_option:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}._7KE1Ra_selected{background:0 0}._7KE1Ra_option:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}._7KE1Ra_optionCopy{flex-direction:column;flex:1;min-width:0;display:flex}._7KE1Ra_modelName{color:inherit;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:500;line-height:20px;overflow:hidden}._7KE1Ra_check{color:var(--dsw-alias-label-primary);flex:0 0 18px;place-items:center;display:grid}._7KE1Ra_cell{box-sizing:border-box;width:auto;min-width:100%;height:40px;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;background:0 0;border:none;border-radius:10px;align-items:center;gap:8px;padding:0 10px;font-size:14px;line-height:22px;display:flex}._7KE1Ra_cell:hover{background:var(--dsw-alias-interactive-bg-hover)}._7KE1Ra_cellLabel{white-space:nowrap;flex:none}._7KE1Ra_cellValue{text-overflow:ellipsis;white-space:nowrap;text-align:right;min-width:0;color:var(--dsw-alias-label-tertiary);flex:auto;overflow:hidden}._7KE1Ra_cellChevron{color:var(--dsw-alias-label-tertiary);flex:none}";
		const tagId = "@deepseek-ai/dsh-client-ui-model-selection/ModelSelect.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-model-selection";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ModelSelect_module_css_default = {
			"cell": "_7KE1Ra_cell",
			"cellChevron": "_7KE1Ra_cellChevron",
			"cellLabel": "_7KE1Ra_cellLabel",
			"cellValue": "_7KE1Ra_cellValue",
			"check": "_7KE1Ra_check",
			"chevron": "_7KE1Ra_chevron",
			"chevronOpen": "_7KE1Ra_chevronOpen",
			"empty": "_7KE1Ra_empty",
			"error": "_7KE1Ra_error",
			"group": "_7KE1Ra_group",
			"groupTitle": "_7KE1Ra_groupTitle",
			"groups": "_7KE1Ra_groups",
			"menu": "_7KE1Ra_menu",
			"modelName": "_7KE1Ra_modelName",
			"option": "_7KE1Ra_option",
			"optionCopy": "_7KE1Ra_optionCopy",
			"retry": "_7KE1Ra_retry",
			"root": "_7KE1Ra_root",
			"selected": "_7KE1Ra_selected",
			"status": "_7KE1Ra_status",
			"trigger": "_7KE1Ra_trigger",
			"triggerEffort": "_7KE1Ra_triggerEffort",
			"triggerIcon": "_7KE1Ra_triggerIcon",
			"triggerLabel": "_7KE1Ra_triggerLabel",
			"warning": "_7KE1Ra_warning"
		};
		//#endregion
		//#region desktop-fork motion layer
		// The upstream effort pane is a plain radio list. This fork keeps the same
		// data contract but renders the levels as the slider the levels deserve:
		// one rail, one fill, one knob that follows the pointer while dragging and
		// springs onto the nearest level when let go. Both panes and the trigger
		// caption keep a short entrance so a change reads as motion, not a repaint.
		const motionCss = [
			".dsms-pane{animation:dsmsPaneIn .22s cubic-bezier(.22,1,.36,1)}",
			"@keyframes dsmsPaneIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}",
			/* Going deeper and coming back are different motions: a pane that
			   drills in slides in from the right, and the one you come back to
			   slides in from the left, so the menu reads as a stack rather than
			   as one surface repainting. */
			".dsms-pane[data-dir='forward']{animation:dsmsPaneFwd .26s cubic-bezier(.22,1,.36,1)}",
			".dsms-pane[data-dir='back']{animation:dsmsPaneBack .24s cubic-bezier(.22,1,.36,1)}",
			"@keyframes dsmsPaneFwd{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:none}}",
			"@keyframes dsmsPaneBack{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}",
			".dsms-rootpane{display:flex;flex-direction:column}",
			/* One width for every pane: the slider pane is wider than the root
			   cells, and without this the menu visibly resized on the way in. */
			".dsms-menu{min-width:min(280px,100vw - 32px)}",
			".dsms-effort{--dsms-max:#7c5cff;min-width:272px;padding:4px 6px 2px}",
			".dsms-effort-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 2px 11px;font-size:12px;color:var(--dsw-alias-label-tertiary)}",
			".dsms-effort-value{color:var(--dsw-alias-label-primary);font-weight:500}",
			/* The way back out of a drilled-in pane, sitting where the eye already
			   is rather than leaving Escape as the only way back. */
			".dsms-back{box-sizing:border-box;display:flex;flex:none;align-items:center;gap:4px;width:100%;height:26px;margin:0 0 5px;padding:0 8px;border:0;border-radius:8px;background:0 0;color:var(--dsw-alias-label-tertiary);font-family:inherit;font-size:12px;line-height:18px;text-align:left;cursor:pointer}",
			".dsms-back:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".dsms-back:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}",
			".dsms-back svg{flex:none}",
			/* the slider itself: the whole box is the hit area, so a tap anywhere
			   on a level name is the same gesture as a tap on the rail */
			".dsms-slider{position:relative;box-sizing:border-box;padding:6px 0 0;border-radius:10px;cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;outline:none}",
			".dsms-slider:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-brand-primary)}",
			".dsms-slider[data-drag='true']{cursor:grabbing}",
			".dsms-slider[aria-disabled='true']{cursor:default}",
			".dsms-rail{position:relative;height:4px;border-radius:2px;background:var(--dsw-alias-border-l2)}",
			".dsms-fill{position:absolute;top:0;bottom:0;border-radius:2px;background:var(--dsw-alias-brand-primary);transition:left .36s cubic-bezier(.22,1,.36,1),width .36s cubic-bezier(.22,1,.36,1)}",
			".dsms-knob{position:absolute;top:50%;width:16px;height:16px;margin-top:-8px;border-radius:50%;background:var(--dsw-alias-bg-layer-1);box-shadow:0 1px 3px rgba(16,20,32,.24),0 0 0 1px var(--dsw-alias-border-l2);transform:translateX(-50%);transition:left .36s cubic-bezier(.22,1,.36,1),width .18s ease,height .18s ease,margin-top .18s ease,box-shadow .2s ease}",
			/* Affordance: the knob swells under the pointer, so the rail reads as
			   draggable before the first drag. The drag rules below deliberately
			   win over this one (same specificity, later in the sheet). */
			".dsms-slider:hover:not([aria-disabled='true']) .dsms-knob{width:18px;height:18px;margin-top:-9px}",
			/* while dragging the knob tracks the pointer with no easing at all,
			   then the release above hands it back to the spring */
			".dsms-slider[data-drag='true'] .dsms-fill{transition:none}",
			".dsms-slider[data-drag='true'] .dsms-knob{width:20px;height:20px;margin-top:-10px;transition:left 0s,width .18s ease,height .18s ease,margin-top .18s ease,box-shadow .2s ease;box-shadow:0 2px 10px rgba(16,20,32,.26),0 0 0 1px var(--dsw-alias-brand-primary),0 0 0 6px color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent)}",
			".dsms-slider[data-busy='true'] .dsms-knob{box-shadow:0 1px 3px rgba(16,20,32,.24),0 0 0 1px var(--dsw-alias-brand-primary)}",
			".dsms-stops{display:flex;margin-top:8px}",
			".dsms-stop{flex:1 1 0;text-align:center;font-size:11.5px;line-height:16px;color:var(--dsw-alias-label-tertiary);transition:color .24s ease,transform .3s cubic-bezier(.22,1,.36,1)}",
			".dsms-stop[data-active='true']{color:var(--dsw-alias-label-primary);font-weight:500;transform:translateY(-1px);animation:dsmsStopPop .44s cubic-bezier(.22,1,.36,1)}",
			/* Every landing gets a beat, not only the top one, so each stop you let
			   go on acknowledges the release. The max stop's own rule below has
			   higher specificity and overrides this with a stronger pop. */
			"@keyframes dsmsStopPop{0%{transform:translateY(1px) scale(.94)}55%{transform:translateY(-2.5px) scale(1.07)}100%{transform:translateY(-1px) scale(1)}}",
			/* ── the top level is the one setting people deliberately reach for, so
			   landing on it is celebrated: the rail turns into a warm gradient with
			   a sheen running along it, the knob throws expanding rings, and the
			   level name flashes once. Everything is decoration — the geometry and
			   the committed value are unchanged, and reduced motion drops it all. ── */
			".dsms-slider[data-max='true'] .dsms-rail{background:color-mix(in srgb,var(--dsms-max) 30%,var(--dsw-alias-border-l2))}",
			".dsms-slider[data-max='true'] .dsms-fill{background:linear-gradient(90deg,var(--dsw-alias-brand-primary),var(--dsms-max));box-shadow:0 0 12px color-mix(in srgb,var(--dsms-max) 48%,transparent)}",
			".dsms-slider[data-max='true'] .dsms-fill:after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.62) 50%,transparent 70%);background-size:220% 100%;animation:dsmsSheen 1.7s linear infinite}",
			".dsms-slider[data-max='true'] .dsms-knob{box-shadow:0 2px 14px rgba(16,20,32,.3),0 0 0 1px var(--dsms-max),0 0 0 7px color-mix(in srgb,var(--dsms-max) 18%,transparent);animation:dsmsKnobPulse 1.9s ease-in-out infinite}",
			"@keyframes dsmsSheen{from{background-position:170% 0}to{background-position:-170% 0}}",
			"@keyframes dsmsKnobPulse{0%,100%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(1.1)}}",
			".dsms-rings{position:absolute;top:50%;left:0;width:0;height:0;pointer-events:none}",
			".dsms-rings i{position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;border:1.5px solid var(--dsms-max);animation:dsmsRing .78s cubic-bezier(.22,1,.36,1) both}",
			".dsms-rings i:nth-child(2){animation-delay:.16s}",
			".dsms-rings i:nth-child(3){animation-delay:.32s}",
			"@keyframes dsmsRing{from{opacity:.8;transform:scale(.5)}to{opacity:0;transform:scale(4.6)}}",
			/* A landing below the top level gets a single softer ring in the brand
			   tone — the same acknowledgement, at a volume that suits a routine
			   level change rather than the deliberate reach for max. */
			".dsms-rings[data-max='false'] i{border-width:1px;border-color:var(--dsw-alias-brand-primary);animation-name:dsmsRingSoft}",
			"@keyframes dsmsRingSoft{from{opacity:.5;transform:scale(.6)}to{opacity:0;transform:scale(3.2)}}",
			".dsms-stop[data-max='true'][data-active='true']{color:var(--dsms-max);font-weight:600;animation:dsmsMaxPop .52s cubic-bezier(.22,1,.36,1)}",
			"@keyframes dsmsMaxPop{0%{transform:translateY(-1px) scale(1)}45%{transform:translateY(-2px) scale(1.14)}100%{transform:translateY(-1px) scale(1)}}",
			".dsms-effort[data-max='true'] .dsms-effort-value{color:var(--dsms-max)}",
			"@media (prefers-reduced-motion: reduce){.dsms-stop[data-active='true']{animation:none}.dsms-slider[data-max='true'] .dsms-fill:after{animation:none;opacity:0}.dsms-slider[data-max='true'] .dsms-knob{animation:none}.dsms-rings{display:none}}",
			".dsms-desc{min-height:34px;margin:8px 2px 2px;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-tertiary);animation:dsmsFade .26s ease}",
			"@keyframes dsmsFade{from{opacity:0;transform:translateY(2px)}to{opacity:1;transform:none}}",
			".dsms-swap{display:inline-block;animation:dsmsSwap .26s cubic-bezier(.22,1,.36,1)}",
			"@keyframes dsmsSwap{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}",
			/* The menu opens with the same motion language as the slider it holds:
			   it rises out of the trigger rather than appearing on the pointer. The
			   class is the upstream menu's own, restated here so this fork can
			   animate it without patching the packaged stylesheet. */
			"._7KE1Ra_menu{transform-origin:bottom center;animation:dsmsMenuIn .2s cubic-bezier(.22,1,.36,1) both}",
			"@keyframes dsmsMenuIn{from{opacity:0;transform:translateY(6px) scale(.985)}to{opacity:1;transform:none}}",
			"@media (prefers-reduced-motion: reduce){.dsms-pane,.dsms-pane[data-dir],.dsms-desc,.dsms-swap,.dsms-stop,._7KE1Ra_menu{animation:none}.dsms-fill,.dsms-knob{transition:none}}"
		].join("");
		const motionTagId = "@deepseek-ai/dsh-client-ui-model-selection/motion.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(motionTagId) + "]") === null) {
			const motionTag = document.createElement("style");
			motionTag.dataset.plugin = "@deepseek-ai/dsh-client-ui-model-selection";
			motionTag.dataset.pluginCss = motionTagId;
			motionTag.textContent = motionCss;
			document.head.appendChild(motionTag);
		}
		//#endregion
		//#region lib/types/client/ModelSelect.js
		/**
		* ModelSelect: the composer's named model seat (`conversation.input.model`).
		* Two-level selection per figma 496:26454's MenuDropdown: the root menu is
		* the Model / Effort row pair (label + current value + a right chevron),
		* each drilling into its own list — the provider-grouped model list over
		* the shared directory, and the effort levels. The trigger (313:14108's
		* ToggleButton) shows both: model name + effort in the caption tone.
		* Data and submission ride the SAME per-session ModelDirectory as the
		* /model popup; exact-model reasoning metadata and the selected effort come
		* from the Host rather than a client-owned vocabulary. A rejected selection
		* announces through the shared transient Toast anchored to the composer
		* card; the in-menu strip with Retry remains the catalog-load surface.
		*/
		/** Unplaced portal card: hidden but laid out at a fixed origin so offsetWidth/offsetHeight are real (Menu primitive's measure pass). */
		const MEASURE_STYLE = {
			visibility: "hidden",
			left: 0,
			top: 0
		};
		/**
		* Reasoning-effort picker built as a real slider, the way Codex asks for a
		* level: one rail, a fill that grows with the level, and a knob.
		*
		* Gestures: press anywhere and drag — the knob tracks the pointer one to
		* one (no easing while dragging, so it never lags the hand), the level name
		* and description preview live, and the release springs the knob onto the
		* nearest stop, which is the only moment the Host is asked to change the
		* level. A plain tap is the same gesture without movement. Arrow keys step
		* one level, Home/End jump to the ends; Up/Down are left to the menu so its
		* own roving focus keeps working.
		*
		* Every accepted release pulses the knob — a single soft ring for a routine
		* level, the full celebration at the top one — so the gesture always lands
		* somewhere audible even when the Host takes a moment to answer.
		*
		* @param props - the effort choices, the current level, the pane direction
		* (for the entrance motion), and the selection verb.
		* @returns the effort slider.
		*/
		function EffortSlider({ choices, selected, busy, describe, onChoose, t, dir }) {
			const count = Math.max(1, choices.length);
			const committed = Math.max(0, choices.findIndex((choice) => choice.effort === selected));
			const sliderRef = (0, react.useRef)(null);
			const [drag, setDrag] = (0, react.useState)(null);
			// The stop the last accepted release landed on, with a monotonic id so
			// the rings re-mount and replay their pulse. Holding the stop index
			// rather than the live knob position keeps the pulse where the gesture
			// ended, even while the Host is still answering.
			const [landing, setLanding] = (0, react.useState)(null);
			// Where the knob sits while idle is always the committed level, so a
			// rejected change snaps back on its own.
			const position = drag === null ? committed : drag;
			const active = Math.min(count - 1, Math.max(0, Math.round(position)));
			const activeChoice = choices[active];
			// The last stop is the model's top reasoning level; landing on it gets
			// the celebration in motionCss. It is a rendering-only flag — the
			// committed value still travels through `commit` exactly as before.
			const atMax = count > 1 && active === count - 1;
			/** Centre of stop `value`, as a percentage of the rail. */
			const stopAt = (value) => ((value + 0.5) / count) * 100;
			/** Pointer x (viewport) to a fractional stop index. */
			const locate = (clientX) => {
				const node = sliderRef.current;
				if (node === null) return 0;
				const rect = node.getBoundingClientRect();
				if (rect.width <= 0) return 0;
				const ratio = (clientX - rect.left) / rect.width;
				return Math.min(count - 1, Math.max(0, ratio * count - 0.5));
			};
			const commit = (value) => {
				const index = Math.min(count - 1, Math.max(0, Math.round(value)));
				const target = choices[index];
				if (target === void 0 || target.effort === selected) return;
				setLanding((previous) => ({ seq: (previous?.seq ?? 0) + 1, at: index }));
				onChoose(target.effort);
			};
			const onPointerDown = (event) => {
				if (busy || event.button !== 0) return;
				event.preventDefault();
				event.currentTarget.setPointerCapture(event.pointerId);
				setDrag(locate(event.clientX));
			};
			const onPointerMove = (event) => {
				if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
				setDrag(locate(event.clientX));
			};
			const onPointerUp = (event) => {
				if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
				event.currentTarget.releasePointerCapture(event.pointerId);
				setDrag(null);
				commit(drag ?? committed);
			};
			// An aborted gesture (the OS took the pointer, the window lost focus)
			// drops the preview without touching the level.
			const onPointerCancel = () => {
				setDrag(null);
			};
			const onKeyDown = (event) => {
				if (busy) return;
				const target = event.key === "ArrowRight" ? committed + 1 : event.key === "ArrowLeft" ? committed - 1 : event.key === "Home" ? 0 : event.key === "End" ? count - 1 : null;
				if (target === null) return;
				event.preventDefault();
				event.stopPropagation();
				commit(target);
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: "dsms-effort dsms-pane",
				"data-dir": dir,
				"data-max": String(atMax),
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: "dsms-effort-head",
						children: [(0, react_jsx_runtime.jsx)("span", { children: t("menu.effort") }), (0, react_jsx_runtime.jsx)("span", {
							className: "dsms-effort-value",
							children: (0, react_jsx_runtime.jsx)("span", {
								className: "dsms-swap",
								children: activeChoice?.label ?? ""
							}, String(active))
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: "dsms-slider",
						ref: sliderRef,
						role: "slider",
						tabIndex: busy ? -1 : 0,
						"aria-label": t("menu.effort"),
						"aria-valuemin": 0,
						"aria-valuemax": count - 1,
						"aria-valuenow": active,
						"aria-valuetext": activeChoice?.label ?? "",
						"aria-disabled": String(busy),
						"data-drag": String(drag !== null),
						"data-busy": String(busy),
						"data-max": String(atMax),
						onPointerDown,
						onPointerMove,
						onPointerUp,
						onPointerCancel,
						onKeyDown,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: "dsms-rail",
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: "dsms-fill",
								style: {
									left: `${stopAt(0)}%`,
									width: `${(position / count) * 100}%`
								}
							}), landing !== null && (0, react_jsx_runtime.jsxs)("span", {
								className: "dsms-rings",
								"data-max": String(landing.at === count - 1),
								style: { left: `${stopAt(landing.at)}%` },
								"aria-hidden": true,
								children: landing.at === count - 1 ? [(0, react_jsx_runtime.jsx)("i", {}, "a"), (0, react_jsx_runtime.jsx)("i", {}, "b"), (0, react_jsx_runtime.jsx)("i", {}, "c")] : [(0, react_jsx_runtime.jsx)("i", {}, "a")]
							}, String(landing.seq)), (0, react_jsx_runtime.jsx)("span", {
								className: "dsms-knob",
								style: { left: `${stopAt(position)}%` }
							})]
						}), (0, react_jsx_runtime.jsx)("div", {
							className: "dsms-stops",
							children: choices.map((choice, index) => (0, react_jsx_runtime.jsx)("span", {
								className: "dsms-stop",
								"data-active": String(index === active),
								"data-max": String(count > 1 && index === count - 1),
								children: choice.label
							}, choice.key))
						})]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: "dsms-desc",
						key: String(active),
						children: describe(activeChoice?.effort)
					}, "desc")
				]
			});
		}
		/**
		* Localized copy for a string the Host declared, falling back to the Host's
		* own wording. `t` returns the key verbatim once nothing in the fallback
		* chain has it, so comparing against the key IS the "is there a translation?"
		* test — which is what lets the level names and hints read in the UI's
		* language while a level from a provider this fork has never seen still
		* shows its own copy instead of a raw dictionary key.
		*
		* @param t - the bound translate function.
		* @param key - the dictionary key to try first.
		* @param fallback - the Host string to use when the dictionary has no entry.
		* @returns the translated string, or the fallback.
		*/
		function localized(t, key, fallback) {
			const value = t(key);
			return value === key ? fallback : value;
		}
		/**
		* Render the composer model seat.
		* @param props - owner share (locked) + injected face (shared directory
		* store/verbs) + the standard locale seat.
		* @returns the trigger and, while open, the two-level menu.
		*/
		function ModelSelect({ locked, available, directory, load, select, t }) {
			const state = (0, react.useSyncExternalStore)((fn) => directory.subscribe(fn), () => directory.getSnapshot());
			const [open, setOpen] = (0, react.useState)(false);
			const [pane, setPane] = (0, react.useState)("root");
			// Which way the pane on screen came from, so its entrance reads as
			// drilling in or stepping back out. Null on the pane the menu opens on,
			// which rises with the menu itself instead.
			const [dir, setDir] = (0, react.useState)(null);
			const lastActionRef = (0, react.useRef)("load");
			const [toast, setToast] = (0, react.useState)(null);
			const toastSeq = (0, react.useRef)(0);
			const rootRef = (0, react.useRef)(null);
			const triggerRef = (0, react.useRef)(null);
			const menuRef = (0, react.useRef)(null);
			const [menuPos, setMenuPos] = (0, react.useState)(null);
			const itemRefs = (0, react.useRef)([]);
			const id = (0, react.useId)();
			const choices = (0, react.useMemo)(() => state.groups.flatMap((group) => group.models.map((model) => ({
				group,
				model,
				selection: {
					provider: group.id,
					model: model.id,
					...model.reasoning?.defaultEffort === void 0 ? {} : { reasoningEffort: model.reasoning.defaultEffort }
				}
			}))), [state.groups]);
			const currentChoice = choices[state.current === null ? -1 : choices.findIndex((c) => c.selection.provider === state.current?.provider && c.selection.model === state.current.model)];
			const reasoning = currentChoice?.model.reasoning;
			const effectiveEffort = state.current?.reasoningEffort ?? reasoning?.defaultEffort;
			const effortLabel = reasoning === void 0 ? void 0 : effectiveEffort === void 0 ? t("effort.providerDefault") : localized(t, `effort.${effectiveEffort}`, reasoning.efforts.find((level) => level.id === effectiveEffort)?.name ?? effectiveEffort);
			const effortChoices = (0, react.useMemo)(() => reasoning === void 0 ? [] : [...reasoning.defaultEffort === void 0 ? [{
				key: "provider-default",
				effort: void 0,
				label: t("effort.providerDefault")
			}] : [], ...reasoning.efforts.map((effort) => ({
				key: `effort:${effort.id}`,
				effort: effort.id,
				label: localized(t, `effort.${effort.id}`, effort.name)
			}))], [reasoning, t]);
			const busy = state.status === "selecting";
			const reload = () => {
				lastActionRef.current = "load";
				load();
			};
			(0, react.useEffect)(() => {
				if (!open) return;
				// The menu must survive an interaction with the window's own chrome:
				// the custom title bar is a real drag region, and pressing it is how
				// the window is moved, not how the menu is dismissed.
				const closeOutside = (event) => {
					const target = event.target;
					if (target instanceof Element && target.closest("#dsh-titlebar") !== null) return;
					if (rootRef.current?.contains(target) === true) return;
					if (menuRef.current?.contains(target) === true) return;
					setOpen(false);
				};
				document.addEventListener("mousedown", closeOutside);
				return () => {
					document.removeEventListener("mousedown", closeOutside);
				};
			}, [open]);
			(0, react.useLayoutEffect)(() => {
				if (!open) {
					setMenuPos(null);
					return;
				}
				const place = () => {
					/* v8 ignore next 2 -- the trigger ref is attached whenever the menu is open. */
					const rect = triggerRef.current?.getBoundingClientRect();
					if (rect === void 0) return;
					const MARGIN = 12;
					const lw = menuRef.current?.offsetWidth ?? 0;
					const lh = menuRef.current?.offsetHeight ?? 0;
					let x = rect.right - lw;
					let y = rect.top - 8 - lh;
					if (lw > 0) x = Math.min(Math.max(x, MARGIN), window.innerWidth - lw - MARGIN);
					if (lh > 0) y = Math.min(Math.max(y, MARGIN), window.innerHeight - lh - MARGIN);
					setMenuPos({
						left: x,
						top: y
					});
				};
				place();
				window.addEventListener("scroll", place, true);
				window.addEventListener("resize", place);
				return () => {
					window.removeEventListener("scroll", place, true);
					window.removeEventListener("resize", place);
				};
			}, [
				open,
				pane,
				state
			]);
			if (!available) return null;
			// Every pane change goes through here, so the entrance motion always
			// knows whether the menu went a level deeper or came back out.
			const go = (next) => {
				setDir(next === "root" ? "back" : "forward");
				setPane(next);
			};
			const show = () => {
				setDir(null);
				setPane("root");
				setOpen(true);
				reload();
			};
			const close = (restoreFocus = false) => {
				setOpen(false);
				setDir(null);
				setPane("root");
				if (restoreFocus) queueMicrotask(() => {
					triggerRef.current?.focus();
				});
			};
			const moveFocus = (offset) => {
				const items = itemRefs.current.filter((item) => item !== null);
				if (items.length === 0) return;
				const active = items.findIndex((item) => item === document.activeElement);
				items[(Math.max(active, 0) + offset + items.length) % items.length]?.focus();
			};
			const onRootKeyDown = (event) => {
				if (event.key === "Escape" && open) {
					event.preventDefault();
					if (pane !== "root") go("root");
					else close(true);
					return;
				}
				if (!open) return;
				if (event.key === "ArrowDown" || event.key === "ArrowUp") {
					event.preventDefault();
					moveFocus(event.key === "ArrowDown" ? 1 : -1);
				}
			};
			const onBlur = (event) => {
				// A null `relatedTarget` means focus left the document entirely — the
				// window chrome was pressed, or the app itself lost focus — rather
				// than moving on to another control. Dismissing there is what made
				// the menu vanish mid-drag; a genuine outside click still closes it
				// through the document listener above.
				const next = event.relatedTarget;
				if (!(next instanceof Node)) return;
				if (rootRef.current?.contains(next) === true) return;
				if (menuRef.current?.contains(next) === true) return;
				close();
			};
			const settleSelection = (accepted, keepOpen = false) => {
				// A level chosen on the slider keeps the pane up: the gesture is the
				// point, and firing it away the moment the Host agrees made the slider
				// impossible to feel. Dismissal stays with an outside click, Escape or
				// the trigger — same as every other menu here.
				if (accepted) {
					if (keepOpen) return;
					if (rootRef.current !== null) close(true);
					return;
				}
				const message = directory.getSnapshot().error;
				if (message !== null) {
					toastSeq.current += 1;
					setToast({
						seq: toastSeq.current,
						text: t("error.action", { message })
					});
				}
			};
			const choose = (selection) => {
				if (state.current?.provider === selection.provider && state.current.model === selection.model) {
					close(true);
					return;
				}
				lastActionRef.current = "select";
				select(selection).then(settleSelection);
			};
			const chooseEffort = (effort) => {
				if (state.current === null) return;
				// Re-picking the level already in force is a no-op on the Host, and it
				// must not dismiss the pane either — a slider that closes when you land
				// on the stop you started from reads as a glitch.
				if (effectiveEffort === effort) return;
				const selection = {
					provider: state.current.provider,
					model: state.current.model,
					...effort === void 0 ? {} : { reasoningEffort: effort }
				};
				lastActionRef.current = "select";
				select(selection).then((accepted) => settleSelection(accepted, true));
			};
			const waiting = state.current === null && state.status === "loading";
			const modelLabel = waiting ? t("trigger.loading") : currentChoice?.model.name ?? (state.current === null ? t("trigger.fallback") : `${state.current.provider}/${state.current.model}`);
			const triggerLabel = effortLabel === void 0 ? modelLabel : `${modelLabel} · ${effortLabel}`;
			const triggerAria = waiting ? t("trigger.loading") : state.current === null ? t("trigger.selectAria") : effortLabel === void 0 ? t("trigger.aria", { model: modelLabel }) : t("trigger.ariaEffort", {
				model: modelLabel,
				effort: effortLabel
			});
			itemRefs.current = [];
			let itemIndex = 0;
			const itemRef = () => {
				const at = itemIndex++;
				return (node) => {
					itemRefs.current[at] = node;
				};
			};
			// Escape leaves a drilled-in pane, but the pointer had no visible way
			// out of one; this is that way, and it joins the roving focus order. It
			// carries the pane's own entrance so a header and the body it belongs to
			// travel together, rather than the body sliding under a header that was
			// already on screen.
			const backRow = () => (0, react_jsx_runtime.jsx)("button", {
				ref: itemRef(),
				type: "button",
				className: "dsms-back dsms-pane",
				"data-dir": dir,
				onClick: () => {
					go("root");
				},
				children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutline14, {}), (0, react_jsx_runtime.jsx)("span", { children: t("menu.back") })]
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: ModelSelect_module_css_default.root,
				onKeyDown: onRootKeyDown,
				onBlur,
				children: [
					(0, react_jsx_runtime.jsxs)("button", {
						ref: triggerRef,
						type: "button",
						className: ModelSelect_module_css_default.trigger,
						"aria-label": triggerAria,
						"aria-haspopup": "menu",
						"aria-expanded": open,
						"aria-controls": open ? `${id}-menu` : void 0,
						title: triggerLabel,
						disabled: locked,
						onClick: () => {
							if (open) close();
							else show();
						},
						children: [
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutline16, {
								className: ModelSelect_module_css_default.triggerIcon,
								size: 16
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: ModelSelect_module_css_default.triggerLabel,
								children: modelLabel
							}),
							effortLabel !== void 0 && (0, react_jsx_runtime.jsx)("span", {
								className: clsx(ModelSelect_module_css_default.triggerEffort, "dsms-swap"),
								key: effortLabel,
								children: effortLabel
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: clsx(ModelSelect_module_css_default.chevron, open && ModelSelect_module_css_default.chevronOpen) })
						]
					}),
					open && (0, react_dom.createPortal)((0, react_jsx_runtime.jsxs)("div", {
						ref: menuRef,
						id: `${id}-menu`,
						className: clsx(ModelSelect_module_css_default.menu, "dsms-menu"),
						style: menuPos ?? MEASURE_STYLE,
						role: "menu",
						"aria-label": t("menu.aria"),
						"aria-busy": state.status === "loading" || busy,
						children: [
							pane === "root" && (0, react_jsx_runtime.jsxs)("div", {
								className: "dsms-pane dsms-rootpane",
								"data-dir": dir,
								children: [(0, react_jsx_runtime.jsxs)("button", {
									ref: itemRef(),
									type: "button",
									role: "menuitem",
									className: ModelSelect_module_css_default.cell,
									onClick: () => {
										go("model");
									},
									children: [
										(0, react_jsx_runtime.jsx)("span", {
											className: ModelSelect_module_css_default.cellLabel,
											children: t("menu.model")
										}),
										(0, react_jsx_runtime.jsx)("span", {
											className: ModelSelect_module_css_default.cellValue,
											children: modelLabel
										}),
										(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, { className: ModelSelect_module_css_default.cellChevron })
									]
								}), reasoning !== void 0 && (0, react_jsx_runtime.jsxs)("button", {
									ref: itemRef(),
									type: "button",
									role: "menuitem",
									className: ModelSelect_module_css_default.cell,
									onClick: () => {
										go("effort");
									},
									children: [
										(0, react_jsx_runtime.jsx)("span", {
											className: ModelSelect_module_css_default.cellLabel,
											children: t("menu.effort")
										}),
										(0, react_jsx_runtime.jsx)("span", {
											className: ModelSelect_module_css_default.cellValue,
											children: effortLabel
										}),
										(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, { className: ModelSelect_module_css_default.cellChevron })
									]
								})]
							}),
							pane === "model" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								backRow(),
								state.status === "loading" && (0, react_jsx_runtime.jsx)("div", {
									className: ModelSelect_module_css_default.status,
									children: t("status.loading")
								}),
								state.error !== null && lastActionRef.current === "load" && (0, react_jsx_runtime.jsxs)("div", {
									className: ModelSelect_module_css_default.error,
									children: [(0, react_jsx_runtime.jsx)("span", { children: t("error.action", { message: state.error }) }), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: ModelSelect_module_css_default.retry,
										onClick: reload,
										children: t("action.reload")
									})]
								}),
								state.failures.map((failure) => (0, react_jsx_runtime.jsxs)("div", {
									className: ModelSelect_module_css_default.warning,
									children: [(0, react_jsx_runtime.jsx)("span", { children: t("warning.groupLoad", {
										name: failure.name,
										message: failure.message
									}) }), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: ModelSelect_module_css_default.retry,
										onClick: reload,
										children: t("action.reload")
									})]
								}, failure.id)),
								(0, react_jsx_runtime.jsx)("div", {
									className: clsx(ModelSelect_module_css_default.groups, "scrollable", "dsms-pane"),
									"data-dir": dir,
									children: state.groups.map((group) => {
										const headingId = `${id}-${group.id}`;
										return (0, react_jsx_runtime.jsxs)("section", {
											role: "group",
											"aria-labelledby": headingId,
											className: ModelSelect_module_css_default.group,
											children: [(0, react_jsx_runtime.jsx)("div", {
												className: ModelSelect_module_css_default.groupTitle,
												id: headingId,
												children: group.name
											}), group.models.map((model) => {
												const selected = state.current?.provider === group.id && state.current.model === model.id;
												return (0, react_jsx_runtime.jsxs)("button", {
													ref: itemRef(),
													type: "button",
													role: "menuitemradio",
													"aria-checked": selected,
													className: clsx(ModelSelect_module_css_default.option, selected && ModelSelect_module_css_default.selected),
													title: model.name,
													disabled: busy,
													onClick: () => {
														choose({
															provider: group.id,
															model: model.id
														});
													},
													children: [(0, react_jsx_runtime.jsx)("span", {
														className: ModelSelect_module_css_default.optionCopy,
														children: (0, react_jsx_runtime.jsx)("span", {
															className: ModelSelect_module_css_default.modelName,
															children: model.name
														})
													}), (0, react_jsx_runtime.jsx)("span", {
														className: ModelSelect_module_css_default.check,
														children: selected ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, {}) : null
													})]
												}, model.id);
											})]
										}, group.id);
									})
								}),
								state.status === "ready" && choices.length === 0 && (0, react_jsx_runtime.jsx)("div", {
									className: ModelSelect_module_css_default.empty,
									children: t("empty.models")
								})
							] }),
							pane === "effort" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [backRow(), state.error !== null && lastActionRef.current === "load" && (0, react_jsx_runtime.jsxs)("div", {
								className: ModelSelect_module_css_default.error,
								children: [(0, react_jsx_runtime.jsx)("span", { children: t("error.action", { message: state.error }) }), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: ModelSelect_module_css_default.retry,
									onClick: reload,
									children: t("action.reload")
								})]
							}), effortChoices.length === 0 ? (0, react_jsx_runtime.jsx)("div", {
								className: ModelSelect_module_css_default.empty,
								children: t("empty.efforts")
							}) : (0, react_jsx_runtime.jsx)(EffortSlider, {
								choices: effortChoices,
								selected: effectiveEffort,
								busy,
								dir,
								onChoose: chooseEffort,
								describe: (effort) => {
									// Dictionary first, then the Host's own hint, then the
									// level name as the last resort.
									const translated = effort === void 0 ? void 0 : localized(t, `effort.${effort}.desc`, void 0);
									if (translated !== void 0) return translated;
									const listed = reasoning === void 0 ? void 0 : reasoning.efforts.find((level) => level.id === effort);
									if (listed?.description !== void 0 && listed.description !== "") return listed.description;
									return effortChoices.find((choice) => choice.effort === effort)?.label ?? "";
								},
								t
							})] })
						]
					}), document.body),
					toast !== null && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
						text: toast.text,
						icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutline16, {}),
						anchor: rootRef.current?.closest("[data-composer-card]") ?? null,
						onDone: () => {
							setToast(null);
						}
					}, toast.seq)
				]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/**
		* `model` namespace dictionaries.
		*
		* `trigger.selectAria` intentionally matches `trigger.fallback` but remains a
		* separate key: the visible fallback label and the accessible name of
		* an unset trigger are free to diverge per locale, and folding it into
		* `trigger.aria` would announce the degenerate "Select model, current Select
		* model".
		*/
		/** Simplified Chinese dictionary (the key-set source of truth). */
		/**
		* The `effort.*` entries are an OVERRIDE layer, not the vocabulary: the
		* level names and descriptions come from the Host (the provider adapter
		* declares them in English), and these keys only restate the ids this fork
		* knows about. Callers look them up through `localized()` below, which
		* falls back to the Host string for any id that is absent here — so a new
		* provider level shows its own copy instead of a raw key.
		*/
		const zh = {
			"command.description": "选择本会话使用的模型",
			"option.loadError": "目录加载失败：{message}",
			"option.deepseekV4Flash.description": "快速、高效且经济；适合目标明确、常规或并行任务。",
			"option.deepseekV4Pro.description": "更强的自主编码、知识与复杂推理能力；适合复杂或质量优先的任务，但成本更高。",
			"trigger.fallback": "选择模型",
			"trigger.loading": "正在加载模型…",
			"trigger.selectAria": "选择模型",
			"trigger.aria": "选择模型，当前 {model}",
			"trigger.ariaEffort": "选择模型，当前 {model}，推理等级 {effort}",
			"menu.aria": "模型与推理等级",
			"menu.model": "模型",
			"menu.effort": "推理等级",
			"menu.back": "返回",
			"effort.providerDefault": "默认",
			"effort.off": "关闭",
			"effort.low": "低",
			"effort.high": "高",
			"effort.max": "最高",
			"effort.off.desc": "用于无需思考的简单任务。",
			"effort.low.desc": "适合日常任务，或对响应速度更敏感的场景。",
			"effort.high.desc": "多数任务默认的平衡档。",
			"effort.max.desc": "留给最难、最看重质量的任务。",
			"status.loading": "正在刷新模型列表…",
			"error.action": "模型操作失败：{message}",
			"action.reload": "重新加载",
			"warning.groupLoad": "{name} 加载失败：{message}",
			"empty.models": "没有可用的模型。",
			"blocked.composer": "当前模型不可用，请先选择模型",
			"empty.efforts": "当前模型未提供推理等级。"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"command.description": "Select the model for this conversation",
			"option.loadError": "Catalog failed to load: {message}",
			"option.deepseekV4Flash.description": "Fast, efficient, and economical; suited to focused, routine, or parallel tasks.",
			"option.deepseekV4Pro.description": "Stronger agentic coding, knowledge, and difficult reasoning; suited to complex or quality-critical tasks at higher cost.",
			"trigger.fallback": "Select model",
			"trigger.loading": "Loading models…",
			"trigger.selectAria": "Select model",
			"trigger.aria": "Select model, current {model}",
			"trigger.ariaEffort": "Select model, current {model}, reasoning effort {effort}",
			"menu.aria": "Model and reasoning effort",
			"menu.model": "Model",
			"menu.effort": "Effort",
			"menu.back": "Back",
			"effort.providerDefault": "Default",
			"effort.off": "Off",
			"effort.low": "Low",
			"effort.high": "High",
			"effort.max": "Max",
			"effort.off.desc": "Use for simple tasks that do not need reasoning.",
			"effort.low.desc": "Prefer for routine or latency-sensitive tasks.",
			"effort.high.desc": "The default balance for most tasks.",
			"effort.max.desc": "Reserve for the hardest quality-first tasks.",
			"status.loading": "Refreshing model list…",
			"error.action": "Model operation failed: {message}",
			"action.reload": "Reload",
			"warning.groupLoad": "{name} failed to load: {message}",
			"empty.models": "No models available.",
			"blocked.composer": "This model is unavailable — select one to continue",
			"empty.efforts": "This model provides no reasoning effort levels."
		};
		//#endregion
		//#region lib/types/client/index.js
		/** One selectable row's id: an opaque row key (resolved by lookup, never parsed). */
		function rowId(providerId, modelId) {
			return `${providerId}/${modelId}`;
		}
		const BUILTIN_DESCRIPTION_KEYS = {
			"deepseek-official/deepseek-v4-flash": "option.deepseekV4Flash.description",
			"deepseek-official/deepseek-v4-pro": "option.deepseekV4Pro.description"
		};
		function descriptionOf(providerId, model, t) {
			const key = BUILTIN_DESCRIPTION_KEYS[rowId(providerId, model.id)];
			return key !== void 0 && model.description === en[key] ? t(key) : model.description;
		}
		/** Flatten the directory into popup rows; failure rows are listed for visibility but never selectable. */
		function optionsOf(directory, t) {
			const rows = [];
			for (const group of directory.groups) for (const model of group.models) {
				const description = descriptionOf(group.id, model, t);
				rows.push({
					id: rowId(group.id, model.id),
					label: model.name,
					detail: description !== void 0 ? `${group.name} · ${description}` : group.name,
					...directory.current !== null && directory.current.provider === group.id && directory.current.model === model.id ? { active: true } : {}
				});
			}
			for (const failure of directory.failures) rows.push({
				id: `failure/${failure.id}`,
				label: failure.name,
				detail: t("option.loadError", { message: failure.message })
			});
			return rows;
		}
		/**
		* Resolve a picked row back to its model selection by matching against the loaded
		* groups (the same data the rows were built from — ids stay opaque).
		* @param state - the session's directory snapshot.
		* @param id - the picked row id.
		* @returns the row's model selection, or undefined for failure rows / stale ids.
		*/
		function selectionOf(state, id) {
			for (const group of state.groups) for (const model of group.models) {
				if (rowId(group.id, model.id) !== id) continue;
				const reasoningEffort = state.current?.provider === group.id && state.current.model === model.id ? state.current?.reasoningEffort ?? model.reasoning?.defaultEffort : model.reasoning?.defaultEffort;
				return {
					provider: group.id,
					model: model.id,
					...reasoningEffort === void 0 ? {} : { reasoningEffort }
				};
			}
		}
		/** Dictionary namespace owned by this plugin. */
		const NS = "model";
		/** Required services: the contribution registry, the seat's slot registry, locale, and the service's own faces. */
		const inject = [
			"commandUi",
			"locale",
			"sessions",
			"slots",
			"remote",
			"remote.session"
		];
		/**
		* Client plugin body: mount ModelDirectoryResolver, register the `model` dictionaries,
		* then register the /model popup contribution and the composer model seat
		* over the service.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-model-selection: dictionaries");
			const t = ctx.locale.bind(NS);
			ctx.plugin(ModelDirectoryResolver, { blockReason: () => t("blocked.composer") });
			ctx.inject(["commandUi", "modelDirectories"], (scope) => {
				const command = scope.get("commandUi");
				const models = scope.modelDirectories;
				const sessions = scope.sessions;
				scope.effect(() => command.register({
					name: "model",
					description: () => t("command.description"),
					available: (session) => sessions.subagentAddress(session.sessionId) === void 0,
					ui: {
						kind: "popupSelect",
						options: async (session) => {
							if (sessions.subagentAddress(session.sessionId) !== void 0) throw new Error("model selection is unavailable for addressed subagent sessions");
							return optionsOf(await models.directoryFor(session.sessionId).load(), t);
						},
						onSelect: async (option, session) => {
							if (sessions.subagentAddress(session.sessionId) !== void 0) throw new Error("model selection is unavailable for addressed subagent sessions");
							const directory = models.directoryFor(session.sessionId);
							const selection = selectionOf(directory.store.getSnapshot(), option.id);
							if (selection === void 0) throw new Error("this provider's catalog failed to load — pick a model from a loaded group");
							await directory.select(selection);
						}
					}
				}), "ui-model-selection: /model contribution");
			});
			ctx.inject(["slots", "modelDirectories"], (scope) => {
				const models = scope.modelDirectories;
				const sessions = scope.sessions;
				scope.slots.inject("conversation.input.model", () => scope.slots.register({
					name: "conversation.input.model",
					locale: NS,
					inject: (sessionId) => {
						const directory = models.directoryFor(sessionId);
						const available = sessions.subagentAddress(sessionId) === void 0;
						return {
							available,
							directory: directory.store,
							load: () => {
								if (available) directory.load().catch(() => {});
							},
							select: (selection) => available ? directory.select(selection).then(() => true, () => false) : Promise.resolve(false)
						};
					}
				}, ModelSelect));
			});
		}
		//#endregion
		exports.ModelDirectory = ModelDirectory;
		exports.ModelDirectoryResolver = ModelDirectoryResolver;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
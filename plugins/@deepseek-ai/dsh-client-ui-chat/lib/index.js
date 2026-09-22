import z from "@deepseek-ai/schemastery";
//#region lib/types/chat-settings.js
/** Chat display preferences stored in the Host user-settings document. */
/** Settings namespace owned by the Chat target. */
const CHAT_SETTINGS_NAMESPACE = "ui-chat";
/** Field carrying the work-details presentation mode. */
const TRANSCRIPT_VIEW_FIELD = "transcriptView";
/** Work-details presentation modes a user can choose. */
const TRANSCRIPT_VIEW_MODES = [
	"compact",
	"detailed",
	"expanded"
];
/**
* Saved value from the two-mode generation of this setting. Read as `detailed`;
* never offered as a choice and never written back.
*/
const LEGACY_TRANSCRIPT_VIEW_MODE = "normal";
/** Every value the durable field accepts: current modes plus the legacy saved value. */
const TRANSCRIPT_VIEW_SETTING_VALUES = [...TRANSCRIPT_VIEW_MODES, LEGACY_TRANSCRIPT_VIEW_MODE];
/** Default preserves the compact process disclosure introduced by Chat. */
const DEFAULT_TRANSCRIPT_VIEW_MODE = "compact";
/** Performance and usage detail levels accepted by user settings. */
const PERFORMANCE_USAGE_MODES = ["compact", "detailed"];
/** Preserve detailed accounting for users without an explicit preference. */
const DEFAULT_PERFORMANCE_USAGE = "detailed";
/** Durable Chat schema; also the wire envelope the browser scope validates against. */
const ChatSettingsFields = {
	linkOpening: z.union(["sidebar", "new-tab"]).default("sidebar"),
	performanceUsage: z.union([...PERFORMANCE_USAGE_MODES]).default(DEFAULT_PERFORMANCE_USAGE),
	[TRANSCRIPT_VIEW_FIELD]: z.union([...TRANSCRIPT_VIEW_SETTING_VALUES]).default(DEFAULT_TRANSCRIPT_VIEW_MODE)
};
z.object(ChatSettingsFields);
//#endregion
//#region lib/types/index.js
/** Live preferences projected to the browser. */
const Config = z.object({
	[TRANSCRIPT_VIEW_FIELD]: ChatSettingsFields[TRANSCRIPT_VIEW_FIELD].volatile(),
	performanceUsage: ChatSettingsFields["performanceUsage"].volatile(),
	linkOpening: ChatSettingsFields.linkOpening.volatile()
});
/** Host preferences are consumed through the configuration form projection.
* @param ctx Plugin context used for optional settings presentation.
*/
function apply(ctx) {
	ctx.inject(["settings"], (child) => {
		child.effect(() => child.settings.configure({ auto: false }, ctx.fiber));
	});
}
//#endregion
export { CHAT_SETTINGS_NAMESPACE, Config, DEFAULT_TRANSCRIPT_VIEW_MODE, LEGACY_TRANSCRIPT_VIEW_MODE, TRANSCRIPT_VIEW_FIELD, TRANSCRIPT_VIEW_MODES, apply };

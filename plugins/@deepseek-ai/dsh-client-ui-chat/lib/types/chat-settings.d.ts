/** Chat display preferences stored in the Host user-settings document. */
import z from '@deepseek-ai/schemastery';
/** Settings namespace owned by the Chat target. */
export declare const CHAT_SETTINGS_NAMESPACE = "ui-chat";
/** Field carrying the work-details presentation mode. */
export declare const TRANSCRIPT_VIEW_FIELD = "transcriptView";
/** Work-details presentation modes a user can choose. */
export declare const TRANSCRIPT_VIEW_MODES: readonly ["compact", "standard", "detailed", "verbose"];
/** Work-details presentation mode. */
export type TranscriptViewMode = typeof TRANSCRIPT_VIEW_MODES[number];
/**
 * Saved value from the two-mode generation of this setting. Read as `standard`;
 * never offered as a choice and never written back.
 */
export declare const LEGACY_TRANSCRIPT_VIEW_MODE = "normal";
/** Saved `expanded` values read as `detailed`, without being offered or written back. */
export declare const LEGACY_EXPANDED_TRANSCRIPT_VIEW_MODE = "expanded";
/** Standard process summaries for users without an explicit preference. */
export declare const DEFAULT_TRANSCRIPT_VIEW_MODE: TranscriptViewMode;
/** Performance and usage detail levels accepted by user settings. */
export declare const PERFORMANCE_USAGE_MODES: readonly ["compact", "detailed"];
/** Performance and usage presentation. */
export type PerformanceUsageMode = typeof PERFORMANCE_USAGE_MODES[number];
/** Preserve detailed accounting for users without an explicit preference. */
export declare const DEFAULT_PERFORMANCE_USAGE: PerformanceUsageMode;
/** Destinations for ordinary clicks on Chat HTTP(S) links. */
export type LinkOpening = 'sidebar' | 'new-tab';
/** Preserve the built-in browser for users without an explicit preference. */
export declare const DEFAULT_LINK_OPENING: LinkOpening;
/** Durable Chat section shared by the Host schema and browser scope. */
export interface ChatSettings {
    /** Work-details preference; legacy values are accepted only from existing saved settings. */
    transcriptView: TranscriptViewMode | typeof LEGACY_TRANSCRIPT_VIEW_MODE | typeof LEGACY_EXPANDED_TRANSCRIPT_VIEW_MODE;
    /** Detail level for composer statistics and completed-Turn usage. */
    performanceUsage: PerformanceUsageMode;
    /** Default destination for Chat HTTP(S) links. */
    linkOpening: LinkOpening;
}
/** Durable Chat schema; also the wire envelope the browser scope validates against. */
export declare const ChatSettingsFields: {
    linkOpening: z<"sidebar" | "new-tab", "sidebar" | "new-tab", "defined">;
    performanceUsage: z<"compact" | "detailed", "compact" | "detailed", "defined">;
    transcriptView: z<"compact" | "standard" | "detailed" | "verbose" | "normal" | "expanded", "compact" | "standard" | "detailed" | "verbose" | "normal" | "expanded", "defined">;
};
/** Schema for shared configuration values. */
export declare const ChatSettingsSchema: z<Schemastery.ObjectS<NoInfer<{
    linkOpening: z<"sidebar" | "new-tab", "sidebar" | "new-tab", "defined">;
    performanceUsage: z<"compact" | "detailed", "compact" | "detailed", "defined">;
    transcriptView: z<"compact" | "standard" | "detailed" | "verbose" | "normal" | "expanded", "compact" | "standard" | "detailed" | "verbose" | "normal" | "expanded", "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    linkOpening: z<"sidebar" | "new-tab", "sidebar" | "new-tab", "defined">;
    performanceUsage: z<"compact" | "detailed", "compact" | "detailed", "defined">;
    transcriptView: z<"compact" | "standard" | "detailed" | "verbose" | "normal" | "expanded", "compact" | "standard" | "detailed" | "verbose" | "normal" | "expanded", "defined">;
}>>, "plain">;
//# sourceMappingURL=chat-settings.d.ts.map
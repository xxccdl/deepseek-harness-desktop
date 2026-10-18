/** Chat presentation derived from Host-backed detail and collapse timing. */
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store';
import type { CollapseTiming, TranscriptViewMode } from '../chat-settings.ts';
export { COLLAPSE_TIMINGS, type CollapseTiming } from '../chat-settings.ts';
/** Presentation capabilities that one work-details mode enables. */
export interface ChatPresentationPolicy {
    /** Preference identity for layout resets and diagnostics; renderers select the capabilities below. */
    readonly mode: TranscriptViewMode;
    /** Saved collapse timing; completion retains the default immediate folding and scrolling. */
    readonly collapseTiming: CollapseTiming;
    /** Whether a normally completed Turn folds its process rows behind the whole-Turn control. */
    readonly foldCompletedTurns: boolean;
    /** Collapsible group headers for all Turns, historical Turns only, or no Turns. */
    readonly stepGrouping: 'collapsed' | 'history' | 'none';
    /** Show the running command, path, query, or reasoning detail in group titles. */
    readonly liveProcessDetail: boolean;
    /** Whether a settled reasoning row previews its first line beside the Think title. */
    readonly settledReasoningPreview: boolean;
}
/**
 * Resolve a stable policy for one detail mode and collapse timing.
 * @param mode - persisted work-details mode.
 * @param collapseTiming - persisted timing; defaults to immediate completion folding.
 * @returns the same policy object for the same pair of choices.
 */
export declare function presentationPolicyFor(mode: TranscriptViewMode, collapseTiming?: CollapseTiming): ChatPresentationPolicy;
/**
 * Combine Host-backed detail and persisted timing without owning subscriptions.
 * @param mode - live work-details mode.
 * @param collapseTiming - live Host-backed collapse timing.
 * @returns observable policy whose subscriptions follow both preferences.
 */
export declare function derivePresentationPolicy(mode: ObservableSnapshot<TranscriptViewMode>, collapseTiming: ObservableSnapshot<CollapseTiming>): ObservableSnapshot<ChatPresentationPolicy>;
//# sourceMappingURL=presentation-policy.d.ts.map
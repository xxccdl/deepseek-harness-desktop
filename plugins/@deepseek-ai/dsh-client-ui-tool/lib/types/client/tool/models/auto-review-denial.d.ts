import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots';
import type { AutoReviewDenial } from './tool-call-model.ts';
/** Localized copy that replaces ordinary failed-call output for an Auto denial. */
export interface AutoReviewDenialPresentation {
    summary: string;
    output: string;
}
/**
 * Normalize only the user-visible copy; the durable error keeps the raw reason.
 * @param reason - raw persisted reviewer reason, or null when none was recorded.
 * @returns one display line, or null when the reason has no displayable text.
 */
export declare function normalizeAutoReviewReason(reason: string | null): string | null;
/**
 * Resolve the collapsed identity and the single expanded OUT line.
 * @param denial - locale-neutral persisted denial facts.
 * @param t - conversation-namespace translator.
 * @returns localized summary and output text for the Tool row.
 */
export declare function localizeAutoReviewDenial(denial: AutoReviewDenial, t: TranslateNS<'conversation'>): AutoReviewDenialPresentation;
//# sourceMappingURL=auto-review-denial.d.ts.map
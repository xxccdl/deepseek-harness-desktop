/** Localized titles for projected step-process activity. */
import type { ChatViewSlotProps } from '../contract/slots.ts';
import type { ProcessActivitySummary } from '../contract/process-groups.ts';
/**
 * Compose a closed group's localized title from its top three categories without counts.
 * @param summary - ranked work and phase evidence for this range.
 * @param t - Chat namespace translator.
 * @returns the secondary disclosure title.
 */
export declare function processTitle(summary: ProcessActivitySummary, t: ChatViewSlotProps['t']): string;
//# sourceMappingURL=step-process.d.ts.map
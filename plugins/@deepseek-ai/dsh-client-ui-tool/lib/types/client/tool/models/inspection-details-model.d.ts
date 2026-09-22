/** Runtime inspection, session queries, and workflow reports from recorded text. */
import type { ToolDetailsModel } from '../components/ToolDetails.tsx';
import { type DetailTranslate } from './detail-model-shared.ts';
/**
 * Present successful inspection, query, and workflow text as named records.
 * @param name - Wire tool name.
 * @param args - Recorded argument object.
 * @param text - Recorded result text.
 * @param json - Parsed whole-result JSON, or undefined for non-JSON text.
 * @param t - Conversation translator.
 * @param locale - Date display locale.
 * @returns Structured details, or null when an output format is unknown.
 */
export declare function inspectionDetails(name: string, args: Record<string, unknown>, text: string, json: unknown, t: DetailTranslate, locale: string): ToolDetailsModel | null;
//# sourceMappingURL=inspection-details-model.d.ts.map
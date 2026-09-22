/** Recorded-value formatting shared by entity lists and inspection results. */
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots';
import type { ToolDetailItem, ToolDetailsModel } from '../components/ToolDetails.tsx';
/** Translator supplied by the conversation slot. */
export type DetailTranslate = TranslateNS<'conversation'>;
/** A compact detail row derived from durable tool output. */
export type DetailItem = ToolDetailItem;
/**
 * Narrow parsed JSON to an object record.
 * @param value - Parsed result or argument value.
 * @returns Whether named fields can be read.
 */
export declare function detailRecord(value: unknown): value is Record<string, unknown>;
/**
 * Check a recorded string field that must contain visible text.
 * @param value - Parsed field value.
 * @returns Whether the field is a non-empty string after trimming.
 */
export declare function nonempty(value: unknown): value is string;
/**
 * Decode an entire JSON result without accepting a partial prefix.
 * @param text - Recorded text.
 * @returns Parsed JSON, or undefined for non-JSON output.
 */
export declare function detailJson(text: string): unknown;
/**
 * Give a recorded status its localized name and a static semantic color.
 * @param status - Result status, retained verbatim when the vocabulary is unknown.
 * @param t - Conversation translator.
 * @returns A badge that does not imply a live subscription.
 */
export declare function detailBadge(status: string, t: DetailTranslate): NonNullable<DetailItem['badge']>;
/**
 * Name a known tool field while preserving extension-owned field names.
 * @param key - Recorded JSON property name.
 * @param t - Conversation translator.
 * @returns Localized known label or the original property name.
 */
export declare function detailLabel(key: string, t: DetailTranslate): string;
/**
 * Project open inspection records into readable fields and named disclosures.
 * @param value - Parsed JSON, including provider-owned extension fields.
 * @param t - Conversation translator.
 * @param depth - Current disclosure depth; deeper records remain available as code.
 * @returns Entity rows preserving the order of visible values.
 */
export declare function inspectionItems(value: unknown, t: DetailTranslate, depth?: number): DetailItem[];
/**
 * Give a result list consistent historical context and empty-state copy.
 * @param items - Recorded result rows.
 * @param summary - Collapsed-row summary.
 * @param t - Conversation translator.
 * @returns A complete compact detail model.
 */
export declare function detailList(items: readonly DetailItem[], summary: string, t: DetailTranslate): ToolDetailsModel;
//# sourceMappingURL=detail-model-shared.d.ts.map
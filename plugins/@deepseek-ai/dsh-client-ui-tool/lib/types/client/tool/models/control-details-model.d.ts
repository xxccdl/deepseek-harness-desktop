/** Entity lists and receipts for agent, job, terminal, and language-server tools. */
import type { ToolDetailsModel } from '../components/ToolDetails.tsx';
import { type DetailTranslate } from './detail-model-shared.ts';
/**
 * Derive entity lists and operation receipts from supported recorded output formats.
 * @param name - Wire tool name, including Team-scoped aliases.
 * @param args - Parsed recorded arguments.
 * @param text - Successful recorded result text.
 * @param json - Parsed whole-result JSON, or undefined for non-JSON text.
 * @param t - Conversation translator.
 * @returns Compact details, or null when the output format is not recognized.
 */
export declare function controlDetails(name: string, args: Record<string, unknown>, text: string, json: unknown, t: DetailTranslate): ToolDetailsModel | null;
//# sourceMappingURL=control-details-model.d.ts.map
/** Recorded todo, goal, and schedule values for the compact detail body. */
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots';
import type { ToolCallBlock } from './tool-call-model.ts';
import type { ToolDetailsModel } from '../components/ToolDetails.tsx';
type Translate = TranslateNS<'conversation'>;
/**
 * Derive the compact todo list from a todo_write call.
 * @param args - Parsed todo_write arguments.
 * @param t - Conversation dictionary translator.
 * @returns Localized todo details, or null for unsupported input.
 */
export declare function todosDetail(args: Record<string, unknown>, t: Translate): ToolDetailsModel | null;
/**
 * Derive a supported successful result, retaining generic output on unknown or malformed data.
 * @param block - Logged root or nested Tool call and its optional result.
 * @param t - Conversation dictionary translator.
 * @param locale - Display locale for absolute dates in the viewer's time zone.
 * @returns Localized detail data, or null for raw input/output.
 */
export declare function detailsCardModel(block: ToolCallBlock, t: Translate, locale: string): ToolDetailsModel | null;
export {};
//# sourceMappingURL=details-card-model.d.ts.map
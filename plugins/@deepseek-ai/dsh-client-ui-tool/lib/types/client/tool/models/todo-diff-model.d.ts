/** Todo changes relative to the preceding recorded write. */
import type { ToolCallBlock } from '@deepseek-ai/dsh-client-ui-chat/client';
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots';
import type { ToolDetailsModel } from '../components/ToolDetails.tsx';
import type { TodoBaseline } from './todo-history.ts';
/**
 * Compare this write with its predecessor in the loaded call history.
 * @param block - The write being displayed.
 * @param baseline - List recorded before this call, or undefined when its start is unavailable.
 * @param hasMore - Whether older unloaded history may contain a preceding list.
 * @param t - Conversation dictionary translator.
 * @returns Details and a change summary, or null for generic Tool output.
 */
export declare function todoDiffModel(block: ToolCallBlock, baseline: TodoBaseline | undefined, hasMore: boolean, t: TranslateNS<'conversation'>): {
    details: ToolDetailsModel;
    summary: string | null;
} | null;
//# sourceMappingURL=todo-diff-model.d.ts.map
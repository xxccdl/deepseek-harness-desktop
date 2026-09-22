import type { Context } from '@deepseek-ai/cordis';
import type { ConversationNodeDefinition, ConversationViewDefinition, ConversationViewNode, TodoItem } from '@deepseek-ai/dsh-client-ui-conversation/client';
/** The durable list preceding one Tool invocation; absent before the first loaded write. */
export interface TodoBaseline {
    readonly todos: readonly TodoItem[] | undefined;
}
/** Session-owned call lookup, read only through the target's observable snapshot. */
export interface TodoHistory {
    /** @param callId - Root or nested call identity. @returns its recorded predecessor, when the start is loaded. */
    get(callId: string): TodoBaseline | undefined;
}
declare module '@deepseek-ai/dsh-client-ui-conversation/client' {
    interface ConversationViewSnapshotMap {
        /** Recorded todo lists preceding each loaded todo call. */
        'tool-todo-history': TodoHistory;
    }
}
/** Durable writes are indexed independently of Tool success receipts. */
export declare const todoWriteDefinition: ConversationNodeDefinition<readonly TodoItem[]>;
/** Invocation predecessors are repaired by the assembler when older history arrives. */
export declare const todoCallDefinition: ConversationNodeDefinition<TodoBaseline>;
interface TodoHistoryNode extends ConversationViewNode {
    readonly data: TodoBaseline;
}
/** Incremental lookup snapshots preserve earlier call baselines across later writes. */
export declare const todoHistoryView: ConversationViewDefinition<TodoHistoryNode, TodoHistory>;
/**
 * Install the recorded-write index and call predecessor target.
 * @param ctx - Tool presentation plugin context.
 */
export declare function registerTodoHistory(ctx: Context): void;
export {};
//# sourceMappingURL=todo-history.d.ts.map
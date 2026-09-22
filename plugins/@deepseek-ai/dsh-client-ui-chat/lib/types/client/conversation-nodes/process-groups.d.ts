import type { ConversationGroupDefinition, ConversationGroupInput, GroupUpdate } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { ChatConversationViewNode } from '../contract/chat-nodes.ts';
import type { ProcessGroupData } from '../contract/process-groups.ts';
type ProcessInput = ConversationGroupInput<ChatConversationViewNode>;
/** Session-local Turn results; ordinary updates never read other Turns' Node contents. */
export declare class ProcessState {
    private turns;
    private order;
    private pending;
    /**
     * Consume one synchronous Builder input without retaining its readers.
     * @param input - projected Node changes, indexed positions, and Turn lifecycle.
     */
    accept(input: ProcessInput): void;
    private rootEntries;
    /**
     * Read pending output without advancing State.
     * @returns the repeatable update for the last input batch.
     */
    output(): GroupUpdate<ProcessGroupData> | null;
}
/** Chat's registered business grouping; presentation modes never enter its State. */
export declare const processGroupDefinition: ConversationGroupDefinition<ChatConversationViewNode, ProcessState, ProcessGroupData> & {
    readonly target: 'chat';
};
export {};
//# sourceMappingURL=process-groups.d.ts.map
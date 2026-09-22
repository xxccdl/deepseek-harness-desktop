import type { Context } from '@deepseek-ai/cordis';
import type { ConversationNodeDefinition } from '@deepseek-ai/dsh-client-ui-conversation/client';
interface InboxIdentity {
    readonly id: string;
    readonly source: {
        readonly kind: string;
    };
}
interface PendingSnapshot {
    readonly kind: 'snapshot';
    readonly ids: readonly InboxIdentity[];
}
interface PendingSplice {
    readonly kind: 'splice';
    readonly previous: PendingState;
    readonly start: number;
    readonly removedCount: number;
    readonly inserted: readonly InboxIdentity[];
}
type PendingState = PendingSnapshot | PendingSplice;
/** Persistent Inbox state after one durable Inbox splice. */
export interface InboxState {
    /** Persistent splice chain materialized only when a batch is claimed. */
    readonly pending: PendingState;
    /** Message ids in the current claim, shared until the next claim. */
    readonly currentClaimed: ReadonlySet<string>;
    readonly claimSeq: number;
    readonly claimedHuman: boolean;
}
/** Persistent next-step claims identify messages admitted into a running Turn. */
export declare const nextStepInboxDefinition: ConversationNodeDefinition<InboxState>;
/** Persistent next-turn claims identify messages that wake a new Turn. */
export declare const nextTurnInboxDefinition: ConversationNodeDefinition<InboxState>;
/**
 * Register the Inbox state used by Chat message classification.
 * @param ctx - owning UI Conversation context.
 */
export declare function registerInboxConversationNodes(ctx: Context): void;
export {};
//# sourceMappingURL=inbox.d.ts.map
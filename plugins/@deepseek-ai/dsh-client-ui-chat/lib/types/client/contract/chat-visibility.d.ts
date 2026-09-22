/** Chat-only row visibility; durable events and trajectory inspection remain intact. */
import type { ChatNode } from './chat-nodes.ts';
/**
 * Exclude system prompts, ordinary Context, and permission commands from visible Chat rows.
 * @param node - projected Chat node.
 * @returns whether the node contributes a visible Chat row.
 */
export declare function isVisibleChatNode(node: ChatNode): boolean;
//# sourceMappingURL=chat-visibility.d.ts.map
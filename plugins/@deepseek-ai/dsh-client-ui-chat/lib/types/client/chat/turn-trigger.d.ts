/** Presentation of durable non-human messages claimed to begin a Turn. */
import type { ContextMessageNode } from '../contract/snapshot.ts';
import type { ChatKey } from '../locale.ts';
/** Existing primitive glyph selected for a Turn trigger's source family. */
export type TurnTriggerIcon = 'agent' | 'github' | 'goal' | 'job' | 'plugin' | 'request' | 'schedule' | 'subagent' | 'team' | 'webhook';
/**
 * Describe a waking message using its source and recognized producer framing.
 * @param node - durable context, including the original notification body.
 * @returns localized title key and source-family icon.
 */
export declare function turnTriggerDetails(node: ContextMessageNode): {
    title: ChatKey;
    icon: TurnTriggerIcon;
};
//# sourceMappingURL=turn-trigger.d.ts.map
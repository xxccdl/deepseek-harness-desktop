import type { ChatConversationViewNode } from '../contract/chat-nodes.ts';
import { type ChatGroupTree } from '../contract/group-tree.ts';
/**
 * Loaded Turns split into consecutive segments at the Turns holding a Node at
 * one group-tree position, visible or hidden. The latest segment starts at the
 * last such Turn, or at the first loaded Turn when none is loaded. Node changes
 * update per-Turn counts without scanning the loaded Nodes; `settle` returns at
 * once while the start holds and otherwise reads loaded Turns only from the
 * earlier of the previous and new starts.
 */
export declare class GroupTreeSegments {
    private readonly position;
    /** Opening Node count by owning Turn. */
    private readonly openings;
    private latestOpening;
    private latestStart;
    /** @param position - group-tree position whose Nodes open a segment. */
    constructor(position: ChatGroupTree);
    /**
     * Account one Node change.
     * @param previous - replaced Node; absent for an addition.
     * @param next - replacing Node; absent for a removal.
     */
    track(previous: ChatConversationViewNode | undefined, next: ChatConversationViewNode | undefined): void;
    /**
     * Test latest-segment membership as of the last `settle`.
     * @param turn - owning Turn, when resolved.
     * @returns whether the Turn belongs to the latest segment.
     */
    inLatest(turn: number | undefined): boolean;
    /**
     * Move the latest segment start for the currently loaded Turns.
     * @param turnOrder - loaded Turns in ascending timeline order.
     * @returns loaded Turns that entered or left the latest segment, in ascending order.
     */
    settle(turnOrder: readonly number[]): readonly number[];
    private openingTurn;
    private lastOpeningTurn;
    /** @returns the Turn's opening count after the change; zero removes the Turn. */
    private adjust;
}
//# sourceMappingURL=group-tree-segments.d.ts.map
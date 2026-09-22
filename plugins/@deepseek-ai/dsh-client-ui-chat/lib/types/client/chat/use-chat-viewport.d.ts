/** Turn-aware DOM scrolling and geometry, without history-loading or follow policy. */
import { type RefObject } from 'react';
import type { ChatScrollPosition } from '../contract/slots.ts';
import type { ChatSnapshot } from '../contract/snapshot.ts';
/** Scroll position, maximum top, and viewport height from one geometry read. */
export interface ViewportMetrics {
    readonly top: number;
    readonly floor: number;
    readonly height: number;
}
/** Scroll geometry attributed against the last acknowledged position. */
export interface ViewportScroll {
    readonly metrics: ViewportMetrics;
    readonly movedByReader: boolean;
}
/** Actual clamped scroll result, including any known semantic anchor and turn. */
export interface ViewportLanding {
    readonly metrics: ViewportMetrics;
    readonly position: ChatScrollPosition | null;
    readonly turn: number | null;
}
interface ViewportEvents {
    scroll: (event: ViewportScroll) => void;
    scrollEnd: () => void;
    resize: () => void;
    interact: () => void;
}
/** Owns one Chat scrollport's DOM operations, event listeners, and size observer. */
export declare class ChatViewport {
    private elements;
    private observer;
    private events;
    private turns;
    private observation;
    private paging;
    /**
     * Bind to the containing scrollport and observe content and viewport sizes.
     * @param list - Chat root inside an optional shared conversation scrollport.
     * @param column - ordered outer Node/Group boxes; its size changes invalidate cached landings.
     */
    attach(list: HTMLElement, column: HTMLElement): void;
    /** Disconnect DOM resources and clear observations for the detached view. */
    detach(): void;
    /**
     * Connect business policy without changing DOM listener ownership.
     * @param events - business handlers for scroll and layout changes.
     * @returns a disposer that disconnects only these handlers.
     */
    connect(events: ViewportEvents): () => void;
    /**
     * Adopt the loaded turn anchors without querying the DOM.
     * @param turns - ordered loaded turns from the committed Chat snapshot.
     */
    updateTurns(turns: ReturnType<ChatSnapshot['navigation']['items']>): void;
    /**
     * Resolve the tail from the committed turn index.
     * @returns the latest loaded turn, or null for an empty window.
     */
    get latestTurn(): number | null;
    /** Discard geometry-dependent landing knowledge while retaining scroll attribution. */
    invalidate(): void;
    /**
     * Accept a sampled reader position without retaining a known landing.
     * @param metrics - settled reader position used as the next attribution baseline.
     */
    acknowledge(metrics: ViewportMetrics): void;
    /**
     * Compare the current scroll geometry with the last acknowledged position.
     * @returns current metrics and movement attribution, or null while detached.
     */
    readScroll(): ViewportScroll | null;
    private metrics;
    private anchor;
    /**
     * Capture visible transcript content, excluding Turn controls that relocate when history expands.
     * @returns a visible semantic anchor, or null when no anchor can be resolved.
     */
    capturePosition(): ChatScrollPosition | null;
    /**
     * Approximate the active Turn by binary-searching outer Node/Group boxes.
     * Gaps retain the last visited Turn candidate, not necessarily the immediate predecessor.
     * A known landing bypasses measurement while its position is unchanged.
     * @param metrics - reusable scroll metrics; omitted callers request a fresh read.
     * @returns the Turn near the reading line, or null while detached or empty.
     */
    readVisibleTurn(metrics?: ViewportMetrics | null): number | null;
    /**
     * Align a known loaded turn and return its actual clamped position.
     * A split Node anchor selects its first visible part.
     * @param turn - loaded turn to align below the scrollport's top edge.
     * @returns the actual landing, or null when its anchor is unavailable.
     */
    scrollToTurn(turn: number): ViewportLanding | null;
    /**
     * Align the nearest available fallback for an unavailable turn anchor.
     * @param turn - minimum turn number for a mounted fallback row.
     * @returns the fallback landing, or null when no eligible row exists.
     */
    scrollToTurnAtOrAfter(turn: number): ViewportLanding | null;
    /**
     * Restore a semantic anchor with a raw-position fallback.
     * @param position - semantic scroll memory; raw top is used only if its row is absent.
     * @returns the actual landing, or null while detached.
     */
    restore(position: ChatScrollPosition): ViewportLanding | null;
    /** Retain the first eligible transcript seat in DOM order; selection reads no geometry. */
    beginPaging(): void;
    /**
     * Retain one old row and its inner/outer offsets for paging and later content growth.
     * @param position - an explicit landing to retain; omitted callers capture the current reading position.
     */
    beginPreserving(position?: ChatScrollPosition | null): void;
    private retain;
    /** Release paging ownership and its content-size observation. */
    stopPreserving(): void;
    /**
     * Expose retained paging ownership to navigation and resize policy.
     * @returns whether a paging row is retained for subsequent layout changes.
     */
    get preserving(): boolean;
    /**
     * Compensate inner scrolling first, then the outer scrollport, within their actual scroll ranges.
     * @returns the actual landing, or null when no visible retained row remains.
     */
    preserve(): ViewportLanding | null;
    /**
     * Align the scrollport with its current floor.
     * @returns the actual floor landing, or null while detached.
     */
    scrollToBottom(): ViewportLanding | null;
    private align;
    private write;
    private readonly onScroll;
    private readonly onScrollEnd;
    private readonly onIntent;
}
/**
 * Bind viewport resource ownership to the component's layout lifetime.
 * @returns one viewport owner and the element refs attached for this mount.
 */
export declare function useChatViewport(): {
    viewport: ChatViewport;
    listRef: RefObject<HTMLDivElement>;
    columnRef: RefObject<HTMLDivElement>;
};
export {};
//# sourceMappingURL=use-chat-viewport.d.ts.map
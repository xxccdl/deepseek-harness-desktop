import type { ChatScrollPosition, ChatViewSlotProps } from '../contract/slots.ts';
import type { ChatViewport, ViewportLanding, ViewportScroll } from './use-chat-viewport.ts';
/** Reading facts that affect Chat chrome and initial rail placement. */
export interface ChatReadingState {
    readonly initialized: boolean;
    readonly followingTail: boolean;
    readonly activeTurn: number | null;
}
/** Settled reader position delivered to history-navigation policy. */
export interface ReadingSample {
    readonly position: ChatScrollPosition | null;
    readonly movedByReader: boolean;
    readonly followingTail: boolean;
}
type PositionStore = ChatViewSlotProps['chatScroll'];
/** Owns reading policy and its cancellable sampling work, without DOM access. */
export declare class ChatReading {
    private readonly viewport;
    private store;
    private state;
    private readonly onChange;
    private sampleTimer;
    private probeFrame;
    private sampled;
    constructor(viewport: ChatViewport, store: PositionStore, state: ChatReadingState, onChange: (state: ChatReadingState) => void);
    /**
     * Expose pending reader ownership to navigation and resize handlers.
     * @returns whether reader input still awaits interval or scrollend sampling.
     */
    get pending(): boolean;
    /**
     * Expose the active follow policy.
     * @returns whether content growth retains bottom-follow ownership.
     */
    get followingTail(): boolean;
    /**
     * Adopt the committed Session's scroll memory.
     * @param store - scroll memory for the current Session.
     */
    setStore(store: PositionStore): void;
    /**
     * Connect history policy to settled reading observations.
     * @param sampled - receives settled reader positions.
     * @returns a disposer that disconnects only this listener.
     */
    connect(sampled: (sample: ReadingSample) => void): () => void;
    /** Cancel timers and animation frames and detach the sample listener. */
    dispose(): void;
    /** Release bottom follow and pending sampling for an explicit navigation. */
    pauseFollowing(): void;
    /** Land at the current floor and clear saved reader position. */
    followTail(): void;
    /** Restore the Session's semantic position, or follow the tail when none is saved. */
    restore(): void;
    /**
     * Adopt a known landing without rediscovering its anchor.
     * @param landing - measured navigation result that replaces pending reader input.
     */
    acceptNavigation(landing: ViewportLanding): void;
    /**
     * Retain reading policy while history changes the anchor's geometry.
     * @param landing - compensated position that retains the current reading policy.
     */
    preservePosition(landing: ViewportLanding): void;
    /**
     * Handle pinned layout movement and reader arrivals at the floor immediately.
     * @param scroll - attributed scroll delivery; other reader movement remains pending until sampled.
     */
    readonly onScroll: (scroll: ViewportScroll) => void;
    /** Settle pending reader movement at the browser's scrollend. */
    readonly onScrollEnd: () => void;
    /** Reconcile a layout change without overriding unsampled reader input. */
    onResize(): void;
    /** Resolve the active turn from tail ownership or a coalesced reading-line probe. */
    refreshActiveTurn(): void;
    private nearBottom;
    private commit;
    private publish;
    private cancelPending;
    private readonly probe;
    private readonly flushSample;
}
/**
 * Retain reading policy and expose only changes in visible reading state.
 * @param viewport - turn-aware DOM operations.
 * @param store - Session-owned semantic scroll memory.
 * @param initialTurn - latest loaded turn before the first landing.
 * @returns the reading owner and its React-visible state.
 */
export declare function useChatReading(viewport: ChatViewport, store: PositionStore, initialTurn: number | null): {
    reading: ChatReading;
    state: ChatReadingState;
};
export {};
//# sourceMappingURL=use-chat-reading.d.ts.map
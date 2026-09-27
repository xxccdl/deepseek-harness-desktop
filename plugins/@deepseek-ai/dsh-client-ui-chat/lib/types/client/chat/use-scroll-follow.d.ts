/** Scroll position, maximum top, and viewport height from one geometry read. */
export interface ViewportMetrics {
    readonly top: number;
    readonly floor: number;
    readonly height: number;
}
/**
 * Read one scrollport without measuring its children.
 * @param element - scrolling element.
 * @returns current position and range.
 */
export declare function scrollMetrics(element: HTMLElement): ViewportMetrics;
/** One scrollport's follow intent; native animation progress does not count as reader movement. */
export declare class ScrollFollow {
    private following;
    private readonly threshold;
    private static readonly owners;
    private target;
    private sampledTop;
    /**
     * @param following - initial follow intent.
     * @param threshold - accepted distance from the floor, in pixels.
     */
    constructor(following: boolean, threshold: number);
    /**
     * Find the mounted controller for reading-position compensation.
     * @param element - scrollport with an optional follow owner.
     * @returns its controller, when bound.
     */
    static forElement(element: HTMLElement): ScrollFollow | undefined;
    /**
     * Share this controller with reading-position compensation for the same scrollport.
     * @param element - owned scrollport.
     * @returns release the association on unmount or close.
     */
    bind(element: HTMLElement): () => void;
    /**
     * Expose follow intent independently of the current offset.
     * @returns whether content growth should follow the floor.
     */
    get active(): boolean;
    /**
     * Expose outstanding native motion before accepting reader input.
     * @returns whether a native follow animation has an outstanding target.
     */
    get animating(): boolean;
    /**
     * Classify bottom arrivals using this scrollport's own tolerance.
     * @param metrics - current scroll geometry.
     * @returns whether the position is within the follow threshold.
     */
    nearBottom(metrics: ViewportMetrics): boolean;
    /**
     * Commit caller-owned follow decisions without moving the scrollport.
     * @param active - externally committed follow intent.
     */
    setFollowing(active: boolean): void;
    /** Adopt the next visible layout as a fresh reader position. */
    reset(): void;
    /**
     * Adopt delivered scrolling while retaining intent during native animation.
     * @param metrics - current geometry.
     * @param movedByReader - caller attribution; omitted callers compare the last sampled position.
     * @returns updated follow intent.
     */
    sample(metrics: ViewportMetrics, movedByReader?: boolean): boolean;
    /**
     * Settle native scrolling; an off-target stop releases follow intent.
     * @param metrics - actual geometry delivered at scrollend.
     * @returns follow intent after completing or interrupting native motion.
     */
    settle(metrics: ViewportMetrics): boolean;
    /**
     * Position immediately and adopt the resulting follow intent.
     * @param element - scrolling element.
     * @param metrics - geometry before positioning.
     * @param top - requested offset, clamped to the measured range.
     * @returns geometry after positioning.
     */
    jump(element: HTMLElement, metrics: ViewportMetrics, top: number): ViewportMetrics;
    /**
     * Follow the measured floor, respecting reduced motion for smooth requests.
     * An outstanding smooth target finishes before another is issued.
     * Within-tolerance positioning is immediate while no animation is outstanding.
     * @param element - scrolling element.
     * @param metrics - current geometry.
     * @param behavior - native animation for growth, or immediate positioning.
     * @returns current geometry; smooth requests retain their starting position until native scroll delivery.
     */
    toBottom(element: HTMLElement, metrics: ViewportMetrics, behavior: 'instant' | 'smooth'): ViewportMetrics;
    /**
     * Cancel native motion before a reader gesture; only subsequent actual movement changes follow intent.
     * @param element - scrolling element.
     * @param metrics - position at interruption.
     */
    interrupt(element: HTMLElement, metrics: ViewportMetrics): void;
}
/**
 * Retain one independent follow controller without React updates for scroll samples.
 * @param initial - initial follow intent.
 * @param threshold - accepted distance from the floor, in pixels.
 * @returns the stable controller shared by the caller's scroll and resize handlers.
 */
export declare function useScrollFollow(initial: boolean, threshold: number): ScrollFollow;
//# sourceMappingURL=use-scroll-follow.d.ts.map
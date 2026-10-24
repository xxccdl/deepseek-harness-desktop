/** Deterministic tooltip placement using measured border boxes and viewport coordinates. */
/** Bubble placement relative to the anchor. */
export type TooltipSide = 'right' | 'left' | 'bottom' | 'top';
interface PlacementInput {
    anchor: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    width: number;
    height: number;
    viewportWidth: number;
    viewportHeight: number;
    side: TooltipSide;
    align: 'center' | 'end';
    gap: number;
}
interface TooltipPlacement {
    left: number;
    top: number;
    width: number;
    height: number;
    side: TooltipSide;
    /** No complete side fits, so placement is bounded by the viewport instead. */
    overflow: boolean;
}
/**
 * Prefer the requested side, its opposite, then perpendicular sides without covering the anchor.
 * @param input - Observed dimensions, anchor edges, viewport and requested placement; horizontal gaps remain 10px.
 * @returns Border-box coordinates and the selected side; if no side fits, a viewport-bounded fallback.
 */
export declare function placeTooltip(input: PlacementInput): TooltipPlacement;
export {};
//# sourceMappingURL=tooltip-placement.d.ts.map
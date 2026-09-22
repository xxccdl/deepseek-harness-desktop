import type { RefObject } from 'react';
/**
 * Clamp a bottom-anchored overlay's max-height to the viewport.
 * @param ref - the overlay element; a null current (overlay closed) skips measuring.
 * @param cap - design max-height in px (the clamp never exceeds it).
 * @param signal - re-measure trigger: pass the overlay's render state so anchor
 *   moves (composer growth) re-fit; resize/scroll re-fit while mounted.
 * @param margin - viewport top margin floor in px; the frame's published top
 *   clearance widens it. Callers under fixed chrome (the conversation header)
 *   raise it past their chrome's height.
 * @returns the max-height to apply inline, in px.
 */
export declare function useAnchoredMaxHeight(ref: RefObject<HTMLElement>, cap: number, signal: unknown, margin?: number): number;
//# sourceMappingURL=useAnchoredMaxHeight.d.ts.map
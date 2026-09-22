/** Anchor-preserving tooltips with optional body portals for clipping containers. */
import type { FocusEventHandler, MouseEventHandler, ReactElement, Ref } from 'react';
/** Bubble placement relative to the anchor. */
export type TooltipSide = 'right' | 'bottom' | 'top';
/** Props Tooltip injects into its anchor child; the child's own handlers are chained ahead of the tooltip's. */
interface AnchorProps {
    ref?: Ref<HTMLElement> | undefined;
    onMouseEnter?: MouseEventHandler | undefined;
    onMouseLeave?: MouseEventHandler | undefined;
    onClick?: MouseEventHandler | undefined;
    onFocus?: FocusEventHandler | undefined;
    onBlur?: FocusEventHandler | undefined;
}
type TooltipLabel = string | (() => string);
/**
 * Attach a hover/focus tooltip to an anchor element.
 * @param props.label - bubble text, or a resolver evaluated only while the bubble is visible.
 * @param props.side - placement relative to the anchor (default 'right').
 * @param props.align - horizontal anchor-edge alignment for 'bottom'/'top' bubbles: 'end' pins
 * the bubble's right edge to the anchor's (for anchors beside other hover surfaces the centered
 * bubble would overlap); default 'center'. Ignored for side 'right'.
 * @param props.portal - render the bubble under document.body to escape containing blocks and clipping ancestors.
 * @param props.delayMs - hover delay in milliseconds; keyboard focus remains immediate.
 * @param props.disabled - suppress the bubble while true; the anchor renders identically so
 * toggling never remounts it (which would cut its CSS transitions).
 * @param props.maxWidth - bubble width cap in pixels, for labels long enough that the default
 * half-viewport cap would render a slab wider than the surface the anchor sits on.
 * @param props.children - a single anchor element; its own ref (callback or object) is forwarded alongside the tooltip's.
 * @returns the cloned anchor plus a fixed-position bubble, optionally portaled to the body; clicking the
 * anchor dismisses the bubble until the next trigger, and focus arriving after a pointer
 * interaction (a closing menu refocusing its trigger) never raises it.
 */
export declare function Tooltip({ label, side, align, delayMs, disabled, portal, maxWidth, children }: {
    label: TooltipLabel;
    side?: TooltipSide;
    align?: 'center' | 'end';
    delayMs?: number;
    disabled?: boolean;
    portal?: boolean;
    maxWidth?: number;
    children: ReactElement<AnchorProps>;
}): import("react").JSX.Element;
export {};
//# sourceMappingURL=Tooltip.d.ts.map
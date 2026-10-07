/** Anchor-preserving tooltips; an optional body portal escapes clipping containers and stacking contexts that cap the bubble's z-index. */
import type { FocusEventHandler, MouseEventHandler, ReactElement, Ref } from 'react';
/** Bubble placement relative to the anchor. */
export type TooltipSide = 'right' | 'bottom' | 'top';
/**
 * Suppression channel for enclosing tooltip and hover-card anchors: a visible
 * tooltip within an anchor withdraws the enclosing preview while its bubble is shown.
 */
export declare const TooltipSuppression: import("react").Context<((suppressed: boolean) => void) | null>;
/** Props Tooltip injects into its anchor child; the child's own handlers are chained ahead of the tooltip's. */
interface AnchorProps {
    'aria-describedby'?: string | undefined;
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
 * @param props.label - bubble text, or a resolver evaluated only while visible; an empty string shows only shortcut keys.
 * @param props.shortcutKeys - effective key labels rendered as platform-formatted keycaps after optional text.
 * @param props.side - placement relative to the anchor (default 'right').
 * @param props.align - horizontal anchor-edge alignment for 'bottom'/'top' bubbles: 'end' pins
 * the bubble's right edge to the anchor's (for anchors beside other hover surfaces the centered
 * bubble would overlap); default 'center'. Ignored for side 'right'.
 * @param props.portal - render the bubble under document.body, so an ancestor's clipping or its
 * stacking context (which confines the bubble's z-index to that context) cannot hide it.
 * @param props.delayMs - hover delay in milliseconds (default 0).
 * @param props.focusDelayMs - keyboard focus delay in milliseconds (default 0); blur, click,
 * mouse leave, disabling, and unmount cancel a pending show.
 * @param props.gap - anchor-to-bubble distance in pixels for 'bottom'/'top' bubbles (default 8);
 * ignored for side 'right'.
 * @param props.disabled - suppress the bubble while true; the anchor renders identically so
 * toggling never remounts it (which would cut its CSS transitions).
 * @param props.maxWidth - bubble width cap in pixels, for labels long enough that the default
 * half-viewport cap would render a slab wider than the surface the anchor sits on.
 * @param props.openOnClick - clicking also pins the bubble for reading; another click, Escape,
 * Tab, or an outside pointerdown dismisses it. Defaults to false for ordinary action tooltips.
 * @param props.children - a single anchor element; its own ref (callback or object) is forwarded alongside the tooltip's.
 * @returns the cloned anchor plus a fixed-position bubble, optionally portaled to the body.
 * The bubble stays hidden until ResizeObserver supplies its size for viewport fitting; clicking the
 * anchor dismisses the bubble unless openOnClick is enabled, and focus arriving after a pointer
 * interaction (a closing menu refocusing its trigger) never raises it.
 */
export declare function Tooltip({ label, shortcutKeys, side, align, delayMs, focusDelayMs, gap, disabled, portal, maxWidth, openOnClick, children }: {
    label: TooltipLabel;
    shortcutKeys?: readonly string[] | undefined;
    side?: TooltipSide;
    align?: 'center' | 'end';
    delayMs?: number;
    focusDelayMs?: number;
    gap?: number;
    disabled?: boolean;
    portal?: boolean;
    maxWidth?: number;
    openOnClick?: boolean;
    children: ReactElement<AnchorProps>;
}): import("react").JSX.Element;
export {};
//# sourceMappingURL=Tooltip.d.ts.map
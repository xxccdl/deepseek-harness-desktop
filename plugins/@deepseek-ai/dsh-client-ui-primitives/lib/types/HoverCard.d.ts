import type { ReactNode, RefObject } from 'react';
/**
 * Render an anchor with a hover-triggered preview card.
 * @param props.anchor - the hover target (rendered in place inside a wrapper span).
 * @param props.content - card content; the pointer may rest on it, so it is
 * readable and selectable, but it carries no dismissal affordance of its own.
 * @param props.openDelayMs - hover dwell before the card shows (default 500).
 * @param props.variant - compact card beside the anchor, or a preview above/below it
 * with 24px side insets, a 420px height cap, frame-top clearance, and 100ms opacity transitions.
 * @param props.widthAnchorRef - optional element whose width and horizontal position size the preview.
 * @param props.disabled - suppress opening; turning true dismisses an open card.
 * @param props.copyText - optional primary value copied by activation and
 * included in the card's accessible name.
 * @param props.copyLabel - localized accessible activation-label prefix.
 * @param props.copiedLabel - localized visible success label.
 * @returns anchor wrapper with the conditional portaled card.
 */
export declare function HoverCard({ anchor, content, openDelayMs, disabled, copyText, copyLabel, copiedLabel, variant, widthAnchorRef, }: {
    anchor: ReactNode;
    content: ReactNode;
    openDelayMs?: number;
    disabled?: boolean;
    variant?: 'compact' | 'preview';
    widthAnchorRef?: RefObject<HTMLElement | null>;
} & ({
    copyText?: string | undefined;
    copyLabel: string;
    copiedLabel: string;
} | {
    copyText?: undefined;
    copyLabel?: string;
    copiedLabel?: string;
})): import("react").JSX.Element;
//# sourceMappingURL=HoverCard.d.ts.map
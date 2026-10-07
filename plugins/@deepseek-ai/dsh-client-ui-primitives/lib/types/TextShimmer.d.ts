/** Text activity animation shared by a row and its nested text fragments. */
import { type ReactNode } from 'react';
/** Text and activity supplied by the owning row. */
export interface TextShimmerProps {
    /** Text or presentational children with text in nested TextShimmer instances. No effects or element ids. */
    children: ReactNode;
    /** Whether to animate; nested instances share the containing row's activity. */
    active?: boolean | undefined;
    className?: string | undefined;
    /** Layout class applied equally to the base and decorative content. */
    contentClassName?: string | undefined;
}
/**
 * Render text with one shared highlight while retaining selectable, accessible content.
 * Nested instances inherit the outer animation. Keep icons outside; mark decorative
 * separators with data-shimmer-decoration so their background follows the highlight.
 * Active children also render in an inert, clipped decoration; supply only presentation.
 * @param props - localized text, running state, and owner styling.
 * @returns retained text and its optional decorative highlight.
 */
export declare const TextShimmer: import("react").MemoExoticComponent<({ children, active, className, contentClassName }: TextShimmerProps) => import("react").JSX.Element>;
//# sourceMappingURL=TextShimmer.d.ts.map
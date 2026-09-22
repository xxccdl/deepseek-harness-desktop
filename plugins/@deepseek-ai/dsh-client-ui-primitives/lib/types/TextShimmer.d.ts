/** Text and activity supplied by the owning row. */
export interface TextShimmerProps {
    children: string;
    active: boolean;
    className?: string | undefined;
}
/**
 * Render text with an optional moving highlight; inactive text keeps the same node.
 * @param props - localized text, running state, and owner styling.
 * @returns the retained text span.
 */
export declare const TextShimmer: import("react").MemoExoticComponent<({ children, active, className }: TextShimmerProps) => import("react").JSX.Element>;
//# sourceMappingURL=TextShimmer.d.ts.map
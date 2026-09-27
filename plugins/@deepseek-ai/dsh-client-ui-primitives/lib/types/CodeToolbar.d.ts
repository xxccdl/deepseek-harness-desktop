/** Localized language fallback and wrapping actions supplied by the card owner. */
export interface CodeToolbarLabels {
    /** Title for an absent or unsupported language. */
    codeLabel: string;
    /** Action that enables wrapping. */
    wrapLabel: string;
    /** Action that preserves source columns with horizontal scrolling. */
    unwrapLabel: string;
}
/** Display state and callbacks for a code card's toolbar. */
interface CodeToolbarProps {
    lang?: string | undefined;
    title?: string | undefined;
    status?: string | undefined;
    labels: CodeToolbarLabels;
    copyLabel: string;
    copiedLabel: string;
    copied: boolean;
    wrapped: boolean;
    onCopy?: (() => void) | undefined;
    onWrap?: (() => void) | undefined;
}
/**
 * Render a language label and keyboard-accessible icon actions with tooltips.
 * @param props - Localized labels, current state, and card-owned actions.
 * @returns The shared code-card header.
 */
export declare function CodeToolbar({ lang, title, status, labels, copyLabel, copiedLabel, copied, wrapped, onCopy, onWrap }: CodeToolbarProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=CodeToolbar.d.ts.map
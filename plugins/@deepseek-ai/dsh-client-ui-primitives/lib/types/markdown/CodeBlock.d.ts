import type { Ref } from 'react';
import { type CodeToolbarLabels } from '../CodeToolbar.tsx';
export interface CodeBlockProps {
    /** The source text, rendered verbatim (trailing newline trimmed for display). */
    code: string;
    /** Grammar hint (markdown fence info string or a fixed caller id); unknown = plain. */
    lang?: string | undefined;
    /**
     * The code is still growing (a streaming markdown fence): highlight through
     * a per-instance {@link StreamingHighlightSession}, which re-tokenizes only
     * appended text and keeps completed line groups (and DOM) untouched. The
     * caller must keep the component instance stable across growth (a
     * stream-stable React key); an unchanged streamed fence also retains that
     * tree when it settles. Cold settled callers get shiki's HTML.
     */
    streaming?: boolean | undefined;
    /** Extra class merged onto the wrapper (callers position; this component draws). */
    className?: string | undefined;
    /** Ref for the stable source-content wrapper, for owners that use it as a scrollport. */
    contentRef?: Ref<HTMLDivElement> | undefined;
    /** Show a numbered gutter without adding numbers to copied source. Defaults to false. */
    lineNumbers?: boolean | undefined;
    /** Show the language and copy header; false when the caller supplies a toolbar. Defaults to true. */
    showHeader?: boolean | undefined;
    /** Copy-button idle label; the owner passes localized copy (this package is cordis-free, so copy arrives via props). */
    copyLabel: string;
    /** Copy-button label during the post-copy confirmation window. */
    copiedLabel: string;
    /** Enable the shared card toolbar and spacing; omit for custom toolbar layouts. */
    toolbarLabels?: CodeToolbarLabels | undefined;
    /** With toolbarLabels, use the owner's wrapping preference and omit the toolbar's local wrap action. */
    wrap?: boolean | undefined;
}
export declare function CodeBlock({ code, lang, streaming, className, contentRef, lineNumbers, showHeader, copyLabel, copiedLabel, toolbarLabels, wrap, }: CodeBlockProps): import("react").JSX.Element;
//# sourceMappingURL=CodeBlock.d.ts.map
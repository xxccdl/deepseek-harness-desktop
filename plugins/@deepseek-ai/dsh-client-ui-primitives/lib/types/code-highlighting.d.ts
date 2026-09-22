import { type HighlightSpan } from './markdown/highlight.ts';
/** Recognized filename suffixes whose source can use the shared syntax highlighter. */
export declare const CODE_HIGHLIGHT_EXTENSIONS: readonly string[];
/**
 * Select the shared syntax highlighter's grammar from a filename.
 * @param path - decoded source filename or path.
 * @returns a supported grammar hint, or `undefined` for other suffixes.
 */
export declare function languageForPath(path: string): string | undefined;
/** Highlight one source fragment into one token list per line. */
export type CodeHighlighter = (code: string) => HighlightSpan[][] | undefined;
/**
 * Bind the shared lazy highlighter to one language and refresh after its grammar loads.
 * @param language - grammar hint selected from the source filename.
 * @returns a stable fragment highlighter; unknown and loading grammars return `undefined` for plain-text fallback.
 */
export declare function useCodeHighlighter(language: string | undefined): CodeHighlighter;
export type { HighlightSpan };
//# sourceMappingURL=code-highlighting.d.ts.map
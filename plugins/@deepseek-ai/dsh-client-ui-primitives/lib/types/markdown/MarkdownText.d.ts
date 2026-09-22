/**
 * Untrusted assistant-Markdown renderer over the direct mdast pipeline:
 * `parse.ts` grammars, the incremental streaming parser, and `render.tsx`.
 * While a message streams, all but the trailing two blocks freeze as cached
 * React elements and only the source tail behind them re-parses per chunk,
 * so per-chunk work tracks the tail size instead of the whole reply. Frozen
 * blocks keep their source-offset keys when they cross the freeze boundary,
 * so React reconciles instead of remounting. Known deviation while
 * streaming: a reference-style link or footnote whose definition sits on the
 * other side of the freeze boundary renders literally until the settled
 * full parse self-heals it.
 */
import type { MarkdownFileMentions, MarkdownLabels, MarkdownPathImages } from './render.tsx';
import 'katex/dist/katex.min.css';
export type { MarkdownCodeLabels, MarkdownFileMentions, MarkdownLabels, MarkdownPathImages } from './render.tsx';
/**
 * Render untrusted assistant-authored Markdown as semantic React elements.
 * @param props - Markdown source text preserved by the session projection;
 * `streaming` parses incrementally across chunks and highlights fences as
 * they grow (each fence re-tokenizes only appended text; TeX stays literal
 * until the finalize swap so incomplete formulae never flash errors);
 * `labels` forwards localized fence and footnote chrome — pass a
 * reference-stable object (memoized per locale revision), because a new
 * identity discards the streaming render cache mid-message. `fileMentions`
 * links inline-code tokens its resolver recognizes as real files, and
 * `pathImages` rewrites image destinations that are local file paths into
 * displayable URLs its resolver vouches for. Those two vocabularies are the
 * single streaming gate — they apply to settled renders only, because a
 * streaming message's vocabulary is not final and frozen cached elements
 * must not bake in handlers that could go stale. A surrounding
 * `MarkdownDelegateProvider` can delegate ordinary HTTP(S) activation while
 * modified clicks retain native behavior. `variant="compact"` uses secondary
 * text sizing, uniform bold headings, and tight block spacing; the default
 * `body` variant uses the full document typography.
 * The provider's `openFile` enables local Markdown links in settled messages,
 * including `#L24` and `#L24-L30` destinations (ranges open at their first line).
 * @returns A GFM document with TeX math rendered through KaTeX; raw HTML and
 * unsafe protocols are disabled. Local links without an opener remain text;
 * absolute HTTP(S) images render directly.
 */
export declare const MarkdownText: import("react").MemoExoticComponent<({ text, streaming, labels, fileMentions, pathImages, variant, }: {
    text: string;
    streaming?: boolean;
    labels: MarkdownLabels;
    fileMentions?: MarkdownFileMentions | undefined;
    pathImages?: MarkdownPathImages | undefined;
    variant?: "body" | "compact";
}) => import("react").JSX.Element>;
//# sourceMappingURL=MarkdownText.d.ts.map
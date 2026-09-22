import type { ReactNode } from 'react';
/**
 * Handle one sanitized absolute HTTP(S) URL selected from Markdown.
 * @param href - destination URL.
 */
export type MarkdownExternalLinkHandler = (href: string) => void;
/** Navigation capabilities supplied by the nearest Markdown owner. */
export interface MarkdownDelegate {
    /** Ordinary HTTP(S) activation; absent handlers retain native anchor behavior. */
    readonly openExternalLink?: MarkdownExternalLinkHandler | undefined;
    /**
     * Open a decoded local destination from settled Markdown; absent handlers leave plain text.
     * @param path - Absolute or workspace-relative file path.
     * @param options - First line to reveal when the destination specifies a line or range.
     */
    readonly openFile?: ((path: string, options?: {
        line?: number;
    }) => void) | undefined;
}
/** Props for one Markdown navigation scope. */
export interface MarkdownDelegateProviderProps extends MarkdownDelegate {
    readonly children: ReactNode;
}
/**
 * Scope Markdown navigation without threading callbacks through renderers.
 * Nested providers replace the enclosing capabilities. Handler changes reach cached links.
 * @param props - Child tree and its file and HTTP(S) link handlers.
 * @returns the scoped child tree.
 */
export declare function MarkdownDelegateProvider({ children, openExternalLink, openFile, }: MarkdownDelegateProviderProps): ReactNode;
/**
 * Read the nearest Markdown navigation capabilities.
 * @returns Owner callbacks, or an empty delegate outside a provider.
 */
export declare function useMarkdownDelegate(): MarkdownDelegate;
//# sourceMappingURL=MarkdownDelegate.d.ts.map
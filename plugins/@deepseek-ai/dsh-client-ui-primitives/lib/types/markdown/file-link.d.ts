/** Local Markdown destinations accepted by the file-preview callback. */
/**
 * Decode a file destination and its optional GitHub-style line fragment.
 * Literal `?` and `#` in filenames must be percent-encoded.
 * @param value - Parsed Markdown link destination.
 * @returns A local path and optional first line, or undefined for URLs,
 * fragment-only links, queries, malformed escapes, or invalid line ranges.
 */
export declare function parseFileLink(value: string): {
    path: string;
    line?: number;
} | undefined;
//# sourceMappingURL=file-link.d.ts.map
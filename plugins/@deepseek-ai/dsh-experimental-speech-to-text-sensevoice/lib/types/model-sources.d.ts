/**
 * Prefer the first successful HEAD response while retaining other sources for download fallback.
 * All probes settle before returning; if every probe fails, the configured order is preserved.
 * @param assetUrl - revision-pinned upstream file URL.
 * @param origins - nonempty configured origins, or one explicit deployment origin.
 * @param timeoutMs - maximum probe duration, including redirects.
 * @param signal - preparation cancellation or deadline.
 * @returns deduplicated download URLs with the first responding source first; a single source needs no probe.
 */
export declare function orderModelSources(assetUrl: string, origins: readonly string[], timeoutMs: number, signal: AbortSignal): Promise<string[]>;
//# sourceMappingURL=model-sources.d.ts.map
/**
 * Shared ranking for `/` menu candidates: the query must be a
 * case-insensitive ordered subsequence of the candidate name or, when the
 * candidate carries one, of its display label (a localized title). Prefix
 * hits rank first, then the strongest alignment score over either key, then
 * the source order of the input. Decision record:
 * .agents/notes/archived/feature/2026-08-04-web-slash-command-fuzzy-discovery.md
 */
/**
 * Rank named items by a menu query.
 * @param items - candidates in source order (a host catalog, then client
 * contributions); an item's optional `label` is a second search key beside
 * its name.
 * @param rawQuery - the text typed after the trigger, matched case-insensitively.
 * @returns the matching items: prefix hits first, then by alignment score,
 * then in source order. The input list itself for an empty query.
 */
export declare function rankByName<T extends {
    readonly name: string;
    readonly label?: string;
}>(items: readonly T[], rawQuery: string): readonly T[];
//# sourceMappingURL=rank-by-name.d.ts.map
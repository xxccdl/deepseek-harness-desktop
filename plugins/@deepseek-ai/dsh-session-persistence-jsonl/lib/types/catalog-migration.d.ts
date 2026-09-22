/** Collect historical discovery facts without recursively preparing related current generations. */
import type { SessionFormatJsonObject } from '@deepseek-ai/dsh-session-format';
import type { SessionHeader, SessionId } from '@deepseek-ai/dsh-session';
import type { JsonlCompression } from './format.ts';
/** Per-parent supplemental facts and the source checks required before serving or publishing them. */
interface PreparedCatalogFacts {
    readonly facts: readonly SessionFormatJsonObject[];
    readonly failures: readonly {
        readonly path: string;
        readonly error: unknown;
    }[];
    /** @returns resolves while every inspected child still has the captured physical revision. */
    validate(): Promise<void>;
}
/**
 * Collect each related child's own descriptor through existing historical codecs.
 * @param parentId - parent whose incoming migration consumes these facts.
 * @param sources - header-indexed direct children in the selected source corpus.
 * @param compression - configured source encoding.
 * @param signal - cancellation forwarded through each source read.
 * @returns compact facts and child-local failures; complete child event arrays are released after extraction.
 */
export declare function prepareCatalogFacts(parentId: SessionId, sources: readonly {
    readonly header: SessionHeader;
    readonly path: string;
}[], compression: JsonlCompression, signal: AbortSignal): Promise<PreparedCatalogFacts>;
export {};
//# sourceMappingURL=catalog-migration.d.ts.map
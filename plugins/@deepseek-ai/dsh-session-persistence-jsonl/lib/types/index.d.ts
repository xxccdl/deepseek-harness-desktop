/**
 * JSONL durable session-persistence backend. It stores a header and contiguous
 * events in immutable generation files under one directory per session and serves the handle-based
 * `SessionPersistence` API: `create`/`open` return per-session handles, and
 * every read validates the same fail-closed storage contract.
 * @module @deepseek-ai/dsh-session-persistence-jsonl
 */
import { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { type JsonlCompression } from './format.ts';
export type { JsonlCompression } from './format.ts';
/** Loader schema for the JSONL artifact's physical encoding. */
export declare const JsonlCompressionSchema: z<JsonlCompression>;
/** Plugin config for the JSONL backend's root, physical encoding, and listing concurrency. */
export interface Config {
    /**
     * Root directory for all session files. Required (no default): a default of
     * `process.cwd()` would scatter session files as the process's cwd changes
     * (bash calls, subprocesses). Sessions group under human-readable project
     * directories, then per-session directories. An existing root must be a
     * readable directory; an absent root is created on first materialization.
     */
    root: string;
    /** Physical encoding; defaults to checksummed Zstandard frames. */
    compression?: JsonlCompression;
    /**
     * Maximum directory, header, and stat reads in flight across all concurrent
     * listings of this backend (`list()`, the root encoding check, and historical
     * fingerprints). Defaults to 3.
     */
    listConcurrency?: number;
}
/** JSONL persistence plugin label. */
export declare const name = "session-persistence-jsonl";
/** Loader schema for the backend's root, physical encoding, and listing concurrency. */
export declare const Config: z<Config>;
/**
 * Mount persistence with live routing and handles retained through the
 * consumer unloads triggered by removing this provider. Consumers must own
 * cleanup in their injecting scope; concurrent root disposal is not ordered.
 * @param ctx - the owning plugin context.
 * @param config - the storage root, physical encoding, and listing concurrency.
 * @returns resolves when the service is ready.
 */
export declare function apply(ctx: Context, config: Config): Promise<void>;
//# sourceMappingURL=index.d.ts.map
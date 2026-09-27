import type { CollectedOutput } from '@deepseek-ai/dsh-subprocess';
/**
 * Receives one spill failure so the owner can log it through its own logger.
 * Called at most once per collector, after the spill has been discarded and
 * the in-memory tail has kept collecting. A reporter that throws is contained
 * and its failure written to stderr.
 * @param error - the `node:fs` failure from opening or appending the spill file.
 * @param label - the stream label of the collector that failed.
 */
export type SpillFailureReporter = (error: unknown, label: string) => void;
/** Spill storage for one collected stream; `undefined` means tail-only collection. */
export interface SpillOptions {
    /** Whole-stream byte cap beyond which an incomplete spill is discarded. */
    maxBytes: number;
    /** Private directory receiving the spill file. */
    dir: string;
    /** Owner-side report of a spill open or write failure. */
    onFailure: SpillFailureReporter;
}
/**
 * Build the reporter an owner passes as {@link SpillOptions.onFailure}: one
 * error-level log line naming the owner and stream, with the failure appended
 * so its `code`, `syscall`, and `path` reach the log.
 * @param logger - the owner's plugin logger.
 * @param owner - the component named in the line.
 * @returns the reporter.
 */
export declare function logSpillFailure(logger: {
    error(message: string, ...detail: unknown[]): void;
}, owner: string): SpillFailureReporter;
/** Inputs a managed native process needs before its output streams are bound. */
export interface ManagedProcessBinding {
    /** Directory receiving spill files. */
    spillDir: string;
    /** Receives a spill open or write failure. */
    onSpillFailure: SpillFailureReporter;
}
/**
 * Prepare fallible output storage before starting a managed native process.
 * This is the explicit resolve step for spill inputs: the spill directory
 * defaults to the private per-process directory, and the failure reporter
 * defaults to a stderr line when the caller has no logger.
 * @param internals - optional caller-owned spill directory and failure reporter.
 * @returns binding inputs whose spill directory is ready for use.
 */
export declare function prepareManagedProcessBinding(internals?: {
    spillDir?: string;
    onSpillFailure?: SpillFailureReporter;
}): ManagedProcessBinding;
/**
 * Collects one stream with a bounded in-memory tail. With spill options, on
 * first overflow a spill file is created and every chunk (including those
 * already collected) is appended there while the full stream remains within
 * the cap; without them, only the in-memory tail is ever retained (the
 * diagnostic-tail shape — a language server's stderr).
 *
 * Spilling is best-effort: a spill open or write failure discards the spill,
 * reports once through {@link SpillOptions.onFailure}, and never interrupts
 * in-memory collection, because `push()` runs inside the stream's `'data'`
 * listener where a thrown error would become an uncaught exception.
 *
 * Tail-keep rationale (pi/OpenCode): errors and final results cluster at the
 * end of command output; the spill file covers the head.
 */
export declare class OutputCollector {
    private readonly maxBytes;
    private readonly label;
    private readonly spill;
    private chunks;
    private bytes;
    private dropped;
    private spillFd;
    private spillFile;
    private spillDisabled;
    /** Total bytes ever pushed (not just retained). */
    private total;
    /**
     * @param maxBytes - in-memory tail cap in bytes.
     * @param label - stream label used in spill file names and failure reports.
     * @param spill - spill storage; omit for tail-only collection.
     */
    constructor(maxBytes: number, label: string, spill: SpillOptions | undefined);
    /**
     * Ingest one stream chunk, counting it toward the whole-stream total. On
     * first overflow of the in-memory cap a spill file is opened (when spilling
     * is enabled) and every chunk (already-collected ones included) is appended
     * there from then on; the in-memory tail then drops whole chunks from its
     * head (or the head of a single over-cap chunk) until it fits the cap again.
     * @param chunk - the raw bytes from one stream 'data' event.
     */
    push(chunk: Buffer): void;
    /**
     * Open the spill file lazily and append `chunk` (and any prior chunks once).
     * Runs inside the stream's `'data'` listener, so every filesystem failure is
     * contained here: the spill is discarded, reported once, and collection
     * continues with the in-memory tail alone.
     */
    private spillAll;
    /** Stop spilling and remove the file once it can no longer hold the complete stream. */
    private discardSpill;
    /**
     * Incremental read in whole-stream byte coordinates: returns everything
     * pushed since `fromByte`. When `fromByte` has already slid out of the
     * in-memory tail window, the read is `lossy` — it returns the whole
     * retained tail and the gap is only recoverable from the spill file.
     * @param fromByte - whole-stream offset to resume from (a prior read's `nextOffset`; 0 for the first read).
     * @returns the delta text, the offset for the next read, the `lossy` flag, and the spill path when one was created.
     */
    readFrom(fromByte: number): {
        text: string;
        nextOffset: number;
        lossy: boolean;
        spillPath?: string;
    };
    /**
     * Copy the retained raw tail with its position in the complete observed stream.
     * @returns independent tail bytes and the total byte count before truncation.
     */
    snapshot(): {
        bytes: Buffer;
        totalBytes: number;
    };
    /**
     * Close the spill file once the stream has ended. A failed close (delayed
     * writeback fault) stops advertising the spill path — the file may be
     * missing its tail — while every in-memory read keeps working. Idempotent;
     * the spawn path seals both collectors at settlement so reads after exit
     * never point at a still-open file.
     */
    seal(): void;
    /**
     * Seal the spill file and return the final output.
     * @returns the final collected output: tail text, truncation flag, and the spill path when intact.
     */
    finalize(): CollectedOutput;
}
//# sourceMappingURL=output.d.ts.map
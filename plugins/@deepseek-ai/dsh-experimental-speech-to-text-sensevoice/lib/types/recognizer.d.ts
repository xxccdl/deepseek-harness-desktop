import type { Context } from '@deepseek-ai/cordis';
import type { SubprocessHandle } from '@deepseek-ai/dsh-subprocess';
import type { SpeechPreparationOptions, SpeechInput, SpeechPreparationState, Transcript } from '@deepseek-ai/dsh-experimental-speech-to-text/types';
import type { Config } from './config.ts';
/**
 * Read one bounded worker readiness frame and reject exit before readiness.
 * @param handle - newly spawned worker with piped stdout.
 * @param limit - maximum readiness bytes.
 * @param signal - startup deadline or caller cancellation.
 * @returns dynamically allocated loopback port.
 */
export declare function readReady(handle: SubprocessHandle, limit: number, signal: AbortSignal): Promise<number>;
/**
 * Decode a bounded worker HTTP response; malformed worker output fails the request.
 * @param response - private authenticated worker response.
 * @param limit - maximum bytes retained before JSON parsing.
 * @returns validated final transcript; marked input rejections throw SpeechInputError.
 */
export declare function readTranscript(response: Response, limit: number): Promise<Transcript>;
/** Own one worker across recordings, and join every accepted job on disposal. */
export declare class SenseVoiceWorker {
    private readonly ctx;
    private readonly config;
    private worker;
    private tail;
    private pending;
    private readonly lifetime;
    private idle;
    private runtime;
    private state;
    private readonly listeners;
    private lastProgressAt;
    /** Configured origins available for explicit downloads; offline deployments expose no choices. */
    readonly downloadSources: readonly string[];
    private preparing;
    constructor(ctx: Context, config: Config);
    /**
     * Read preparation readiness.
     * @returns the current Host-owned state.
     */
    snapshot(): SpeechPreparationState;
    /**
     * Observe readiness.
     * @param listener - invalidation callback.
     * @returns subscription disposer.
     */
    subscribe(listener: () => void): () => void;
    private publish;
    /** Inspect disk caches on activation; valid resources enter standby without starting a worker. */
    inspect(): void;
    /**
     * Start or join one Host-owned preparation task with a fixed download source.
     * @param options - omitted source uses deployment policy; a manual source must be advertised and disables fallback.
     */
    prepare(options?: SpeechPreparationOptions): void;
    private runPreparation;
    /** Cancel unfinished preparation; completed readiness is retained. @returns after its queued or active work settles. */
    cancel(): Promise<void>;
    /**
     * Queue one bounded recording; cancellation never leaves inference running after settlement.
     * Verified resources accept recordings while the worker wakes; other preparation states reject without downloading.
     * @param input - complete WAV and language hint.
     * @param signal - caller cancellation.
     * @returns recognized text; cancelled waiting jobs never acquire the worker.
     */
    transcribe(input: SpeechInput, signal: AbortSignal): Promise<Transcript>;
    private enqueue;
    private start;
    private execute;
    private stop;
    /** Stop the local recognizer. @returns after admission closes, queued jobs settle, and the managed worker exits. */
    dispose(): Promise<void>;
}
//# sourceMappingURL=recognizer.d.ts.map
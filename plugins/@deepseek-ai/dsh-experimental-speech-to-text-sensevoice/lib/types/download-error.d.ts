/** Download failures retain their cause locally and expose only safe, structured diagnostics to clients. */
import type { SpeechDownloadFailure } from '@deepseek-ai/dsh-experimental-speech-to-text/types';
type FailureKind = Pick<SpeechDownloadFailure, 'reason' | 'code'>;
/**
 * Inspect native fetch causes, including aggregate connection attempts, without publishing their messages.
 * @param failure - error received from the network or filesystem.
 * @returns an actionable category and recognized diagnostic code, or a generic failure.
 */
export declare function classifyDownloadFailure(failure: unknown): FailureKind;
/** A preparation error whose public details exclude raw causes, credentials, signed URLs and local paths. */
export declare class SpeechDownloadError extends Error {
    readonly download: SpeechDownloadFailure;
    constructor(download: SpeechDownloadFailure, options?: ErrorOptions);
}
export {};
//# sourceMappingURL=download-error.d.ts.map
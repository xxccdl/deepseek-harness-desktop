import type { Context } from '@deepseek-ai/cordis';
import type { Config } from './config.ts';
import type { SpeechPreparationState } from '@deepseek-ai/dsh-experimental-speech-to-text/types';
/** Release-pinned downloadable file. */
export interface Asset {
    readonly name: string;
    readonly url: string;
    readonly sha256: string;
    readonly bytes: number;
}
/** Prepared model and process paths, private to the local provider. */
export interface RuntimePaths {
    readonly model: string;
    readonly tokens: string;
    readonly vad: string;
    readonly worker: string;
}
/**
 * Inspect existing models without downloading, writing files or starting the worker.
 * @param config - model paths and selected precision.
 * @param signal - provider cancellation or inspection deadline.
 * @returns cached paths when all files exist and managed assets match their pinned size and hash; otherwise undefined.
 */
export declare function inspectRuntime(config: Config, signal: AbortSignal): Promise<RuntimePaths | undefined>;
/**
 * Download into a unique partial file, verify, then publish it atomically.
 * @param asset - pinned release identity.
 * @param root - provider-owned cache directory.
 * @param signal - preparation cancellation.
 * @param report - Host-owned progress publisher.
 * @returns verified local file path; failures carry localized-UI diagnostics through SpeechDownloadError.
 */
export declare function downloadAsset(asset: Asset, root: string, signal: AbortSignal, report?: (state: SpeechPreparationState) => void): Promise<string>;
/**
 * Resolve the bundled native runtime and prepare verified ONNX models on demand.
 * @param _ctx - Host context owning the preparation task.
 * @param config - model paths, precision, and download source policy.
 * @param signal - preparation cancellation or deadline.
 * @param report - Host-owned progress publisher.
 * @returns verified model and worker paths.
 */
export declare function prepareRuntime(_ctx: Context, config: Config, signal: AbortSignal, report?: (state: SpeechPreparationState) => void): Promise<RuntimePaths>;
//# sourceMappingURL=runtime.d.ts.map
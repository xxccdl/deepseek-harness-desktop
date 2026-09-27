import type { Transcript } from '@deepseek-ai/dsh-experimental-speech-to-text/types';
import type { Config } from './config.ts';
/** Verified files and validated inference settings sent by the Host. */
export interface InferenceConfig extends Config {
    readonly model: string;
    readonly tokens: string;
    readonly vad: string;
}
/**
 * Load one native model pair; every recording resets VAD and updates its language hint.
 * @param config - verified ONNX paths and explicit CPU/VAD limits.
 * @returns synchronous inference confined to its dedicated process.
 */
export declare function createTranscriber(config: InferenceConfig): (audio: Uint8Array, language: string) => Transcript;
//# sourceMappingURL=inference.d.ts.map
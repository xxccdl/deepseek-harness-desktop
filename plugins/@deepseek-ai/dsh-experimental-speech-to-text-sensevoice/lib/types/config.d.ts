/** Deployment configuration for the managed local SenseVoice recognizer. */
import z from '@deepseek-ai/schemastery';
/** Local runtime, inference, and retention settings. */
export interface Config {
    /** Unique registration id; consumers select this exact id. */
    providerId: string;
    /** Absolute directory for verified ONNX models. */
    dataRoot: string;
    /** Existing directory containing the selected ONNX model and tokens.txt; omission downloads verified files. */
    modelDirectory?: string | undefined;
    /** Existing Silero VAD ONNX file; omission downloads the verified model. */
    vadModelPath?: string | undefined;
    /** Weight precision; INT8 minimizes first-use download and model storage. */
    precision: 'int8' | 'fp32';
    /** Explicit Hugging Face-compatible origin; bypasses automatic selection and public fallback. */
    modelOrigin?: string | undefined;
    /** Hugging Face-compatible origins compared before downloading each missing asset. */
    modelOrigins: string[];
    /** Deadline for concurrent HEAD probes, including redirects to the actual asset. */
    modelProbeTimeoutMs: number;
    /** CPU intra-operation thread count. */
    threads: number;
    /** Maximum speech segment length passed to the recognizer. */
    segmentSeconds: number;
    /** Silero speech probability threshold. */
    vadThreshold: number;
    /** Minimum speech duration retained by VAD. */
    minSpeechSeconds: number;
    /** Silence separating two speech segments. */
    minSilenceSeconds: number;
    /** Maximum decoded WAV bytes accepted by the private worker. */
    maxAudioBytes: number;
    /** Deadline for runtime preparation and cold model loading. */
    prepareTimeoutMs: number;
    /** Deadline for one inference after the worker is ready. */
    inferenceTimeoutMs: number;
    /** Idle period before stopping the worker; zero keeps it warm. */
    idleTimeoutMs: number;
    /** Maximum accepted running and waiting transcriptions. */
    maxPending: number;
    /** Managed process termination grace period. */
    graceMs: number;
    /** Maximum retained worker diagnostic bytes. */
    maxLogBytes: number;
    /** Maximum transcript response bytes. */
    maxResponseBytes: number;
    /** Minimum interval between intermediate download progress notifications. */
    progressIntervalMs: number;
}
/** Validate deployment-varying runtime choices at plugin activation. */
export declare const Config: z<Partial<Config>, Config>;
//# sourceMappingURL=config.d.ts.map
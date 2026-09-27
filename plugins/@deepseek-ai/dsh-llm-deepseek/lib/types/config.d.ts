/** Plugin configuration and complete request-local resolution for DeepSeek. */
import type { Volatile } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import type { RetryPolicyConfig } from '@deepseek-ai/dsh-llm';
import type { LaunchEnvironmentSnapshot } from '@deepseek-ai/dsh-launch-environment';
import type { DeepSeekCatalogModel, DeepSeekConnectionOptions } from './types.ts';
/** Shared Messages request configuration, without provider credential selection. */
export interface Config {
    /** Endpoint base; falls back to $DEEPSEEK_BASE_URL from a trusted environment layer, then the public API. */
    baseURL: Volatile<string | undefined>;
    /** Deployment thinking policy; `disabled` limits every conversation request to `off`. */
    thinking: Volatile<'enabled' | 'disabled' | undefined>;
    /** Default thinking effort (default `high`); `off` disables thinking per request. */
    reasoningEffort: Volatile<'off' | 'low' | 'high' | 'max' | undefined>;
    /** Default per-request output cap (default 256,000); a model's own cap and explicit request values win. */
    maxTokens: Volatile<number>;
    /** Positive context capacity used when the selected model has no exact value (default 1,000,000). */
    defaultContextWindow: Volatile<number>;
    /** Advisory models shown by discovery consumers; defaults to V41 Flash and V4 Pro. */
    models: Volatile<DeepSeekCatalogModel[]>;
    /** Maximum provider idle time while one stream read is outstanding (default five minutes). */
    streamIdleTimeoutMs: Volatile<number>;
    /** Maximum accumulated file-referenced image bytes per chat request (default 128 MiB). */
    maxRequestFilesBytes: Volatile<number>;
    /** Maximum accumulated base64 image payload after Files API fallback (default 20 MiB). */
    maxInlineRequestImageBytes: Volatile<number>;
    /** Maximum number of represented images per chat request (default 600). */
    maxImagesPerRequest: Volatile<number>;
    /** Raw-byte removal step after the request exceeds its file bound (default 64 MiB). */
    imageOffloadByteQuantum: Volatile<number>;
    /** Base64-byte removal step after inline fallback exceeds its bound (default 10 MiB). */
    inlineImageOffloadByteQuantum: Volatile<number>;
    /** Image-count removal step after the request exceeds its count bound (default 20). */
    imageOffloadCountQuantum: Volatile<number>;
    /** Maximum duration of one request-image Files API resolution (default one minute). */
    filesApiTimeoutMs: Volatile<number>;
    /** Explicit lifetime assigned to each uploaded image (default seven days). */
    fileExpiresAfterSeconds: Volatile<number>;
    /** Remaining lifetime below which an indexed file is replaced (default one hour). */
    fileRefreshMarginSeconds: Volatile<number>;
    /** Oldest harness-owned files deleted before one quota-recovery upload retry (default 100). */
    fileQuotaCleanupBatch: Volatile<number>;
    /** Provider-owned model-request retry policy; omission uses normal mode with five retries. */
    retryPolicy: Volatile<RetryPolicyConfig | undefined>;
}
/** Plain options accepted by the provider resolver. */
export type Options = {
    [K in keyof Config]?: Config[K] extends Volatile<infer T> ? Exclude<T, undefined> : never;
};
/** Read the current value behind every reference of a validated Config.
 * @param config Parsed plugin Config.
 * @returns Plain options for the resolver.
 */
export declare function plainOptions(config: Config): Options;
/** Shared schema fields for Messages protocol options. */
export declare const deepSeekConfigFields: {
    baseURL: z<string, string, "volatile">;
    thinking: z<"enabled" | "disabled", "enabled" | "disabled", "volatile">;
    reasoningEffort: z<"low" | "off" | "high" | "max", "low" | "off" | "high" | "max", "volatile">;
    maxTokens: z<number, number, "volatile-defined">;
    defaultContextWindow: z<number, number, "volatile-defined">;
    models: z<NoInfer<DeepSeekCatalogModel[]>, NoInfer<DeepSeekCatalogModel[]>, "volatile-defined">;
    streamIdleTimeoutMs: z<number, number, "volatile-defined">;
    maxRequestFilesBytes: z<number, number, "volatile-defined">;
    maxInlineRequestImageBytes: z<number, number, "volatile-defined">;
    maxImagesPerRequest: z<number, number, "volatile-defined">;
    imageOffloadByteQuantum: z<number, number, "volatile-defined">;
    inlineImageOffloadByteQuantum: z<number, number, "volatile-defined">;
    imageOffloadCountQuantum: z<number, number, "volatile-defined">;
    filesApiTimeoutMs: z<number, number, "volatile-defined">;
    fileExpiresAfterSeconds: z<number, number, "volatile-defined">;
    fileRefreshMarginSeconds: z<number, number, "volatile-defined">;
    fileQuotaCleanupBatch: z<number, number, "volatile-defined">;
    retryPolicy: z<NoInfer<RetryPolicyConfig>, NoInfer<RetryPolicyConfig>, "volatile">;
};
export declare const Config: z<Schemastery.ObjectS<NoInfer<{
    baseURL: z<string, string, "volatile">;
    thinking: z<"enabled" | "disabled", "enabled" | "disabled", "volatile">;
    reasoningEffort: z<"low" | "off" | "high" | "max", "low" | "off" | "high" | "max", "volatile">;
    maxTokens: z<number, number, "volatile-defined">;
    defaultContextWindow: z<number, number, "volatile-defined">;
    models: z<NoInfer<DeepSeekCatalogModel[]>, NoInfer<DeepSeekCatalogModel[]>, "volatile-defined">;
    streamIdleTimeoutMs: z<number, number, "volatile-defined">;
    maxRequestFilesBytes: z<number, number, "volatile-defined">;
    maxInlineRequestImageBytes: z<number, number, "volatile-defined">;
    maxImagesPerRequest: z<number, number, "volatile-defined">;
    imageOffloadByteQuantum: z<number, number, "volatile-defined">;
    inlineImageOffloadByteQuantum: z<number, number, "volatile-defined">;
    imageOffloadCountQuantum: z<number, number, "volatile-defined">;
    filesApiTimeoutMs: z<number, number, "volatile-defined">;
    fileExpiresAfterSeconds: z<number, number, "volatile-defined">;
    fileRefreshMarginSeconds: z<number, number, "volatile-defined">;
    fileQuotaCleanupBatch: z<number, number, "volatile-defined">;
    retryPolicy: z<NoInfer<RetryPolicyConfig>, NoInfer<RetryPolicyConfig>, "volatile">;
}>>, Schemastery.ObjectT<NoInfer<{
    baseURL: z<string, string, "volatile">;
    thinking: z<"enabled" | "disabled", "enabled" | "disabled", "volatile">;
    reasoningEffort: z<"low" | "off" | "high" | "max", "low" | "off" | "high" | "max", "volatile">;
    maxTokens: z<number, number, "volatile-defined">;
    defaultContextWindow: z<number, number, "volatile-defined">;
    models: z<NoInfer<DeepSeekCatalogModel[]>, NoInfer<DeepSeekCatalogModel[]>, "volatile-defined">;
    streamIdleTimeoutMs: z<number, number, "volatile-defined">;
    maxRequestFilesBytes: z<number, number, "volatile-defined">;
    maxInlineRequestImageBytes: z<number, number, "volatile-defined">;
    maxImagesPerRequest: z<number, number, "volatile-defined">;
    imageOffloadByteQuantum: z<number, number, "volatile-defined">;
    inlineImageOffloadByteQuantum: z<number, number, "volatile-defined">;
    imageOffloadCountQuantum: z<number, number, "volatile-defined">;
    filesApiTimeoutMs: z<number, number, "volatile-defined">;
    fileExpiresAfterSeconds: z<number, number, "volatile-defined">;
    fileRefreshMarginSeconds: z<number, number, "volatile-defined">;
    fileQuotaCleanupBatch: z<number, number, "volatile-defined">;
    retryPolicy: z<NoInfer<RetryPolicyConfig>, NoInfer<RetryPolicyConfig>, "volatile">;
}>>, "plain">;
/** Public API default; the internal endpoint comes from $DEEPSEEK_BASE_URL. */
export declare const PUBLIC_BASE_URL = "https://api.deepseek.com/anthropic";
/** Complete protocol settings captured for one request operation. */
export type ResolvedDeepSeekOptions = DeepSeekConnectionOptions;
/**
 * The one explicit resolve step from raw config to validated protocol
 * settings. Programmatic construction may bypass Schemastery normalization, so
 * every default and bound is re-judged here — for the composition entry at
 * load (fail loud) and for each settings snapshot at its first use.
 * @param config - raw plugin config or resolved settings snapshot.
 * @param environment - this run's environment layers, or `undefined` outside
 * the product CLI. Every layer may supply an endpoint: the product trusts the
 * project it is launched in, so a checkout can point its own agent at the
 * gateway that checkout is meant to use.
 * @returns validated protocol settings.
 */
export declare function resolveAdapterOptions(config: Options, environment?: LaunchEnvironmentSnapshot): ResolvedDeepSeekOptions;
//# sourceMappingURL=config.d.ts.map
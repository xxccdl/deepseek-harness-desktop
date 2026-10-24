/** Configuration of a route that follows a `/models` listing: cache timing and its validation. */
import type { Volatile } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
/** Default deadline of one model-listing request and of a first-use wait. */
export declare const DEFAULT_MODELS_TIMEOUT_MS = 5000;
/** Default listing age after which the next access refreshes it in the background. */
export declare const DEFAULT_MODELS_MAX_AGE_MS = 600000;
/** Listing fields of a route Config. */
export interface ModelListingConfig {
    /** Deadline of one listing request, which also bounds a first-use wait (default five seconds). */
    modelsTimeoutMs: Volatile<number>;
    /**
     * Listing age after which the next access refreshes it in the background;
     * a failed load retries after the same age (default ten minutes).
     */
    modelsMaxAgeMs: Volatile<number>;
}
/** Schemas of the {@link ModelListingConfig} fields. */
export declare const modelListingConfigFields: {
    modelsTimeoutMs: z<number, number, "volatile-defined">;
    modelsMaxAgeMs: z<number, number, "volatile-defined">;
};
/** Plain listing options accepted by {@link resolveListingTiming}. */
export interface ModelListingOptions {
    modelsTimeoutMs?: number;
    modelsMaxAgeMs?: number;
}
/** Listing cache timing of one configuration generation. */
export interface ListingTiming {
    /** Deadline of one listing request. */
    readonly timeoutMs: number;
    /** Listing age after which the next access refreshes it. */
    readonly maxAgeMs: number;
}
/** Listing endpoint and cache timing of one configuration generation. */
export interface ListingSettings extends ListingTiming {
    /** Listing endpoint; it always shares the Messages origin. */
    readonly url: string;
}
/**
 * Validate listing timing. Settings updates can reach it without schema validation, so every bound is judged here.
 * @param options - plain listing options; absent values take the defaults.
 * @param owner - plugin name that prefixes each failure message.
 * @returns the validated timing.
 * @throws Error when a value is outside its schema bounds.
 */
export declare function resolveListingTiming(options: ModelListingOptions, owner: string): ListingTiming;
//# sourceMappingURL=listing-config.d.ts.map
import type { ListingSettings } from './listing-config.ts';
import type { ModelListing } from './listing.ts';
/** Host-owned inputs of one cache instance. */
export interface ListingCacheDependencies {
    /** The credential the route sends to `url`, or `undefined` when it has none. */
    readonly credential: (url: string) => Promise<string | undefined>;
    /** Perform one listing request authenticated with `credential`; `signal` carries the {@link LISTING_TIMEOUT} request deadline. */
    readonly load: (url: string, credential: string, signal: AbortSignal) => Promise<ModelListing>;
    /** Wall clock used for listing age. */
    readonly now: () => number;
    /** Report a loaded listing. */
    readonly info: (message: string) => void;
    /** Report the first failure of a failing streak. */
    readonly warn: (message: string) => void;
}
/** What request resolution reads. */
export interface ListingView {
    /** Whether a credential is available for the listing endpoint. */
    readonly authenticated: boolean;
    /** Last successful listing for this credential and endpoint; `undefined` until one succeeds. */
    readonly listing: ModelListing | undefined;
}
/** One route's listing cache; each endpoint and credential pair has its own scope. */
export declare class ModelListingCache {
    private readonly dependencies;
    private scope;
    private listing;
    /** Settle time of the latest load in this scope; `undefined` before the first one settles. */
    private settledAt;
    private inflight;
    private request;
    private generation;
    private failing;
    private closed;
    /** @param dependencies - credential, transport, clock, and diagnostic callbacks. */
    constructor(dependencies: ListingCacheDependencies);
    /**
     * The last published view, without I/O.
     * @returns the credential state and listing of the current scope.
     */
    current(): ListingView;
    /**
     * Resolve the view for the current credential. The first access of a scope
     * waits for its load, which the request deadline bounds; later accesses
     * return at once and refresh a stale listing in the background.
     * @param settings - endpoint and timing of the caller's configuration generation.
     * @param signal - abandons this wait only; the shared load continues.
     * @returns the view after any first load of the scope settles.
     */
    view(settings: ListingSettings, signal?: AbortSignal): Promise<ListingView>;
    /** Discard the listing and abort any in-flight load; the next access loads again and waits like a first access. */
    invalidate(): void;
    /** Abort in-flight loads; later results and accesses change nothing. */
    dispose(): void;
    private rescope;
    private start;
}
//# sourceMappingURL=listing-cache.d.ts.map
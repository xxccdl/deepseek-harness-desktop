/**
 * @deepseek-ai/dsh-web-app — the browser-surface bundle's runtime glue plugin
 * plus the bundle patch (`cordis.patch.yml`, declared by the `dsh.bundle.patch`
 * manifest field). The plugin owns the browser-surface glue: it resolves
 * the built frontend dist (workspace knowledge of this bundle, never user
 * config), mounts the `frontend-static` fallback owner over it, registers the
 * bash-visible web runtime variable, the process-token URL line, and the
 * default-browser handoff, and provides the `webApp` service. An advertised
 * `publicUrl` replaces the published bind-address URL. Non-loopback
 * HTTP binds trigger an exposure warning. App command-line values arrive
 * through the `webStartup` service expressions in the bundle patch.
 * @module @deepseek-ai/dsh-web-app
 */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
/** The Web GUI this process serves, provided by the `web-runtime` row. */
export interface WebApp {
    /**
     * The URL this GUI advertises, also used for `DSH_WEB_URL` and the startup URL line.
     * @returns the configured `publicUrl`, otherwise the listener origin.
     */
    getAdvertisedUrl(): string;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** The Web GUI this process serves; absent when no Web runtime is mounted. */
        webApp: WebApp;
    }
}
/** Stable Cordis plugin name. */
export declare const name = "web-app";
/** Services required before the web runtime can mount. */
export declare const inject: string[];
/** Plugin config: composed deployment settings plus per-invocation command-line values. */
export interface Config {
    /** Permit default-browser handoff after the Loader tree settles; an SSH launch suppresses it. */
    openBrowser: boolean;
    /** Print the URL line on activation; a non-interactive layer can turn it off. */
    printUrl: boolean;
    /**
     * Register the `DSH_WEB_URL` bash variable naming this GUI. A one-shot
     * non-interactive layer can turn it off when its user is not in the GUI.
     */
    surfaceContext: boolean;
    /**
     * Canonical HTTP(S) root to advertise in the printed and opened URL,
     * `DSH_WEB_URL`, and `webApp.getAdvertisedUrl()`, which supplies the Web GUI
     * URL in agent runtime context, e.g. `https://app.example/ui/`, normalized to end in `/`. Configures no routing
     * or authentication; see [public deployments](../README.md#public-deployments).
     * Absent or YAML `null` advertises the bind-address URL.
     */
    publicUrl?: string;
}
export declare const Config: z<Config>;
/** Test hooks for the built dist and native browser handoff; production never mutates them. */
export declare const internals: {
    resolveDistIndex: () => string;
    openBrowser: (url: string) => Promise<void>;
};
/**
 * Mount the Web runtime: dist serving, the bash runtime variable, the URL
 * line, and the default-browser handoff.
 * @param ctx - plugin context carrying the webServer service.
 * @param config - validated {@link Config}.
 */
export declare function apply(ctx: Context, config: Config): void;
//# sourceMappingURL=index.d.ts.map
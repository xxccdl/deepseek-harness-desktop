/**
 * The web app's command-line provider: it parses the `dsh --profile web` flag
 * family (`--host`, `--port`, `--public-url`, `--trusted-host`, `--no-open`, TLS)
 * and its `--help` text, then provides the immutable values as
 * {@link WEB_STARTUP_SERVICE}. Ordinary rows inject that service before
 * reading it from lazy config.
 * @module @deepseek-ai/dsh-web-app/startup
 */
import type { Context } from '@deepseek-ai/cordis';
import { type TlsConfig } from '@deepseek-ai/dsh-host-webserver';
/** Stable Cordis plugin name. */
export declare const name = "web-startup";
/** Services required before the flags can be resolved. */
export declare const inject: string[];
/** Service provided by this ordinary plugin and injected by flag-configured rows. */
export declare const WEB_STARTUP_SERVICE = "webStartup";
/** What the web rows read from {@link WEB_STARTUP_SERVICE}. */
export interface WebStartupValues {
    /** Whether this invocation opens the default browser after startup. */
    openBrowser: boolean;
    /** `--host`, absent when the invocation did not name one. */
    host?: string;
    /** `--port`, absent when the invocation did not name one. */
    port?: number;
    /**
     * `--public-url`, absent when not specified: the advertised HTTP(S) root.
     * See [public deployments](../README.md#public-deployments).
     */
    publicUrl?: string;
    /** Explicit `--trusted-host` authorities, in argument order. */
    trustedHosts: string[];
    /** Server certificate chain and unencrypted private key supplied together. */
    tls?: TlsConfig;
}
/**
 * Parse and provide the Web invocation as an ordinary Cordis service. The
 * command's action publishes the flags this invocation named. Invalid flags,
 * including an unpaired TLS certificate or key, are usage errors; rejection
 * and `--help` provide no service.
 * @param ctx - plugin context carrying the command line.
 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=startup.d.ts.map
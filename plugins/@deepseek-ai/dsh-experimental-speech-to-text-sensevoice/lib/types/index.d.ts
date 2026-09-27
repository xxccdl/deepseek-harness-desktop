import type { Context } from '@deepseek-ai/cordis';
import { Config } from './config.ts';
export { Config } from './config.ts';
export declare const name = "experimental-speech-to-text-sensevoice";
export declare const inject: string[];
/**
 * Register the local recognizer and inspect disk caches without downloading or loading models.
 * @param ctx - Host registry and subprocess owner.
 * @param config - validated runtime configuration.
 */
export declare function apply(ctx: Context, config: Config): void;
//# sourceMappingURL=index.d.ts.map
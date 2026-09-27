/** Shared Host wiring for the DeepSeek protocol adapter. */
import type { Context } from '@deepseek-ai/cordis';
import type { DeepSeekAdapterOptions, DeepSeekConnectionOptions } from './types.ts';
/**
 * Register one provider with request-local transport services and live retry policy.
 * @param ctx - provider plugin lifetime with the LLM registry injected.
 * @param provider - exact route owned by this plugin.
 * @param dependencies - provider-owned discovery, credential, and configuration callbacks.
 */
export declare function registerDeepSeekProvider<C extends DeepSeekConnectionOptions>(ctx: Context, provider: string, dependencies: Pick<DeepSeekAdapterOptions<C>, 'options' | 'resolveAuth' | 'providerName' | 'discoverModels'>): void;
//# sourceMappingURL=host.d.ts.map
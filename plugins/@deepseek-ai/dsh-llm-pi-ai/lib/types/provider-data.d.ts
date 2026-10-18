/** Installed provider defaults for configuration surfaces. */
import type { Provider } from '@earendil-works/pi-ai';
import type { LlmConfigurableProvider } from '@deepseek-ai/dsh-llm';
/**
 * Return generated display metadata without executing authentication.
 * @param provider - Installed catalog provider, possibly from a newer consumer dependency.
 * @returns Known metadata, or only a fixed public endpoint for an unrecorded provider.
 */
export declare function providerDefaultsOf(provider: Provider): Pick<LlmConfigurableProvider, 'nativeAuth' | 'defaultBaseURL' | 'baseURLEnv'>;
//# sourceMappingURL=provider-data.d.ts.map
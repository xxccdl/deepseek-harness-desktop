/** Generated from the installed pi-ai catalog. Run pnpm gen-provider-data; do not edit. */
import type { BuiltinProvider } from '@earendil-works/pi-ai/providers/all';
import type { LlmConfigurableProvider } from '@deepseek-ai/dsh-llm';
type ProviderData = Pick<LlmConfigurableProvider, 'defaultBaseURL' | 'baseURLEnv'> & {
    env: readonly string[];
};
/** Catalog endpoints and environment names; no credentials are evaluated at runtime. */
export declare const PROVIDER_DATA: Record<BuiltinProvider, ProviderData> & Partial<Record<string, ProviderData>>;
export {};
//# sourceMappingURL=provider-data.generated.d.ts.map
/** Direct Messages transport with one cancellable lifecycle per model request. */
import { LlmAdapter } from '@deepseek-ai/dsh-llm';
import type { GenerateOptions, PreparedAdapterCall, StreamChunk } from '@deepseek-ai/dsh-llm';
import type { DeepSeekAdapterOptions, DeepSeekConnectionOptions as Connection } from './types.ts';
/** DeepSeek provider using Messages content and native thinking replay. */
export declare class DeepSeekAdapter<C extends Connection = Connection> extends LlmAdapter {
    private readonly dependencies;
    private readonly files;
    private readonly imageAccess;
    constructor(dependencies: DeepSeekAdapterOptions<C>);
    providerInfo(provider: string): {
        id: string;
        name: string;
    };
    providerRetryPolicy(_provider: string): import("@deepseek-ai/dsh-llm").ResolvedRetryPolicy;
    listModels(provider: string): Promise<never[] | import("@deepseek-ai/dsh-llm").LlmModelInfo[]>;
    resolveModel(provider: string, model: string, _signal?: AbortSignal): Promise<import("@deepseek-ai/dsh-llm").LlmResolvedModelInfo>;
    imageRequestPricing(_provider: string, model: string): import("@deepseek-ai/dsh-llm").LlmImageRequestPricing;
    prepareCall(provider: string, model: string, _signal?: AbortSignal): Promise<PreparedAdapterCall>;
    stream(options: GenerateOptions): AsyncIterable<StreamChunk>;
    private generate;
    private request;
}
//# sourceMappingURL=adapter.d.ts.map
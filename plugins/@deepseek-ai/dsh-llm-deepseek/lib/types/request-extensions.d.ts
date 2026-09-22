/** Prepare plugin-contributed request fields and commit their delivery after HTTP acceptance. */
import type { DeepSeekLlmApiExtensionRequest } from '@deepseek-ai/dsh-deepseek-llm-api-extensions';
import type { DeepSeekAdapterOptions } from './types.ts';
/**
 * Merge contributions without replacing Messages fields. Preparation and
 * acceptance failures report REQUEST_EXTENSION.
 * @param body - serialized Messages request before extension fields.
 * @param options - request identity, purpose, and cancellation.
 * @param prepare - contributor registry captured for this adapter.
 * @returns HTTP payload and a commit to invoke only after a successful HTTP response.
 */
export declare function prepareRequestExtensions(body: DeepSeekLlmApiExtensionRequest['body'], options: Omit<DeepSeekLlmApiExtensionRequest, 'body'>, prepare: DeepSeekAdapterOptions['prepareExtensions']): Promise<{
    payload: string;
    accept(): Promise<void>;
}>;
//# sourceMappingURL=request-extensions.d.ts.map
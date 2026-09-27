/** Prepare plugin-contributed request fields and commit their delivery after HTTP acceptance. */
import type { DeepSeekLlmApiExtensionRequest } from '@deepseek-ai/dsh-deepseek-llm-api-extensions';
import type { DeepSeekAdapterOptions } from './types.ts';
/**
 * Merge contributions without replacing Messages fields. Preparation and
 * acceptance failures report REQUEST_EXTENSION. When the merged request fails
 * to serialize, the payload is the base request alone and acceptance is a no-op,
 * so contributors resend their unaccepted state on a later request.
 * @param body - serialized Messages request before extension fields.
 * @param options - request identity, purpose, and cancellation.
 * @param prepare - contributor registry captured for this adapter.
 * @param onOmitted - receives the omitted field names and the serialization failure.
 * @returns HTTP payload and a commit to invoke only after a successful HTTP response.
 */
export declare function prepareRequestExtensions(body: DeepSeekLlmApiExtensionRequest['body'], options: Omit<DeepSeekLlmApiExtensionRequest, 'body'>, prepare: DeepSeekAdapterOptions['prepareExtensions'], onOmitted: (fields: readonly string[], error: unknown) => void): Promise<{
    payload: string;
    accept(): Promise<void>;
}>;
//# sourceMappingURL=request-extensions.d.ts.map
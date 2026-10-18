/** Prepare plugin-contributed request fields and commit their delivery after HTTP acceptance. */
import type { DeepSeekLlmApiExtensionRequest } from '@deepseek-ai/dsh-deepseek-llm-api-extensions';
import type { DeepSeekAdapterOptions } from './types.ts';
/**
 * Merge contributions without replacing Messages fields. A rejected preparation or
 * a base-field collision reports REQUEST_EXTENSION with the cause chain appended to
 * the message. When the merged request fails to serialize, the payload is the
 * base request alone and acceptance is a no-op, so contributors resend their
 * unaccepted state on a later request. An acceptance failure is reported and
 * does not fail the request.
 * @param body - serialized Messages request before extension fields.
 * @param options - request identity, purpose, and cancellation.
 * @param prepare - contributor registry captured for this adapter.
 * @param onOmitted - receives the omitted field names and the serialization failure.
 * @param onUnaccepted - receives an acceptance failure after HTTP 2xx.
 * @returns HTTP payload and a commit to invoke only after a successful HTTP response.
 */
export declare function prepareRequestExtensions(body: DeepSeekLlmApiExtensionRequest['body'], options: Omit<DeepSeekLlmApiExtensionRequest, 'body'>, prepare: DeepSeekAdapterOptions['prepareExtensions'], onOmitted: (fields: readonly string[], error: unknown) => void, onUnaccepted: (error: unknown) => void): Promise<{
    payload: string;
    accept(): Promise<void>;
}>;
//# sourceMappingURL=request-extensions.d.ts.map
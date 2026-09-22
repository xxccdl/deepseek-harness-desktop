/** Normalize HTTP and in-band Messages errors into provider-neutral failures. */
import { LlmError } from '@deepseek-ai/dsh-llm';
/** Read only provider error fields used by bounded Files recovery.
 * @param raw - decoded HTTP error response.
 * @returns code, type, and message text, without unrelated response fields.
 */
export declare function providerErrorDetail(raw: unknown): string;
/** Classify a provider error without trusting arbitrary response fields.
 * @param raw - decoded response or in-band error event.
 * @param status - HTTP status when the error preceded streaming.
 * @param headers - response headers for retry delay and request identity.
 * @returns a stable error consumed by LlmRuntime and llm-retry.
 */
export declare function providerError(raw: unknown, status: number | undefined, headers?: Headers): LlmError;
//# sourceMappingURL=transport.d.ts.map
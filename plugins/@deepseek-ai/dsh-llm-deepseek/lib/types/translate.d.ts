/** Translate Messages events while preserving block order and cumulative usage. */
import type { StreamChunk } from '@deepseek-ai/dsh-llm';
/** Decode a required string from provider JSON.
 * @param value - provider field.
 * @returns the validated string.
 */
export declare function string(value: unknown): string;
/** Translate decoded SSE data into the Harness stream protocol.
 * @param events - framed, decoded provider events in arrival order.
 * @param model - requested model id stored in durable replay state.
 * @returns blocks, one final usage value, and exactly one terminal finish.
 */
export declare function translate(events: AsyncIterable<Record<string, unknown>>, model: string): AsyncGenerator<StreamChunk>;
//# sourceMappingURL=translate.d.ts.map
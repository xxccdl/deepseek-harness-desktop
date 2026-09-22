/** Minimal native thinking metadata; durable Harness blocks own all response text. */
import type { Message, ReplayEnvelope } from '@deepseek-ai/dsh-llm';
/** Index-aligned metadata retained alongside each emitted Harness block. */
export interface ReplayBlock {
    type: 'text' | 'reasoning' | 'tool-call';
    signature?: string;
}
/** Reject malformed JSON objects at provider and durable-data reads.
 * @param value - untrusted decoded JSON.
 * @param code - owning failure category.
 * @returns the validated object.
 */
export declare function object(value: unknown, code?: string): Record<string, unknown>;
/** Construct response metadata without duplicating the assistant text.
 * @param model - requested model identity.
 * @param blocks - metadata in emitted block order.
 * @returns the versioned envelope persisted by the existing assembler.
 */
export declare function replayState(model: string, blocks: ReplayBlock[]): ReplayEnvelope;
/** Validate native replay, discarding unusable metadata before serializing durable content.
 * @param message - durable assistant content and source metadata.
 * @param model - target model; cross-model signatures are not portable.
 * @param onDegrade - diagnostic for unusable metadata; receives no message content or signatures.
 * @returns index-aligned metadata, absent for foreign, cross-model or degraded history.
 */
export declare function readReplay(message: Message, model: string, onDegrade?: (reason: string) => void): ReplayBlock[] | undefined;
//# sourceMappingURL=replay.d.ts.map
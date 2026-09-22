import type { AssistantMessageNode } from '@deepseek-ai/dsh-client-ui-conversation/client';
/** One assistant step's derivable latency facts; null marks an unrecorded part. */
export interface StepReading {
    /** step/start → first token delta, in ms. */
    ttftMs: number | null;
    /** First token delta → final message, in ms. */
    decodeMs: number | null;
    /** Provider-reported completion tokens. */
    outputTokens: number | null;
}
type AssistantNode = AssistantMessageNode;
/**
 * Read one assistant node's TTFT, decode wall time, and output tokens.
 * @param node - A settled assistant node.
 * @returns Per-part readings with `null` for unrecorded values.
 */
export declare function assistantStepReading(node: AssistantNode): StepReading;
export {};
//# sourceMappingURL=turn-metrics.d.ts.map
/** Shared narrowing for raw Tool call and result fields consumed by card models. */
import type { ToolResultNode } from '@deepseek-ai/dsh-client-ui-chat/client';
import type { ToolCallBlock } from './tool-call-model.ts';
/** A parsed, in-window Tool call whose arguments are a JSON object. */
export interface ParsedToolCall {
    name: string;
    args: Record<string, unknown>;
}
/**
 * Parse the call head paired with one immutable Tool block.
 * @param block - preparing, dispatched, or settled Tool block.
 * @returns the Tool name and object arguments, or null during preparation or when valid arguments are unavailable.
 */
export declare function parsedToolCall(block: ToolCallBlock): ParsedToolCall | null;
/**
 * Read the exact single text block consumed by first-party card derivations.
 * @param block - settled Tool result.
 * @returns its text, or undefined for any other content layout.
 */
export declare function singleResultText(block: ToolResultNode): string | undefined;
/**
 * Validate the optional escalation pair shared by first-party shell and file
 * mutation tools.
 * @param args - parsed open-root Tool arguments.
 * @returns whether the declared escalation fields form a valid pair.
 */
export declare function validEscalationFields(args: Record<string, unknown>): boolean;
//# sourceMappingURL=raw-tool-call.d.ts.map
import type { ToolCallInjected } from '../contract/slots.ts';
/**
 * Bind one call without subscribing until its component invokes the Hook.
 * @param _standard - framework-provided scope props.
 * @param context - the preparing call's Step source and identity.
 * @returns a Hook that reads only this call's raw argument prefix.
 */
export declare const bindToolCallArgumentsPartial: ToolCallInjected['hooks']['toolCallArgumentsPartial'];
//# sourceMappingURL=tool-call-arguments-partial.d.ts.map
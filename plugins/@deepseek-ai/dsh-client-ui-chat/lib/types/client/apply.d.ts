import type { Context } from '@deepseek-ai/cordis';
import type { ChatFlowInjected, ChatNodeInjected } from './contract/slots.ts';
/** Bind group and header visibility to the viewport of one flow render. */
export declare const CHAT_FLOW_INJECT: ChatFlowInjected;
/** Bind node-local sources and forward the flow's existing visibility hook. */
export declare const CHAT_NODE_INJECT: ChatNodeInjected;
/** Services required by the Chat target and its presentation registrations. */
export declare const inject: string[];
/**
 * Mount all Chat-owned contributions.
 * @param ctx - Client root context.
 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=apply.d.ts.map
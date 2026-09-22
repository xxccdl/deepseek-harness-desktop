import type { Context } from '@deepseek-ai/cordis';
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store';
import type { PerformanceUsageMode } from '../../chat-settings.ts';
import type { ChatPresentationPolicy } from '../presentation-policy.ts';
/**
 * Register this package's business renderers behind the keyed Chat Node seat.
 * Renderers whose output depends on the work-details mode receive the policy
 * through their own registration; the seat and the other renderers do not.
 * @param ctx - owning UI Conversation context.
 * @param performanceUsage - live statistics detail preference.
 * @param presentation - live presentation policy.
 */
export declare function registerChatNodeRenderers(ctx: Context, performanceUsage: ObservableSnapshot<PerformanceUsageMode>, presentation: ObservableSnapshot<ChatPresentationPolicy>): void;
//# sourceMappingURL=register-node-renderers.d.ts.map
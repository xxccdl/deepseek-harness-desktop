import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client';
import { type ChatSettings, type PerformanceUsageMode } from '../chat-settings.ts';
/** Shared live preference for the settings row and chat statistics. */
export declare class PerformanceUsagePolicy {
    private readonly host;
    private readonly unsubscribe;
    /** Current choice, reconciled with accepted Host settings when available. */
    readonly mode: import("@deepseek-ai/dsh-client-store").SnapshotStore<"compact" | "detailed">;
    /** @param host - Chat settings scope, durable on loopback and memory-only elsewhere. */
    constructor(host: ConfigForm<ChatSettings>);
    /** Release the accepted-value subscription. */
    dispose(): void;
    /**
     * Publish a choice immediately and persist it when the scope supports writes.
     * @param mode - Statistics detail selected by the user.
     */
    setMode(mode: PerformanceUsageMode): void;
}
//# sourceMappingURL=performance-usage.d.ts.map
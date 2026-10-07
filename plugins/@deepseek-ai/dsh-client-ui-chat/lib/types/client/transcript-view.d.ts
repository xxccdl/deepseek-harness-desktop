/** Host-backed work-details presentation policy. */
import { type SnapshotStore } from '@deepseek-ai/dsh-client-store';
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client';
import { type ChatSettings, type TranscriptViewMode } from '../chat-settings.ts';
/** Live work-details preference consumed by Chat and its Settings row. */
export declare class TranscriptViewPolicy {
    private readonly host;
    private readonly defaultMode;
    private readonly unsubscribe;
    /** Reactive current mode, including the client default before Host settings arrive. */
    readonly mode: SnapshotStore<TranscriptViewMode>;
    /**
     * @param host - durable Chat settings scope.
     * @param defaultMode - presentation used without an explicit saved mode.
     */
    constructor(host: ConfigForm<ChatSettings>, defaultMode?: TranscriptViewMode);
    /** Release the accepted-value subscription. */
    dispose(): void;
    /**
     * Publish and persist one explicit user choice.
     * @param mode - Compact, Standard, Detailed, or Verbose work details.
     */
    setMode(mode: TranscriptViewMode): void;
    /** Adopt the latest accepted Host section without writing it back. */
    private adopt;
}
//# sourceMappingURL=transcript-view.d.ts.map
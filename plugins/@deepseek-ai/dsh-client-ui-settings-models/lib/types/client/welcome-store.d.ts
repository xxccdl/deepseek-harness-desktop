/**
 * Welcome-notice state derived from the welcome settings scope: the notice
 * follows the Host section and records its acknowledgement through it.
 */
import { type SnapshotStore } from '@deepseek-ai/dsh-client-store';
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client';
/** State rendered by the welcome step. */
export interface WelcomeNoticeState {
    status: 'idle' | 'loading' | 'ready' | 'saving' | 'error';
    acknowledged: boolean;
    error: string | null;
}
/** The welcome section as the notice reads it. */
export type WelcomeSection = Record<string, unknown>;
/**
 * Accept any object section verbatim; a malformed durable value reads as an
 * empty section, so the notice treats it as unacknowledged instead of leaving
 * the scope stuck on its previous value.
 * @param section - the wire section value.
 * @returns the section object, or an empty one for non-object values.
 */
export declare function decodeWelcomeSection(section: unknown): WelcomeSection;
/** Coordinates the durable Host acknowledgement. */
export declare class WelcomeNoticeStore {
    private readonly scope;
    /** uSES-safe state source shared by the registered welcome step. */
    readonly store: SnapshotStore<WelcomeNoticeState>;
    private saving;
    private following;
    constructor(scope: ConfigForm<WelcomeSection>);
    /**
     * Begin following the bound scope (idempotent) and publish its current answer.
     * @returns settlement after the current answer is published.
     */
    load(): Promise<void>;
    /**
     * Persist this copy version through the scope. Success is judged against the
     * state the write left behind, so a refused or failed write reports false
     * after its recovery read settles.
     * @returns true when the Host holds the acknowledgement.
     */
    acknowledge(): Promise<boolean>;
    /** Stop following the scope. */
    dispose(): void;
    private derive;
}
//# sourceMappingURL=welcome-store.d.ts.map
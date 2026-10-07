/** Workspace command registration and browser-owned opening requests. */
import type { Context } from '@deepseek-ai/cordis';
import type { SnapshotStore } from '@deepseek-ai/dsh-client-store';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { UiWorkspace } from './navigation.ts';
/** Transient requests consumed by the existing workspace browser. */
export interface WorkspaceShortcutState {
    readonly searchRequest: number;
    readonly addRequested: boolean;
    readonly directoryBusy: boolean;
    readonly renameTarget: {
        readonly sessionId: SessionId;
        readonly currentTitle: string;
    } | null;
    readonly forkError: {
        readonly reason: 'unavailable' | 'failed';
        readonly seq: number;
    } | null;
}
interface WorkspaceShortcutControls {
    state: SnapshotStore<WorkspaceShortcutState>;
    search: () => void;
    add: () => void;
    closeAdd: () => void;
    directoryBusy: (busy: boolean) => void;
    rename: (sessionId: SessionId, currentTitle: string) => void;
    closeRename: () => void;
    forkFailed: (reason: 'unavailable' | 'failed') => void;
    dismissForkError: () => void;
}
/**
 * Create the private browser request source shared by commands and controls.
 * @returns observable state and its complete mutation callbacks.
 */
export declare function createWorkspaceShortcutControls(): WorkspaceShortcutControls;
/**
 * Register navigation commands against the existing workspace owner.
 * Rename requires a nonblank main Conversation with no modal obscuring it.
 * @param ctx - plugin context with the shortcut, locale, and model services.
 * @param navigation - session creation and forking from the pointer controls' navigation service.
 * @param controls - browser-owned opening requests.
 * @param archiveSession - shared archive action, including running-work confirmation and notices.
 */
export declare function installWorkspaceShortcuts(ctx: Context, navigation: Pick<UiWorkspace, 'startSession' | 'forkSession'>, controls: ReturnType<typeof createWorkspaceShortcutControls>, archiveSession: (sessionId: SessionId) => void): void;
export {};
//# sourceMappingURL=shortcuts.d.ts.map
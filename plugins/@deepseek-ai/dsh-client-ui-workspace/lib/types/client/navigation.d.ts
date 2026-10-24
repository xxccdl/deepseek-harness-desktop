/** Workspace archive and directory UI capability. */
import { Service, type Context } from '@deepseek-ai/cordis';
import type { ClientRemote, DirectoryListing, RemoteFailure } from '@deepseek-ai/dsh-api-remotes/client';
import type { ISessions, SessionTarget } from '@deepseek-ai/dsh-api-session-controller/client';
import type { IWorkspaces, WorkspaceId } from '@deepseek-ai/dsh-api-workspace-controller/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { DraftInitializationOptions } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { RowToast } from './contract/slots.ts';
import type { WorkspaceViewStoreActions } from './stores.ts';
/** Content preparation and Agent preset for the Session a Workspace flow opens. */
export interface StartSessionOptions extends DraftInitializationOptions {
    /** Agent preset the Session runs; the Host default when omitted. */
    readonly agentPreset?: string;
}
/** Workspace archive and directory operations consumed by Client UI domains. */
export interface UiWorkspace {
    /**
     * Select a Session and show its Conversation as one UI navigation action.
     * @param target - known Session identity or durable direct-parent subagent address to display.
     */
    openSession(target: SessionTarget): void;
    /**
     * Connect a Workspace and open its Session unless a later navigation supersedes it.
     * @param workspaceId - target Workspace.
     * @param beforeOpen - optional synchronous preparation for the selected Session,
     * skipped after supersession; a throw aborts the open and releases the retained reference.
     * @param options - choices for the Session the connection creates or reuses.
     * @returns completion; a superseded request may create a Session but does not open it.
     * @throws on failure; a refused creation is also shown through the Workspace
     * notice unless a later navigation or disposal superseded the request.
     */
    openWorkspace(workspaceId: WorkspaceId, beforeOpen?: (sessionId: SessionId) => void, options?: Pick<StartSessionOptions, 'agentPreset'>): Promise<void>;
    /**
     * Fork a Session without changing the current selection.
     * @param sessionId - source Session.
     * @param onCreated - observer before the optional child-title update.
     * @param options - optional permission to start source migration; omission preserves the Host default.
     * @returns the child SessionId after creation and inherited-title increment.
     */
    forkSession(sessionId: SessionId, onCreated?: (childId: SessionId) => void, options?: Pick<Parameters<ISessions['fork']>[0], 'allowMigration'>): Promise<SessionId>;
    /**
     * Resolve the Session for a new conversation in a Workspace: navigation names the first
     * reusable blank member, skipping blanks that list a preset other than a requested one, and
     * the Host reuses it under the requested preset or its default, or creates another Session.
     * @param workspaceId - target Workspace.
     * @param options - choices for the created or reused Session.
     * @returns a Session already addressable through the Session Controller.
     */
    connectWorkspace(workspaceId: WorkspaceId, options?: Pick<StartSessionOptions, 'agentPreset'>): Promise<SessionId>;
    /**
     * Open the Workspace blank `connectWorkspace` resolves, so New Session returns to that blank's
     * unsent draft. A creation the Host refuses is shown through the Workspace notice and leaves the
     * selection as it was.
     * @param workspaceId - explicit target; absent inherits the current or most recent Workspace.
     * @param options - initial content, the blank's preset, and `whenDraftExists`, which decides
     * whether existing text or attachments are kept, replaced, or followed by the prompt.
     */
    startSession(workspaceId?: WorkspaceId, options?: StartSessionOptions): void;
    /**
     * Archive a Session and clear it when it is the current selection.
     * @param sessionId - Session to archive.
     * @param options - `stopActivity` asks the Host to stop the Session's running work instead of refusing.
     */
    archiveSession(sessionId: SessionId, options?: {
        readonly stopActivity?: boolean;
    }): Promise<void>;
    /**
     * Unarchive a Session, restoring it to its recorded Workspace position.
     * @param sessionId - Session to unarchive.
     */
    unarchiveSession(sessionId: SessionId): Promise<void>;
    /**
     * Pin a Session on the Host, then lead it in its accounts' saved orders
     * (its Workspace group or Ungrouped, and the flat list). The order write
     * reads the memberships current at completion, so reorders that landed
     * while the Host call was pending keep their positions.
     * @param sessionId - Session to pin.
     */
    pinSession(sessionId: SessionId): Promise<void>;
    /**
     * Unpin a Session on the Host; saved positions stay as they are.
     * @param sessionId - Session to unpin.
     */
    unpinSession(sessionId: SessionId): Promise<void>;
    /**
     * Open the Host-native directory picker.
     * @returns the selected directory, or null when cancelled.
     */
    pickDirectory(): Promise<string | null>;
    /**
     * List one Host directory level.
     * @param path - directory path; absent selects the Host home.
     * @param signal - cancellation for a superseded scan.
     * @returns directory entries and breadcrumb ancestry.
     */
    listDirectory(path?: string, signal?: AbortSignal): Promise<DirectoryListing>;
    /**
     * Create a child directory.
     * @param path - existing parent directory.
     * @param name - child directory name.
     * @returns created absolute path.
     */
    createDirectory(path: string, name: string): Promise<string>;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** Cross-Controller Workspace navigation and directory UI capability. */
        uiWorkspace: UiWorkspace;
    }
}
/** Structured directory failure exposed to directory UI consumers. */
export declare class DirectoryBrowseError extends Error {
    readonly rpcError: RemoteFailure;
    readonly name = "DirectoryBrowseError";
    /** @param rpcError - Host directory business failure. */
    constructor(rpcError: RemoteFailure);
}
/** Implements Workspace archive and directory UI operations. */
declare class UiWorkspaceService extends Service implements UiWorkspace {
    private readonly directoryPicker;
    private readonly workspaces;
    private readonly sessions;
    private readonly view;
    private readonly notify;
    /** The latest in-flight connection per Workspace; a request joins it only when both name the same preset. */
    private readonly connecting;
    private readonly lifetime;
    private readonly selection;
    private mainReference;
    /**
     * @param ctx - Client root Context.
     * @param directoryPicker - the directory-picking Remote namespace.
     * @param workspaces - pure Workspace Controller.
     * @param sessions - pure Session Controller.
     * @param view - the browser's viewing-store write set (one instance shared with its registration).
     * @param notify - show one notice through the Workspace notice channel.
     */
    constructor(ctx: Context, directoryPicker: ClientRemote['directoryPicker'], workspaces: IWorkspaces, sessions: ISessions, view: Pick<WorkspaceViewStoreActions, 'pinSessionOrder'>, notify: (toast: RowToast) => void);
    connectWorkspace(workspaceId: WorkspaceId, options?: Pick<StartSessionOptions, 'agentPreset'>): Promise<SessionId>;
    /**
     * @param reuse - preset for the reused or created blank.
     */
    private connectBlank;
    /** Name the first reusable member blank; a requested preset also skips blanks listing another preset. */
    private createInWorkspace;
    /**
     * Create through the Host. A named blank the Host declined may still read as
     * blank from stale cached list metadata, which hides it from the Session tree;
     * its projections are reloaded so the row reflects its log.
     */
    private createNamed;
    /**
     * Reopen a saved blank Session under the preset its log recorded, or under
     * the Host default once that preset no longer activates. Listed values are
     * cached hints that can lag the log after an unclean Host exit, so the
     * Session's projections are reloaded before the preset is read; a Session
     * that still awaits a format migration reloads only those cached hints.
     */
    private restoreBlank;
    openSession(target: SessionTarget): void;
    openWorkspace(workspaceId: WorkspaceId, beforeOpen?: (sessionId: SessionId) => void, options?: Pick<StartSessionOptions, 'agentPreset'>): Promise<void>;
    private openWorkspaceSession;
    forkSession(sessionId: SessionId, onCreated?: (childId: SessionId) => void, options?: Pick<Parameters<ISessions['fork']>[0], 'allowMigration'>): Promise<SessionId>;
    startSession(workspaceId?: WorkspaceId, options?: StartSessionOptions): void;
    private prepareDraft;
    private draftPreparationFailed;
    archiveSession(sessionId: SessionId, options?: {
        readonly stopActivity?: boolean;
    }): Promise<void>;
    unarchiveSession(sessionId: SessionId): Promise<void>;
    pinSession(sessionId: SessionId): Promise<void>;
    unpinSession(sessionId: SessionId): Promise<void>;
    pickDirectory(): Promise<string | null>;
    listDirectory(path?: string, signal?: AbortSignal): Promise<DirectoryListing>;
    createDirectory(path: string, name: string): Promise<string>;
    private watchNavigation;
    private restoreSelection;
    private initializeDefaultWorkspace;
    /** @returns true when an archived current selection was cleared. */
    private clearArchivedCurrent;
    private clearMain;
    private replaceMain;
}
export { UiWorkspaceService };
//# sourceMappingURL=navigation.d.ts.map
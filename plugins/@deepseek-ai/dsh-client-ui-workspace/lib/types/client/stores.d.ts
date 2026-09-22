/**
 * The workspace browser's viewing store: the session-list grouping mode,
 * persisted across reloads. Module level exports the factory only (a
 * module-level handle would pin the store identity across plugin reloads);
 * register() receives the factory and the browser derives its PropsStore
 * share from the return type.
 */
import { type EngineStoreHandle } from '@deepseek-ai/dsh-client-store';
import type { SessionListState } from '@deepseek-ai/dsh-api-session-controller/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import { type ArchivedFilter, type SessionRowState } from './tree.ts';
/** Browser-local order account for the hierarchy-free flat Session list. */
export declare const FLAT_SESSION_ORDER_KEY = "__flat_session_order__";
/** Session-list grouping mode: sibling Workspace sections, a Workspace tree, or one flat list. */
export type SessionGroupBy = 'workspace' | 'workspace-tree' | 'flat';
/** Session order: saved manual positions or current recency. */
export type SessionOrderBy = 'manual' | 'updated';
/** Workspace browser viewing state persisted across surface remounts and reloads. */
type WorkspaceViewState = {
    groupBy: SessionGroupBy;
    orderBy: SessionOrderBy;
    /** Explicit group expansion keyed by Workspace identity, including descendants in tree mode. */
    groupExpansion: Record<string, boolean>;
    /** Saved manual order per Workspace group plus the browser-local flat-list account. */
    sessionOrderByAccount: Record<string, string[]>;
    /** Archived-row visibility; omitted in pre-filter v5 snapshots and read as 'default'. */
    archivedFilter?: ArchivedFilter;
};
type SessionOrderSource = {
    members: Readonly<Record<string, readonly SessionId[]>>;
    summaries: SessionListState['byId'];
    rowState: Pick<SessionRowState, 'pinnedSessionIds' | 'archivedSessionIds'>;
};
/**
 * Annotation twin of the actions literal below (the export needs a declared
 * return type); drift fails assignability at the defineStore call.
 */
type WorkspaceViewActions = {
    setGroupBy: (draft: WorkspaceViewState, mode: SessionGroupBy) => void;
    setOrderBy: (draft: WorkspaceViewState, mode: SessionOrderBy, initialOrders: Readonly<Record<string, readonly string[]>>) => void;
    setGroupExpanded: (draft: WorkspaceViewState, key: string, expanded: boolean) => void;
    retainAccountKeys: (draft: WorkspaceViewState, workspaceKeys: readonly string[]) => void;
    syncSessionOrders: (draft: WorkspaceViewState, orders: Readonly<Record<string, readonly string[]>>) => void;
    setSessionOrder: (draft: WorkspaceViewState, accountKey: string, order: readonly string[], initialOrders: Readonly<Record<string, readonly string[]>>) => void;
    pinSessionOrder: (draft: WorkspaceViewState, sessionId: string, accountKeys: readonly string[], source: SessionOrderSource) => void;
    setArchivedFilter: (draft: WorkspaceViewState, filter: ArchivedFilter) => void;
};
/**
 * Create the workspace browser viewing store handle.
 * @returns the store handle (spec + type + identity + factory in one).
 */
export declare function createWorkspaceViewStore(): EngineStoreHandle<WorkspaceViewState, WorkspaceViewActions>;
/** The bound write set of one viewing-store instance (what the UiWorkspace service drives). */
export type WorkspaceViewStoreActions = ReturnType<ReturnType<typeof createWorkspaceViewStore>['create']>['actions'];
export {};
//# sourceMappingURL=stores.d.ts.map
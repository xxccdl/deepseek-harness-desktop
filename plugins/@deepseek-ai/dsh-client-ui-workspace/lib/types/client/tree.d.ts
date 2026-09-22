/**
 * Derives the workspace browser tree from caller-projected Workspace and
 * Session order. Unassigned Sessions trail under Ungrouped; only the selected
 * blank Session remains visible.
 */
import { type SessionListState, type SessionSearchResultItem } from '@deepseek-ai/dsh-api-session-controller/client';
import type { WorkspaceId, WorkspaceView } from '@deepseek-ai/dsh-api-workspace-controller/client';
import type { SessionStatusSnapshot } from '@deepseek-ai/dsh-client-ui-session/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
/** Group key for Sessions outside every Workspace. */
export declare const UNGROUPED_KEY = "";
/**
 * Resolve the Workspace browser group that owns one Session.
 * @param workspaces - authoritative Workspace membership.
 * @param sessionId - Session whose browser group is required.
 * @returns owning Workspace id, or {@link UNGROUPED_KEY} when no Workspace accounts for it.
 */
export declare function owningGroupKey(workspaces: readonly WorkspaceView[], sessionId: SessionId): string;
/** Pending interaction kinds with dedicated Workspace-row presentation. */
export type SessionPendingInteractionStatus = 'approval' | 'plan-review' | 'question';
type SessionStatuses = SessionStatusSnapshot;
/** One top-level session row in a group or the flat list. */
export interface SessionNode {
    id: SessionId;
    /** Stored display title; the renderer substitutes the localized New Session label for blank rows. */
    title: string;
    /** The provisional blank session (renderer shows the localized New Session title). */
    blank: boolean;
    /** A Session-scoped UI consumer is awaiting this user. */
    pendingInteraction?: SessionPendingInteractionStatus;
    running: boolean;
    /** Running direct children in the loaded subagent catalog. */
    runningSubagentCount: number;
    /** Finished running while not selected and not yet opened (the green "done" reminder dot). */
    completed: boolean;
    /** The current list projection contains at least one active Schedule record. */
    hasActiveSchedule: boolean;
    /** In the registry-global pin set: leads its section, reorderable only among pinned rows. */
    pinned: boolean;
    /** In the registry-global archive set: shown grayed in place and not openable. */
    archived: boolean;
    updatedAt: number;
}
/** Session order selected by the Workspace browser. */
export type SessionOrderBy = 'manual' | 'updated';
/** One workspace group section: header row facts + visible top-level session rows. */
export interface GroupNode {
    /** Group key: the workspace id or {@link UNGROUPED_KEY}. */
    key: string;
    /** Backing Workspace id; absent only for the ungrouped bucket. */
    workspaceId: WorkspaceId | undefined;
    cwd: string | undefined;
    /** Workspace creation time (epoch ms); absent only for the ungrouped bucket. */
    createdAt: number | undefined;
    label: string;
    /** Total visible sessions in the group. */
    sessionCount: number;
    expanded: boolean;
    /** The group contains the selected session (active folder tint; supplied here so the renderer never scans). */
    containsCurrent: boolean;
    /** Visible session rows (empty while the group is folded). */
    sessions: readonly SessionNode[];
}
/** One flat search row combining list metadata with an optional content match. */
export interface SearchResultNode {
    id: SessionId;
    title: string;
    workspace: string;
    /** A Session-scoped UI consumer is awaiting this user. */
    pendingInteraction?: SessionPendingInteractionStatus;
    running: boolean;
    /** Running direct children in the loaded subagent catalog. */
    runningSubagentCount: number;
    /** Finished running while not selected and not yet opened (the green "done" reminder dot). */
    completed: boolean;
    /** The current list projection contains at least one active Schedule record. */
    hasActiveSchedule: boolean;
    /** In the registry-global archive set: shown grayed and not openable. */
    archived: boolean;
    snippet?: string;
}
/** Bounded merged search projection plus the refine-query hint bit. */
export interface SearchResultSet {
    items: readonly SearchResultNode[];
    hasMore: boolean;
}
/** Viewing state consumed by the derivation. */
export interface TreeView {
    expandedGroups: readonly string[];
    /** Browser-local order for Sessions without a backing Workspace account. */
    ungroupedOrder?: readonly string[];
}
/**
 * Directory display label: basename of the path (both separators accepted).
 * Ungrouped-bucket fallback for surfaces without a workspace title.
 * @param cwd - directory path, or undefined for the ungrouped bucket.
 * @returns basename, the raw cwd when it has no basename, or an empty ungrouped marker.
 */
export declare function workspaceLabel(cwd: string | undefined): string;
/**
 * Project known account members by current Session recency.
 * @param sessionIds - authoritative account membership.
 * @param summaries - current Session summaries; members without a summary are omitted until it arrives.
 * @returns known members newest first, with Session identity as the deterministic tie-break.
 */
export declare function orderByRecency(sessionIds: readonly SessionId[], summaries: SessionListState['byId']): SessionId[];
/**
 * Reconcile a browser-local manual order with current account membership.
 * New ordinary forks precede their sources without changing saved entries' relative order.
 * @param memberIds - authoritative account membership.
 * @param savedOrder - previously saved browser-local order.
 * @param summaries - current Session metadata; unknown new members wait for their summaries.
 * @param rowState - global pin and archive membership; only account members can supplement the order.
 * @returns saved relative positions plus missing members ordered by pin, fork source, recency, and archive status.
 */
export declare function reconcileManualOrder(memberIds: readonly SessionId[], savedOrder: readonly string[] | undefined, summaries: SessionListState['byId'], rowState?: Pick<SessionRowState, 'pinnedSessionIds' | 'archivedSessionIds'>): SessionId[];
/**
 * Keep the selected provisional New Session ahead of either base order.
 * @param order - recency or reconciled manual order.
 * @param currentBlank - selected blank Session in this account, when present.
 * @returns a copy with the selected blank first and no duplicate slot.
 */
export declare function pinCurrentBlank(order: readonly SessionId[], currentBlank: SessionId | undefined): SessionId[];
/**
 * Archived-row visibility choice: the default hides archived rows, `show`
 * mixes them into their kept slots, and `only` restricts the view (and
 * search) to archived rows.
 */
export type ArchivedFilter = 'default' | 'show' | 'only';
/** Registry-global row state consumed by every tree derivation. */
export interface SessionRowState {
    /** Registry-global pin ids; pinned rows lead their section in the local order. */
    pinnedSessionIds: readonly SessionId[];
    /** Archive set; members keep their slots and show grayed while visible. */
    archivedSessionIds: readonly SessionId[];
    /** Archived-row visibility choice applied to lists and search alike. */
    archivedFilter: ArchivedFilter;
}
/**
 * Derive the workspace browser groups with every session as a top-level row.
 *
 * Every group shows; sessions populate under expanded groups with pinned rows
 * leading in the selected local order. Blank sessions are
 * excluded except for the selected provisional New Session row; archived
 * sessions keep their slots and appear per the archived filter. Content
 * search lives outside this derivation (see {@link deriveSearchResults}).
 * @param list - sessions list snapshot (`mainView` retention feeds containsCurrent).
 * @param workspaces - real Workspaces in Host group order with caller-projected Session order.
 * @param rowState - registry-global pin and archive sets plus the archived filter.
 * @param statuses - unified UI status by Session.
 * @param view - local expansion arrays.
 * @returns group sections in render order.
 */
export declare function deriveGroups(list: SessionListState, workspaces: readonly WorkspaceView[], rowState: SessionRowState, statuses: SessionStatuses, view: TreeView): GroupNode[];
/**
 * Select complete flat-list membership, independently of archive visibility.
 * @param list - sessions list snapshot.
 * @returns known ordinary Session ids, including archives and only the current blank.
 */
export declare function sessionMemberIds(list: SessionListState): SessionId[];
/**
 * Select visible flat-list members without deriving row presentation or ordering.
 * @param list - sessions list snapshot.
 * @param archivedSessionIds - registry-global archive set.
 * @param archivedFilter - archived-row visibility choice.
 * @returns known visible Session ids in list order, including ordinary forks and only the current blank.
 */
export declare function visibleSessionIds(list: SessionListState, archivedSessionIds: readonly SessionId[], archivedFilter: ArchivedFilter): SessionId[];
/**
 * Derive flat rows from the browser's complete ordered Session ids, with
 * pinned rows fronted ahead of the supplied order.
 * @param list - sessions list snapshot used to select the ids.
 * @param sessionIds - complete account members in the selected order, including hidden archives.
 * @param rowState - registry-global pin and archive sets plus the archived filter.
 * @param statuses - unified UI status by Session.
 * @returns flat rows in sectioned order with current status indicators.
 */
export declare function deriveFlat(list: SessionListState, sessionIds: readonly SessionId[], rowState: SessionRowState, statuses: SessionStatuses): SessionNode[];
/**
 * Merge immediate title/Workspace substring matches with ranked Host content
 * matches. Local rows lead newest-first, content-only rows retain backend
 * order, and duplicate sessions receive the backend snippet in place.
 * @param list - session metadata authority.
 * @param workspaces - Workspace membership and display labels.
 * @param query - caller text; surrounding whitespace is ignored.
 * @param archivedSessionIds - registry-global archive set (members match per the archived filter).
 * @param archivedFilter - archived-row visibility choice; search follows it.
 * @param statuses - unified UI status by Session.
 * @param content - ranked Host content-search page.
 * @param limit - protocol-owned maximum merged row count.
 * @returns bounded deduplicated flat rows and a refine-query hint bit.
 */
export declare function deriveSearchResults(list: SessionListState, workspaces: readonly WorkspaceView[], query: string, archivedSessionIds: readonly SessionId[], archivedFilter: ArchivedFilter, statuses: SessionStatuses, content: {
    items: readonly SessionSearchResultItem[];
    hasMore: boolean;
}, limit: number): SearchResultSet;
/**
 * Find the nearest registered ancestor, excluding the Workspace directory itself.
 * Paths use Host spelling; matching is case-sensitive, like Workspace identity.
 * @param path - Workspace directory.
 * @param parents - registered Workspace directory paths.
 * @returns the owning parent path, or undefined when no parent contains the Workspace.
 */
export declare function owningParentFolder(path: string, parents: readonly string[]): string | undefined;
export {};
//# sourceMappingURL=tree.d.ts.map
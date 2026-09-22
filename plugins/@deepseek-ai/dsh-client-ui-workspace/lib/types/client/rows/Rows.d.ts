import type { PropsRenderSlots } from '@deepseek-ai/dsh-client-ui-slots';
import type { WorkspaceBrowserProps } from '../contract/slots.ts';
import type { GroupNode, SearchResultNode, SessionNode } from '../tree.ts';
/** The standard locale seat, prop-passed from the browser root. */
type RowTranslate = WorkspaceBrowserProps['t'];
/**
 * Row drag wiring supplied by the tree owner. `drop` reports the half of the
 * row where the pointer released so the owner can resolve an insert anchor.
 */
export interface RowDragProps {
    /** Start dragging this row. */
    start: () => void;
    /** A compatible row drag is in flight. */
    active: boolean;
    /** Current marker on this row: insert line above, below, or none. */
    marker: 'before' | 'after' | null;
    /** Report the hovered half while a compatible drag passes over this row. */
    hover: (half: 'before' | 'after') => void;
    drop: (half: 'before' | 'after') => void;
    end: () => void;
}
/** Drag lifecycle owned by a workspace row; its enclosing group owns hit testing. */
interface WorkspaceRowDragProps {
    start: () => void;
    end: () => void;
}
/**
 * Project (workspace) header row: folder + title;
 * hover reveals the chevron and create button, and dwelling on a real
 * Workspace shows its hover card (the ungrouped bucket has none).
 * `containsCurrent` arrives on the node (derivation fact, no renderer scan).
 * @param props.group - derived group node.
 * @param props.containsCurrentDescendant - highlight an ancestor even when its subtree is collapsed.
 * @param props.onToggle - expand/collapse the group.
 * @param props.onCreate - start a frontend Session inside this Workspace.
 * @param props.drag - optional workspace-row drag wiring.
 * @param props.home - host account home for POSIX hover-path abbreviation.
 * @param props.t - the browser root's locale seat.
 * @returns the row element.
 */
export declare function ProjectRowItem({ group, containsCurrentDescendant, onToggle, onCreate, actions, drag, home, t }: {
    group: GroupNode;
    containsCurrentDescendant?: boolean;
    onToggle: () => void;
    onCreate: () => void;
    /** Real-Workspace actions; absent for the ungrouped bucket (no menu shown). */
    actions?: {
        rename: () => void;
        delete: () => void;
    } | undefined;
    /** Present only for real Workspace rows in the grouped view. */
    drag?: WorkspaceRowDragProps | undefined;
    /** Host account home; POSIX home-rooted hover paths display as `~`. */
    home?: string | undefined;
    t: RowTranslate;
}): import("react").JSX.Element;
/**
 * One flat search result: title, Workspace context, and optional content
 * excerpt. Search navigation opens the session only; it does not address an
 * event inside the conversation. Archived rows carry a hover unarchive
 * button, because search is where the filter surfaces them for recovery.
 * @param props.result - merged local/content search row.
 * @param props.currentId - selected session id.
 * @param props.onOpen - open the selected session.
 * @param props.onUnarchive - unarchive an archived result row.
 * @param props.t - Workspace-browser translation seat.
 * @returns the result row.
 */
export declare function SearchResultItem({ result, currentId, onOpen, onUnarchive, t }: {
    result: SearchResultNode;
    currentId: string | undefined;
    onOpen: (id: SearchResultNode['id']) => void;
    onUnarchive: (id: SearchResultNode['id']) => void;
    t: RowTranslate;
}): import("react").JSX.Element;
/**
 * One top-level 34px session row: status dot (pending user interaction outranks
 * own or descendant activity), title, relative time or compact pending label,
 * and the row actions menu.
 * @param props.node - derived session node.
 * @param props.currentId - selected session id (row highlight).
 * @param props.now - epoch ms for relative-time formatting.
 * @param props.onOpen - open a session by id.
 * @param props.onRenameRequest - open the rename dialog from a title double-click (id + current title).
 * @param props.renderSlot - render the row's `sidebar.workspaces.session.menu.item` and `sidebar.workspaces.session.row.action` lists.
 * @param props.onReveal - scroll this row into view after search navigation, then acknowledge it.
 * @param props.drag - optional row-drag target wiring; blank rows cannot start a drag.
 * @param props.flat - omit the empty status slot in the hierarchy-free flat list.
 * @param props.t - the browser root's locale seat.
 * @returns the session row.
 */
export declare function SessionNodeItem({ node, currentId, now, onOpen, onRenameRequest, renderSlot, onReveal, drag, flat, t, }: {
    node: SessionNode;
    currentId: string | undefined;
    now: number;
    onOpen: (id: SessionNode['id']) => void;
    /** Open the rename dialog from a title double-click (id + current title). */
    onRenameRequest: (id: SessionNode['id'], currentTitle: string) => void;
    /** Scroll this row into view after search navigation, then acknowledge it. */
    onReveal?: (() => void) | undefined;
    /** Present on reorderable-list rows so every row can remain a drop target. */
    drag?: RowDragProps | undefined;
    /** The row is rendered without a parent Workspace header. */
    flat?: boolean | undefined;
    t: RowTranslate;
} & PropsRenderSlots<'sidebar.workspaces.session.menu.item' | 'sidebar.workspaces.session.row.action'>): import("react").JSX.Element;
export {};
//# sourceMappingURL=Rows.d.ts.map
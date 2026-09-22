import type { ArchiveSessionInjected, SessionArchiveConfirmProps, SessionMenuItemProps, SessionRowActionProps } from '../contract/slots.ts';
/**
 * Menu row (order 400): archive, or restore an archived row.
 * @param props - owner share, the archive share, and the menu open state.
 * @returns the row.
 */
export declare function ArchiveSessionMenuItem({ sessionId, useArchived, useMenuOpenState, archiveSession, unarchiveSession, t, }: SessionMenuItemProps<ArchiveSessionInjected>): import("react").JSX.Element;
/**
 * Hover button (order 100): archive, or restore an archived row.
 * @param props - owner share and the archive share.
 * @returns the button.
 */
export declare function ArchiveSessionRowButton({ sessionId, useArchived, archiveSession, unarchiveSession, t, }: SessionRowActionProps<ArchiveSessionInjected>): import("react").JSX.Element;
/**
 * The `shell.overlay` entry: nothing while no confirmation is pending,
 * otherwise one dialog per request (keyed by the Session). Confirming asks
 * the Host to stop the listed work and archive; cancelling leaves the
 * Session running and visible.
 * @param props - the request hook, its settlement, the stop-and-archive hop, and the locale seat.
 * @returns the open dialog, or null.
 */
export declare function SessionArchiveConfirmDialog({ useArchiveRequest, settleSessionArchive, stopAndArchiveSession, t, }: SessionArchiveConfirmProps): import("react").JSX.Element | null;
//# sourceMappingURL=ArchiveSession.d.ts.map
import type { RenameSessionInjected, SessionMenuItemProps, SessionRenameDialogProps } from '../contract/slots.ts';
/**
 * Menu row (order 200): ask for the rename dialog, seeded with the row's current title.
 * @param props - owner share, menu open state, and the rename share.
 * @returns the row.
 */
export declare function RenameSessionMenuItem({ sessionId, displayTitle, useMenuOpenState, requestSessionRename, t, }: SessionMenuItemProps<RenameSessionInjected>): import("react").JSX.Element;
/**
 * The `shell.overlay` entry: nothing while no rename is requested, otherwise
 * one dialog per request (keyed by the Session, so a new request starts a
 * fresh draft). Sessions have no client-side name-conflict rule (the host
 * normalizes), and unlike Workspace rename an unchanged title is NOT
 * blocked: confirming the current automatic title is the gesture that pins it.
 * @param props - the request hook, its settlement, the rename hop, and the locale seat.
 * @returns the open dialog, or null.
 */
export declare function SessionRenameDialog({ useRenameRequest, settleSessionRename, renameSession, t }: SessionRenameDialogProps): import("react").JSX.Element | null;
//# sourceMappingURL=RenameSession.d.ts.map
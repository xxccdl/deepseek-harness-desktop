import type { RowToastProps } from '../contract/slots.ts';
/**
 * Render the current notice: the archived and stopped-and-archived notices
 * with their undo action — plus the show-archived action while archived rows
 * are hidden — on a 6 s hold, a refused Session creation with the Host's
 * reason on the same hold, or a plain warning for a failed pin, an archived
 * row that was clicked, or default Workspace creation.
 * @param props - the notice hook, the shared viewing store, the notice dismissal, the two archived-notice actions, and the locale seat.
 * @returns the notice on display, or null.
 */
export declare function RowActionToast({ useToast, useStore, dismissToast, undoArchive, showArchived, t }: RowToastProps): import("react").JSX.Element | null;
//# sourceMappingURL=RowActionToast.d.ts.map
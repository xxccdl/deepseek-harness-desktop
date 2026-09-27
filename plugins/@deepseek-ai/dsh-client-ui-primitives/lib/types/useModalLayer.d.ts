import type { RefObject } from 'react';
/** Dialog and menu elements whose document order determines foreground shortcut ownership. */
export declare const modalSelector = "[role=\"dialog\"][aria-modal=\"true\"], [role=\"menu\"]";
/**
 * Request closure of the foreground registered modal using its current onClose callback.
 * A newer menu or unregistered dialog blocks dismissal of the modal behind it.
 * @param document - product document whose modal owns the close command.
 */
export declare function closeTopModal(document: Document): void;
/**
 * Whether an anchor belongs behind the current modal and must yield keyboard input.
 * @param anchor - local control owning the input handler.
 * @returns true when another modal owns the foreground.
 */
export declare function isBehindModal(anchor: HTMLElement | null): boolean;
/**
 * Give only the top modal Escape and Tab ownership, then restore its previous focus.
 * Automatic entry and return focus omit outlines; keyboard traversal retains its indicators.
 * Controls mounted with the dialog use data-modal-autofocus for initial focus;
 * React autoFocus runs before this layer can capture the invoking control.
 * Local menus handle their Escape during capture before this bubble listener.
 * @param dialog - mounted dialog element.
 * @param open - whether this layer is active.
 * @param onClose - top-layer Escape or application close action.
 */
export declare function useModalLayer(dialog: RefObject<HTMLElement | null>, open: boolean, onClose: () => void): void;
//# sourceMappingURL=useModalLayer.d.ts.map
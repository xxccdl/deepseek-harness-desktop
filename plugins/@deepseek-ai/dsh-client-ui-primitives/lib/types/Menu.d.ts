import type { ReactNode } from 'react';
/** Selectable row (optionally with a nested submenu). */
export interface MenuItem {
    id: string;
    label: ReactNode;
    disabled?: boolean;
    /** Leading icon (figma .Menu_cell gap 8). */
    icon?: ReactNode;
    /** Destructive row: error-colored text/icon and danger hover fill. */
    danger?: boolean;
    /** Nested card opened to the right on hover/focus. */
    submenu?: readonly MenuItem[];
}
/** Hairline between item groups (not selectable). */
export interface MenuSeparator {
    type: 'separator';
    id: string;
}
/** Non-interactive heading row above a group of items. */
export interface MenuLabel {
    type: 'label';
    id: string;
    text: string;
}
/** One primary-menu entry: a row, a separator, or a heading label. */
export type MenuEntry = MenuItem | MenuSeparator | MenuLabel;
/** Props for one component-rendered menu row. */
export interface MenuItemButtonProps {
    /** Visible row label. */
    children: ReactNode;
    /** Leading icon (figma .Menu_cell gap 8). */
    icon?: ReactNode;
    /** Whether the row cannot be activated. */
    disabled?: boolean;
    /** Destructive row: error-colored text/icon and danger hover fill. */
    danger?: boolean;
    /**
     * Start a new group: a hairline above this row, the same one a
     * `{ type: 'separator' }` data entry draws. It comes and goes with the row,
     * so a row that renders nothing leaves no stray line; a data separator
     * directly before it draws no second line, and the list's first row draws none.
     */
    separatorBefore?: boolean;
    /** Row activation (click, Enter, or Tab on the focused row). */
    onSelect: () => void;
}
/**
 * Render one `role="menuitem"` row for a {@link Menu} whose rows are
 * components rather than `items` data: the same markup and styling as a data
 * row, so it joins the list's keyboard walk and post-selection focus return
 * without any shared state. Closing the menu stays the owner's decision, as
 * it is for data rows.
 * @param props.children - visible row label.
 * @param props.icon - optional leading icon.
 * @param props.disabled - whether the row cannot be activated.
 * @param props.danger - whether to use the destructive row colors.
 * @param props.separatorBefore - whether this row starts a new group (hairline above it).
 * @param props.onSelect - row activation callback.
 * @returns one menu-item row.
 */
export declare function MenuItemButton({ children, icon, disabled, danger, separatorBefore, onSelect, }: MenuItemButtonProps): import("react").JSX.Element;
/**
 * Render an anchored dropdown menu. While the list is open its keys mirror the
 * composer's: Tab settles the focused row — from the trigger, Tab enters the
 * list instead — and Escape or Shift+Tab close it and return focus to the
 * anchor's first button, and selecting a row does the same — the rows unmount
 * with the list. Only a keyboard on the trigger or inside the list is
 * intercepted; Tab presses elsewhere on the page stay the browser's.
 * @param props.autoFocus - focus the first item on open; the arrow keys walk the list either way.
 * @param props.open - whether the list is showing (owner-controlled).
 * @param props.anchor - the trigger element (rendered in place).
 * @param props.items - selectable data rows and optional separators (default none; with no `children` either, the list is empty).
 * @param props.selectedId - row shown as selected.
 * @param props.selectedIds - rows shown as selected when a menu contains independent option groups.
 * @param props.onSelect - data-row activation callback (not called for disabled rows or submenu parents that only open children).
 * @param props.onClose - invoked on outside click, Escape, or a window blur
 * that moved focus into an iframe (the only signal a pointerdown inside a
 * cross-origin iframe leaves).
 * @param props.align - list alignment against the anchor (default 'start').
 * @param props.side - open below (`bottom`, default) or above (`top`) the anchor.
 * @param props.portal - render the list into document.body, fixed-positioned
 * from the anchor rect (repositions on scroll/resize while open). Use when an
 * ancestor's overflow clipping would crop the in-place list; default false
 * keeps the pure-CSS in-place behavior.
 * @param props.closeOnPointerLeave - close the list once the pointer has left
 * both trigger and list for the pointer grace (default false keeps it open
 * until outside click/Escape/selection). The grace makes the 4px trigger->list
 * gap and a brief overshoot survivable; coming back cancels the close.
 * @param props.dense - reduce vertical row spacing without changing the standard typography or card width.
 * @param props.compact - use reduced menu typography and spacing.
 * @param props.getAnchorRect - portal mode only: supply the anchor rect
 * directly (e.g. from a host-owned trigger button) instead of measuring the
 * Menu's own wrapper span. Required when the wrapper isn't itself laid out at
 * the trigger (render-prop anchors, effect-positioned proxies — measuring the
 * wrapper there races the host's layout effects). Called on open and on every
 * scroll/resize; return null to skip placement for that frame.
 * @param props.footer - rows pinned below the scrolling items area, separated
 * by a hairline; they stay visible while the items above scroll.
 * @param props.children - component rows rendered after `items` in the same
 * list, each a `role="menuitem"` button such as {@link MenuItemButton}; they
 * share the keyboard walk, the submenu exclusivity, and the post-selection
 * focus return.
 * @param props.selection - how a selected row is marked: a trailing check
 * (`'check'`, default — figma .Menu_cell) or the hover fill held on the row
 * with no check (`'fill'`, for icon-labelled rows where a trailing glyph
 * crowds the cell).
 * @param props.className - extra class on the anchor wrapper span.
 * @param props.listClassName - extra class on the dropdown card itself; the
 * only style hook that reaches a portaled list, which renders under
 * document.body outside the owner's DOM subtree.
 * @returns anchor wrapper with the conditional list.
 */
export declare function Menu({ open, anchor, items, children, selectedId, selectedIds, onSelect, onClose, align, side, portal, closeOnPointerLeave, dense, compact, autoFocus, selection, getAnchorRect, footer, className, listClassName }: {
    open: boolean;
    autoFocus?: boolean;
    anchor: ReactNode;
    items?: readonly MenuEntry[];
    children?: ReactNode;
    footer?: readonly MenuEntry[];
    selectedId?: string | undefined;
    selectedIds?: readonly string[] | undefined;
    onSelect?: (id: string) => void;
    onClose: () => void;
    align?: 'start' | 'end';
    side?: 'bottom' | 'top' | 'right';
    portal?: boolean;
    closeOnPointerLeave?: boolean;
    dense?: boolean;
    compact?: boolean;
    selection?: 'check' | 'fill';
    getAnchorRect?: () => DOMRect | null;
    className?: string | undefined;
    listClassName?: string | undefined;
}): import("react").JSX.Element;
//# sourceMappingURL=Menu.d.ts.map
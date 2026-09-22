import type { PinSessionInjected, SessionMenuItemProps, SessionRowActionProps } from '../contract/slots.ts';
/**
 * Menu row (order 100): pin or unpin by the row's current state; absent on archived rows.
 * @param props - owner share, the pin share, and the menu open state.
 * @returns the row, or null for an archived Session.
 */
export declare function PinSessionMenuItem(props: SessionMenuItemProps<PinSessionInjected>): import("react").JSX.Element | null;
/**
 * Hover button (order 200, rightmost: it lands where the rest-state pin marker sits); absent on archived rows.
 * @param props - owner share and the pin share.
 * @returns the button, or null for an archived Session.
 */
export declare function PinSessionRowButton(props: SessionRowActionProps<PinSessionInjected>): import("react").JSX.Element | null;
//# sourceMappingURL=PinSession.d.ts.map
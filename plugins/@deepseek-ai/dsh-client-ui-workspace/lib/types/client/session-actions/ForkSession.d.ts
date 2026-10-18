import type { ForkSessionInjected, SessionMenuItemProps } from '../contract/slots.ts';
/**
 * Menu row (order 300): fork at the Session's last completed turn; the child
 * arrives through the Host list beside its source. Absent when the access
 * snapshot excludes `session/fork` for this Session.
 * @param props - owner share, menu open state, access Hook, and the fork share.
 * @returns the row, or nothing when the caller may not fork this Session.
 */
export declare function ForkSessionMenuItem({ sessionId, useMenuOpenState, useShortcuts, useSessionAccess, forkSession, t, }: SessionMenuItemProps<ForkSessionInjected>): import("react").JSX.Element | null;
//# sourceMappingURL=ForkSession.d.ts.map
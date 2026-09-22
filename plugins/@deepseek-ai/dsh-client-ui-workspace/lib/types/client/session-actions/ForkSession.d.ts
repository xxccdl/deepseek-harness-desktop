import type { ForkSessionInjected, SessionMenuItemProps } from '../contract/slots.ts';
/**
 * Menu row (order 300): fork at the Session's last completed turn; the child
 * arrives through the Host list beside its source.
 * @param props - owner share, menu open state, and the fork share.
 * @returns the row.
 */
export declare function ForkSessionMenuItem({ sessionId, useMenuOpenState, forkSession, t }: SessionMenuItemProps<ForkSessionInjected>): import("react").JSX.Element;
//# sourceMappingURL=ForkSession.d.ts.map
import { type ReactNode } from 'react';
interface GroupState {
    isWarm: () => boolean;
    enter: (overCard: boolean) => void;
    leave: () => void;
    containsCard: (target: EventTarget | null) => boolean;
    shown: (owner: symbol, dismiss: () => void, element: HTMLElement) => void;
    release: (owner: symbol) => void;
}
/** Private coordination shared only by opted-in HoverCards inside one mounted group. */
export declare const HoverCardGroupContext: import("react").Context<GroupState | null>;
/**
 * Share first-display dwell across a list and its active portal, including the card's existing pointer grace.
 * @param props.children - list contents, including opted-in HoverCards.
 * @param props.className - classes for the physical list container.
 * @returns the list container and its private hover coordinator.
 */
export declare function HoverCardGroup({ children, className }: {
    children: ReactNode;
    className?: string;
}): import("react").JSX.Element;
export {};
//# sourceMappingURL=HoverCardGroup.d.ts.map
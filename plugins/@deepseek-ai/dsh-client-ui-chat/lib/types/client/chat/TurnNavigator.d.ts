import type { ChatViewSlotProps } from '../contract/slots.ts';
import type { TurnRailItem } from './turn-rail-items.ts';
interface TurnNavigatorProps {
    readonly items: readonly TurnRailItem[];
    readonly activeTurn: number | null;
    /** Turn whose jump is still paging history in; its mark pulses. */
    readonly busyTurn: number | null;
    readonly onNavigate: (item: TurnRailItem) => void;
    readonly t: ChatViewSlotProps['t'];
}
/** Imperative controls for known turns; unknown turn numbers are ignored. */
export interface TurnNavigatorHandle {
    /** @param turn - turn to activate through the navigation callback. */
    activateTurn(turn: number): void;
    /** @param turn - turn to center in the rail without navigating the transcript. */
    scrollToTurn(turn: number): void;
}
/**
 * Fixed-pitch rail of every known Turn — loaded marks scroll, unloaded marks
 * page history in first — with hover and focus previews. Overflow scrolls
 * inside the frame, gradient fades marking each scrollable end, and the
 * active mark centers only outside the fade-free band while the pointer is
 * elsewhere. Previews follow pointer movement or focus, not scrolling under
 * a stationary pointer.
 */
export declare const TurnNavigator: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<TurnNavigatorProps & import("react").RefAttributes<TurnNavigatorHandle>>>;
export {};
//# sourceMappingURL=TurnNavigator.d.ts.map
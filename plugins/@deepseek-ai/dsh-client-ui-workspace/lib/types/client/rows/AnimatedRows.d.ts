/** React-commit-driven movement and entry/exit fades for the sidebar's keyed rows. */
import { Component, type ReactNode } from 'react';
interface AnimatedRowsProps {
    children: ReactNode;
    className: string;
    label: string;
    /** Unique DOM-order keys matching the rendered data-row-key attributes. */
    rowKeys: readonly string[];
    ready: boolean;
    /** Changes that replace the view or reveal hidden rows settle immediately. */
    resetKey: string;
}
interface RowPosition {
    element: HTMLElement;
    rect: DOMRect;
    opacity: number;
}
interface RowSnapshot {
    positions: Map<string, RowPosition>;
    removed: Map<string, RowPosition>;
}
/**
 * Animates keyed sidebar rows only when their rendered membership or order changes.
 * Motion starts after the first pointer or keyboard input inside the mounted list.
 * The parent supplies a positioned container for the inert exit overlay.
 */
export declare class AnimatedRows extends Component<AnimatedRowsProps> {
    private armed;
    private readonly list;
    private readonly overlay;
    private readonly movements;
    private readonly exits;
    getSnapshotBeforeUpdate(previous: AnimatedRowsProps): RowSnapshot | null;
    componentDidUpdate(previous: AnimatedRowsProps, _state: unknown, snapshot: RowSnapshot | null): void;
    componentWillUnmount(): void;
    private readPositions;
    private move;
    private cancelMovements;
    private removeExit;
    private clear;
    render(): ReactNode;
}
export {};
//# sourceMappingURL=AnimatedRows.d.ts.map
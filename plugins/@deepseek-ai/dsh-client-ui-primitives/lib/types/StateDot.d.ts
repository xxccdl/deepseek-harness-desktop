/**
 * State semantic: green done / amber user-attention / tertiary-grey loading /
 * red error / neutral-grey idle for a tracked subject with nothing in progress.
 */
export type StateDotState = 'done' | 'warning' | 'ongoing' | 'error' | 'idle';
/**
 * Render a state dot.
 * @param props.state - which of `done`, `warning`, `ongoing`, `error`, or `idle` to show.
 * @param props.size - outer diameter in px; defaults to 14 for ongoing and 10 for solid states.
 * @param props.className - extra class for layout placement.
 * @param props.appearance - compact dot by default; step uses a filled check or hollow pending circle.
 * @returns the dot element (aria-hidden; pair with text for accessibility).
 */
export declare function StateDot({ state, size, className, appearance }: {
    state: StateDotState;
    size?: number | undefined;
    className?: string | undefined;
    appearance?: 'dot' | 'step';
}): import("react").JSX.Element;
//# sourceMappingURL=StateDot.d.ts.map
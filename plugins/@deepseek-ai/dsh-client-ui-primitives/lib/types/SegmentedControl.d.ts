/** One segment of a {@link SegmentedControl}. */
export interface SegmentedControlOption<Value extends string> {
    /** The value the owner receives when this segment is chosen. */
    value: Value;
    /** Localized segment text. */
    label: string;
    /** Whether the segment refuses selection. */
    disabled?: boolean;
    /** Localized hover text, typically why the segment is locked. */
    title?: string;
}
/**
 * Render a segmented control.
 * @param props.id - the owner's base id: each tab is `<id>-<value>` and names
 * `<id>-<value>-panel` as the panel it controls.
 * @param props.value - the selected option's value; the control is fully controlled.
 * @param props.options - the segments in display order; at least two.
 * @param props.onChange - called with the value a click or a walk key asks for,
 * never with the value already selected.
 * @param props.label - localized accessible name of the tablist.
 * @param props.disabled - lock every segment, typically while the shown panel
 * has a write or a fetch in flight that switching would orphan.
 * @param props.className - extra class for layout placement.
 * @returns the tablist element.
 */
export declare function SegmentedControl<Value extends string>({ id, value, options, onChange, label, disabled, className, }: {
    id: string;
    value: Value;
    options: readonly SegmentedControlOption<Value>[];
    onChange: (next: Value) => void;
    label: string;
    disabled?: boolean;
    className?: string | undefined;
}): import("react").JSX.Element;
//# sourceMappingURL=SegmentedControl.d.ts.map
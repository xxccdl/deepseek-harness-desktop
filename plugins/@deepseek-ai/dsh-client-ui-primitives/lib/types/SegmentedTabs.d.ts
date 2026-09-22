import type { ReactNode } from 'react';
/** A tab links its localized label to a caller-owned panel. */
export interface SegmentedTab<Value extends string = string> {
    value: Value;
    label: ReactNode;
    id: string;
    panelId: string;
}
/**
 * Render equal-width, controlled tabs with a sliding selection indicator.
 * @param props.items - non-empty ordered tabs with unique values and DOM ids.
 * @param props.value - selected value, which must belong to items.
 * @param props.onChange - selection requested by click, Left/Right, or Home/End.
 * Keyboard selection also moves focus; only the selected tab is a tab stop.
 * @param props.label - localized accessible name for the tab list.
 * @param props.className - layout placement; panels remain caller-owned.
 * @returns the tab list, without its panels.
 */
export declare function SegmentedTabs<Value extends string>({ items, value, onChange, label, className }: {
    items: readonly [SegmentedTab<Value>, ...SegmentedTab<Value>[]];
    value: Value;
    onChange: (value: Value) => void;
    label: string;
    className?: string | undefined;
}): ReactNode;
//# sourceMappingURL=SegmentedTabs.d.ts.map
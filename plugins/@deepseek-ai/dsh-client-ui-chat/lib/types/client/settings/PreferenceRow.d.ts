/**
 * Render a preference label and its menu; selection restores focus before publishing the new value.
 * @param props - localized copy, selected value, choices, and mutation callback.
 * @returns the settings row.
 */
export declare function PreferenceRow({ title, description, value, selectedLabel, options, onSelect }: {
    title: string;
    description: string;
    value: string;
    selectedLabel: string;
    options: readonly {
        id: string;
        label: string;
    }[];
    onSelect: (value: string) => void;
}): import("react").JSX.Element;
//# sourceMappingURL=PreferenceRow.d.ts.map
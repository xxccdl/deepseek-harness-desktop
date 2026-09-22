/** Controlled native checkbox with a caller-owned visible and accessible label. */
/**
 * Render a labeled checkbox with native keyboard and form semantics.
 * @param props.checked - current checked state.
 * @param props.onChange - receives the requested checked state.
 * @param props.label - localized visible and accessible label.
 * @param props.disabled - whether the control refuses changes.
 * @param props.title - optional localized hover text.
 * @param props.className - extra class for the label's placement.
 * @returns the label containing its checkbox.
 */
export declare function Checkbox({ checked, onChange, label, disabled, title, className }: {
    checked: boolean;
    onChange: (next: boolean) => void;
    label: string;
    disabled?: boolean;
    title?: string | undefined;
    className?: string | undefined;
}): import("react").JSX.Element;
//# sourceMappingURL=Checkbox.d.ts.map
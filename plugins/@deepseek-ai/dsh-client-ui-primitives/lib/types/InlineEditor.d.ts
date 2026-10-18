/** Multi-line inline editor for short saved-on-Enter drafts such as queued messages and goals. */
/**
 * Render an autofocused textarea that grows with its text up to six lines, then scrolls.
 * A textarea rather than an input: HTML strips newlines from single-line input values.
 * Enter saves, Shift+Enter breaks the line, Enter during IME composition does nothing,
 * and Escape cancels.
 * @param props.value - current draft text.
 * @param props.label - localized accessible name.
 * @param props.onChange - receives the edited text.
 * @param props.onSave - called for a plain Enter.
 * @param props.onCancel - called for Escape.
 * @param props.className - extra class for the editor's placement.
 * @returns the textarea.
 */
export declare function InlineEditor({ value, label, onChange, onSave, onCancel, className }: {
    value: string;
    label: string;
    onChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
    className?: string;
}): import("react").JSX.Element;
//# sourceMappingURL=InlineEditor.d.ts.map
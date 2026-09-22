/** Field state and localized controls supplied by the owning form. */
export interface ConfigFieldProps {
    /** Display label from the owning plugin. */
    label: string;
    /** Editable text; containers may use JSON. */
    value: string;
    /** Hide the input text and disable browser password autofill. */
    secret: boolean;
    /** Finite choices; an empty list uses a text control. */
    choices: readonly string[];
    /** Whether the field is currently read-only. */
    disabled: boolean;
    /** Whether the field has a user override. */
    overridden: boolean;
    /** Whether the draft fails validation. */
    invalid: boolean;
    /** Localized reset, inherited-value choice, and validation text. */
    labels: {
        reset: string;
        inherited: string;
        invalid: string;
    };
    /** Stage a new text value. */
    onChange: (value: string) => void;
    /** Stage removal of the user override. */
    onReset: () => void;
}
/** Render a field without owning its schema, draft, or persistence.
 * @param props Controlled field state and actions.
 * @returns A labelled input with reset and validation feedback.
 */
export declare function ConfigField(props: ConfigFieldProps): import("react").JSX.Element;
//# sourceMappingURL=ConfigField.d.ts.map
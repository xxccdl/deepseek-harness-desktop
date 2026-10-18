import type { InputHTMLAttributes, ReactNode } from 'react';
import type { en } from './locales.ts';
/** Input attributes and section copy for the current credential draft. */
interface ApiKeyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'type' | 'className' | 'autoComplete'> {
    /** Unsaved input; stored credentials are never read into this field. */
    readonly value: string;
    /** Section copy, including the same reveal labels as SecretText. */
    readonly t: (key: keyof typeof en) => string;
}
/**
 * Reveal only a nonempty draft; a different value starts masked, as in SecretText.
 * @param props - current draft, input attributes, and translated control labels.
 * @returns a password input with an optional reveal button.
 */
export declare function ApiKeyInput({ value, t, ...props }: ApiKeyInputProps): ReactNode;
export {};
//# sourceMappingURL=ApiKeyInput.d.ts.map
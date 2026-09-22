/** Input-type declarations shared by the DeepSeek and pi-ai catalog editors. */
import type { ReactNode } from 'react';
import type { DeepSeekModelDraft } from './DeepSeekModelsEditor.tsx';
import type { ModelsKey } from './locales.ts';
/** Props of {@link ModelInputTypes}. */
interface ModelInputTypesProps {
    /** Effective model row, including fields outside the curated editor. */
    model: DeepSeekModelDraft;
    /** Adapter-owned field; pi-ai inherits capabilities when absent or empty. */
    field: 'inputModalities' | 'input';
    /** One-based row position for the accessible group label. */
    position: number;
    /** Prevent changes while read-only or saving. */
    disabled: boolean;
    /** Installed model or provider defaults when the row does not declare input types. */
    fallback?: readonly string[] | undefined;
    /** Section copy. */
    t: (key: ModelsKey) => string;
    /** Replace this row, preserving unrelated configuration. */
    onChange: (model: DeepSeekModelDraft) => void;
}
/**
 * Edit a nonempty set of input types, displaying inherited types before an override exists.
 * @param props - model declaration and row replacement action.
 * @returns the labeled text and image checkboxes.
 */
export declare function ModelInputTypes({ model, field, position, disabled, fallback, t, onChange }: ModelInputTypesProps): ReactNode;
export {};
//# sourceMappingURL=ModelInputTypes.d.ts.map
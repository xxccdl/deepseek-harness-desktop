/** Shared model fields and actions for both adapter catalog editors. */
import type { ReactNode } from 'react';
import type { DeepSeekModelDraft } from './DeepSeekModelsEditor.tsx';
import type { ModelsKey } from './locales.ts';
/** A capacity's editable text and adapter-specific inherited hint. */
interface CapacityInput {
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
}
/** Adapter-owned data and actions for one model row. */
interface ModelRowProps {
    model: DeepSeekModelDraft;
    position: number;
    inputField: 'inputModalities' | 'input';
    inputFallback?: readonly string[] | undefined;
    inputLoading?: boolean;
    expanded: boolean;
    disabled: boolean;
    t: (key: ModelsKey) => string;
    contextWindow: CapacityInput;
    maxTokens: CapacityInput;
    onFieldChange: (field: 'id' | 'name', value: string | undefined) => void;
    onIdBlur?: (value: string) => void;
    onChange: (model: DeepSeekModelDraft) => void;
    onToggle: () => void;
    onRemove: () => void;
}
/**
 * Render consistent model identity, capacity, and input-type controls.
 * @param props - drafted fields and their owning editor's actions.
 * @returns one expandable model entry.
 */
export declare function ModelRow(props: ModelRowProps): ReactNode;
export {};
//# sourceMappingURL=ModelRow.d.ts.map
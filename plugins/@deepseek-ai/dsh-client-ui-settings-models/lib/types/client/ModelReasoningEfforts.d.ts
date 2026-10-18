/** Reasoning-level declarations for a model on a hand-declared pi-ai route. */
import type { ReactNode } from 'react';
import type { DeepSeekModelDraft } from './DeepSeekModelsEditor.tsx';
import type { ModelsKey } from './locales.ts';
/** A reasoning-level failure the Models cards name by row. */
export interface ReasoningEffortsFailure {
    /** Zero-based model position. */
    index: number;
    /** Message key owned by the Models settings section. */
    key: 'modelReasoningValueRequired' | 'modelReasoningNeedsLevel';
}
/**
 * Mirror the pi-ai refusals of a hand-declared `reasoningEfforts`, so a card
 * names the row instead of failing at the write.
 * @param value - drafted `models` value, or `undefined` while inherited.
 * @returns the first refused row, or `undefined` when the adapter will accept every row.
 */
export declare function validateReasoningEfforts(value: unknown): ReasoningEffortsFailure | undefined;
/** Props of {@link ModelReasoningEfforts}. */
interface ModelReasoningEffortsProps {
    /** Effective model row, including fields outside the curated editor. */
    model: DeepSeekModelDraft;
    /** Levels the adapter's schema accepts as `reasoningEfforts` keys, in escalation order. */
    levels: readonly string[];
    /** One-based row position for accessible names. */
    position: number;
    /** Prevent changes while read-only or saving. */
    disabled: boolean;
    /** Section copy. */
    t: (key: ModelsKey) => string;
    /** Replace this row, preserving unrelated configuration. */
    onChange: (model: DeepSeekModelDraft) => void;
}
/**
 * Edit the `reasoningEfforts` a hand-declared pi-ai model offers: a switch,
 * then one row per level pairing the level with the value sent for it. Every
 * row is read from the model, so a reused instance shows its new model.
 * @param props - model declaration and row replacement action.
 * @returns the reasoning-level group.
 */
export declare function ModelReasoningEfforts({ model, levels, position, disabled, t, onChange }: ModelReasoningEffortsProps): ReactNode;
export {};
//# sourceMappingURL=ModelReasoningEfforts.d.ts.map
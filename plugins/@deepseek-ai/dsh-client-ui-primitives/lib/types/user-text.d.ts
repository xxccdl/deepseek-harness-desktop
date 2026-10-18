/** Inline text and reference presentation; business rules supply resolved JSON data and actions. */
import type { ReactNode } from 'react';
import { type ReferenceIconKind } from './ReferenceIcon.tsx';
/** Plain text follows the wrapping and typography of its host. */
export interface UserTextRunProps {
    readonly text: string;
}
/**
 * Render an uninterpreted inline text run.
 * @param props - text retained verbatim from the caller's document.
 * @returns one inline run without Markdown or reference recognition.
 */
export declare function UserTextRun({ text }: UserTextRunProps): ReactNode;
/** Presentation selected by a reference renderer, independent of its matching grammar. */
export interface ReferenceChipProps {
    readonly appearance: ReferenceIconKind | 'skill' | 'command';
    readonly label: string;
    readonly title: string;
    /** Absent for display-only references and previews. */
    readonly onActivate?: () => void;
}
/**
 * Render a reference label or its explicitly supplied activation action.
 * Text selection and repeated pointer clicks do not activate the reference.
 * @param props - resolved visual fields and optional action from the owning renderer.
 * @returns an inline label, or a keyboard-accessible button when activation is supplied.
 */
export declare function ReferenceChip({ appearance, label, title, onActivate }: ReferenceChipProps): ReactNode;
//# sourceMappingURL=user-text.d.ts.map
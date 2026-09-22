/** General Settings row for work-details presentation. */
import type { SnapshotStore } from '@deepseek-ai/dsh-client-store';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import { type TranscriptViewMode } from '../../chat-settings.ts';
/** Registration-side work-details preference face. */
export interface TranscriptViewRowInjected {
    hooks: {
        /** Persisted work-details preference bound as useTranscriptView. */
        transcriptView: SnapshotStore<TranscriptViewMode>;
    };
    /** Change the work-details presentation. */
    setTranscriptView: (mode: TranscriptViewMode) => void;
}
/** Full Settings-row props. */
export type TranscriptViewRowProps = PropsRuntime<'settings.general.item'> & PropsLocale<'chat'> & InjectFace<TranscriptViewRowInjected>;
/**
 * Render the work-details mode selector.
 * @param props - composed Settings slot props.
 * @returns the preference row.
 */
export declare function TranscriptViewRow({ useTranscriptView, setTranscriptView, t }: TranscriptViewRowProps): import("react").JSX.Element;
//# sourceMappingURL=TranscriptViewRow.d.ts.map
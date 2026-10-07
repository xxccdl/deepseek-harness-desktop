import type { Context } from '@deepseek-ai/cordis';
import type { InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { ToolCallViewProps, UserQuestionRecord } from '../../contract/slots.ts';
/** Injected panel verbs for the row's own Session, filled by the optional panel provider. */
interface AskQuestionPanelInjected {
    /**
     * Show one call's answer panel in the composer.
     * @param callId - the row's own `ask_user_question` call.
     * @returns whether a panel for that call was there to show.
     */
    revealPanel: (callId: string) => boolean;
    /**
     * Show one settled call's recorded answers as a read-only panel.
     * @param callId - the row's own `ask_user_question` call.
     * @param record - the call's questions and recorded answers, read from this row.
     * @returns whether a panel provider was there to show it.
     */
    reviewPanel: (callId: string, record: UserQuestionRecord) => boolean;
}
type AskQuestionRowProps = ToolCallViewProps & PropsLocale<'conversation'> & InjectFace<AskQuestionPanelInjected>;
/** Summarizes a pending, answered, cancelled, or interrupted question set. */
export declare function AskQuestionRow({ callId, toolName, block, inspect, useDisclosure, useProjection, revealPanel, reviewPanel, t, }: AskQuestionRowProps): import("react").JSX.Element;
/** Registers the ask-user-question conversation row. */
export declare const askQuestionToolview: {
    name: string;
    inject: string[];
    apply(ctx: Context): void;
};
export {};
//# sourceMappingURL=ask-question-row.d.ts.map
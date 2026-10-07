import type { ToolRowProps } from './ToolRow.tsx';
type QuestionToolRowProps = Pick<ToolRowProps, 'useDisclosure' | 't' | 'summary' | 'bodyRaw' | 'output' | 'askQuestion' | 'state' | 'inspect'> & {
    readonly openPanel: () => boolean;
    readonly panelLabel: string;
};
/**
 * Render a question with its answer-panel entry point.
 * @param props - Question transcript, panel action, and disclosure state.
 * @returns The question's summary and optional expanded record.
 */
export declare function QuestionToolRow({ useDisclosure, t, summary, bodyRaw, output, askQuestion, state, inspect, openPanel, panelLabel, }: QuestionToolRowProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=QuestionToolRow.d.ts.map
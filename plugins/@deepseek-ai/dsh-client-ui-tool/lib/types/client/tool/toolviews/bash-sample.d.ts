import type { Context } from '@deepseek-ai/cordis';
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { ToolCallViewProps } from '../../contract/slots.ts';
type BashRowProps = ToolCallViewProps & PropsLocale<'conversation'>;
/**
 * Render expandable Bash output with an accessible lifecycle label. While the
 * call is preparing the row shows the description streamed so far and cannot expand.
 * @param props - tool call, Session sources, locale, and inspection callback.
 * @returns the Bash output row.
 */
export declare const BashRow: import("react").MemoExoticComponent<({ toolName, block, sessionId, useSessions, inspect, useDisclosure, t }: BashRowProps) => import("react").JSX.Element>;
/** Registers the standalone Bash conversation-row sample. */
export declare const bashToolviewSample: {
    name: string;
    inject: string[];
    apply(ctx: Context): void;
};
export {};
//# sourceMappingURL=bash-sample.d.ts.map
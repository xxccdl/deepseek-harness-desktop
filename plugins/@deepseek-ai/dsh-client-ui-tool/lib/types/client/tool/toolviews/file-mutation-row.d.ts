import type { Context } from '@deepseek-ai/cordis';
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { ToolCallViewProps } from '../../contract/slots.ts';
type FileMutationRowProps = ToolCallViewProps & PropsLocale<'conversation'>;
/**
 * Shows the path and decoded input size through preparation, execution, and
 * settlement, with the applied diff available once the call settles.
 */
export declare function FileMutationRow({ toolName, block, cwd, home, openFile, inspect, useDisclosure, t }: FileMutationRowProps): import("react").JSX.Element;
/** Registers the edit and write conversation rows. */
export declare const fileMutationToolview: {
    name: string;
    inject: string[];
    apply(ctx: Context): void;
};
export {};
//# sourceMappingURL=file-mutation-row.d.ts.map
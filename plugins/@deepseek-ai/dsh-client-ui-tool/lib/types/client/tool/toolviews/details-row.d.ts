import type { Context } from '@deepseek-ai/cordis';
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { ToolCallViewProps } from '../../contract/slots.ts';
/**
 * Present recorded entities, receipts, and report fields in the existing expandable row.
 * @param props - Tool call, row actions, and locale supplied by the keyed slot.
 * @returns A Tool row with structured details or generic input/output.
 */
export declare function DetailsRow({ toolName, block, cwd, home, openFile, inspect, useDisclosure, t }: ToolCallViewProps & PropsLocale<'conversation'>): import("react").JSX.Element;
/** Register recorded-result details through the standard atomic Tool slot. */
export declare const detailsToolview: {
    name: string;
    inject: string[];
    apply(ctx: Context): void;
};
//# sourceMappingURL=details-row.d.ts.map
import type { ChatViewSlotProps, CommandRowOwnerProps } from '../contract/slots.ts';
/** Card props: the owner payload plus the render site's locale seat (plain prop). */
export interface GenericCommandCardProps extends CommandRowOwnerProps {
    t: ChatViewSlotProps['t'];
    /** Command-specific running copy; absent uses the generic command label. */
    runningSummary?: string | undefined;
}
/**
 * Render a command summary and its lazily mounted multiline output.
 * @param props - command, locale, and optional running label.
 * @returns the command disclosure.
 */
export declare const GenericCommandCard: import("react").MemoExoticComponent<({ node, t, runningSummary }: GenericCommandCardProps) => import("react").JSX.Element>;
//# sourceMappingURL=GenericCommandCard.d.ts.map
/** Completed-Turn token usage action and its accounting details dialog. */
import type { TurnTokenUsage } from '../contract/chat-nodes.ts';
import type { ChatViewSlotProps } from '../contract/slots.ts';
export interface TurnUsagePanelProps {
    usage: TurnTokenUsage;
    /** The owning view's locale seat, passed down as a plain prop. */
    t: ChatViewSlotProps['t'];
}
/**
 * Turn-usage IconActions pill with a click-open Turn-usage details dialog.
 * @param props - Turn usage buckets and locale seat.
 * @returns The trigger and, while open, its portaled dialog anchored above the trigger.
 */
export declare function TurnUsagePanel({ usage, t }: TurnUsagePanelProps): import("react").JSX.Element;
//# sourceMappingURL=TurnUsagePanel.d.ts.map
/** Stable process container; display policy changes visibility, never member parents. */
import { type ComponentProps } from 'react';
import type { GroupKey } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { ChatFlowSlotProps } from '../contract/slots.ts';
import { ChatNodeSeat } from './ChatNodeSeat.tsx';
type SeatProps = Omit<ComponentProps<typeof ChatNodeSeat>, 'nodeKey' | 'groupPart'>;
type ChatGroupSeatProps = SeatProps & {
    readonly groupKey: GroupKey;
    readonly useChatGroup: ChatFlowSlotProps['useChatGroup'];
    readonly useGroupHeaderAction: ChatFlowSlotProps['useGroupHeaderAction'];
};
/** Render a process group with local disclosure and the existing outer-Turn visibility. */
export declare const ChatGroupSeat: import("react").MemoExoticComponent<({ groupKey, useChatGroup, useGroupHeaderAction, ...props }: ChatGroupSeatProps) => import("react").JSX.Element | null>;
export {};
//# sourceMappingURL=ChatGroupSeat.d.ts.map
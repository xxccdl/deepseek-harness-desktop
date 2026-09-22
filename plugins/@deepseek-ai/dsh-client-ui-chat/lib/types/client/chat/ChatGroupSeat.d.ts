/** Stable process container; display policy changes visibility, never member parents. */
import { type ComponentProps } from 'react';
import type { GroupKey } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { ChatViewSlotProps } from '../contract/slots.ts';
import { ChatNodeSeat } from './ChatNodeSeat.tsx';
type SeatProps = Omit<ComponentProps<typeof ChatNodeSeat>, 'nodeKey' | 'groupPart'>;
type ChatGroupSeatProps = SeatProps & {
    readonly groupKey: GroupKey;
    readonly useChatGroup: ChatViewSlotProps['useChatGroup'];
};
/** Render a process group with local disclosure and the existing outer-Turn visibility. */
export declare const ChatGroupSeat: import("react").MemoExoticComponent<({ groupKey, useChatGroup, ...props }: ChatGroupSeatProps) => import("react").JSX.Element | null>;
export {};
//# sourceMappingURL=ChatGroupSeat.d.ts.map
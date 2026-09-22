import type { ChatNodeOwnerProps, ChatViewSlotProps, UsePresentation } from '../contract/slots.ts';
import type { ChatNodeStore } from '../contract/snapshot.ts';
interface ChatNodeSeatProps extends ChatNodeOwnerProps {
    readonly nodeKey: string;
    /** A replaced Builder must rebind keyed hooks even when references and keys survive. */
    readonly nodeStore: ChatNodeStore;
    readonly useChatNode: ChatViewSlotProps['useChatNode'];
    readonly useChatNodeProcess: ChatViewSlotProps['useChatNodeProcess'];
    readonly usePresentation: UsePresentation;
    readonly useStore: ChatViewSlotProps['useStore'];
    readonly actions: ChatViewSlotProps['actions'];
    readonly renderSlot: ChatViewSlotProps['renderSlot'];
    readonly t: ChatViewSlotProps['t'];
}
/**
 * Subscribe, apply Turn-process visibility, and dispatch one stable Context key.
 * Policy reads select this seat's own conclusion, so a mode change re-renders
 * only seats whose visibility actually changes.
 */
export declare const ChatNodeSeat: import("react").MemoExoticComponent<({ nodeKey, groupPart, useChatNode, useChatNodeProcess, usePresentation, cwd, openFile, openSkill, inspectCall, forkAt, loadImage, renderMessageImages, fileMentions, useStore, actions, renderSlot, t, }: ChatNodeSeatProps) => import("react").JSX.Element | null>;
export {};
//# sourceMappingURL=ChatNodeSeat.d.ts.map
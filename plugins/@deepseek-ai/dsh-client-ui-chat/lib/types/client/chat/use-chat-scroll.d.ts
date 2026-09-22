/** Composes viewport operations, reading policy, and history navigation for Chat. */
import { type RefObject } from 'react';
import type { ChatSnapshot } from '../contract/snapshot.ts';
import type { ChatViewSlotProps } from '../contract/slots.ts';
import { type ChatNavigation, type ChatNavigationInput } from './use-chat-navigation.ts';
import { type ChatReadingState } from './use-chat-reading.ts';
/** Committed content and Session operations used to reconcile scroll ownership. */
export interface ChatScrollInput extends ChatNavigationInput {
    readonly chatScroll: ChatViewSlotProps['chatScroll'];
    readonly ready: boolean;
    readonly order: readonly string[];
    readonly lastKey: string | null;
    readonly lastIsUser: boolean;
    readonly steeringId: string | null;
    readonly submissionId: string | null;
    readonly running: boolean;
    readonly loadedTurns: ReturnType<ChatSnapshot['navigation']['items']>;
}
interface ChatScrollState extends ChatReadingState {
    readonly listRef: RefObject<HTMLDivElement>;
    readonly columnRef: RefObject<HTMLDivElement>;
    readonly busyTurn: number | null;
    readonly navigateToTurn: ChatNavigation['navigateToTurn'];
    readonly loadEarlier: ChatNavigation['loadEarlier'];
    readonly returnToBottom: () => void;
}
/**
 * Coordinate scroll policy after Chat content commits.
 * New submitted input supersedes pending reader sampling.
 * @param input - current Chat content, scroll memory, and history operations.
 * @returns element refs, visible reading state, and navigation callbacks.
 */
export declare function useChatScroll(input: ChatScrollInput): ChatScrollState;
export {};
//# sourceMappingURL=use-chat-scroll.d.ts.map
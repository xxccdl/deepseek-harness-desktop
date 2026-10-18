/** Per-Session Chat view store. */
import { type EngineStoreHandle } from '@deepseek-ai/dsh-client-store';
import type { ChatStoreState, TurnProcessViewEntry } from './contract/store.ts';
import type { TurnProcessSpec } from './contract/turn-process.ts';
type ChatActions = {
    setTurnProcessOpen: (draft: ChatStoreState, turn: number, answerStep: number, open: boolean) => void;
};
/**
 * Resolve the manual disclosure choice for one Turn.
 * @param state - Chat store snapshot.
 * @param turn - owning Turn.
 * @returns the Turn's stored entry, when present.
 */
export declare function storedTurnProcessEntry(state: Readonly<ChatStoreState>, turn: number): Readonly<TurnProcessViewEntry> | undefined;
/**
 * Whether a foldable Turn's process is open: the reader's choice for the current answer generation
 * wins; otherwise the latest completed Turn stays open until the next input, and older Turns fold.
 * @param state - Chat store snapshot.
 * @param spec - the Turn's process specification.
 * @param defaultOpen - whether this Turn is exempt from automatic folding.
 * @returns the effective open state.
 */
export declare function turnProcessOpen(state: Readonly<ChatStoreState>, spec: Pick<TurnProcessSpec, 'turn' | 'answerStep'>, defaultOpen: boolean): boolean;
/**
 * Create the Chat view store handle.
 * @returns a handle instantiated once per rendered Session scope.
 */
export declare function createChatStore(): EngineStoreHandle<ChatStoreState, ChatActions>;
export {};
//# sourceMappingURL=stores.d.ts.map
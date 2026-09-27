/** Shared settings viewing state for its mouse and command entry points. */
import { type EngineStoreHandle } from '@deepseek-ai/dsh-client-store';
type State = {
    open: boolean;
    activeId: string | undefined;
};
type Actions = {
    open(draft: State): void;
    close(draft: State): void;
    select(draft: State, id: string): void;
    openSection(draft: State, id: string): void;
};
/**
 * Declare the settings dialog state and its complete mutation API.
 * @returns one root-scoped store handle for the settings shell.
 */
export declare function createSettingsShellStore(): EngineStoreHandle<State, Actions>;
export {};
//# sourceMappingURL=shell-store.d.ts.map
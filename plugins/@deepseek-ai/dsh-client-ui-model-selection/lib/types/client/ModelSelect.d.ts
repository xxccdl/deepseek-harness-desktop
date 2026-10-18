import type { PropsLocale, PropsRenderSlots, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { ModelSelectInjected } from './slots.ts';
/**
 * Render the composer model seat.
 * @param props - owner share (locked) + injected face (shared directory
 * store/verbs) + the standard locale seat.
 * @returns the trigger and, while open, the two-level menu.
 */
export declare function ModelSelect({ locked, available, directory, load, select, t, renderSlot }: ModelSelectInjected & Pick<PropsRuntime<'conversation.input.model'>, 'locked'> & PropsLocale<'model'> & Omit<PropsRenderSlots<'conversation.input.model.label'>, 'SessionProvider'>): import("react").JSX.Element | null;
//# sourceMappingURL=ModelSelect.d.ts.map
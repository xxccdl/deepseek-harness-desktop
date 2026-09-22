import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store';
import type { UseDisclosure } from '../contract/slots.ts';
/**
 * Own one initially collapsed disclosure without an external subscription.
 * @param version - reset generation; unchanged generations retain local open state.
 * @returns the open state, an explicit setter, and a toggle action.
 */
export declare function useDisclosure(version?: number): ReturnType<UseDisclosure>;
/**
 * Bind a Hook without subscribing until a component calls it.
 * @param reset - stable source whose version advances when the seat is hidden by its Turn.
 * @returns a Hook with independent open state for each invocation.
 */
export declare function bindDisclosure(reset: ObservableSnapshot<number>): UseDisclosure;
//# sourceMappingURL=use-disclosure.d.ts.map
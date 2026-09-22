import type { Context } from '@deepseek-ai/cordis';
import type { HostObservable, InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { ToolCallViewProps } from '../../contract/slots.ts';
import { type TodoHistory } from '../models/todo-history.ts';
type TodoHistoryInjected = {
    hooks: {
        todoHistory: HostObservable<TodoHistory | undefined>;
    };
};
type TodoRowProps = ToolCallViewProps & PropsLocale<'conversation'> & InjectFace<TodoHistoryInjected>;
/** Summarizes a plan update without presenting a cancelled call as completed. */
export declare function TodoRow({ toolName, block, inspect, useDisclosure, useTodoHistory, useSession, t }: TodoRowProps): import("react").JSX.Element;
/** Registers the todo conversation row. */
export declare const todoToolview: {
    name: string;
    inject: string[];
    apply(ctx: Context): void;
};
export {};
//# sourceMappingURL=todo-row.d.ts.map
import { Service } from '@deepseek-ai/cordis';
import type { Context } from '@deepseek-ai/cordis';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import { ModelDirectory } from './directory.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        modelDirectories: ModelDirectoryResolver;
    }
}
/** The `ctx.modelDirectories` session model-selection service. */
export declare class ModelDirectoryResolver extends Service {
    static inject: string[];
    private readonly live;
    private readonly catalog;
    /**
     * @param ctx - owning root context (the service registers itself as `models`).
     */
    constructor(ctx: Context);
    /**
     * Resolve the per-session shared directory (lazy; the scope disposer
     * removes and disposes it). Unknown sessions fail loud.
     * @param sessionId - the owning session.
     * @returns the resident directory both entries share.
     */
    directoryFor(sessionId: SessionId): ModelDirectory;
}
//# sourceMappingURL=service.d.ts.map
import type { Volatile, Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
/** Runtime preferences projected to the browser. */
export interface Config {
    /** Last acknowledged welcome notice version. */
    welcomeNoticeVersion: Volatile<string | undefined>;
}
/** Live welcome preference. */
export declare const Config: z<Schemastery.ObjectS<NoInfer<{
    welcomeNoticeVersion: z<string, string, "volatile">;
}>>, Schemastery.ObjectT<NoInfer<{
    welcomeNoticeVersion: z<string, string, "volatile">;
}>>, "plain">;
/** The browser consumes the configuration form projection.
 * @param ctx Plugin context used for optional settings presentation.
 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map
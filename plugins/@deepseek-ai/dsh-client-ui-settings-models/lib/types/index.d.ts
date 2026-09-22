/** Host configuration and page bootstrap for Models credential onboarding. */
import type { Context } from '@deepseek-ai/cordis';
import { type Config } from './onboarding-config.ts';
export { Config } from './onboarding-config.ts';
/**
 * Publish the credential-onboarding choice before browser plugins activate.
 * @param ctx - Host context collecting the page's initialization data.
 * @param config - plugin options with schema defaults applied by the Loader.
 */
export declare function apply(ctx: Context, config: Config): void;
//# sourceMappingURL=index.d.ts.map
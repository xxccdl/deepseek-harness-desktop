import z from "@deepseek-ai/schemastery";
//#region lib/types/onboarding-config.js
/** Public page-bootstrap options shared by the Host and Client halves. */
/** Validate Host configuration and its public page-bootstrap payload. */
const Config = z.object({ credentialOnboarding: z.boolean().default(true) });
/** Page-global key carrying only the public onboarding options. */
const ONBOARDING_CONFIG_GLOBAL = "__DSH_MODELS_ONBOARDING__";
//#endregion
//#region lib/types/index.js
/** Host configuration and page bootstrap for Models credential onboarding. */
/**
* Publish the credential-onboarding choice before browser plugins activate.
* @param ctx - Host context collecting the page's initialization data.
* @param config - plugin options with schema defaults applied by the Loader.
*/
function apply(ctx, config) {
	ctx.on("webserver/index-inject", (table) => {
		table.push({
			kind: "global",
			name: ONBOARDING_CONFIG_GLOBAL,
			value: { credentialOnboarding: config.credentialOnboarding }
		});
	});
}
//#endregion
export { Config, apply };

import z from "@deepseek-ai/schemastery";
//#region lib/types/index.js
/** Live welcome preference. `dshOnboardingDone` is the desktop fork's durable
 *  marker for a finished first-run wizard: the shell boots the SPA on a fresh
 *  loopback port each launch, so the wizard's localStorage origin changes
 *  between runs and the flag has to live on the Host to survive. */
const Config = z.object({ welcomeNoticeVersion: z.string().volatile(), dshOnboardingDone: z.boolean().volatile() });
/** The browser consumes the configuration form projection.
* @param ctx Plugin context used for optional settings presentation.
*/
function apply(ctx) {
	ctx.inject(["settings"], (child) => {
		child.effect(() => child.settings.configure({ auto: false }, ctx.fiber));
	});
}
//#endregion
export { Config, apply };

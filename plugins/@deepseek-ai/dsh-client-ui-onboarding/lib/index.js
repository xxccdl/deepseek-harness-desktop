// Host half of dsh-client-ui-onboarding. The browser half (lib/client.js) owns
// the wizard and the tutorial section; this module only satisfies the plugin
// entry contract.
/** Cordis plugin name. */
const name = "ui-onboarding";
/** No host services are required. */
const inject = [];
/** No-op apply: the client half does the work. */
function apply() {}
export { apply, inject, name };

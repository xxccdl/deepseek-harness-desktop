// Host half of dsh-client-ui-enhance. The browser half (lib/client.js) owns
// every surface; this module only satisfies the plugin entry contract.
/** Cordis plugin name. */
const name = "ui-enhance";
/** No host services are required. */
const inject = [];
/** No-op apply: the client half does the work. */
function apply() {}
export { apply, inject, name };

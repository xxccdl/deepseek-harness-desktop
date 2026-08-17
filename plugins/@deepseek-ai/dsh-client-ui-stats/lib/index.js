// Host half of dsh-client-ui-stats. The browser half (lib/client.js) owns the
// stats section; this module only satisfies the plugin entry contract.
/** Cordis plugin name. */
const name = "ui-stats";
/** No host services are required. */
const inject = [];
/** No-op apply: the client half does the work. */
function apply() {}
export { apply, inject, name };

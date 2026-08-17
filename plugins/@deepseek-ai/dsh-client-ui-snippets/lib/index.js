// Host half of dsh-client-ui-snippets. The browser half (lib/client.js) owns
// the picker; this module only satisfies the plugin entry contract.
/** Cordis plugin name. */
const name = "ui-snippets";
/** No host services are required (the store is served by dsh-tool-snippets). */
const inject = [];
/** No-op apply: the client half does the work. */
function apply() {}
export { apply, inject, name };

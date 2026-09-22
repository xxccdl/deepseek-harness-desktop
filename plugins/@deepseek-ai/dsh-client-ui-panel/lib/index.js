// Host half of dsh-client-ui-panel. The browser half (lib/client.js) owns the
// DeepSeek peak/off-peak pricing chip in the composer dock. The drawer, its
// toggles and the header toolbar the package used to carry are gone.
/** Cordis plugin name. */
const name = "ui-panel";
/** No host services are required. */
const inject = [];
/** No-op apply: the client half does the work. */
function apply() {}
export { apply, inject, name };

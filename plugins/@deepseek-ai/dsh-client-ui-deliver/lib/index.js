// Host half of dsh-client-ui-deliver. The browser half (lib/client.js) owns the
// "产物标签 + 一键保存" surface; this module only satisfies the entry contract.
/** Cordis plugin name. */
const name = "ui-deliver";
/** No host services are required. */
const inject = [];
/** No-op apply: the client half does the work. */
function apply() {}
export { apply, inject, name };
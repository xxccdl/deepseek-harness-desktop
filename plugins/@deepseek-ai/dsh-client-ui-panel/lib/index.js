// Host half of dsh-client-ui-panel. The browser half (lib/client.js) owns the
// bottom drawer, the session header toolbar, and the pricing hint. The shared
// PowerShell it displays is served by `@deepseek-ai/dsh-host-shellpanel`.
/** Cordis plugin name. */
const name = "ui-panel";
/** No host services are required. */
const inject = [];
/** No-op apply: the client half does the work. */
function apply() {}
export { apply, inject, name };

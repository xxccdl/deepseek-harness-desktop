// Plugin market — host half.
//
// The surfaces live in the browser; everything they need from the host (the
// market's address, the install/uninstall verbs) arrives through the HTTP bridge
// `@deepseek-ai/dsh-host-plugin-market` publishes under /api/market/*. The host
// half therefore only has to exist for the loader to mount the package.
/** Cordis plugin name. */
const name = "ui-market";
/** No host services are needed. */
const inject = [];

/** No host-side contribution. */
function apply() {}

export { apply, inject, name };

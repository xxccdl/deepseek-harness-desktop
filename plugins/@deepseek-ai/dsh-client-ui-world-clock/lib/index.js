// World clock — host half.
//
// The whole plugin is a browser surface (a clock in the sidebar foot plus a
// world-clock panel), so there is no host-side contribution. The module still
// has to exist and export a Cordis plugin, because that is the entry the
// loader mounts and the file the market validates as the package entry.

/** Cordis plugin name. */
const name = "ui-world-clock";

/** No host services are required. */
const inject = [];

/** No host-side contribution: the client half owns everything. */
function apply() {}

export { apply, inject, name };

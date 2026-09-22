// Dino Jump — host half.
//
// The whole plugin is a browser surface (a playable runner game floating in the
// frame-wide overlay layer), so there is no host-side contribution here. The
// module still has to exist and export a Cordis plugin, because that is the
// entry the loader mounts and the file the market validates as the package
// entry point.

/** Cordis plugin name. */
const name = "ui-dino-game";

/** No host services are required. */
const inject = [];

/** No host-side contribution: the client half owns everything. */
function apply() {}

export { apply, inject, name };

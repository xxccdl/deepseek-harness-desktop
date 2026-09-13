/**
 * Host half of the floating ball.
 *
 * The whole feature lives in the browser: the client half registers one entry
 * in `shell.overlay` and owns every interaction. This half exists so the host
 * loader has a valid plugin entry to mount, and it deliberately contributes
 * nothing — no service, no tool, no configuration.
 */
export const name = 'client-ui-floating-ball'

export function apply() {}

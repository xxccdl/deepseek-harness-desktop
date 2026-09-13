/**
 * Host half of 外观美化 (UI theme polish).
 *
 * The whole feature lives in the browser: the client half stacks a single
 * token override layer over the active theme and registers one settings page.
 * This half exists so the host loader has a valid plugin entry to mount, and it
 * deliberately contributes nothing — no service, no tool, no configuration.
 */
export const name = 'client-ui-theme-polish'

export function apply() {}

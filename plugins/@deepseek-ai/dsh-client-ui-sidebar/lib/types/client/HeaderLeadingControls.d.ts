import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { SidebarRootInjected } from './contract/slots.ts';
/** Full props of the shell.leading occupant. */
export type HeaderLeadingControlsProps = PropsRuntime<'shell.leading'> & InjectFace<SidebarRootInjected> & PropsLocale<'sidebar'>;
/**
 * Sidebar-open and New Session controls in the frame's window-chrome seat.
 * On macOS desktop a collapsed sidebar hides entirely (no rail), taking both
 * controls off screen; this occupant puts them back beside the traffic
 * lights. The frame mounts the seat only in that state and owns its
 * placement, so the occupant renders unconditionally.
 * @param props - Injected sidebar actions plus the sidebar locale seat.
 * @returns the two window-chrome controls.
 */
export declare function HeaderLeadingControls({ toggleSidebar, startSession, t }: HeaderLeadingControlsProps): import("react").JSX.Element;
//# sourceMappingURL=HeaderLeadingControls.d.ts.map
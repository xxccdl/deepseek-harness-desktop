import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { DesktopUpdateView } from '../types.ts';
import type { SettingsRootInjected } from './shell-contract.ts';
type SettingsTranslate = PropsLocale<'settings'>['t'];
/**
 * @param props - Connection priority, sidebar width, and localized bridge-failure copy.
 * @returns Desktop-only status beside the account button, or nothing in browsers.
 */
export declare function DesktopUpdateIndicator({ wide, hidden, t, view, onOpen }: {
    wide: boolean;
    hidden: boolean;
    t: SettingsTranslate;
    view: DesktopUpdateView;
    onOpen: () => void;
}): import("react").JSX.Element | null;
type BadgeProps = PropsRuntime<'sidebar.toggle.badge'> & PropsLocale<'settings'> & Pick<InjectFace<SettingsRootInjected>, 'useDesktopUpdate' | 'useConnectionState'>;
/**
 * @param props - Framework-bound carrier and connection state.
 * @returns A non-interactive notification on the sidebar expand button.
 */
export declare function DesktopUpdateBadge({ useDesktopUpdate, useConnectionState, t }: BadgeProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=DesktopUpdateIndicator.d.ts.map
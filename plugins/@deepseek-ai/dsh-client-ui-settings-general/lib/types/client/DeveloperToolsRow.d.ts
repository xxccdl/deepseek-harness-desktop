import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
/** Accepted setting and ordered mutation supplied by the settings owner. */
export interface DeveloperToolsRowInjected {
    hooks: {
        developerTools: ObservableSnapshot<boolean>;
    };
    setEnabled(enabled: boolean): Promise<void>;
}
/**
 * Render the developer-tool toggle.
 * @param props - accepted preference, writer and localized copy.
 * @returns the General Settings row.
 */
export declare function DeveloperToolsRow({ useDeveloperTools, setEnabled, t }: PropsRuntime<'settings.general.item'> & PropsLocale<'settings'> & InjectFace<DeveloperToolsRowInjected>): import("react").JSX.Element;
//# sourceMappingURL=DeveloperToolsRow.d.ts.map
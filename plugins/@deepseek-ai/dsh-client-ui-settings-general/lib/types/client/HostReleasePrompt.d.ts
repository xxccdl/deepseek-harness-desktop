import type { ClientReleaseChange } from '@deepseek-ai/dsh-client-modules/client';
import type { HostObservable, InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
/** Registrant-private face: the page's release change and its two decisions. */
export type HostReleasePromptInjected = {
    /** Keep this page at its boot release and stop asking about the connected Host's release. */
    dismissRelease: () => void;
    /** Reload the page from the Host. */
    reloadPage: () => void;
    hooks: {
        /** Host release change owned by the page's module system. */
        releaseChange: HostObservable<ClientReleaseChange | undefined>;
    };
};
/** Overlay props: the root overlay owner share, the `settings` copy, and the injected face. */
export type HostReleasePromptProps = PropsRuntime<'shell.overlay'> & PropsLocale<'settings'> & InjectFace<HostReleasePromptInjected>;
/**
 * Ask whether to reload after the Host changed releases; closing the dialog keeps the page.
 * The service line shows the Host's completed switch from its previous release; the page line shows the
 * switch from the page's boot release that only a reload completes.
 * @param props - the release change, both decisions, and localized copy.
 * @returns the dialog while a change is announced; otherwise nothing.
 */
export declare function HostReleasePrompt({ useReleaseChange, dismissRelease, reloadPage, t }: HostReleasePromptProps): import("react").JSX.Element | null;
//# sourceMappingURL=HostReleasePrompt.d.ts.map
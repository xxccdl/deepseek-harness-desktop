/** General Settings row for Chat HTTP(S) link destinations. */
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { LinkOpening } from '../../chat-settings.ts';
/** Registration-side link-opening preference. */
export interface LinkOpeningRowInjected {
    hooks: {
        /** Current destination, bound as useLinkOpening. */
        linkOpening: ObservableSnapshot<LinkOpening>;
        /** Whether the built-in browser is registered, bound as useBrowserAvailable. */
        browserAvailable: ObservableSnapshot<boolean>;
    };
    /** Change the default destination for Chat HTTP(S) links. */
    setLinkOpening: (destination: LinkOpening) => void;
}
/** Full Settings-row props. */
export type LinkOpeningRowProps = PropsRuntime<'settings.general.item'> & PropsLocale<'chat'> & InjectFace<LinkOpeningRowInjected>;
/**
 * Render the link-opening destination selector.
 * @param props - Composed Settings slot props.
 * @returns The preference row.
 */
export declare function LinkOpeningRow({ useLinkOpening, useBrowserAvailable, setLinkOpening, t }: LinkOpeningRowProps): import("react").JSX.Element | null;
//# sourceMappingURL=LinkOpeningRow.d.ts.map
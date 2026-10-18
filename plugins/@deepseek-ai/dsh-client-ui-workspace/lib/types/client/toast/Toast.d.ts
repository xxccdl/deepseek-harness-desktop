import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { ArchiveToastEntryProps, ToastEntryProps, WorkspaceToastProps } from '../contract/toast.ts';
/**
 * Render one notice using the shared Factory.
 * @param props - Keyed payload, injected display mapping, locale, and Factory renderer.
 * @returns The shared Toast occurrence.
 */
export declare function ToastEntry<P extends PropsRuntime<'workspace.toast'>>(props: ToastEntryProps<P>): import("react").ReactNode;
/**
 * Keep the archive filter action reactive without subscribing unrelated notices.
 * @param props - Archive notice, display mapping, and the existing viewing store.
 * @returns The shared Toast occurrence with its current actions.
 */
export declare function ArchiveToastEntry(props: ArchiveToastEntryProps): import("react").ReactNode;
/**
 * Present plain display data with the shared primitive's timing and portal.
 * @param props - Localized display fields, display identity, and dismissal.
 * @returns One Toast, remounted only for a new display identity.
 */
export declare function WorkspaceToast({ seq, text, tone, holdMs, actions, onDone }: WorkspaceToastProps): import("react").JSX.Element;
//# sourceMappingURL=Toast.d.ts.map
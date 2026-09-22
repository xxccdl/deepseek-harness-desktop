import type { ReactNode } from 'react';
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store';
import type { InjectFace } from '@deepseek-ai/dsh-client-ui-slots';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import { type SessionLogDownloadDialogProps } from './Dialog.tsx';
import type { SessionLogDownloadDialogInjected } from './Dialog.tsx';
/** Session download controls with observable feedback availability and a Session feedback action. */
export interface SessionLogDownloadHeaderInjected extends SessionLogDownloadDialogInjected {
    hooks: SessionLogDownloadDialogInjected['hooks'] & {
        feedbackAvailable: ObservableSnapshot<boolean>;
    };
    /**
     * Open the existing Session feedback draft without recording feedback; no-op after the feedback plugin unloads.
     * @param sessionId - Session whose feedback form to open.
     */
    openFeedback: (sessionId: SessionId) => void;
}
/** Session download props plus the optional feedback action. */
export type SessionLogDownloadHeaderProps = SessionLogDownloadDialogProps & InjectFace<SessionLogDownloadHeaderInjected>;
/**
 * Render the Session Header menu with download and optional feedback actions.
 * @param props - Session runtime, download controller, and localized copy.
 * @returns the persistent Header action and Session-scoped dialog.
 */
export declare function SessionLogDownloadHeaderAction(props: SessionLogDownloadHeaderProps): ReactNode;
//# sourceMappingURL=HeaderAction.d.ts.map
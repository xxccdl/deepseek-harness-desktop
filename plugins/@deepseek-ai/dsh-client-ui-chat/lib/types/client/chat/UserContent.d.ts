import type { FactoryComponentPropsOf } from '@deepseek-ai/dsh-client-ui-slots';
/**
 * Render prepared text, ordered attachments, and references without message chrome.
 * The caller owns row identity, pending/echo state, time, and message actions.
 * @param props - prepared content, facts, authorized image loader, and framework Factory/locale seats.
 * @returns the content stack using the existing user-message layout.
 */
export declare function UserContent({ content, loadImage, facts, interactive, ellipsis, renderSlot, renderFactorySlot, t }: FactoryComponentPropsOf<'conversation.chat.user.content'>): import("react").JSX.Element;
//# sourceMappingURL=UserContent.d.ts.map
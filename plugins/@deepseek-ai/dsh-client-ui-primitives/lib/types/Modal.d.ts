import type { KeyboardEventHandler, ReactNode } from 'react';
interface ModalBaseProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children?: ReactNode;
    footer?: ReactNode;
    className?: string;
    contentClassName?: string;
    shortcutModal?: string;
    onKeyDownCapture?: KeyboardEventHandler<HTMLDivElement>;
    backdropBlur?: boolean;
}
type ModalProps = ModalBaseProps & ({
    headless: true;
    closeLabel?: never;
} | {
    headless?: false;
    closeLabel: string;
});
/**
 * Render a centered, body-portaled modal over a blurred page mask.
 * @param props.open - whether the dialog is showing.
 * @param props.onClose - application close command, Escape, or mask click; while a menu is open inside the
 * dialog, Escape belongs to that menu first.
 * @param props.title - dialog heading (aria-label in every mode).
 * @param props.closeLabel - localized accessible close-button label.
 * @param props.description - optional supporting sentence under the title.
 * @param props.children - dialog body; mark its initial-focus control with
 * data-modal-autofocus instead of React autoFocus to preserve return focus.
 * @param props.footer - action row (Cancel / Create).
 * @param props.contentClassName - optional class for a scrollable content region.
 * @param props.backdropBlur - disable when the caller already blurs the page; defaults to true.
 * @param props.shortcutModal - command scope allowed by shortcut owners; unnamed
 * dialogs block application commands unless their owner allows the "other" scope.
 * @param props.headless - render children directly in the card (no default
 * header/close/body chrome); mask, card, Escape, and aria-label remain.
 * @param props.onKeyDownCapture - handle a nested dialog's keys before the document Escape listeners.
 * @returns null when closed; otherwise the overlay tree.
 */
export declare function Modal({ open, onClose, title, closeLabel, description, children, footer, className, contentClassName, onKeyDownCapture, headless, backdropBlur, shortcutModal, }: ModalProps): import("react").ReactPortal | null;
export {};
//# sourceMappingURL=Modal.d.ts.map
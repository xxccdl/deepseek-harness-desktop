import { type ButtonHTMLAttributes, type ReactNode } from 'react';
/** Visual variant, each backed by its --dsw-alias-button-* token family. */
export type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'toolbar';
/**
 * Render a button.
 * @param props.variant - visual family (default 'ghost').
 * @param props.size - 'md' 36px control with 12px corners or 'sm' 28px control with 8px corners.
 * @param props.icon - optional leading 16px icon node.
 * @param ref - native button for focus management and overlay anchors.
 * @returns the button element; native button attributes pass through.
 */
export declare const Button: import("react").ForwardRefExoticComponent<{
    variant?: ButtonVariant;
    size?: "md" | "sm";
    icon?: ReactNode;
    className?: string | undefined;
    children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement> & import("react").RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=Button.d.ts.map
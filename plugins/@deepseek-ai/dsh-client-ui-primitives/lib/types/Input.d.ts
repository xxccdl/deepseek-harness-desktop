import { type InputHTMLAttributes, type ReactNode } from 'react';
/**
 * Render a text input with an optional leading icon.
 * @param props.icon - optional 16px leading icon node.
 * @param ref - the native input, cleared when it unmounts.
 * @returns wrapper span containing the native input; input attributes pass through.
 */
export declare const Input: import("react").ForwardRefExoticComponent<{
    icon?: ReactNode;
    className?: string;
} & InputHTMLAttributes<HTMLInputElement> & import("react").RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=Input.d.ts.map
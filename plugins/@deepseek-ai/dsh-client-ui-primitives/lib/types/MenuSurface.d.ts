/** Shared menu material and the macOS backing that lets Chromium blur transparent windows. */
import { type ComponentPropsWithoutRef } from 'react';
/** Menu containers preserve native div props and refs. */
export interface MenuSurfaceProps extends ComponentPropsWithoutRef<'div'> {
    /** Match the shared compact menu's smaller outer radius. */
    compact?: boolean;
}
/**
 * Paint a menu and, on macOS, an opaque backing behind the page content within its bounds.
 * CSS anchors keep each backing aligned during placement, resizing, and nested-menu movement.
 * @param props - Div content and placement, and compact geometry.
 * @param ref - The visible menu div, excluding the non-interactive backing.
 * @returns Menu content plus a backing portal removed with the menu.
 */
export declare const MenuSurface: import("react").ForwardRefExoticComponent<MenuSurfaceProps & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=MenuSurface.d.ts.map
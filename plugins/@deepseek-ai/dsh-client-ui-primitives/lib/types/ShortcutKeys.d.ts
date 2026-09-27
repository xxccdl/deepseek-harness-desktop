/**
 * Render one command's keycaps without owning binding defaults or localized copy.
 * @param props - effective key labels, presentation variant and optional interaction styling.
 * @returns unboxed keys by default, or tooltip keycaps with plus-separated combinations grouped together.
 */
export declare function ShortcutKeys({ keys, variant, className }: {
    keys: readonly string[];
    variant?: 'plain' | 'tooltip';
    className?: string | undefined;
}): import("react").JSX.Element;
//# sourceMappingURL=ShortcutKeys.d.ts.map
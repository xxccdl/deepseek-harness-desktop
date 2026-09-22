/** A single-line file path whose trailing characters remain visible in narrow toolbars. */
import { type HTMLAttributes } from 'react';
/**
 * Render subdued directories and a primary filename, with the complete path on hover.
 * Fitting text is left-aligned; overflow clips and fades at the left edge.
 * The fade updates on path changes and, when ResizeObserver is available, size changes.
 * @param props - File path and attributes for its outer span; callers own toolbar spacing.
 * @returns the path label.
 */
export declare function PathLabel({ path, className, ...attributes }: {
    path: string;
} & Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'title'>): import("react").JSX.Element;
//# sourceMappingURL=PathLabel.d.ts.map
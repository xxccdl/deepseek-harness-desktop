import { type ReactNode } from 'react';
/** Shared 24px disclosure chrome for compact flow rows. */
export interface DisclosureRowProps {
    icon: ReactNode;
    title: string;
    open: boolean;
    expandable: boolean;
    onToggle: () => void;
    /** Animate the title while its owning operation is running. */
    running?: boolean | undefined;
    /** Makes the complete title row the disclosure target. */
    expandOnRowClick?: boolean | undefined;
    /** Replaces the collapsed icon with a chevron while the row is hovered. */
    previewChevron?: boolean | undefined;
    /** Keeps `collapsedContent` inline while open. */
    keepContentWhenOpen?: boolean | undefined;
    collapsedContent?: ReactNode;
    children?: ReactNode;
    className?: string | undefined;
    rowClassName?: string | undefined;
    leadingClassName?: string | undefined;
    chevronClassName?: string | undefined;
    titleClassName?: string | undefined;
}
/**
 * Render one disclosure header and its controlled expanded content.
 * Shallow prop comparison requires stable callbacks and React nodes to skip unchanged renders.
 * @param props - Visual content, controlled state, and interaction policy.
 * @returns the disclosure row.
 */
export declare const DisclosureRow: import("react").MemoExoticComponent<({ icon, title, open, expandable, onToggle, running, expandOnRowClick, previewChevron, keepContentWhenOpen, collapsedContent, children, className, rowClassName, leadingClassName, chevronClassName, titleClassName, }: DisclosureRowProps) => import("react").JSX.Element>;
//# sourceMappingURL=DisclosureRow.d.ts.map
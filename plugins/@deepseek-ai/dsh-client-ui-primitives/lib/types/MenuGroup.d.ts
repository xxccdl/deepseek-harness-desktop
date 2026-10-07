/** Accessible menu groups with shared sticky-heading presentation and viewport observation. */
import { type ReactNode } from 'react';
/**
 * Render a named group with an instance-owned heading id and an inaccessible position sentinel.
 * @param props - Caller-localized label and optional menu rows.
 * @returns A section named by its direct heading, followed by the supplied children.
 */
export declare function MenuGroup({ label, children }: {
    label: string;
    children?: ReactNode;
}): import("react").JSX.Element;
/**
 * Update heading backgrounds asynchronously from native intersection and viewport-size observations.
 * Headings remain transparent until observations identify a section crossing the viewport top.
 * Without IntersectionObserver or ResizeObserver, CSS sticky headings remain transparent.
 * Group membership is captured at setup; dispose before observing changed groups or the same viewport again.
 * @param viewport - Unpadded, borderless scroll container with direct MenuGroup children.
 * @returns Cleanup owning both intersection observers and the viewport resize observer; disconnects
 * them, ignores queued callbacks, and clears managed data-stuck attributes. No valid groups acquires nothing.
 */
export declare function observeStickyMenuGroups(viewport: HTMLElement): () => void;
//# sourceMappingURL=MenuGroup.d.ts.map
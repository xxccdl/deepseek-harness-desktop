/**
 * Site marks for well-known external link hosts. {@link LinkIconMedium} renders one in
 * the leading glyph seat, so a familiar destination leads with its own mark
 * instead of the generic globe. The marks are the `simple-icons` artwork set
 * (CC0-1.0), pinned by this package's dependency on it; each mark takes the
 * link's `currentColor` rather than the brand fill that set records.
 */
import type { ReactElement } from 'react';
/** Props for {@link siteGlyph}: the destination plus the shared icon sizing seat. */
interface SiteGlyphProps {
    /** The link destination; only an absolute http(s) URL can name a host. */
    href: string | undefined;
    /** Square edge in px. */
    size: number;
    /** Extra class for layout placement. */
    className?: string | undefined;
}
/**
 * Render the site mark for a known external destination.
 * @param props - The destination and the icon sizing seat.
 * @returns The site's mark riding currentColor, or undefined for an unknown site.
 */
export declare function siteGlyph({ href, size, className }: SiteGlyphProps): ReactElement | undefined;
export {};
//# sourceMappingURL=SiteGlyph.d.ts.map
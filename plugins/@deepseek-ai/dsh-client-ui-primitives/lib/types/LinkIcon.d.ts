/**
 * Leading current-color category glyphs for clickable artifact links. The
 * public component keeps individual artwork private to the link vocabulary.
 */
import type { ReactNode } from 'react';
import type { IconProps } from './icons/props.ts';
/** Link categories with distinct leading glyphs. */
export type LinkIconKind = 'url' | 'folder' | 'code' | 'image' | 'document' | 'other';
/** Props for link icons: the category plus the shared icon sizing seat. */
export interface LinkIconProps extends IconProps {
    kind: LinkIconKind;
    /** Destination of a URL link; known HTTP(S) hosts render their site mark. */
    href?: string | undefined;
}
/**
 * Derive a file path's link-icon category from its extension. Unknown and
 * missing extensions fall to `other` (the plain-paper glyph).
 * @param path - File path as the producing tool spelled it (either separator).
 * @returns The file's glyph category; never `url` or `folder`.
 */
export declare function classifyLinkPath(path: string): LinkIconKind;
/**
 * Render a regular one-pixel link icon.
 * @param props - Link category, size, and optional class.
 * @returns The regular decorative link glyph.
 */
export declare function LinkIconRegular(props: LinkIconProps): ReactNode;
/**
 * Render a medium 1.3px link icon.
 * @param props - Link category, size, and optional class.
 * @returns The medium decorative link glyph.
 */
export declare function LinkIconMedium(props: LinkIconProps): ReactNode;
//# sourceMappingURL=LinkIcon.d.ts.map
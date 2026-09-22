import type { ReactNode } from 'react';
import type { IconProps } from './icons/props.ts';
/** Reference domains with distinct composer and transcript glyphs. */
export type ReferenceIconKind = 'session' | 'file' | 'folder';
/** Props shared by inline reference glyphs. */
export interface ReferenceIconProps extends IconProps {
    kind: ReferenceIconKind;
}
/**
 * Render a regular one-pixel reference icon.
 * @param props - Reference kind, size, and optional class.
 * @returns The regular decorative reference glyph.
 */
export declare function ReferenceIconRegular(props: ReferenceIconProps): ReactNode;
/**
 * Render a medium 1.3px reference icon.
 * @param props - Reference kind, size, and optional class.
 * @returns The medium decorative reference glyph.
 */
export declare function ReferenceIconMedium(props: ReferenceIconProps): ReactNode;
//# sourceMappingURL=ReferenceIcon.d.ts.map
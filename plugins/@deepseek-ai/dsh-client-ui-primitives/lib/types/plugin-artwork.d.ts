import type { IconProps } from './icons/props.ts';
/** Terminal plugin artwork (prompt chevron and cursor bar). */
export declare const PluginArtworkTerminal: ({ size, className }: IconProps) => import("react").JSX.Element;
/** Agent-loop plugin artwork (four leaves circling a center). */
export declare const PluginArtworkLoop: ({ size, className }: IconProps) => import("react").JSX.Element;
/** Subagent plugin artwork (two stacked rounded squares); also marks every row inside a bundle. */
export declare const PluginArtworkSubagent: ({ size, className }: IconProps) => import("react").JSX.Element;
/**
 * Web-search plugin artwork (conic-gradient ring and handle). SVG has no
 * native conic gradient, so the ring clips an HTML div painted with CSS
 * `conic-gradient` — the same emulation Figma exports; it renders inline in
 * the browser UI but would stay empty in an `<img>` or mask context.
 */
export declare const PluginArtworkSearch: ({ size, className }: IconProps) => import("react").JSX.Element;
/** Default plugin artwork for plugins without one of their own (connector blocks and a node). */
export declare const PluginArtworkDefault: ({ size, className }: IconProps) => import("react").JSX.Element;
//# sourceMappingURL=plugin-artwork.d.ts.map
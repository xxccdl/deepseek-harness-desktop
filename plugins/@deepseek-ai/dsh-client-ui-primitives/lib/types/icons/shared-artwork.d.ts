import type { IconProps } from './props.ts';
interface WeightedArtworkProps extends IconProps {
    strokeWidth: number;
}
/**
 * Render new-conversation geometry — the bubble around a plus — for product icons.
 * @param props - Size, optional CSS class, and inherited stroke width.
 * @returns The decorative SVG artwork.
 */
export declare const NewChatOutlineArtwork: ({ size, className, strokeWidth }: WeightedArtworkProps) => import("react").JSX.Element;
/**
 * Render shared conversation geometry — the chat bubble around two text
 * lines — for the queue product icon and session reference icons.
 * @param props - Size, optional CSS class, and inherited stroke width.
 * @returns The decorative SVG artwork.
 */
export declare const ChatLinesOutlineArtwork: ({ size, className, strokeWidth }: WeightedArtworkProps) => import("react").JSX.Element;
/**
 * Render shared globe geometry for product and link icons.
 * @param props - Size, optional CSS class, and inherited stroke width.
 * @returns The decorative SVG artwork.
 */
export declare const GlobeOutlineArtwork: ({ size, className, strokeWidth }: WeightedArtworkProps) => import("react").JSX.Element;
/**
 * Render shared code-bracket geometry for product and link icons.
 * @param props - Size, optional CSS class, and inherited stroke width.
 * @returns The decorative SVG artwork.
 */
export declare const CodeBracketsArtwork: ({ size, className, strokeWidth }: WeightedArtworkProps) => import("react").JSX.Element;
/**
 * Render shared document-browse geometry for product and reference icons.
 * @param props - Size, optional CSS class, and inherited stroke width.
 * @returns The decorative SVG artwork.
 */
export declare const BrowseOutlineArtwork: ({ size, className, strokeWidth }: WeightedArtworkProps) => import("react").JSX.Element;
/**
 * Render shared closed-folder geometry for product, reference, and link icons.
 * @param props - Size, optional CSS class, and inherited stroke width.
 * @returns The decorative SVG artwork.
 */
export declare const FolderCloseArtwork: ({ size, className, strokeWidth }: WeightedArtworkProps) => import("react").JSX.Element;
export {};
//# sourceMappingURL=shared-artwork.d.ts.map
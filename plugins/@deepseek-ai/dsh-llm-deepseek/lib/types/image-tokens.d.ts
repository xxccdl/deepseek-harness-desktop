/**
 * DeepSeek vision-token accounting: the provider's published image-token
 * calculator (api-docs.deepseek.com, Token & Token Usage) ported verbatim in
 * its current `v41` configuration. The provider scales an image below
 * 544×544 total pixels up, aligns it to a 14px-patch grid, downsamples 3:1
 * per axis into token cells, and caps one image at 1024 tokens by solving the
 * largest aspect-preserving grid inside that budget. The count is exact: this
 * configuration has no alignment pad and no aspect-ratio clamp. Actual usage
 * remains authoritative.
 *
 * @module dsh-llm-deepseek/image-tokens
 */
import type { ProjectedDimensions } from '@deepseek-ai/dsh-attachment';
/**
 * Dimensions the harness sends so the provider keeps the whole image: the
 * source itself when its patch-padded grid fits the token cap, otherwise the
 * source aspect ratio at the solved grid's long edge. The provider pads the
 * short edge to whole patches on its side. Rounding the aspect-preserving
 * short edge can change the token count from the source's solved grid;
 * request pricing uses the sent dimensions. Small images are never enlarged.
 * @param width - positive integer source width in pixels.
 * @param height - positive integer source height in pixels.
 * @returns the request dimensions to encode.
 */
export declare function deepSeekRequestImageDimensions(width: number, height: number): ProjectedDimensions;
/**
 * Vision tokens DeepSeek charges for one request image of the given
 * dimensions.
 * @param width - positive integer request-image width in pixels.
 * @param height - positive integer request-image height in pixels.
 * @returns the provider vision-token price, at most 1024.
 */
export declare function deepSeekImageTokens(width: number, height: number): number;
//# sourceMappingURL=image-tokens.d.ts.map
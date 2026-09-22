/**
 * Provider-side request-image pricing for DeepSeek routes: prices every
 * retained surface occurrence at its per-model request target with
 * the published vision-token accounting, and every occurrence the surface
 * marks offloaded as its placeholder text. Consumed synchronously by the
 * token meter through `LlmAdapter.imageRequestPricing`; provider usage
 * remains the authoritative anchor for completed requests.
 *
 * @module dsh-llm-deepseek/request-pricing
 */
import type { ImageAttachmentAccessResolver, LlmImageRequestPricing } from '@deepseek-ai/dsh-llm';
import type { ImageAttachmentRef, ImageRequestTarget } from '@deepseek-ai/dsh-attachment';
import type { DeepSeekCatalogModel, DeepSeekConnectionOptions } from './types.ts';
/** Default bound on accumulated file-referenced image bytes per request. */
export declare const DEFAULT_MAX_REQUEST_FILES_BYTES: number;
/** Provider request image-count limit. */
export declare const DEFAULT_MAX_IMAGES_PER_REQUEST = 600;
/** Total-pixel budget matching provider low-detail image input. */
export declare const DEFAULT_LOW_DETAIL_IMAGE_PIXEL_BUDGET: number;
/** Encoded-byte target for one deterministic model-request image; the smallest quality-ladder output is used when no quality fits. */
export declare const DEFAULT_REQUEST_IMAGE_MAX_BYTES: number;
/**
 * Provider per-side limit for a request carrying 15 or more images, applied
 * to every request image so the image count never changes a projection.
 */
export declare const REQUEST_IMAGE_MAX_DIMENSION = 4096;
/**
 * Resolve the encoded-byte target one DeepSeek model route applies to every request image.
 * @param model - Advertised model route and its optional image overrides.
 * @returns the route's encoded-byte target.
 * @internal
 */
export declare function resolveRequestImageMaxBytes(model: DeepSeekCatalogModel): number;
/**
 * Resolve the deterministic request target one DeepSeek model route chooses
 * for one source image: the published token grid unless the model overrides
 * it with a pixel budget, then the provider per-side limit, then the route's
 * encoded-byte target. Small images are never enlarged.
 * @param model - Advertised model route and its optional image overrides.
 * @param source - intrinsic dimensions of the normalized attachment.
 * @returns Complete request dimensions and encoded-byte target.
 * @internal
 */
export declare function resolveRequestImageTarget(model: DeepSeekCatalogModel, source: Pick<ImageAttachmentRef, 'width' | 'height'>): ImageRequestTarget;
/**
 * Build the request-image pricing for one DeepSeek route from a validated
 * connection snapshot. Uncatalogued and text-only models price every
 * occurrence as its deterministic text substitution; image-capable models
 * price an offloaded occurrence as its placeholder text and a retained one by
 * its projected request dimensions, with each occurrence's handle or
 * placeholder text built through the same access resolution the serializer
 * uses. Access paths resolve at pricing time, so a path that changes before
 * the request only shifts the text price by its own length.
 * @param connection - validated connection facts of the pricing resolution.
 * @param model - exact model id named by the request header.
 * @param resolveAccess - current execution-world access resolution shared with request serialization.
 * @returns synchronous per-occurrence pricing for the route.
 */
export declare function deepSeekImageRequestPricing(connection: DeepSeekConnectionOptions, model: string, resolveAccess?: ImageAttachmentAccessResolver): LlmImageRequestPricing;
//# sourceMappingURL=request-pricing.d.ts.map
/** Pure image-card derivation from raw result content and metadata. @module */
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment';
import type { ToolCallBlock } from './tool-call-model.ts';
/**
 * The image-card material one settled call contributes: the read path plus the
 * durable references the attachment slot renders as a gallery.
 *
 * The bytes are not here. `attachmentId` is opaque and provider-owned, so a UI
 * resolves it to a session-authorized URL at render time; this model never parses
 * it nor derives a path from it.
 */
export interface ImageCardModel {
    /** The resolved path as recorded, unshortened; the row summary already shows the short form. */
    path: string;
    /** The durable images this result returned, in result order. */
    images: readonly {
        readonly attachment: ImageAttachmentRef;
    }[];
    /**
     * Text blocks other than the model-facing envelope (for example, text a
     * post-execute hook appended), joined in order; null when there are none.
     * The envelope itself is not repeated: its path and image facts are already
     * `path` and `images`.
     */
    extraText: string | null;
}
/**
 * Derive a settled image card after validating the call head, persisted
 * metadata (or its argument fallback), and the model-facing image envelope.
 *
 * The card is result-side only: a call carries no content until `execute`
 * returns, so a running `read_image` has none and this returns null for it.
 * Both root and nested calls settle as ToolResultNode. Historical nested
 * records without presentation metadata fall back to the call's own
 * `file_path` argument for the path.
 * @param block - running or settled Tool block.
 * @returns the image-card props, or null for the generic path.
 */
export declare function imageCardModel(block: ToolCallBlock): ImageCardModel | null;
//# sourceMappingURL=image-card-model.d.ts.map
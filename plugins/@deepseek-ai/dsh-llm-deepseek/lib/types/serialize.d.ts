/** Map system snapshots and conversation turns to Messages using the configured route capability. */
import type { GenerateOptions, ImageAttachmentAccessResolver, RequestMessage } from '@deepseek-ai/dsh-llm';
import type { ImageAttachmentRef, RequestImageAttachment } from '@deepseek-ai/dsh-attachment';
import type { DeepSeekConnectionOptions as Connection } from './types.ts';
import type { DeepSeekFileId } from './file-id.ts';
import type { WireRequest } from './wire-types.ts';
/** Serialize one complete request using already prepared image bytes.
 * User and tool-result content omits reasoning and tool-call blocks.
 * Empty user messages are skipped; empty tool results retain their call ids.
 * @param options - provider-neutral request.
 * @param connection - validated defaults and thinking policy.
 * @param history - image-projected history with complete system snapshots; durable messages remain unchanged.
 * @param images - request versions for retained images.
 * @param access - execution-world paths for image descriptions.
 * @param onReplayDegrade - diagnostic for discarded native replay metadata.
 * @param fileIds - resolved Files references; omission selects inline image bytes.
 * @returns the Messages API JSON body.
 */
export declare function serialize(options: GenerateOptions, connection: Connection, history: readonly RequestMessage[], images: ReadonlyMap<ImageAttachmentRef['attachmentId'], RequestImageAttachment>, access: ImageAttachmentAccessResolver, onReplayDegrade?: (reason: string) => void, fileIds?: ReadonlyMap<ImageAttachmentRef['attachmentId'], DeepSeekFileId>): WireRequest;
//# sourceMappingURL=serialize.d.ts.map
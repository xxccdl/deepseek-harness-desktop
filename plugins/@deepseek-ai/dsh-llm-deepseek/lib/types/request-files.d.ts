/** Shared Files resolution, bounded stale-id recovery, and normalized-image diagnostics. */
import type { RequestImageAttachment } from '@deepseek-ai/dsh-attachment';
import type { DeepSeekFileStore, DeepSeekFileConnection, DeepSeekFilePolicy } from './file-store.ts';
import type { DeepSeekFileId } from './file-id.ts';
/** Position of an image occurrence in the request's conversation messages. */
export interface ImageWireLocation {
    message: number;
    image: number;
}
/** A file upload failure eligible for request-wide inline fallback. */
export declare class FileResolutionFailure extends Error {
    constructor(cause: unknown);
}
/** Files state owned by one model request, including at most one stale-id retry. */
export declare class RequestFiles {
    private readonly files;
    private readonly connection;
    private readonly policy;
    private readonly timeoutMs;
    private readonly signal;
    private readonly activity;
    private used;
    private retried;
    constructor(files: DeepSeekFileStore, connection: DeepSeekFileConnection, policy: DeepSeekFilePolicy, timeoutMs: number, signal: AbortSignal, activity: () => void);
    /** Reset occurrence tracking before serializing the next HTTP attempt. */
    beginAttempt(): void;
    /**
     * Resolve a retained image under its own upload deadline.
     * @param version - prepared request image.
     * @param location - occurrence used by provider-rejection diagnostics.
     * @returns the reusable provider id.
     */
    resolve(version: RequestImageAttachment, location: ImageWireLocation): Promise<DeepSeekFileId>;
    /**
     * Invalidate rejected mappings; only the first stale-id response permits another request.
     * @param detail - provider error fields used for stale-id classification.
     * @returns whether the caller should serialize and dispatch again.
     */
    retry(detail: string): Promise<boolean>;
    /**
     * Attribute a normalized-image rejection to the actual uploaded image occurrences.
     * @param status - rejected request's HTTP status.
     * @param message - provider's error message.
     * @param detail - provider error classification fields.
     * @returns the image diagnostic or the original provider message.
     */
    errorMessage(status: number, message: string, detail: string): string;
}
//# sourceMappingURL=request-files.d.ts.map
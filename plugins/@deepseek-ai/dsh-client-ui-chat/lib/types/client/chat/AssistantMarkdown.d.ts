import type { MarkdownFileMentions } from '@deepseek-ai/dsh-client-ui-primitives';
import type { ChatNodeOwnerProps, ChatViewSlotProps, UseDisclosure, UsePresentation } from '../contract/slots.ts';
import type { AssistantBlock } from '../contract/snapshot.ts';
/**
 * Resolve an authored POSIX image path against the document's file API.
 * @param base - canonical `document.baseURI` at render time.
 * @param value - authored markdown destination.
 * @returns an absolute HTTP(S) file-API URL, or undefined for unsupported
 * protocols and non-local paths.
 */
export declare function localPathMediaUrl(base: string, value: string): string | undefined;
export interface AssistantMarkdownProps {
    /** Render only the requested business portion, preserving original block indexes. */
    groupPart?: string | undefined;
    /** Stable Hook forwarded to each independently expandable reasoning block. */
    useDisclosure: UseDisclosure;
    blocks: readonly AssistantBlock[];
    streaming: boolean;
    /** Frozen partial of an aborted turn: rendered with a stopped marker. */
    interrupted?: boolean | undefined;
    /** Render consecutive image blocks through the attachment slot. */
    renderMessageImages: ChatNodeOwnerProps['renderMessageImages'];
    /** Hide reasoning that belongs to the Turn-level process disclosure. */
    reasoningHidden?: boolean | undefined;
    /** Live display policy for reasoning summaries. */
    usePresentation: UsePresentation;
    /** Reveal the disclosure that hides this reasoning. */
    revealProcess?: (() => void) | undefined;
    /** Resolved prose file mentions for this Assistant's closing turn. */
    mentions?: MarkdownFileMentions | undefined;
    /** The owning view's locale seat, passed down as a plain prop. */
    t: ChatViewSlotProps['t'];
}
/** Reasoning block as the Think variant summary row (figma 39:28304). */
export declare const AssistantMarkdown: import("react").MemoExoticComponent<({ blocks, streaming, interrupted, renderMessageImages, groupPart, useDisclosure, reasoningHidden, usePresentation, revealProcess, mentions, t, }: AssistantMarkdownProps) => import("react").JSX.Element | null>;
//# sourceMappingURL=AssistantMarkdown.d.ts.map
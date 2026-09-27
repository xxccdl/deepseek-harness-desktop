/** Pure web-card derivation from raw web result metadata. @module */
import type { WebBlockProps } from '@deepseek-ai/dsh-client-ui-primitives';
import type { ToolCallBlock } from './tool-call-model.ts';
type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;
/** Web-card data owned by the presenter; render sites add localized labels and classes. */
export type WebCardModelProps = DistributiveOmit<WebBlockProps, 'labels' | 'className'>;
/**
 * Derive a settled root web-search or web-fetch card from persisted metadata.
 * @param block - running or settled Tool block.
 * @returns web-card props, or null for the generic path.
 */
export declare function webCardModel(block: ToolCallBlock): WebCardModelProps | null;
/**
 * Read the openable URL of a web_fetch call from its arguments.
 * @param block - running or settled Tool block.
 * @returns the http(s) URL, or undefined for another tool, protocol, or unparsable argument.
 */
export declare function webFetchHref(block: ToolCallBlock): string | undefined;
export {};
//# sourceMappingURL=web-card-model.d.ts.map
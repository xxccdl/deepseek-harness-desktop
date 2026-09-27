/** Recover standalone local image references with bare spaces without changing code or source offsets. */
import type { Root } from 'mdast';
/**
 * Recover only unambiguous, unescaped image-only paragraphs containing a local path with spaces.
 * @param root - Parsed Markdown tree, modified in place.
 * @param source - Original source used to distinguish authored syntax from escaped examples.
 * @returns The same root with recovered image nodes.
 */
export declare function recoverLocalImages(root: Root, source: string): Root;
//# sourceMappingURL=local-image-syntax.d.ts.map
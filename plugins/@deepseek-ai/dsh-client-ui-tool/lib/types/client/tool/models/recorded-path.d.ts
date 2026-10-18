/**
 * Read one absolute location from opaque persisted result metadata.
 * @param meta - tool-owned result metadata from the Session log.
 * @param field - the file path or command working directory.
 * @returns the recorded path, or undefined for old or malformed metadata.
 */
export declare function recordedAbsolutePath(meta: unknown, field: 'path' | 'cwd'): string | undefined;
//# sourceMappingURL=recorded-path.d.ts.map
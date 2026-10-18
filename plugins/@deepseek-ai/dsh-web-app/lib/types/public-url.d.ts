/**
 * Canonical public HTTP(S) root parsing shared by this bundle's `publicUrl`
 * config and its CLI startup provider.
 * @module @deepseek-ai/dsh-web-app/public-url
 */
/**
 * Parse the advertised public HTTP(S) root of a prefix-stripping proxy
 * deployment, rejecting the hazards WHATWG URL parsing would accept on its own,
 * then normalize the path to end in `/`.
 * @param value - advertised public HTTP(S) root.
 * @param label - field name or CLI flag included in rejection messages.
 * @returns the parsed URL with a trailing-slash pathname.
 * @throws when the value is not a usable advertised root, naming the reason.
 */
export declare function parsePublicUrl(value: string, label?: string): URL;
//# sourceMappingURL=public-url.d.ts.map
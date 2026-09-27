/** Composition lifetime for local keyboard handlers, including a late closing keydown. */
/**
 * Observe composition until its closing key is released or consumed.
 * @param document - document whose input events belong to the caller.
 * @returns an event guard and a disposer for all listeners.
 */
export declare function observeComposition(document: Document): {
    guards(event: KeyboardEvent): boolean;
    dispose(): void;
};
//# sourceMappingURL=keyboard-composition.d.ts.map
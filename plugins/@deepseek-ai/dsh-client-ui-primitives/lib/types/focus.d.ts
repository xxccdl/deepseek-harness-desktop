/**
 * Focus an automatic destination without a focus outline until keyboard navigation or blur.
 * The theme suppresses outlines while data-dsh-automatic-focus is present; borders and shadows remain intact.
 * Tab and directional navigation restore normal focus styling.
 * @param element - control or container receiving automatic focus.
 * @param options - browser focus options, including scroll preservation.
 */
export declare function focusWithoutRing(element: HTMLElement, options?: FocusOptions): void;
//# sourceMappingURL=focus.d.ts.map
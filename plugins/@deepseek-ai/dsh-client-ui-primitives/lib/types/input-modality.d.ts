/**
 * Document-wide input tracking shared by tooltips and focus-ring styles.
 * Tooltips follow the last input; rings follow navigation or a key followed by
 * focus on a different control. Modifiers and refocusing alone keep rings silent.
 * Module-level listeners live for the document lifetime; Node imports are inert.
 */
/** Modality values published on the document element. */
export declare const INPUT_MODALITY: {
    readonly pointer: "pointer";
    readonly keyboard: "keyboard";
};
/** Attribute carrying whether focus navigation last owned focus. */
export declare const INPUT_MODALITY_ATTRIBUTE = "data-input-modality";
/**
 * Whether the last input came from a pointer, independently of ring visibility.
 * @returns True after pointer input; false after any key.
 */
export declare function pointerModality(): boolean;
//# sourceMappingURL=input-modality.d.ts.map
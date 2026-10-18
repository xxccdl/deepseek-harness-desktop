/** Display text and owner-localized identification for a command scrollport. */
export interface CommandTextProps {
    /** Original command or formatted command arguments, without truncation. */
    text: string;
    /** Accessible name while the text can scroll horizontally. */
    label: string;
    /** Owner typography and positioning. */
    className?: string | undefined;
}
/**
 * Render command text without adding Tab stops for content that fits.
 * @param props - Text, localized scrollport name, and owner styling.
 * @returns A horizontal text scrollport, named and keyboard-focusable only when overflowing.
 */
export declare function CommandText({ text, label, className }: CommandTextProps): import("react").JSX.Element;
//# sourceMappingURL=CommandText.d.ts.map
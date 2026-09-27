/** Language hints accepted by both provider metadata and native inference. */
export declare const languages: readonly string[];
/** A request rejected before native inference; the loaded worker remains reusable. */
export declare class SpeechInputError extends Error {
}
/**
 * Validate a recording before touching the native recognizer.
 * @param audio - untrusted WAV request bytes.
 * @param language - requested SenseVoice language hint.
 * @param maxAudioBytes - configured worker byte limit.
 * @returns validated audio duration in seconds; invalid inputs throw SpeechInputError.
 */
export declare function validateInput(audio: Uint8Array, language: string, maxAudioBytes: number): number;
//# sourceMappingURL=input.d.ts.map
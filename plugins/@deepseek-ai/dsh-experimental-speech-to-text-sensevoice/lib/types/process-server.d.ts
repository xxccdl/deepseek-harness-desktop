/** Authenticated loopback transport for one serial native recognizer. */
import { type Server } from 'node:http';
import type { Transcript } from '@deepseek-ai/dsh-experimental-speech-to-text/types';
/**
 * Bind an ephemeral loopback listener; model loading completes before readiness is published.
 * @param token - private per-process authentication secret.
 * @param maxAudioBytes - maximum retained request bytes.
 * @param transcribe - synchronous inference owned by this process.
 * @returns the listening server and its dynamically assigned port.
 */
export declare function startRecognitionServer(token: string, maxAudioBytes: number, transcribe: (audio: Uint8Array, language: string) => Transcript): Promise<{
    server: Server;
    port: number;
}>;
//# sourceMappingURL=process-server.d.ts.map
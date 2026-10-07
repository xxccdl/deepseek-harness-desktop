import { randomUUID } from "node:crypto";
import z from "@deepseek-ai/schemastery";
import { validateWave } from "@deepseek-ai/dsh-experimental-speech-to-text/wave";
//#region lib/types/config.js
/** Largest delay `setTimeout`-backed timers accept; keeps configured timeouts inside the platform bound. */
const MAX_TIMER_DELAY_MS = 2147483647;
/** Language hints the SenseVoice HTTP service accepts, in the order the voice UI labels them. */
const languages = ["auto", "zh", "en", "yue", "ja", "ko"];
/**
* Deployment configuration for the remote SenseVoice HTTP recognizer.
*
* `baseUrl` defaults to the public tunnel so a mount without explicit config still
* reaches the service from anywhere; the voice-input bundle pins the same address.
*/
const Config = z.object({
	providerId: z.string().min(1).default("sensevoice-remote"),
	name: z.string().min(1).default("SenseVoiceSmall (远程)"),
	baseUrl: z.string().min(1).default("https://inches-beginning-enhancement-measured.trycloudflare.com"),
	apiKey: z.string().default(""),
	maxDurationSeconds: z.number().min(1).default(120),
	requestTimeoutMs: z.natural().min(1).max(MAX_TIMER_DELAY_MS).default(12e4)
});
//#endregion
//#region lib/types/index.js
/**
* Read one failed response's human-readable reason without trusting its shape.
* @param response - settled non-2xx response.
* @returns `: <detail>` when the body carries one, otherwise an empty string.
*/
async function failureDetail(response) {
	try {
		const body = await response.json();
		const detail = body?.detail ?? body?.error?.message ?? body?.error;
		return typeof detail === "string" && detail.length > 0 ? `: ${detail}` : "";
	} catch {
		return "";
	}
}
/**
* Describe one transport failure, keeping undici's cause code.
*
* `fetch failed` alone cannot tell a closed port from a filtered one; the cause
* code (ECONNREFUSED, ETIMEDOUT, ENOTFOUND) is the part an operator acts on.
* @param error - rejection raised by fetch.
* @returns the message with the cause code appended when it exists.
*/
function transportReason(error) {
	if (!(error instanceof Error)) return String(error);
	const code = error.cause?.code;
	return typeof code === "string" ? `${error.message}: ${code}` : error.message;
}
/**
* Assemble one `file` + `language` multipart body as a single fixed-length buffer.
*
* Deliberately not `FormData`: a `Blob` part uploads as a web stream, and aborting
* that upload mid-flight closes the stream while undici is still enqueuing into it,
* which crashes the host process instead of rejecting the call. A fixed-length body
* keeps cancellation a plain rejection.
* @param audio - canonical WAV bytes.
* @param language - selected language hint.
* @returns the boundary and the complete request body.
*/
function multipartBody(audio, language) {
	const boundary = `----dshspeechform${randomUUID().replaceAll("-", "")}`;
	const head = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="audio.wav"\r\nContent-Type: audio/wav\r\n\r\n`, "utf8");
	const tail = Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="language"\r\n\r\n${language}\r\n--${boundary}--\r\n`, "utf8");
	return {
		boundary,
		body: Buffer.concat([head, Buffer.from(audio.buffer, audio.byteOffset, audio.byteLength), tail])
	};
}
/**
* Recognize one recording through the service's `POST /asr` endpoint.
* @param endpoint - absolute transcription URL.
* @param config - validated runtime configuration.
* @param input - canonical WAV bytes and the selected language hint.
* @param signal - caller or registration cancellation.
* @returns final text and measured durations.
*/
async function transcribe(endpoint, config, input, signal) {
	signal.throwIfAborted();
	const audioSeconds = validateWave(input.audio, config.maxDurationSeconds);
	const { boundary, body } = multipartBody(input.audio, input.language);
	const timeout = AbortSignal.timeout(config.requestTimeoutMs);
	let response;
	try {
		response = await fetch(endpoint, {
			method: "POST",
			body,
			headers: {
				"content-type": `multipart/form-data; boundary=${boundary}`,
				...config.apiKey.length === 0 ? {} : {
					authorization: `Bearer ${config.apiKey}`,
					"x-api-key": config.apiKey
				}
			},
			signal: AbortSignal.any([signal, timeout])
		});
	} catch (error) {
		if (signal.aborted) throw error;
		if (timeout.aborted) throw new Error(`Remote speech service timed out after ${config.requestTimeoutMs}ms: ${endpoint}`);
		throw new Error(`Remote speech service is unreachable: ${endpoint} (${transportReason(error)})`);
	}
	if (!response.ok) throw new Error(`Remote speech service returned HTTP ${response.status}${await failureDetail(response)}`);
	let payload;
	try {
		payload = await response.json();
	} catch {
		throw new Error(`Remote speech service returned a non-JSON response: ${endpoint}`);
	}
	if (typeof payload?.text !== "string") throw new Error(`Remote speech service returned no transcription: ${endpoint}`);
	return {
		text: payload.text,
		audioSeconds,
		inferenceSeconds: typeof payload.elapsed === "number" ? payload.elapsed : 0
	};
}
/** Optional remote SenseVoice provider; activation contacts no service and prepares nothing. */
const name = "experimental-speech-to-text-remote";
const inject = ["speechToText"];
/**
* Register the remote recognizer. It needs no preparation, so the voice UI offers it as an
* immediately ready cloud choice next to the local SenseVoice provider.
* @param ctx - Host registry carrying the speech service.
* @param config - validated runtime configuration.
*/
function apply(ctx, config) {
	const base = config.baseUrl.replace(/\/+$/, "");
	new URL(base);
	const endpoint = `${base}/asr`;
	ctx.effect(() => {
		const unregister = ctx.speechToText.register({
			info: {
				id: config.providerId,
				name: config.name,
				location: "cloud",
				languages
			},
			transcribe: async (input, signal) => await transcribe(endpoint, config, input, signal)
		});
		return () => void unregister();
	});
}
//#endregion
export { Config, apply, inject, name };

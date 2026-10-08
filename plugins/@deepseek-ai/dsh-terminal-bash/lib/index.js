import { TerminalBackendCleanupError, TerminalError } from "@deepseek-ai/dsh-terminal";
import { ENCODING_PREAMBLE, resolvePwshPath } from "@deepseek-ai/dsh-pwsh-local";
import z from "@deepseek-ai/schemastery";
import { Buffer } from "node:buffer";
import { createLazyRequire } from "@deepseek-ai/dsh-lazy-require";
//#region lib/types/config.js
/** Validated configuration for the local PTY backend. */
/** Bash dialect default executable. */
const DEFAULT_BASH_SHELL = "/bin/bash";
/** Bash dialect default arguments (interactive, profile-free). */
const DEFAULT_BASH_ARGS = [
	"--noprofile",
	"--norc",
	"-i"
];
/** Pwsh dialect default arguments (interactive host, profile-free). */
const DEFAULT_PWSH_ARGS = ["-NoLogo", "-NoProfile"];
/**
* Resolve the effective per-dialect shell specification. Defaulting is this
* explicit step: an unset or empty `shellPath`/`shellArgs` selects the
* dialect's defaults, while a non-empty explicit value always wins.
* (Schemastery materializes an absent optional array as `[]`, so emptiness —
* not just `undefined` — means "dialect default".)
* @param config - Schemastery-resolved plugin configuration.
* @returns the fully resolved configuration.
*/
function resolveConfig(config) {
	const shellDialect = config.shellDialect ?? "bash";
	return {
		...config,
		shellDialect,
		shellPath: config.shellPath !== void 0 && config.shellPath.length > 0 ? config.shellPath : shellDialect === "pwsh" ? resolvePwshPath() : DEFAULT_BASH_SHELL,
		shellArgs: config.shellArgs !== void 0 && config.shellArgs.length > 0 ? config.shellArgs : shellDialect === "pwsh" ? DEFAULT_PWSH_ARGS : DEFAULT_BASH_ARGS
	};
}
/** Schemastery config exposed by the plugin. */
const Config = z.object({
	backendType: z.string().default("shell"),
	shellDialect: z.union(["bash", "pwsh"]).default("bash"),
	shellPath: z.string().required(false),
	shellArgs: z.array(z.string()).required(false),
	rows: z.number().default(40),
	cols: z.number().default(160),
	scrollbackLines: z.number().default(1e4),
	scrollbackMaxBytes: z.number().default(4 * 1024 * 1024),
	maxReadBytes: z.number().default(256 * 1024),
	pollIntervalMs: z.number().default(50),
	exactProbeAfterMs: z.number().default(150),
	idleSilenceMs: z.number().default(3e3),
	handoffGraceMs: z.number().default(500),
	promptTailGraceMs: z.number().default(0),
	timeoutMs: z.number().default(3e4),
	disposeGraceMs: z.number().default(3e3)
});
/**
* Assert every effective numeric config field is a positive safe integer — except
* `promptTailGraceMs`, whose zero is the documented "no extension" value — and that bounds
* compose.
* @param config - Schemastery-resolved plugin configuration.
* @returns Narrows the input to the fully resolved configuration.
*/
function validateConfig(config) {
	const resolved = config;
	if (resolved.backendType.length === 0) throw new Error("terminal-bash: backendType must be non-empty");
	if (resolved.shellPath.length === 0) throw new Error("terminal-bash: shellPath must be non-empty");
	for (const [name, value] of Object.entries(resolved)) {
		if (name === "promptTailGraceMs") continue;
		if (typeof value === "number" && (!Number.isSafeInteger(value) || value <= 0)) throw new Error(`terminal-bash: ${name} must be a positive safe integer`);
	}
	if (typeof resolved.promptTailGraceMs === "number" && (!Number.isSafeInteger(resolved.promptTailGraceMs) || resolved.promptTailGraceMs < 0)) throw new Error("terminal-bash: promptTailGraceMs must be a non-negative safe integer");
	if (resolved.maxReadBytes > resolved.scrollbackMaxBytes) throw new Error("terminal-bash: maxReadBytes must not exceed scrollbackMaxBytes");
	if (resolved.handoffGraceMs < resolved.pollIntervalMs) throw new Error("terminal-bash: handoffGraceMs must be at least pollIntervalMs so one readiness poll runs inside the grace window");
	if (resolved.promptTailGraceMs !== 0 && resolved.promptTailGraceMs < resolved.pollIntervalMs) throw new Error("terminal-bash: promptTailGraceMs must be zero or at least pollIntervalMs so a nonzero tolerance contains one readiness poll");
}
/** Exact printable prompt emitted after the private marker. */
const CONTROLLED_PROMPT = "dsh> ";
/**
* Remove CSI/OSC/short escape sequences while preserving split-sequence carry.
* Full terminal emulation is deliberately deferred; ordinary line output and
* the private prompt marker are the supported contract.
*/
var TerminalSanitizer = class {
	maxPendingBytes;
	pending = "";
	discardMode;
	discardOscEscape = false;
	trailingCarriageReturn = false;
	trackingPromptTail = false;
	constructor(maxPendingBytes) {
		this.maxPendingBytes = maxPendingBytes;
	}
	/**
	* Consume one decoded `node-pty` data chunk.
	* @param chunk - decoded terminal data.
	* @returns Printable text and whether the private prompt marker completed.
	*/
	push(chunk) {
		this.pending += this.discardPrefix(chunk);
		let text = "";
		let prompt = false;
		let includePromptTail = this.trackingPromptTail;
		let promptTail = "";
		let index = 0;
		const appendText = (value) => {
			text += value;
			if (this.trackingPromptTail) promptTail += value;
		};
		while (index < this.pending.length) {
			const escape = this.pending.indexOf("\x1B", index);
			if (escape < 0) {
				appendText(this.pending.slice(index));
				index = this.pending.length;
				break;
			}
			appendText(this.pending.slice(index, escape));
			if (escape + 1 >= this.pending.length) {
				index = escape;
				break;
			}
			const kind = this.pending[escape + 1];
			if (kind === "]") {
				const bel = this.pending.indexOf("\x07", escape + 2);
				const stringTerminator = this.pending.indexOf("\x1B\\", escape + 2);
				let end = -1;
				if (bel >= 0 && stringTerminator >= 0) end = Math.min(bel + 1, stringTerminator + 2);
				else if (bel >= 0) end = bel + 1;
				else if (stringTerminator >= 0) end = stringTerminator + 2;
				if (end < 0) {
					index = escape;
					break;
				}
				const terminatorBytes = this.pending[end - 1] === "\x07" ? 1 : 2;
				if (this.pending.slice(escape + 2, end - terminatorBytes).startsWith("133;D;")) {
					prompt = true;
					this.trackingPromptTail = true;
					includePromptTail = true;
					promptTail = "";
				}
				index = end;
				continue;
			}
			if (kind === "[") {
				let end = escape + 2;
				while (end < this.pending.length) {
					const code = this.pending.charCodeAt(end);
					if (code >= 64 && code <= 126) break;
					end += 1;
				}
				if (end >= this.pending.length) {
					index = escape;
					break;
				}
				index = end + 1;
				continue;
			}
			index = escape + 2;
		}
		this.pending = this.pending.slice(index);
		this.enforcePendingBound();
		return {
			text: this.normalizeText(text),
			prompt,
			...includePromptTail ? { promptTail } : {}
		};
	}
	/**
	* Flush a trailing printable fragment when the PTY exits.
	* @returns Remaining printable text; incomplete escapes are discarded.
	*/
	flush() {
		const text = this.pending.startsWith("\x1B") ? "" : this.pending;
		this.pending = "";
		this.discardMode = void 0;
		this.discardOscEscape = false;
		this.trackingPromptTail = false;
		const normalized = this.normalizeText(text);
		if (!this.trailingCarriageReturn) return normalized;
		this.trailingCarriageReturn = false;
		return `${normalized}\n`;
	}
	normalizeText(text) {
		let complete = this.trailingCarriageReturn ? `\r${text}` : text;
		this.trailingCarriageReturn = false;
		if (complete.endsWith("\r")) {
			complete = complete.slice(0, -1);
			this.trailingCarriageReturn = true;
		}
		return normalizeTerminalText(complete);
	}
	enforcePendingBound() {
		if (Buffer.byteLength(this.pending) <= this.maxPendingBytes) return;
		this.discardMode = this.pending[1] === "]" ? "osc" : "csi";
		this.pending = "";
	}
	discardPrefix(chunk) {
		if (this.discardMode === void 0) return chunk;
		if (this.discardMode === "csi") {
			for (let index = 0; index < chunk.length; index += 1) {
				const code = chunk.charCodeAt(index);
				if (code >= 64 && code <= 126) {
					this.discardMode = void 0;
					return chunk.slice(index + 1);
				}
			}
			return "";
		}
		let index = 0;
		if (this.discardOscEscape) {
			this.discardOscEscape = false;
			if (chunk.startsWith("\\")) {
				this.discardMode = void 0;
				return chunk.slice(1);
			}
		}
		while (index < chunk.length) {
			if (chunk[index] === "\x07") {
				this.discardMode = void 0;
				return chunk.slice(index + 1);
			}
			if (chunk[index] === "\x1B") {
				if (chunk[index + 1] === "\\") {
					this.discardMode = void 0;
					return chunk.slice(index + 2);
				}
				if (index + 1 === chunk.length) this.discardOscEscape = true;
			}
			index += 1;
		}
		return "";
	}
};
/**
* Normalize CRLF and standalone carriage returns for line-oriented rendering.
* @param text - sanitized terminal text.
* @returns Line-normalized text with BEL removed.
*/
function normalizeTerminalText(text) {
	return text.replaceAll("\r\n", "\n").replaceAll("\r", "\n").replaceAll("\x07", "");
}
//#endregion
//#region lib/types/session.js
/** Persistent PTY session with bounded output, readiness, and terminal-protocol replies. */
const requireHeadless = createLazyRequire("@xterm/headless", import.meta.url);
function utf8Tail(text, maxBytes) {
	if (Buffer.byteLength(text) <= maxBytes) return {
		text,
		truncated: false
	};
	const chars = Array.from(text);
	let bytes = 0;
	let start = chars.length;
	while (start > 0) {
		const next = Buffer.byteLength(chars[start - 1]);
		if (bytes + next > maxBytes) break;
		bytes += next;
		start -= 1;
	}
	return {
		text: chars.slice(start).join(""),
		truncated: true
	};
}
const COALESCED_CHUNK_UNITS = 4096;
/** Retention work is amortized over appended text; reads assemble the retained chunks. */
var BoundedTextBuffer = class {
	maxBytes;
	maxLines;
	head;
	tail;
	bytes = 0;
	newlines = 0;
	lastCodeUnit = 0;
	dropped = false;
	constructor(maxBytes, maxLines) {
		this.maxBytes = maxBytes;
		this.maxLines = maxLines;
	}
	get truncated() {
		return this.dropped;
	}
	get isEmpty() {
		return this.head === void 0;
	}
	append(text) {
		if (text.length === 0) return;
		text = Buffer.from(text, "utf16le").toString("utf16le");
		this.bytes += Buffer.byteLength(text);
		const tail = this.tail;
		if (tail !== void 0) {
			const last = this.lastCodeUnit;
			const first = text.charCodeAt(0);
			if (last >= 55296 && last <= 56319 && first >= 56320 && first <= 57343) this.bytes -= 2;
		}
		for (let index = text.indexOf("\n"); index !== -1; index = text.indexOf("\n", index + 1)) this.newlines += 1;
		this.lastCodeUnit = text.charCodeAt(text.length - 1);
		if (tail !== void 0 && tail !== this.head && tail.text.length + text.length <= COALESCED_CHUNK_UNITS) tail.text += text;
		else {
			if (tail !== void 0 && tail.text.length <= COALESCED_CHUNK_UNITS) tail.text = Buffer.from(tail.text, "utf16le").toString("utf16le");
			const chunk = {
				text,
				start: 0,
				next: void 0
			};
			if (tail === void 0) this.head = chunk;
			else tail.next = chunk;
			this.tail = chunk;
		}
		while (this.head !== void 0 && (this.bytes > this.maxBytes || this.maxLines !== void 0 && this.newlines >= this.maxLines)) {
			const head = this.head;
			const first = head.text.charCodeAt(head.start);
			const second = head.start + 1 < head.text.length ? head.text.charCodeAt(head.start + 1) : head.next?.text.charCodeAt(0);
			const paired = first >= 55296 && first <= 56319 && second !== void 0 && second >= 56320 && second <= 57343;
			this.bytes -= paired ? 4 : first < 128 ? 1 : first < 2048 ? 2 : 3;
			if (first === 10) this.newlines -= 1;
			this.advance(paired ? 2 : 1);
			this.dropped = true;
		}
		const head = this.head;
		if (head !== void 0 && head.start >= head.text.length / 2) {
			head.text = Buffer.from(head.text.slice(head.start), "utf16le").toString("utf16le");
			head.start = 0;
		}
	}
	advance(units) {
		while (units > 0 && this.head !== void 0) {
			const head = this.head;
			const count = Math.min(units, head.text.length - head.start);
			head.start += count;
			units -= count;
			if (head.start === head.text.length) this.head = head.next;
		}
		if (this.head === void 0) this.tail = void 0;
	}
	consume() {
		const { text: delta, truncated } = this.snapshot();
		this.head = void 0;
		this.tail = void 0;
		this.bytes = 0;
		this.newlines = 0;
		this.dropped = false;
		return {
			delta,
			truncated
		};
	}
	snapshot() {
		const chunks = [];
		for (let chunk = this.head; chunk !== void 0; chunk = chunk.next) chunks.push(chunk.text.slice(chunk.start));
		return {
			text: chunks.join(""),
			truncated: this.dropped
		};
	}
};
var LocalSendOperation = class {
	startedAt;
	onCancel;
	output;
	promise;
	finished = false;
	cancellationRequested = false;
	initialForegroundLeftWait;
	initialForegroundPgid;
	constructor(maxBytes, startedAt, onCancel) {
		this.startedAt = startedAt;
		this.onCancel = onCancel;
		this.output = new BoundedTextBuffer(maxBytes);
		this.promise = Promise.withResolvers();
		this.initialForegroundLeftWait = true;
	}
	get done() {
		return this.promise.promise;
	}
	get settled() {
		return this.finished;
	}
	get cancelRequested() {
		return this.cancellationRequested;
	}
	append(text) {
		if (!this.finished) this.output.append(text);
	}
	settle(waitReason, sessionStatus, inheritedTruncation) {
		if (this.finished) return;
		this.finished = true;
		const read = this.output.snapshot();
		this.promise.resolve({
			viewport: read.text,
			waitReason,
			sessionStatus,
			truncated: read.truncated || inheritedTruncation
		});
	}
	fail(error) {
		if (this.finished) return;
		this.finished = true;
		this.promise.reject(error);
	}
	readOutput() {
		return this.output.consume();
	}
	setInitialForeground(foreground) {
		this.initialForegroundPgid = foreground?.processGroupId;
		this.initialForegroundLeftWait = foreground?.inputWaiting !== true;
	}
	acceptsStdinWait(pgid, waiting) {
		if (pgid !== this.initialForegroundPgid) return waiting;
		if (!waiting) this.initialForegroundLeftWait = true;
		return waiting && this.initialForegroundLeftWait;
	}
	cancel() {
		if (this.finished) return false;
		this.cancellationRequested = true;
		this.onCancel();
		return true;
	}
};
/** Backend session wrapping one provider-owned terminal process. */
var LocalPtySession = class {
	terminal;
	config;
	motd = "";
	pid;
	decoder = new TextDecoder();
	/** Protocol state only; the sanitizer and bounded buffers own returned text. */
	emulator;
	emulatorData;
	sanitizer;
	scrollback;
	outputEnded = Promise.withResolvers();
	completion;
	statusValue = { kind: "running" };
	active;
	activeTimer;
	activeDeadlineTimer;
	activeAbort;
	interrupting;
	activeWrite;
	pollingReady;
	polling = false;
	promptSeen = false;
	promptTextSeen = false;
	promptTail = "";
	shellPgid;
	initializing = false;
	lastOutputAt = Date.now();
	closing = false;
	closePromise;
	transportFailure;
	emulatorWrites = Promise.resolve();
	emulatorWriteDone;
	emulatorBuffer = "";
	emulatorWriting = false;
	responseWrites = Promise.resolve();
	pendingResponseWrites = 0;
	emulatorClosed = false;
	constructor(terminal, config) {
		this.terminal = terminal;
		this.config = config;
		this.pid = terminal.pid;
		const { Terminal: HeadlessTerminal } = requireHeadless();
		this.emulator = new HeadlessTerminal({
			cols: config.cols,
			rows: config.rows,
			scrollback: 0
		});
		this.emulatorData = this.emulator.onData((data) => {
			this.pendingResponseWrites += 1;
			const response = this.responseWrites.then(async () => {
				await this.terminal.write(data);
			});
			this.responseWrites = response.then(() => {
				this.finishResponseWrite();
			}, (error) => {
				this.finishResponseWrite();
				if (!this.emulatorClosed && !this.closing) this.onTransportFailure(error);
			});
		});
		this.sanitizer = new TerminalSanitizer(config.maxReadBytes);
		this.scrollback = new BoundedTextBuffer(config.scrollbackMaxBytes, config.scrollbackLines);
		terminal.output.on("data", this.onTerminalData);
		terminal.output.once("end", this.onTerminalEnd);
		terminal.output.once("error", this.onTerminalError);
		this.completion = terminal.done.then((outcome) => this.onExit(outcome), (error) => {
			this.onTransportFailure(error);
		});
	}
	/**
	* Capture startup output through the same readiness contract as later sends.
	* @param signal - optional cancellation while the shell reaches its first prompt.
	* @returns Resolves after startup readiness; rejects on exit or readiness timeout.
	*/
	async initialize(signal) {
		this.initializing = true;
		try {
			const result = await this.startSend({
				text: "",
				submit: false,
				...signal !== void 0 ? { signal } : {}
			}).done;
			if (result.waitReason === "session_exit") throw startupFailure("PTY shell exited during startup", void 0, result.viewport);
			if (result.waitReason === "timeout") throw startupFailure("PTY shell did not reach readiness before startup timeout", void 0, result.viewport);
			this.motd = result.viewport;
		} catch (error) {
			signal?.throwIfAborted();
			throw error;
		} finally {
			this.initializing = false;
		}
	}
	startSend(request) {
		if (this.closing) throw new Error("PTY session is closing");
		if (this.statusValue.kind === "exited") throw new Error("PTY session has exited");
		if (this.active !== void 0) throw new TerminalError(`PTY session already has an active send${this.activeWrite !== void 0 ? " or draining provider write" : this.interrupting !== void 0 ? " or draining foreground interrupt" : ""}`, "SEND_ACTIVE");
		if (request.signal?.aborted === true) throw new Error("PTY send aborted before write");
		const operation = new LocalSendOperation(this.config.maxReadBytes, Date.now(), () => {
			this.interrupt(operation);
		});
		this.active = operation;
		this.resetReadinessEvidence();
		if (request.signal !== void 0) {
			const onAbort = () => {
				operation.cancel();
			};
			request.signal.addEventListener("abort", onAbort, { once: true });
			this.activeAbort = () => request.signal?.removeEventListener("abort", onAbort);
		}
		this.activeDeadlineTimer = setTimeout(() => {
			if (this.active === operation) this.settleActive("timeout", this.activeWrite !== void 0 || this.interrupting === operation || this.protocolWorkPending());
		}, this.config.timeoutMs);
		this.beginSend(operation, request);
		return operation;
	}
	async beginSend(operation, request) {
		let foreground;
		try {
			if (this.protocolWorkPending()) await this.drainTerminalProtocol();
			const emulatorWrites = this.emulatorWrites;
			const responseWrites = this.responseWrites;
			foreground = await this.terminal.inspectForeground();
			if (this.protocolStateChanged(emulatorWrites, responseWrites)) foreground = await this.inspectForegroundAfterProtocol();
		} catch (error) {
			if (this.protocolWorkPending()) await this.drainTerminalProtocol();
			if (this.active === operation && !this.closing && this.interrupting !== operation) this.failActive(error);
			return;
		}
		try {
			if (this.active !== operation || this.closing || this.interrupting === operation) return;
			operation.setInitialForeground(foreground);
			const input = `${request.text}${request.submit ? "\r" : ""}`;
			if (input.length > 0 && !operation.cancelRequested) {
				this.resetReadinessEvidence();
				const write = this.terminal.write(input);
				this.activeWrite = write.then(() => true, () => false);
				try {
					await write;
				} finally {
					this.activeWrite = void 0;
				}
			}
			if (operation.cancelRequested) return;
			if (this.active === operation && operation.settled) {
				this.releaseSettledActive();
				return;
			}
			if (this.active === operation && !this.closing) {
				this.pollingReady = operation;
				this.schedulePoll(operation);
			}
		} catch (error) {
			if (this.active === operation && !this.closing) if (operation.settled) this.releaseSettledActive();
			else this.failActive(error);
		}
	}
	resetReadinessEvidence() {
		this.lastOutputAt = Date.now();
		this.promptSeen = false;
		this.promptTextSeen = false;
		this.promptTail = "";
	}
	read(request) {
		const snapshot = this.scrollback.snapshot();
		const lines = snapshot.text.split("\n");
		const totalLines = snapshot.text.length === 0 ? 0 : lines.length;
		const offset = request.offset ?? 0;
		const count = request.count ?? 500;
		if (!Number.isSafeInteger(offset) || offset < 0) throw new Error("PTY read offset must be a non-negative safe integer");
		if (!Number.isSafeInteger(count) || count <= 0) throw new Error("PTY read count must be a positive safe integer");
		if (offset >= totalLines) return {
			text: "",
			totalLines,
			lineBegin: offset,
			lineEnd: offset,
			truncated: snapshot.truncated
		};
		const end = totalLines - offset;
		const start = Math.max(0, end - count);
		const bounded = utf8Tail(lines.slice(start, end).join("\n"), this.config.maxReadBytes);
		const returnedLines = bounded.text.length === 0 ? 0 : bounded.text.split("\n").length;
		return {
			text: bounded.text,
			totalLines,
			lineBegin: offset,
			lineEnd: offset + returnedLines,
			truncated: snapshot.truncated || bounded.truncated
		};
	}
	async signal(signal) {
		if (this.closing) throw new Error("PTY session is closing");
		return {
			delivered: true,
			targetPgid: await this.terminal.signalForeground(signal)
		};
	}
	status() {
		return this.statusValue;
	}
	close(reason) {
		this.closing = true;
		if (this.closePromise !== void 0) return this.closePromise;
		const closing = this.closeOnce(reason).catch((error) => {
			this.closePromise = void 0;
			this.failActive(error);
			throw error;
		});
		this.closePromise = closing;
		return closing;
	}
	onTerminalData = (chunk) => {
		const bytes = typeof chunk === "string" ? Buffer.from(chunk, "utf8") : chunk;
		const data = this.decoder.decode(bytes, { stream: true });
		this.queueEmulatorData(data);
		this.onData(data);
	};
	onTerminalEnd = () => {
		this.onData(this.decoder.decode());
		this.appendOutput(this.sanitizer.flush());
		this.closeEmulator();
		this.outputEnded.resolve();
	};
	onTerminalError = (error) => {
		this.closeEmulator();
		this.onTransportFailure(error);
		this.outputEnded.resolve();
	};
	onData(data) {
		const sanitized = this.sanitizer.push(data);
		this.appendOutput(sanitized.text);
		if (sanitized.prompt) {
			this.promptSeen = true;
			this.promptTail = "";
			this.lastOutputAt = Date.now();
		}
		if (this.promptSeen && sanitized.promptTail !== void 0) {
			const remaining = Math.max(0, 6 - this.promptTail.length);
			this.promptTail += sanitized.promptTail.slice(0, remaining);
			if (sanitized.promptTail.length > remaining) this.promptTail = `${CONTROLLED_PROMPT}\0`;
			this.promptTextSeen = this.promptTail === CONTROLLED_PROMPT;
		}
	}
	async onExit(outcome) {
		await this.outputEnded.promise;
		if (this.transportFailure !== void 0) return;
		this.statusValue = {
			kind: "exited",
			exitCode: outcome.exitCode,
			signal: outcome.signal
		};
		this.settleActive("session_exit");
	}
	onTransportFailure(error) {
		const failure = error instanceof Error ? error : new Error(String(error));
		this.transportFailure ??= failure;
		this.statusValue = {
			kind: "exited",
			exitCode: null,
			signal: null
		};
		this.closeEmulator();
		this.failActive(failure);
		this.terminal.terminate().catch(() => {});
	}
	appendOutput(text) {
		if (text.length === 0) return;
		this.lastOutputAt = Date.now();
		this.scrollback.append(text);
		this.active?.append(text);
	}
	schedulePoll(operation, delayMs = this.config.pollIntervalMs) {
		if (this.active !== operation || this.interrupting === operation || this.polling) return;
		if (this.activeTimer !== void 0) clearTimeout(this.activeTimer);
		this.activeTimer = setTimeout(() => {
			this.activeTimer = void 0;
			this.pollReadiness(operation);
		}, delayMs);
	}
	async pollReadiness(operation) {
		if (this.active !== operation || this.polling) return;
		this.polling = true;
		try {
			if (this.statusValue.kind === "exited") {
				this.settleActive("session_exit");
				return;
			}
			if (this.protocolWorkPending()) await this.drainTerminalProtocol();
			const emulatorWrites = this.emulatorWrites;
			const responseWrites = this.responseWrites;
			let foreground = await this.terminal.inspectForeground();
			if (this.protocolStateChanged(emulatorWrites, responseWrites)) foreground = await this.inspectForegroundAfterProtocol();
			if (this.active !== operation || this.closing || this.interrupting === operation) return;
			const idleFor = Date.now() - this.lastOutputAt;
			if (this.promptSeen && foreground !== void 0 && this.shellPgid === void 0) this.shellPgid = foreground.processGroupId;
			if (this.promptSeen && this.promptTextSeen && idleFor >= this.config.pollIntervalMs && foreground?.processGroupId === this.shellPgid) {
				this.settleActive("stdin_read");
				return;
			}
			const elapsed = Date.now() - operation.startedAt;
			const startupHasOutput = !this.initializing || !this.scrollback.isEmpty;
			const acceptsStdinWait = startupHasOutput && foreground !== void 0 && operation.acceptsStdinWait(foreground.processGroupId, foreground.inputWaiting);
			if (elapsed >= this.config.exactProbeAfterMs && acceptsStdinWait) {
				this.settleActive("stdin_read");
				return;
			}
			const handoffGrace = this.promptSeen ? this.config.handoffGraceMs : 0;
			const tailGrace = this.promptSeen && !this.promptTextSeen && "dsh> ".startsWith(this.promptTail) ? this.config.promptTailGraceMs : 0;
			if (startupHasOutput && idleFor >= this.config.idleSilenceMs + handoffGrace + tailGrace) this.settleActive("inferred_idle");
		} catch (error) {
			if (this.protocolWorkPending()) await this.drainTerminalProtocol();
			if (this.active === operation && !this.closing && this.interrupting !== operation) this.failActive(error);
		} finally {
			this.polling = false;
			const active = this.active;
			if (active !== void 0 && this.pollingReady === active) this.schedulePoll(active);
		}
	}
	/** Wait until generated replies reach the provider before another send can publish. */
	async drainTerminalProtocol() {
		for (;;) {
			const emulatorWrites = this.emulatorWrites;
			await emulatorWrites;
			const responseWrites = this.responseWrites;
			await responseWrites;
			if (emulatorWrites === this.emulatorWrites && responseWrites === this.responseWrites && !this.protocolWorkPending()) return;
		}
	}
	/** Sample foreground state only after protocol replies are quiet for the entire inspection. */
	async inspectForegroundAfterProtocol() {
		for (;;) {
			if (this.protocolWorkPending()) await this.drainTerminalProtocol();
			const emulatorWrites = this.emulatorWrites;
			const responseWrites = this.responseWrites;
			const foreground = await this.terminal.inspectForeground();
			if (!this.protocolStateChanged(emulatorWrites, responseWrites)) return foreground;
		}
	}
	protocolStateChanged(emulatorWrites, responseWrites) {
		return emulatorWrites !== this.emulatorWrites || responseWrites !== this.responseWrites || this.protocolWorkPending();
	}
	protocolWorkPending() {
		return this.emulatorWriteDone !== void 0 || this.pendingResponseWrites > 0;
	}
	queueEmulatorData(data) {
		if (this.emulatorClosed) return;
		this.emulatorBuffer += data;
		if (this.emulatorWriteDone === void 0) {
			const idle = Promise.withResolvers();
			this.emulatorWrites = idle.promise;
			this.emulatorWriteDone = () => {
				idle.resolve(void 0);
			};
		}
		this.pumpEmulator();
	}
	pumpEmulator() {
		if (this.emulatorWriting || this.emulatorClosed) return;
		if (this.emulatorBuffer.length === 0) {
			const done = this.emulatorWriteDone;
			this.emulatorWriteDone = void 0;
			done?.();
			this.releaseSettledActive();
			return;
		}
		const data = this.emulatorBuffer;
		this.emulatorBuffer = "";
		this.emulatorWriting = true;
		try {
			this.emulator.write(data, () => {
				this.emulatorWriting = false;
				this.pumpEmulator();
			});
		} catch (error) {
			this.emulatorWriting = false;
			this.emulatorBuffer = "";
			const done = this.emulatorWriteDone;
			this.emulatorWriteDone = void 0;
			done?.();
			this.releaseSettledActive();
			if (!this.closing) this.onTransportFailure(error);
		}
	}
	finishResponseWrite() {
		this.pendingResponseWrites -= 1;
		this.releaseSettledActive();
	}
	releaseSettledActive() {
		const operation = this.active;
		if (operation === void 0 || !operation.settled || this.activeWrite !== void 0 || this.interrupting === operation || this.protocolWorkPending()) return;
		this.clearActive();
	}
	closeEmulator() {
		if (this.emulatorClosed) return;
		this.emulatorClosed = true;
		this.emulatorBuffer = "";
		this.emulatorWriting = false;
		const done = this.emulatorWriteDone;
		this.emulatorWriteDone = void 0;
		done?.();
		this.emulatorData.dispose();
		this.emulator.dispose();
	}
	settleActive(waitReason, retainOwnership = false) {
		const operation = this.active;
		if (operation === void 0) return;
		const scrollbackTruncated = this.scrollback.truncated;
		if (retainOwnership) {
			this.stopPolling();
			this.activeAbort?.();
			this.activeAbort = void 0;
		} else this.clearActive();
		operation.settle(waitReason, this.statusValue, scrollbackTruncated);
	}
	stopPolling() {
		this.stopReadinessPolling();
		if (this.activeDeadlineTimer !== void 0) clearTimeout(this.activeDeadlineTimer);
		this.activeDeadlineTimer = void 0;
	}
	stopReadinessPolling() {
		if (this.activeTimer !== void 0) clearTimeout(this.activeTimer);
		this.activeTimer = void 0;
		this.pollingReady = void 0;
	}
	clearActive() {
		const operation = this.active;
		this.stopPolling();
		this.activeAbort?.();
		this.activeAbort = void 0;
		if (this.interrupting === operation) this.interrupting = void 0;
		this.pollingReady = void 0;
		this.active = void 0;
	}
	failActive(error) {
		const operation = this.active;
		if (operation === void 0) return;
		this.clearActive();
		operation.fail(error);
	}
	interrupt(operation) {
		if (this.active !== operation) return;
		this.interrupting = operation;
		this.stopReadinessPolling();
		this.interruptOnce(operation);
	}
	async interruptOnce(operation) {
		try {
			const activeWrite = this.activeWrite;
			if (activeWrite !== void 0 && !await activeWrite) return;
			await this.terminal.signalForeground("SIGINT");
		} catch (error) {
			if (this.active === operation && !this.closing) this.onTransportFailure(error);
			return;
		} finally {
			if (this.interrupting === operation) this.interrupting = void 0;
		}
		if (this.active === operation && operation.settled) this.releaseSettledActive();
		else if (this.active === operation && !this.closing) {
			this.pollingReady = operation;
			this.schedulePoll(operation, 0);
		}
	}
	async closeOnce(reason) {
		this.stopPolling();
		this.closeEmulator();
		try {
			await this.terminal.terminate();
		} catch (error) {
			throw new Error(`PTY cleanup failed (${reason})`, { cause: error });
		}
		this.settleActive("session_exit");
		await this.completion;
		this.terminal.output.off("data", this.onTerminalData);
		this.terminal.output.off("end", this.onTerminalEnd);
		this.terminal.output.off("error", this.onTerminalError);
		if (this.transportFailure !== void 0) throw this.transportFailure;
	}
};
//#endregion
//#region lib/types/index.js
/**
* Persistent shell PTY backend over the subprocess terminal primitive, shared
* sandbox policy, bounded output, and provider-owned session cleanup.
* @module @deepseek-ai/dsh-terminal-bash
*/
/** Cordis plugin name. */
const name = "terminal-bash";
/** Required services: terminal registry, shared confinement policy, projection registry, and process substrate. */
const inject = [
	"terminals",
	"sandboxPolicy",
	"sessionProjections",
	"subprocess"
];
const sandboxModeFences = /* @__PURE__ */ new WeakMap();
function ensureSandboxModeFence(ctx, owner) {
	const existing = sandboxModeFences.get(owner);
	if (existing !== void 0) {
		existing.pty = ctx.terminals;
		existing.sandboxPolicy = ctx.sandboxPolicy;
		existing.sessionProjections = ctx.sessionProjections;
		return;
	}
	const state = {
		pty: ctx.terminals,
		sandboxPolicy: ctx.sandboxPolicy,
		sessionProjections: ctx.sessionProjections
	};
	sandboxModeFences.set(owner, state);
	owner.ctx.on("internal/dispatch", (_mode, eventName, args) => {
		if (eventName !== "session/event") return;
		const [session, event] = args;
		if (session !== owner.session || event.type !== "sandbox/mode") return;
		const currentMode = state.sessionProjections.stateOf(session, "sandboxMode") ?? null ?? state.sandboxPolicy.defaultMode;
		if (event.data.mode === currentMode || !state.pty.hasOwnerActivity(owner)) return;
		throw new Error(`cannot change sandbox mode from "${currentMode}" to "${event.data.mode}" while persistent terminal sessions are open or being created; wait for creation to settle and close them first`);
	}, { global: true });
}
function childEnvironment(spec, dialect) {
	const common = {
		TERM: "dumb",
		PAGER: "cat",
		GIT_PAGER: "cat",
		DSH_SHELL: "1",
		DSH_SESSION_ID: spec.owner.id,
		DSH_PTY_SESSION_ID: spec.sessionId
	};
	if (dialect === "pwsh") return {
		...common,
		NO_COLOR: "1"
	};
	return {
		...common,
		PS1: CONTROLLED_PROMPT,
		PROMPT_COMMAND: `printf "\\033]133;D;%s\\007" "$?"; PS1='${CONTROLLED_PROMPT}'`,
		BASH_SILENCE_DEPRECATION_WARNING: "1"
	};
}
/**
* The pwsh prompt function that emits the shared OSC `133;D;` + BEL marker
* before every prompt, mirroring bash's PROMPT_COMMAND. `[char]27`/`[char]7`
* build the control bytes at runtime because raw ESC characters in submitted
* input are unreliable under PSReadLine.
*/
const PWSH_PROMPT_SETUP = "function prompt { [Console]::Write([char]27 + ']133;D;' + [int]$LASTEXITCODE + [char]7); 'dsh> ' }";
/** Trailing share of the captured startup output a failure message carries. */
const STARTUP_OUTPUT_TAIL = 500;
/**
* Drop CSI and OSC control sequences so captured terminal output stays readable
* inside an error message. The child's own words (`'D:\x' is not recognized…`)
* are the point; the cursor and window-title traffic around them is not.
* @param text - raw viewport text.
* @returns the same text without terminal control sequences.
*/
function stripTerminalControls(text) {
	return text.replace(/\u001b\][^\u0007\u001b]*(?:\u0007|\u001b\\)/gu, "").replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/gu, "");
}
/**
* Describe a failed PTY startup with the evidence the session already holds.
*
* The bare reason names neither the program nor what it said, so every cause
* looks identical from the outside: a sandbox that refused the wrap, a console
* host that mangled the command line, a shell that died in its own startup all
* surface as one sentence. The launched argv and the child's last output are
* what tell them apart, and they are only available here.
* @param message - the reason that classified the wait.
* @param argv - the exact program and arguments the PTY was given, when known.
* @param viewport - text the session captured before it settled.
* @returns the error to reject the startup with.
*/
function startupFailure(message, argv, viewport) {
	const lines = [message];
	if (argv !== void 0) lines.push(`argv: ${argv.join(" ")}`);
	const captured = stripTerminalControls(String(viewport)).trim();
	if (captured.length > 0) lines.push(`output: ${captured.length > STARTUP_OUTPUT_TAIL ? `…${captured.slice(-STARTUP_OUTPUT_TAIL)}` : captured}`);
	return new Error(lines.join("\n"));
}
async function spawnArgv(ctx, config, policy, signal) {
	const argv = [config.shellPath, ...config.shellArgs];
	if (policy.mode === "danger-full-access") return argv;
	const sandbox = ctx.get("sandbox");
	if (sandbox === void 0) throw new Error(`terminal-bash: sandbox mode "${policy.mode}" requires a ctx.sandbox provider in the execution world`);
	return (await sandbox.confine(argv, {
		...policy,
		mode: policy.mode
	}, signal)).argv;
}
async function startupSession(session, dialect, timeoutMs, signal, argv) {
	let startupOperation;
	const start = async () => {
		if (dialect === "bash") {
			await session.initialize(signal);
			return;
		}
		let viewport = "";
		for (;;) {
			const first = viewport.length === 0;
			startupOperation = session.startSend({
				text: first ? ENCODING_PREAMBLE + PWSH_PROMPT_SETUP : "",
				submit: first,
				...signal !== void 0 ? { signal } : {}
			});
			const result = await startupOperation.done;
			if (result.waitReason === "session_exit") throw startupFailure("PTY shell exited during startup", argv, result.viewport);
			if (result.waitReason === "timeout") throw startupFailure("PTY shell did not reach readiness before startup timeout", argv, result.viewport);
			viewport = result.viewport;
			if (result.waitReason === "stdin_read") break;
		}
		session.motd = viewport;
	};
	const races = [];
	let onAbort;
	if (signal !== void 0) {
		const aborted = Promise.withResolvers();
		onAbort = () => {
			aborted.reject(signal.reason);
		};
		signal.addEventListener("abort", onAbort, { once: true });
		races.push(aborted.promise);
	}
	let deadlineTimer;
	if (dialect === "pwsh") {
		const deadline = Promise.withResolvers();
		deadlineTimer = setTimeout(() => {
			startupOperation?.cancel();
			deadline.reject(/* @__PURE__ */ new Error("PTY shell did not reach readiness before startup timeout"));
		}, timeoutMs);
		races.push(deadline.promise);
	}
	try {
		signal?.throwIfAborted();
		await Promise.race([start(), ...races]);
	} finally {
		if (deadlineTimer !== void 0) clearTimeout(deadlineTimer);
		if (signal !== void 0 && onAbort !== void 0) signal.removeEventListener("abort", onAbort);
	}
}
/** Reject a failed startup only after its unpublished resources reach quiescence. */
async function rejectAfterStartupCleanup(error, cleanup) {
	try {
		await cleanup();
	} catch (cleanupError) {
		throw new TerminalBackendCleanupError(error, cleanupError);
	}
	throw error;
}
/** Local shell backend registered under the configured type. */
var BashTerminalBackend = class {
	ctx;
	config;
	spawnTerminal;
	createSession;
	type;
	constructor(ctx, config, spawnTerminal = (spec) => ctx.subprocess.spawnTerminal(spec), createSession = (terminal, config) => new LocalPtySession(terminal, config)) {
		this.ctx = ctx;
		this.config = config;
		this.spawnTerminal = spawnTerminal;
		this.createSession = createSession;
		this.type = config.backendType;
	}
	async spawn(spec) {
		spec.signal?.throwIfAborted();
		ensureSandboxModeFence(this.ctx, spec.owner);
		const policy = this.ctx.sandboxPolicy.resolve({ session: spec.owner.session });
		const argv = await spawnArgv(this.ctx, this.config, policy, spec.signal);
		spec.signal?.throwIfAborted();
		if (argv[0] === void 0) throw new Error("terminal-bash: sandbox returned empty argv");
		const terminal = await this.spawnTerminal({
			argv,
			cwd: spec.cwd ?? policy.workspaceRoot,
			env: childEnvironment(spec, this.config.shellDialect),
			rows: this.config.rows,
			cols: this.config.cols,
			terminalType: "dumb",
			graceMs: this.config.disposeGraceMs,
			signal: spec.signal
		});
		let session;
		try {
			session = this.createSession(terminal, this.config);
		} catch (error) {
			return rejectAfterStartupCleanup(error, () => terminal.terminate());
		}
		try {
			await startupSession(session, this.config.shellDialect, this.config.timeoutMs, spec.signal, argv);
			return session;
		} catch (error) {
			return rejectAfterStartupCleanup(error, () => session.close("PTY startup failed"));
		}
	}
};
/** Register the local PTY backend. */
function apply(ctx, config) {
	const resolved = resolveConfig(config);
	validateConfig(resolved);
	ctx.terminals.registerBackend(new BashTerminalBackend(ctx, resolved));
}
//#endregion
export { BashTerminalBackend, Config, PWSH_PROMPT_SETUP, apply, inject, name };

/** Linux user-systemd scope launch and managed-range ownership. */
import { spawn, spawnSync } from 'node:child_process';
import type { SubprocessOutcome, SubprocessSpawnSpec, SubprocessTerminalSpawnSpec } from '@deepseek-ai/dsh-subprocess';
import { loadLinuxExecve } from './linux-execve.ts';
import type { BoundProcessOwner, ManagedProcessLaunch } from './managed-owner.ts';
import type { RunnerInvocation } from './runner-launch.ts';
/** Test seams for systemd command execution. */
export interface LinuxScopeInternals {
    spawn?: typeof spawn;
    spawnSync?: typeof spawnSync;
    systemctlQuery?: (command: string, args: readonly string[]) => Promise<SystemctlResult>;
    systemdRun?: string;
    systemctl?: string;
    runnerInvocation?: RunnerInvocation;
    resolveRunnerInvocation?: () => RunnerInvocation;
    runnerAvailable?: (invocation: RunnerInvocation) => boolean;
    loadLinuxExecve?: typeof loadLinuxExecve;
    sleep?: (delayMs: number, signal?: AbortSignal) => Promise<void>;
    /** Kernel unix socket table read by the user-manager confirmation; defaults to /proc/net/unix. */
    unixSocketTable?: string;
}
interface SystemctlResult {
    status: number | null;
    stdout: string;
    stderr: string;
    error?: Error;
}
/** systemd-run options that keep target argv literal; empty where scope mode never expands argv. */
export type LiteralArgvOptions = readonly string[];
/**
 * Confirm this exact runner entry and libc execve binding without a probe mode.
 * @param internals - optional runner and libc-binding seams used by tests.
 * @returns whether the bootstrap can enter the final target.
 */
export declare function probeLinuxBootstrap(internals?: LinuxScopeInternals): boolean;
/**
 * Confirm current literal-argv transient-scope support before selecting native launch.
 * @param internals - optional systemd command seams used by tests.
 * @returns the options that keep target argv literal, or undefined when the user manager cannot create the scope.
 */
export declare function probeLinuxScope(internals?: LinuxScopeInternals): LiteralArgvOptions | undefined;
/**
 * Check every Linux native prerequisite on each call.
 * @param internals - optional native capability seams used by tests.
 * @returns the literal-argv scope options when Linux native containment is available, otherwise undefined.
 */
export declare function probeLinuxNative(internals?: LinuxScopeInternals): LiteralArgvOptions | undefined;
/**
 * Query the user manager once through systemctl.
 * @param internals - optional systemctl seam used by tests.
 * @returns whether the query succeeds.
 */
export declare function probeLinuxManager(internals?: LinuxScopeInternals): boolean;
/**
 * Identify the user manager's listener on `$XDG_RUNTIME_DIR/systemd/private`, the socket
 * `systemd-run --user` connects through.
 * @param internals - optional socket-table seam used by tests.
 * @returns the listening socket's inode from the kernel socket table, or undefined when
 *   XDG_RUNTIME_DIR is unset or nothing in this network namespace listens there.
 */
export declare function linuxManagerListener(internals?: LinuxScopeInternals): string | undefined;
/**
 * Identify the systemd-run binary that scope launches resolve through PATH, so a package upgrade
 * that replaces it triggers another probe of its literal-argv options.
 * @param internals - optional systemd-run seam used by tests.
 * @returns the device, inode, size, and modification time of the first match, or undefined when none resolves.
 */
export declare function systemdRunIdentity(internals?: LinuxScopeInternals): string | undefined;
/**
 * Confirm the user manager before a scope launch. A listener on its private socket confirms it
 * without a child process; otherwise one systemctl query decides. A hung manager that still
 * listens passes, and its scope launch fails with LinuxScopeNotStartedError.
 * @param internals - optional socket-table and systemctl seams used by tests.
 * @returns whether a scope launch can reach the user manager.
 */
export declare function confirmLinuxManager(internals?: LinuxScopeInternals): boolean;
interface DirectRange {
    running(): boolean;
    /** True for group TERM delivery, direct signal submission, or proven direct-PID absence. */
    signal(signal: 'SIGTERM' | 'SIGKILL'): boolean;
    /** Direct exit/error settlement, independent of output drain and managed-range completion. */
    settled: Promise<unknown>;
}
/** A scope launch whose bootstrap never consumed its launch request, so its target never ran. */
export declare class LinuxScopeNotStartedError extends Error {
    readonly name = "LinuxScopeNotStartedError";
}
/**
 * Send a direct-process signal, distinguishing an absent PID from failed delivery.
 * @param pid - owned direct-process identity whose exit notification can still be pending.
 * @param send - platform signal operation; true means the signal was submitted.
 * @returns whether the signal was submitted or the owned PID is already absent.
 */
export declare function signalLinuxDirectProcess(pid: number, send: () => boolean): boolean;
/** Linux PTY invocation and owner for the exact one-shot scope/bootstrap. */
export interface LinuxTerminalScopeLaunch {
    command: string;
    args: string[];
    cwd: string;
    env: NodeJS.ProcessEnv;
    bindOwner: (direct: DirectRange) => BoundProcessOwner;
    resolveOutcome: (outcome: SubprocessOutcome) => SubprocessOutcome;
    cleanup: () => void;
}
/**
 * Prepare one Linux PTY scope using the same launch request and bootstrap core.
 * @param spec - terminal target request.
 * @param targetEnv - validated complete target environment.
 * @param literalArgv - options from the provider's positive scope probe.
 * @param internals - optional runner and systemd seams used by tests.
 * @returns invocation and ownership callbacks; requested termination preserves the observed signal even before bootstrap consumption.
 */
export declare function prepareLinuxTerminalScope(spec: SubprocessTerminalSpawnSpec, targetEnv: Record<string, string>, literalArgv: LiteralArgvOptions, internals?: LinuxScopeInternals): LinuxTerminalScopeLaunch;
/**
 * Launch one ordinary target inside a transient user scope.
 * @param spec - ordinary target request.
 * @param targetEnv - validated complete target environment.
 * @param literalArgv - options from the provider's positive scope probe.
 * @param internals - optional runner and systemd seams used by tests.
 * @returns streams, result, and scope owner; requested termination preserves the observed signal even before bootstrap consumption.
 */
export declare function launchLinuxScope(spec: SubprocessSpawnSpec, targetEnv: Record<string, string>, literalArgv: LiteralArgvOptions, internals?: LinuxScopeInternals): ManagedProcessLaunch;
export {};
//# sourceMappingURL=linux-scope.d.ts.map
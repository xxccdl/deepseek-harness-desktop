/** Linux native containment decisions over injected host observations. */
import type { LiteralArgvOptions } from './linux-scope.ts';
/** Host observations behind each decision; the runtime supplies the real checks and tests script them. */
export interface LinuxScopeObservations {
    /** Run the deep transient-scope probe: literal-argv options when a scope can start, otherwise undefined. */
    probe(): LiteralArgvOptions | undefined;
    /** Identify the process listening on the user manager's private socket, or undefined when none listens. */
    managerListener(): string | undefined;
    /** Confirm the user manager before a launch under a positive verdict. */
    confirmManager(): boolean;
    /** Identify the systemd-run binary scope launches resolve, or undefined when none resolves. */
    launcherIdentity(): string | undefined;
}
/** Event that made the selector probe: the first selection or one that invalidated the previous verdict. */
export type LinuxProbeTrigger = 'first' | 'scope-not-started' | 'new-listener' | 'launcher-changed';
/** One containment decision and the branch that produced it. */
export type LinuxScopeDecision = {
    readonly kind: 'scope';
    /** A probe found scope support, or a positive verdict confirmed the user manager. */
    readonly reason: 'probe-available' | 'manager-confirmed';
    readonly literalArgv: LiteralArgvOptions;
    /** Probe count when the verdict was made; pass it to scopeNotStarted for a failed launch. */
    readonly generation: number;
    readonly probe: LinuxProbeTrigger | undefined;
} | {
    readonly kind: 'fallback';
    /**
     * A probe found no scope support; a positive verdict failed to confirm the manager for this launch;
     * or a negative verdict saw no listener or the listener present at the failed probe.
     */
    readonly reason: 'probe-unavailable' | 'manager-unconfirmed' | 'no-listener' | 'same-listener';
    readonly probe: LinuxProbeTrigger | undefined;
};
/**
 * Provider-lifetime Linux scope selection. A probe runs on the first selection and again only after
 * a scope launch never started its target, a different user-manager listener appears under a
 * negative verdict, or the systemd-run binary changes under a positive one. A positive verdict
 * confirms the user manager on every selection. Selection is synchronous, so a decision stays
 * valid for the launch that follows it.
 */
export declare class LinuxScopeSelector {
    private readonly observe;
    private state;
    private generation;
    /** @param observe - host checks consulted by each selection. */
    constructor(observe: LinuxScopeObservations);
    /**
     * Choose containment for one eligible launch.
     * @returns the decision and the branch that produced it.
     */
    select(): LinuxScopeDecision;
    /**
     * Record that a scope launched under generation exited before its bootstrap started the target,
     * so the next selection probes again. Launches from a superseded probe are ignored.
     * @param generation - generation of the scope decision that launched it.
     */
    scopeNotStarted(generation: number): void;
    private probe;
}
//# sourceMappingURL=linux-scope-selector.d.ts.map
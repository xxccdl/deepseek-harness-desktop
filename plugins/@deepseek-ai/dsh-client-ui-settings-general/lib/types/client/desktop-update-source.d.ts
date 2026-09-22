import type { DesktopUpdateBridge, DesktopUpdateView } from '../types.ts';
/** Owns one preload subscription across both sidebar locations. */
export declare class DesktopUpdateSource {
    private readonly bridge;
    /** Framework-observed carrier status shared by both sidebar controls. */
    readonly store: import("@deepseek-ai/dsh-client-store").SnapshotStore<DesktopUpdateView>;
    private live;
    private received;
    private readonly unsubscribe;
    /** @param bridge - Optional isolated Electron API, absent in ordinary browsers. */
    constructor(bridge: DesktopUpdateBridge | undefined);
    /** Invoke one user action; subsequent clicks join the shell-owned operation. */
    open(): void;
    /** Detach the carrier and ignore any pending status or action completion. */
    dispose(): void;
}
//# sourceMappingURL=desktop-update-source.d.ts.map
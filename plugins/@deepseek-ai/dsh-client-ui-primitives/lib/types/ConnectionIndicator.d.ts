/** Visual state rendered by {@link ConnectionIndicator}. */
export type ConnectionIndicatorState = 'disconnected' | 'connecting' | 'recovered';
/**
 * Render an inline connection-recovery control. The outage and retry-attempt
 * states are one button whose static label already names the retry action;
 * clicking it requests an immediate reconnect. The indicator animates in on
 * appearance and fades out for {@link EXIT_MS} before unmounting.
 * @param props.state - visible outage, retry-attempt, or recovered state.
 * @param props.disconnectedLabel - localized outage text naming the retry action.
 * @param props.connectingLabel - localized retry text followed by the attempt dots.
 * @param props.recoveredLabel - localized recovery confirmation.
 * @param props.reconnectActionLabel - accessible label for the outage action.
 * @param props.restartActionLabel - accessible label for replacing an active attempt.
 * @param props.onReconnect - request an immediate reconnect attempt.
 * @returns the indicator, or null when no connection feedback is active.
 */
export declare function ConnectionIndicator({ state, disconnectedLabel, connectingLabel, recoveredLabel, reconnectActionLabel, restartActionLabel, onReconnect, }: {
    state: ConnectionIndicatorState | undefined;
    disconnectedLabel: string;
    connectingLabel: string;
    recoveredLabel: string;
    reconnectActionLabel: string;
    restartActionLabel: string;
    onReconnect: () => void;
}): import("react").JSX.Element | null;
//# sourceMappingURL=ConnectionIndicator.d.ts.map
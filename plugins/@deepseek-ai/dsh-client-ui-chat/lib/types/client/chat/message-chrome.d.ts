import type { Translate } from '@deepseek-ai/dsh-client-ui-slots';
/** The date-template share of the conversation dictionary the clock consumes. */
export type ClockTranslate = Translate<'clock.md' | 'clock.ymd'>;
/** The elapsed-duration share of the conversation dictionary. */
export type RunDurationTranslate = Translate<'duration.secondUnit' | 'duration.minuteUnit' | 'duration.hourUnit'>;
/** Refresh interval for whole-second live run clocks. */
export declare const LIVE_RUN_CLOCK_INTERVAL_MS = 1000;
/**
 * Local calendar-day epoch (ms at local midnight) for an instant.
 * @param ms - Unix epoch ms.
 * @returns Midnight of that local calendar day.
 */
export declare function startOfLocalDay(ms: number): number;
/**
 * Delay until the next local midnight after `ms` (at least 1ms).
 * @param ms - Unix epoch ms.
 * @returns Milliseconds until the following local midnight.
 */
export declare function msUntilNextLocalMidnight(ms: number): number;
/** One numeric value or localized unit in an elapsed-time label. */
export interface RunDurationPart {
    readonly text: string;
    readonly numeric: boolean;
}
/**
 * Build elapsed-time fragments for both live and completed Turn labels.
 * @param ms - elapsed milliseconds; negatives clamp to zero and fractions floor.
 * @param t - translate seat supplying units and their trailing spacing.
 * @returns numbers and localized units in display order, without leading zeros;
 * minutes start at 60 seconds and hours at 60 minutes.
 */
export declare function formatRunDuration(ms: number, t: RunDurationTranslate): RunDurationPart[];
/**
 * Decode-throughput figure: whole tokens from ten up, one decimal below.
 * @param tps - Tokens per second.
 * @returns Display number without unit.
 */
export declare function formatTokensPerSecond(tps: number): string;
/**
 * Compact local timestamp for message IconActions. Same calendar day →
 * `HH:mm`; earlier this year → the `clock.md` date template + clock; other
 * years → the `clock.ymd` template + clock. Pure: the date templates arrive
 * through the caller's locale seat.
 * @param time - Unix epoch ms from the source session event.
 * @param t - translate seat supplying the `clock.md` / `clock.ymd` templates.
 * @param now - Reference instant for the day/year cut (defaults to wall clock).
 * @returns Date-aware clock string (24-hour, zero-padded time).
 */
export declare function formatMessageClock(time: number, t: ClockTranslate, now?: number): string;
//# sourceMappingURL=message-chrome.d.ts.map
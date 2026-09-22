import type { Translate } from '@deepseek-ai/dsh-client-ui-slots';
/** The date-template share of the conversation dictionary the clock consumes. */
export type ClockTranslate = Translate<'clock.md' | 'clock.ymd'>;
/** The elapsed-duration share of the conversation dictionary. */
export type RunDurationTranslate = Translate<'duration.seconds' | 'duration.minutes' | 'duration.hours'>;
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
/**
 * Localized elapsed-time label for the running conversation clock.
 * @param ms - Elapsed duration in milliseconds (negatives clamp to zero).
 * @param t - Translate seat supplying the duration templates.
 * @returns Display string in whole seconds; minutes and seconds once the
 * duration reaches a minute; hours, minutes, and seconds once it reaches an
 * hour, with the smaller units zero-padded.
 */
export declare function formatRunDuration(ms: number, t: RunDurationTranslate): string;
/**
 * Localized live elapsed time without padded seconds or early rollover.
 * @param ms - Elapsed duration in milliseconds (negatives clamp to zero).
 * @param t - Translate seat supplying the duration templates.
 * @returns Whole seconds without a leading zero; minutes start at 60 seconds
 * and hours start at exactly 60 minutes.
 */
export declare function formatLiveRunDuration(ms: number, t: RunDurationTranslate): string;
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
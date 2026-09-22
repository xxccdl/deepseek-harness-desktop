/** General Settings row for performance and usage detail. */
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { PerformanceUsageMode } from '../../chat-settings.ts';
import type { PerformanceUsageInjected } from '../contract/slots.ts';
/** Registration-side performance and usage preference face. */
export interface PerformanceUsageRowInjected extends PerformanceUsageInjected {
    /** Change the performance and usage detail. */
    setPerformanceUsage: (mode: PerformanceUsageMode) => void;
}
/** Full Settings-row props. */
export type PerformanceUsageRowProps = PropsRuntime<'settings.general.item'> & PropsLocale<'chat'> & InjectFace<PerformanceUsageRowInjected>;
/**
 * Render the performance and usage detail selector.
 * @param props - composed Settings slot props.
 * @returns the preference row.
 */
export declare function PerformanceUsageRow({ usePerformanceUsage, setPerformanceUsage, t }: PerformanceUsageRowProps): import("react").JSX.Element;
//# sourceMappingURL=PerformanceUsageRow.d.ts.map
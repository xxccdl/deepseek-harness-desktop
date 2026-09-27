/** Capped process-group scrolling and fades over the shared follow controller. */
import { type DOMAttributes, type RefObject } from 'react';
interface ScrollEdges {
    readonly canScrollUp: boolean;
    readonly canScrollDown: boolean;
}
/**
 * Observe one group's body and content without coupling its follow intent to the outer transcript.
 * Wheel, touchstart, any pointerdown, and unprevented scroll keys interrupt active animations,
 * including events from editable controls; subsequent position sampling determines follow intent.
 * @param bodyRef - capped scrolling body.
 * @param contentRef - uncapped content whose size reports growth.
 * @param open - local disclosure state.
 * @param grouped - whether the display mode retains the group's height cap.
 * @returns edge fades, DOM event bindings, and one-shot positioning for manual opening.
 */
export declare function useProcessScroll(bodyRef: RefObject<HTMLDivElement>, contentRef: RefObject<HTMLDivElement>, open: boolean, grouped: boolean): {
    edges: ScrollEdges;
    events: Pick<DOMAttributes<HTMLDivElement>, 'onScroll' | 'onWheel' | 'onTouchStart' | 'onPointerDown' | 'onKeyDown'>;
    initialize: (position: 'top' | 'bottom') => void;
};
export {};
//# sourceMappingURL=use-process-scroll.d.ts.map
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots';
import type { OpenFileOptions } from '@deepseek-ai/dsh-client-ui-chat/client';
/** One recorded entity, receipt, or collapsible group of related values. */
export interface ToolDetailItem {
    title?: string;
    subtitle?: string;
    description?: string;
    badge?: {
        label: string;
        tone: 'neutral' | 'info' | 'success' | 'warning' | 'error';
    };
    status?: {
        value: 'completed' | 'in_progress' | 'pending';
        label: string;
    };
    previousStatus?: string;
    change?: {
        value: 'added' | 'removed' | 'updated';
        label: string;
    };
    fields: readonly {
        label: string;
        value: string;
    }[];
    lines?: readonly string[];
    markdown?: string;
    code?: {
        text: string;
        language?: string;
    };
    location?: {
        path: string;
        line?: number;
    };
    groups?: readonly {
        label: string;
        items: readonly ToolDetailItem[];
    }[];
}
/** Localized display data shared by the built-in detail cards. */
export interface ToolDetailsModel {
    items: readonly ToolDetailItem[];
    summary?: string;
    /** Header text while expanded, omitting a receipt status shown in the body. */
    expandedSummary?: string;
    empty?: string;
    caption?: string;
    unchanged?: {
        label: string;
        items: ToolDetailsModel['items'];
    };
}
interface DetailContentProps {
    t: TranslateNS<'conversation'>;
    onOpenFile?: ((path: string, options?: OpenFileOptions) => void) | undefined;
}
/**
 * Render recorded values with local disclosures, copy controls, and file navigation.
 * @param props.model - Localized fields or list items; an empty list uses its empty label.
 * @param props.hasInspect - Reserve space for the row's upper-right Inspect button.
 * @param props.t - Conversation dictionary for shared Markdown and code controls.
 * @param props.onOpenFile - Open a recorded file location in the session workspace.
 * @returns The expanded detail body.
 */
export declare function ToolDetails({ model, hasInspect, t, onOpenFile }: {
    model: ToolDetailsModel;
    hasInspect?: boolean;
} & DetailContentProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ToolDetails.d.ts.map
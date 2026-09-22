import type { InjectFace } from '@deepseek-ai/dsh-client-ui-slots';
import type { ChatNodeViewProps, PresentationInjected } from '../contract/slots.ts';
type AssistantNodeViewProps = ChatNodeViewProps<'assistant-step'> & InjectFace<PresentationInjected>;
/** Streaming, settled, and interrupted Assistant states share one keyed renderer instance. */
export declare const AssistantNodeView: import("react").MemoExoticComponent<({ node, groupPart, useDisclosure, useTurnData, turnProcess, openFile, renderMessageImages, fileMentions, usePresentation, t, }: AssistantNodeViewProps) => import("react").JSX.Element>;
export {};
//# sourceMappingURL=AssistantNodeView.d.ts.map
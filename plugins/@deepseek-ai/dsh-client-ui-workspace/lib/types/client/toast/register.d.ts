/** Business-owned mappings into the keyed Workspace Toast slot. */
import type { Context } from '@deepseek-ai/cordis';
import type { RowToastActions, WorkspaceViewStoreHandle } from '../contract/slots.ts';
/** Register notice presentations with their business-owned display fields and actions.
 * @param ctx - Workspace plugin context.
 * @param viewStore - Viewing store, read only by archive notices.
 * @param actions - Archive and source-opening callbacks.
 */
export declare function registerToasts(ctx: Context, viewStore: WorkspaceViewStoreHandle, actions: Pick<RowToastActions, 'undoArchive' | 'showArchived' | 'openForkSource'>): void;
//# sourceMappingURL=register.d.ts.map
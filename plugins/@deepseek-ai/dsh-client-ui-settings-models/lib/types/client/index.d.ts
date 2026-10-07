import type { Context as ClientContext } from '@deepseek-ai/cordis';
import { ModelsSettingsStore } from './store.ts';
import { type ModelsKey } from './locales.ts';
export type { ModelsSectionInjected, ModelsSectionProps } from './ModelsSection.tsx';
export type { ModelsFooterOwnerProps, ProviderCardExtrasOwnerProps } from './slot-contract.ts';
export type { ModelsKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** The Models page + product-onboarding copy. */
        'settings.models': ModelsKey;
    }
}
export type { ModelsSettingsState, ProviderDirectoryEntry, ProviderRow, } from './store.ts';
export type { ModelDiscoveryOutcome, ModelsOperations, SettingsWriteOutcome } from './operations.ts';
/**
 * Refetch the page snapshot only after its first load: an unopened Models
 * page must not fetch on background invalidations.
 * @param controller - the page store.
 */
export declare function refreshIfLoaded(controller: ModelsSettingsStore): void;
/**
 * Required services (cordis fiber inject). The target slot is declared by
 * ui-settings' apply, whose activation order relative to this one is NOT
 * constrained; registration depends on each slot through `slots.inject()`.
 */
export declare const inject: string[];
/**
 * Register the Models section once the `settings.section` declaration is on
 * the ledger, wire its store to the connection, and keep it fresh on every
 * pushed invalidation (settings, credentials, or provider topology).
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map
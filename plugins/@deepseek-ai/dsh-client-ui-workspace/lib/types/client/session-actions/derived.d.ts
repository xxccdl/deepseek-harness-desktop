/** Derived observable sources for the row actions' injected hooks. */
import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots';
/**
 * Project one observable into another, recomputing only when the source
 * snapshot changes identity, so consumers that select from the projection
 * (a Set lookup per row) never rebuild it per read.
 * @param source - the observable to project.
 * @param project - pure projection of one source snapshot.
 * @returns the projected observable, subscribing through the source.
 */
export declare function derive<S, T>(source: HostObservable<S>, project: (snapshot: S) => T): HostObservable<T>;
//# sourceMappingURL=derived.d.ts.map
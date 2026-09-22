/**
 * The staged form model behind a plugin's settings page.
 *
 * A card stages what the user types and writes it only when they save. Each
 * settings write is a durable, revision-fenced document mutation, so a control
 * that committed as it settled turned one edit into a write the user never
 * asked for and could not preview; staged text makes what is on screen exactly
 * what a save would store.
 *
 * A field shows its effective value — the user layer over the composition
 * layer over the schema default — and whether the user layer carries it. That
 * presence, not a value comparison, is what marks a field overridden: an
 * override equal to the composition default is still an override.
 */
import { type SnapshotStore } from '@deepseek-ai/dsh-client-store';
/** What the model reads of one Host entry's form. */
export interface SettingsFormScopeSnapshot<T> {
    /** `ready` while the Host serves the entry to this client; the form renders nothing otherwise. */
    status: 'loading' | 'ready' | 'unavailable';
    /** Last accepted schema-resolved section; undefined before the first acceptance. */
    value: T | undefined;
    /** Composition layer the value resolves over: what a field reverts to once cleared. */
    base: unknown;
    /** Raw user layer as stored; a field's PRESENCE here is what marks it overridden. */
    user: unknown;
    /** Whether the Host document accepts writes. */
    writable: boolean;
    /** Revision the snapshot was read at; a save fences its mutation with the revision its drafts started from. */
    revision: number | undefined;
}
/** One path edit a save sends, as the shared configuration form's `mutate` accepts it. */
export type SettingsFormPathOp = {
    op: 'set';
    path: readonly string[];
    value: unknown;
} | {
    op: 'unset';
    path: readonly string[];
};
/** The entry form the model stages over: the reads and the atomic write of the form `ui-settings` shares per Host entry. */
export interface SettingsFormScope<T> {
    /** @returns the current sync snapshot. */
    getSnapshot(): SettingsFormScopeSnapshot<T>;
    /**
     * Observe snapshot replacements.
     * @param listener - invoked after each snapshot change.
     * @returns the disposer removing this listener.
     */
    subscribe(listener: () => void): () => void;
    /**
     * Apply ordered field edits in one revision-fenced write.
     * @param ops - the edits, in staging order.
     * @param expectedRevision - the revision the drafts were staged against, when known.
     * @returns true for Host acceptance, false for refusal, after any recovery read.
     */
    mutate(ops: readonly SettingsFormPathOp[], expectedRevision?: number): Promise<boolean>;
}
/** The write one field's staged text performs when the card is saved. */
export type SettingsFieldWrite = {
    kind: 'set';
    value: unknown;
} | {
    kind: 'clear';
};
/** How one section field converts between its stored value and its draft text. */
export interface SettingsFieldSpec {
    /** Field name inside the namespace section. */
    field: string;
    /** Render a stored value as draft text; the empty string when the section carries none. */
    format: (value: unknown) => string;
    /**
     * The write this draft text stages, or undefined when the text is not a
     * value this field accepts — which blocks the save rather than discarding it.
     */
    parse: (text: string) => SettingsFieldWrite | undefined;
}
/**
 * A control whose value is written outside the settings section. A credential
 * literal never rides a response, so its draft has nothing to seed from: it is
 * blank until typed, and a blank draft writes nothing.
 */
export interface SettingsSecretSpec {
    /** Field name addressing this control inside the card's form. */
    field: string;
    /** Write the staged text; resolves to whether the Host accepted it. */
    write: (text: string) => Promise<boolean>;
}
/** One field as a card's control renders it. */
export interface SettingsFieldState {
    /** Draft text the control renders. */
    text: string;
    /**
     * Whether saving would leave a user-layer entry for this field. A staged
     * edit answers for itself, so the badge previews the save rather than
     * reporting a state the pending edit already contradicts.
     */
    overridden: boolean;
    /** Whether the draft is not a value this field accepts, which blocks saving. */
    invalid: boolean;
}
/** Form state every plugin card shares. */
export interface SettingsFormShell {
    /** False while the namespace is not served to this client; the card renders nothing. */
    available: boolean;
    /** Whether the Host document accepts writes. */
    writable: boolean;
    /** Whether the form holds edits that a save would write. */
    dirty: boolean;
    /** Whether any staged draft is invalid, which blocks the save. */
    invalid: boolean;
    /** Whether a save is crossing the wire. */
    saving: boolean;
    /** Whether the last save did not land as staged; cleared by the next edit or save. */
    failed: boolean;
}
/** The write actions every plugin card's slot entry injects. */
export interface SettingsFormActions {
    /** Stage draft text for one field. */
    edit: (field: string, text: string) => void;
    /** Stage a clear, so saving lets the field re-inherit the composition layer. */
    resetField: (field: string) => void;
    /** Write every staged edit, then re-seed from what the Host accepted. */
    save: () => void;
    /** Drop every staged edit. */
    discard: () => void;
}
/**
 * A whole-number field. An empty draft clears the field; any other draft that
 * is not a finite number blocks the save.
 * @param field - field name inside the namespace section.
 * @returns the field's conversion spec.
 */
export declare function settingsNumberField(field: string): SettingsFieldSpec;
/**
 * A free-text field. An empty draft clears the field, so emptying the control
 * and saving is the same gesture as resetting it.
 * @param field - field name inside the namespace section.
 * @returns the field's conversion spec.
 */
export declare function settingsTextField(field: string): SettingsFieldSpec;
/**
 * Stages one card's edits over one settings namespace and writes them on save.
 *
 * The form publishes through a snapshot store because slot components read
 * through a snapshot selector, while both the scope and the local drafts
 * change underneath; every projection is rebuilt from the two together.
 */
export declare class SettingsFormModel<T> {
    private readonly scope;
    private readonly specs;
    private readonly secretSpecs;
    private readonly staged;
    private readonly listeners;
    private baseline;
    private readonly unsubscribe;
    private saving;
    private failed;
    /**
     * @param scope - the shared configuration form for this card's namespace.
     * @param specs - the section fields this card edits.
     * @param secrets - the card's write-only controls, written outside the section.
     */
    constructor(scope: SettingsFormScope<T>, specs: SettingsFieldSpec[], secrets?: SettingsSecretSpec[]);
    /**
     * Publish a projection of this form, rebuilt whenever the scope or a draft changes.
     * @param project - build the card's state from the form's current reads.
     * @returns the store the card's component reads through its bound selector.
     */
    bind<S>(project: () => S): SnapshotStore<S>;
    /**
     * Read the card-level state: what the Host serves, and what a save would do.
     * @returns the form state every card shares.
     */
    shell(): SettingsFormShell;
    /**
     * Read one control's state.
     * @param field - field name of a section field or of a write-only control.
     * @returns the draft text, whether a save would leave an override, and whether it is invalid.
     */
    field(field: string): SettingsFieldState;
    /**
     * Build the edit, reset, save, and discard actions bound to this form.
     * @returns the actions a card's slot entry injects.
     */
    actions(): SettingsFormActions;
    /**
     * Write every staged edit, then re-seed from what the Host accepted.
     *
     * The Host is the only authority on whether a value was accepted — its
     * validators own the constraints no schema can express — so the outcome is
     * read back from the section rather than predicted here. A save that did not
     * land keeps its drafts, so the user can correct them instead of retyping.
     * @returns settlement after every write and the read-back.
     */
    save(): Promise<void>;
    /** Release the form's accepted-value subscription. */
    dispose(): void;
    /**
     * Every staged edit a save would write. An entry whose draft is not a value
     * its field accepts carries no write: the form is still dirty, and the save
     * refuses rather than dropping the edit.
     * @returns the planned writes, in the order the fields were staged.
     */
    private plan;
    private stage;
    private spec;
    private snapshotOf;
    private sectionValue;
    private baseValue;
    private userLayer;
    private stored;
    private publish;
}
//# sourceMappingURL=form-model.d.ts.map
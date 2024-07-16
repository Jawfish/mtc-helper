/**
 * Actions are used to update the state of the global store based on mutations in the
 * DOM. They are called by the mutation handlers in the `MutationHandler` class.
 *
 * The functions here are intended to be pure functions that take the current state, and
 * element that was mutated and return the new state. You can create non-pure functions
 * and just call them for their side effects, too. If you want to do that, just return
 * `state` without modifying it.
 *
 * You can return partial state changes and the mutation handler will merge them into
 *  application state store, triggering an update for any listeners of that slice of the
 *  store.
 *
 * You can add the same action for multiple selectors or multiple actions for a single
 * selector. There is some awkwardness with the former, since the action would need a
 * few switches to determine different behavior based on the selector, but it's
 * possible.
 */

import { globalStore, Process } from '@src/store/globalStore';
import { StoreApi } from 'zustand';

export type Selector = () => Element | undefined;

type ActionPayload<T> = {
    readonly state: ReturnType<StoreApi<T>['getState']>;
    readonly element: Element | undefined;
};

export type Action<T> = (payload: ActionPayload<T>) => T;

/**
 * Options for an action.
 * - markElement: Add a custom attribute to the element to mark the element as seen.
 *   Actions that specify the same mark will not run if the mark is present on the
 *   element.
 * - runIfElementMissing: Run the action if the element is missing.
 * - process: Only run the action on the specified process if provided.
 */
type ActionOptions = {
    runIfElementMissing: boolean;
    markElement?: string;
    processes: Process[];
};

/**
 * Add a custom attribute to an element to mark it as seen by an action.
 *
 * @param marker The marker to add to the element.
 * @param element The element to mark.
 */
const addMarkerToElement = (element: Element | undefined, marker: string) => {
    element?.setAttribute(`data-mtc-helper-${marker}`, 'true');
};

/**
 * Check if an element has been marked by an action.
 *
 * @param marker The marker to check for.
 * @param element The element to check.
 * @returns True if the element has been marked, false otherwise.
 */
const elementHasMarker = (element: Element | undefined, marker: string) => {
    return Boolean(element?.attributes.getNamedItem(`data-mtc-helper-${marker}`));
};

export class MutationHandler {
    private actions: {
        selector: Selector;
        action: Action<unknown>;
        store: StoreApi<unknown>;
        options: ActionOptions;
    }[] = [];

    private observer: MutationObserver;

    constructor(targetNode: Node) {
        const config: MutationObserverInit = {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        };

        this.observer = new MutationObserver(this.handleMutations);
        this.observer.observe(targetNode, config);
    }

    /**
     * Set the mutation observer to watch for changes on an element that matches the
     * selector, calling the action function when a change is detected. The action
     * function will be called on any change to any element, but will only be passed the
     * element that is relevant to that action as specified by the selector.
     *
     * @param selector A function that returns the element to watch for changes.
     * @param action A function that returns the new state based on the current state
     * and the element.
     * @param store The Zustand store to update with the new state.
     * @param options Options for the action.
     */
    addAction<T>(
        selector: Selector,
        action: Action<T>,
        store: StoreApi<T>,
        options: ActionOptions
    ) {
        const a = action as Action<unknown>;
        this.actions.push({
            selector,
            action: a,
            store,
            options
        });
    }

    private handleMutations = () => {
        // There is a lack of consistency in determining which element was mutated on
        // Manticore. I'm not entirely sure why this is the case, though it may be
        // related to the virtual DOM. Ideally we would be able to pass the target of
        // the mutation. The workaround is to use the selector function to query the
        // element from the document. This is not ideal because it means every selector
        // is called on every mutation. If this is addressed in the future, note that
        // the `()` above can be replaced with `(listOfMutations)` to get access to the
        // list of mutations and pass the target to the action.
        this.actions.forEach(({ selector, action, store, options }) => {
            if (
                options.processes &&
                !options.processes.includes(globalStore.getState().process)
            ) {
                return;
            }

            const element = selector();

            if (!element && !options.runIfElementMissing) {
                return;
            }

            const marker = options.markElement;

            if (marker && elementHasMarker(element, marker)) {
                return;
            }

            if (marker) {
                addMarkerToElement(element, marker);
            }

            const state = store.getState();
            const newState = action({ state, element });

            if (newState === state) {
                return;
            }

            store.setState(newState);
        });
    };

    disconnect() {
        this.observer.disconnect();
        this.actions = [];
    }
}

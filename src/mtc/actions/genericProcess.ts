import { GenericProcessStoreState } from '@src/store/genericProcessStore';
import { Action } from '@mtc/MutationHandler';
import MarkdownConverter from '@lib/markdown';
import Logger from '@lib/logging';

/**
 * Returns the model's response state as markdown if the element is found, otherwise
 * returns the current state.
 */
export const updateSelectedModelResponse: Action<GenericProcessStoreState> = ({
    element,
    state
}) => {
    const { operatorResponseMarkdown } = state;

    // If the operator response is empty, we can't convert the model response from HTML
    // to markdown based on the operator's markdown style
    if (!operatorResponseMarkdown) {
        Logger.error(
            'Tried to update model response without operator response to base the markdown conversion on'
        );

        return state;
    }

    const modelResponseMarkdown = MarkdownConverter.instance
        .htmlToMarkdown(element as HTMLElement, operatorResponseMarkdown)
        .replaceAll('\\*', '*');

    return {
        ...state,
        modelResponsePlaintext: element?.textContent || undefined,
        modelResponseMarkdown
    };
};

export const updateOperatorResponse: Action<GenericProcessStoreState> = ({
    element,
    state
}) => {
    const operatorResponseMarkdown = element?.textContent || undefined;

    // If the operator response is empty, return the current state to preserve if it has
    // already been set
    if (!operatorResponseMarkdown) {
        return state;
    }

    return { ...state, operatorResponseMarkdown };
};

/**
 * Resets the selected response state to `undefined` if the specified element is not
 * found (i.e. the element indicating that a response is selected is not present).
 *
 * The primary use case for this action is to prevent stale data from being used when
 * the QA closes one of the responses in a non-Orochi process.
 */
export const resetSelectedResponse: Action<GenericProcessStoreState> = ({
    element,
    state
}) => {
    // Don't reset unless the target element has been removed from the DOM
    if (element) {
        return state;
    }

    return {
        ...state,
        modelResponseMarkdown: undefined,
        modelResponsePlaintext: undefined,
        operatorResponseMarkdown: undefined,
        unselectedResponse: undefined
    };
};

/**
 * Updates the unselected response state with the text content of the specified element.
 * The unselected response is the model response that the agent did NOT pick.
 */
export const updateUnselectedModelResponse: Action<GenericProcessStoreState> = ({
    element,
    state
}) => ({ ...state, unselectedResponse: element?.textContent || undefined });

/**
 * Updates the selected prompt state with the text content of the specified element.
 */
export const updateSelectedPrompt: Action<GenericProcessStoreState> = ({
    element,
    state
}) => ({ ...state, prompt: element?.textContent || undefined });

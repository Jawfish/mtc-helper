import HTMLToMarkdown from '@lib/markdown';
import { OrochiStoreState } from '@src/store/orochiStore';
import { Action } from '@mtc/MutationHandler';
import Logger from '@lib/logging';

/**
 * Returns new state with the operator's prompt as markdown if the element is found,
 * otherwise the current state.
 */
export const updatePrompt: Action<OrochiStoreState> = ({ element, state }) => {
    if (!element) {
        return state;
    }

    // Replace double quotes with single quotes to avoid and issue where copying a
    // Python prompt and pasting into an editor will result in a syntax error sinc the
    // prompt copied from MTC is wrapped in triple double quotes
    const text = HTMLToMarkdown.instance
        .htmlToMarkdown(element as HTMLElement, '')
        .replaceAll('"', "'");

    return { ...state, prompt: text };
};

/**
 * Returns the language state as 'python' if the element is found and indicates that
 * the language of the conversation is Python, 'unknown' if the element is found and
 * not Python, or undefined if the element is not found.
 */
export const updateLanguage: Action<OrochiStoreState> = ({ state, element }) => {
    const pyIndicators = ['Programming Language:Python', 'Programming Language*Python'];

    if (
        element?.textContent?.toLowerCase().includes('python') ||
        pyIndicators.some(indicator => element?.textContent?.includes(indicator)) ||
        element?.classList.contains('language-python')
    ) {
        return { ...state, language: 'python' };
    }

    return { ...state, language: 'unknown' };
};

/**
 * Returns the state with model response state converted to markdown if the element is
 * found, otherwise the current state.
 */
export const updateModelResponse: Action<OrochiStoreState> = ({ element, state }) => {
    if (!element) {
        return state;
    }

    if (!state.operatorResponse) {
        Logger.error(
            'Tried to update model response without operator response to base the markdown conversion on'
        );

        return state;
    }

    const modelResponse = HTMLToMarkdown.instance.htmlToMarkdown(
        element as HTMLElement,
        state.operatorResponse
    );
    const modelResponseCode =
        element?.querySelector('pre code')?.textContent || undefined;

    return {
        ...state,
        modelResponse,
        modelResponseCode
    };
};

/**
 * Returns the state with the raw operator response as markdown if the element is found,
 * otherwise the current state.
 */
export const updateOperatorResponse: Action<OrochiStoreState> = ({
    element,
    state
}) => {
    if (!element) {
        return state;
    }

    const operatorResponse = element.textContent || undefined;

    return {
        ...state,
        operatorResponse
    };
};

/**
 * Returns the state with the operator response code if the element is found, otherwise
 * the current state.
 */
export const updateOperatorResponseCode: Action<OrochiStoreState> = ({
    element,
    state
}) => {
    if (!element) {
        return state;
    }

    const operatorResponseCode =
        element.querySelector('pre code')?.textContent || undefined;

    return {
        ...state,
        operatorResponseCode
    };
};

/**
 * Removes the empty metadata section with the non-functioning save button that apepars
 * at the bottom of a response while editing it.
 *
 * This function is only called for its side effects.
 *
 * @returns always returns the current state with no changes
 */
export const removeUselessMetadata: Action<OrochiStoreState> = ({ element, state }) => {
    element?.remove();

    return state;
};

/**
 * Returns the state with the operator notes as markdown if the element is found,
 * otherwise the current state.
 */
export const updateOperatorNotes: Action<OrochiStoreState> = ({ element, state }) => {
    if (!element) {
        return state;
    }

    const operatorNotes = HTMLToMarkdown.instance.htmlToMarkdown(
        element as HTMLElement,
        ''
    );

    return { ...state, operatorNotes };
};

/**
 * Returns the state with the conversation title if the element is found, otherwise the current state.
 */
export const updateConversationTitle: Action<OrochiStoreState> = ({
    element,
    state
}) => {
    if (!element) {
        return state;
    }

    const conversationTitle = element.textContent?.trim() || undefined;

    return { ...state, conversationTitle };
};

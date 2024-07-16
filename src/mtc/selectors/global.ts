import { Selector } from '@mtc/MutationHandler';

/**
 * Select the main task window element.
 * @returns The task window element if found, otherwise `undefined`.
 */
export const taskWindow: Selector = (): HTMLDivElement | undefined => {
    const taskWindow = document.querySelector(
        '#__next > div > div > div > div > div.fixed.top-0.left-0.flex.h-screen.w-screen.items-center.justify-center'
    );

    return taskWindow instanceof HTMLDivElement ? taskWindow : undefined;
};

/**
 * Select the main task submission button element from a QA task.
 * @returns The task submit button element if found, otherwise `undefined`.
 */
export const submitButton: Selector = (): HTMLButtonElement | undefined => {
    const element = Array.from(document.querySelectorAll('span')).find(span =>
        span.textContent?.trim()?.includes('Submit QA Task')
    )?.parentElement;

    return element instanceof HTMLButtonElement ? element : undefined;
};

/**
 * Select the currently selected response, i.e. when the "edit" button has been clicked
 * on one of the responses.
 *
 * @returns The selected response element or `undefined` if not found.
 */
export const selectedResponse = (): HTMLDivElement | undefined => {
    const element = document.querySelector('div[id="0"]');

    if (element instanceof HTMLDivElement) {
        return element;
    }

    return undefined;
};

/**
 * Select the operator's original, raw response; the one that shows after the edit
 * button has been clicked and the "Edited" tab is selected.
 *
 * @returns The operator's response element or `undefined` if not found.
 */
export const editableOperatorResponse = (): HTMLDivElement | undefined => {
    const element = document.querySelector('div[contenteditable="true"]');

    if (element instanceof HTMLDivElement) {
        return element;
    }

    return undefined;
};

/**
 * Selects the model's raw response, after the edit button has been clicked and the
 * "Original" tab has been selected.
 *
 * @returns The model's response element or `undefined` if not found.
 */

export const modelResponse = (): HTMLDivElement | undefined => {
    if (editableOperatorResponse()) {
        return;
    }

    // 'div[data-cy="tab"]' where it's parent's parent's first child contains within it
    // a button that contains a span that has the text Save
    const element = Array.from(document.querySelectorAll('div[data-cy="tab"]')).find(
        div => {
            const grandparent = div.parentElement?.parentElement;
            if (!grandparent || !grandparent.firstElementChild) return false;

            const saveButton = grandparent.firstElementChild.querySelector('button');
            if (!saveButton) return false;

            const spanWithSaveText = Array.from(
                saveButton.getElementsByTagName('span')
            ).find(span => span.textContent?.trim().toLowerCase() === 'save');

            return !!spanWithSaveText;
        }
    );

    return element instanceof HTMLDivElement ? element : undefined;
};

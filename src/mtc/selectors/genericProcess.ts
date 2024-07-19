const selectButton = (): HTMLButtonElement | undefined => {
    const button = Array.from(document.querySelectorAll('button')).find(
        button => button.querySelector('span')?.textContent === 'Select'
    );

    if (button instanceof HTMLButtonElement) {
        return button;
    }

    return undefined;
};

/**
 * Selects the *unselected* response - the model response that the agent did not pick.
 * Retrurns `undefined` if the element is not found.
 */
export const unselectedResponse = (): HTMLDivElement | undefined => {
    const parentElement = selectButton()?.parentElement?.parentElement;
    const responseElement = parentElement?.querySelector('div[data-cy="tab"]');

    if (responseElement instanceof HTMLDivElement) {
        return responseElement;
    }

    return undefined;
};

const selectedPromptCloseButton = (): HTMLButtonElement | undefined => {
    const closeButton = Array.from(document.querySelectorAll('button')).find(
        button => button?.textContent === 'Close'
    );

    if (closeButton instanceof HTMLButtonElement) {
        return closeButton;
    }

    return undefined;
};

/**
 * Selects the selected prompt element. Returns `undefined` if the element is not found.
 */
export const selectedPrompt = () =>
    selectedPromptCloseButton()?.parentElement?.parentElement?.children[1];

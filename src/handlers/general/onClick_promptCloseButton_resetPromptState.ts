import { generalStore } from '@src/store/generalStore';
import Logger from '@lib/logging';

import { isClickWithinElement } from '../clickUtils';

const isPromptCloseButton = (target: Element) =>
    target.closest('button')?.querySelector('span')?.textContent === 'Close';

/**
 * Resets the prompt state when the prompt edit button is clicked.
 */
export const resetPromptState = (event: MouseEvent, target: Element) => {
    const button = target.closest('button');

    if (
        !button ||
        !isClickWithinElement(event, button) ||
        !isPromptCloseButton(button)
    ) {
        return;
    }

    Logger.debug('Prompt edit button clicked.');

    generalStore.getState().resetPrompt();
};

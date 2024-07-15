import { generalStore } from '@src/store/generalStore';
import {
    addMtcHelperAttributeToElement,
    elementHasMtcHelperAttribute
} from '@handlers/index';
import Logger from '@lib/logging';
import md from '@lib/markdown';

/**
 * Updates the prompt state in the generTal store when there are mutations to the prompt
 * element in the DOM.
 */
export const updatePromptState = (target: Element) => {
    const closeButton = Array.from(target.querySelectorAll('button')).find(
        button => button?.textContent === 'Close'
    );

    if (!closeButton || elementHasMtcHelperAttribute(closeButton)) {
        generalStore.getState().resetPrompt();

return;
    }

    addMtcHelperAttributeToElement(closeButton);

    const promptElement = closeButton.parentElement?.parentElement?.children[1];
    if (!promptElement || !(promptElement instanceof HTMLElement)) {
        Logger.debug('Prompt element not found.');

        return;
    }

    const text = md.instance.htmlToMarkdown(promptElement, '');

    generalStore.setState({
        prompt: text
    });
};

import { MutHandler } from '@handlers/index';
import Logger from '@src/lib/logging';
import md from '@lib/markdown';
import { generalStore } from '@src/store/generalStore';

import { elementHasMtcHelperAttribute, addMtcHelperAttributeToElement } from '..';

import { createCopyButtonElement } from './utils';

export const handlePromptMutation: MutHandler = (mutation: Element) => {
    const closeButton = Array.from(mutation.querySelectorAll('button')).find(
        button => button.textContent === 'Close'
    );
    if (!closeButton || elementHasMtcHelperAttribute(closeButton)) {
        return;
    }
    Logger.debug('Handling general prompt mutation.');

    addMtcHelperAttributeToElement(closeButton);

    const promptElement = closeButton.parentElement?.parentElement?.children[1];
    if (!promptElement || !(promptElement instanceof HTMLElement)) {
        Logger.debug('Prompt element not found.');

        return;
    }

    const text = md.instance.htmlToMarkdown(promptElement, '');
    // const plaintext = doubleSpace(markdownToTxt(promptContent));

    const container = document.createElement('div');
    const copyPrompt = createCopyButtonElement('prompt');

    container.className = 'flex gap-2 w-full justify-end mt-2 items-center';

    container.appendChild(copyPrompt.element);

    closeButton.parentElement?.insertAdjacentElement('afterend', container);

    generalStore.setState(state => ({
        ...state,
        prompt: {
            text,
            elements: {
                controlsContainer: container,
                copy: copyPrompt
            }
        }
    }));

    copyPrompt.update();
};

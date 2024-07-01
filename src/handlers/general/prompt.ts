import { MutHandler } from '@handlers/types';
import Logger from '@src/lib/logging';
import { getWordCount } from '@lib/textProcessing';
import md from '@lib/markdown';
import { generalStore } from '@src/store/generalStore';

import { elementHasMtcHelperAttribute, addMtcHelperAttributeToElement } from '..';

import { createWordCountElement, createCopyButtonElement } from './utils';

export const handleGeneralPromptMutation: MutHandler = (mutation: Element) => {
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

    const promptContent = promptElement.textContent || '';
    const wordCount = getWordCount(promptContent);
    const text = md.instance.htmlToMarkdown(promptElement, '');
    // const plaintext = doubleSpace(markdownToTxt(promptContent));

    const container = document.createElement('div');
    const wordCounter = createWordCountElement('prompt');
    const copyPrompt = createCopyButtonElement('prompt');

    container.className = 'flex gap-2 w-full justify-end mt-2 items-center';

    container.appendChild(wordCounter.element);
    container.appendChild(copyPrompt.element);

    closeButton.parentElement?.insertAdjacentElement('afterend', container);

    generalStore.setState(state => ({
        ...state,
        prompt: {
            wordCount,
            text,
            elements: {
                controlsContainer: container,
                wordCounter,
                copy: copyPrompt
            }
        }
    }));

    copyPrompt.update();
};

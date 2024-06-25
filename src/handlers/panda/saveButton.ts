import { MutHandler } from '@handlers/types';
import Logger from '@src/lib/logging';
import { pandaStore } from '@src/store/pandaStore';
import { getWordCount } from '@lib/textProcessing';

import { elementHasMtcHelperAttribute, addMtcHelperAttributeToElement } from '..';

import { getWordCountElement, getCopyButton, getControlsContainer } from './utils';

export const handlePandaSelectedResponseSaveButtonMutation: MutHandler = (
    mutation: Element
) => {
    const saveButton = Array.from(mutation.querySelectorAll('button')).find(
        button => button.textContent === 'Save' && button.classList.contains('text-xs')
    );

    if (!saveButton) {
        return;
    }

    const seen = elementHasMtcHelperAttribute(saveButton);
    if (seen) {
        return;
    }

    addMtcHelperAttributeToElement(saveButton);

    const contentElement = mutation.querySelector('div[contenteditable="true"]');
    const container = getControlsContainer();
    const wordCount = getWordCount(contentElement?.textContent || '');
    const wcElement = getWordCountElement(wordCount);
    const copyEditedButton = getCopyButton('Copy Edited');
    const copyOriginalButton = getCopyButton('Copy Original');
    copyOriginalButton.disabled = true;

    // update word count in the word count element when editedResponse changes
    pandaStore.subscribe(({ editedResponseMarkdown }) => {
        wcElement.textContent = `${getWordCount(editedResponseMarkdown || '')} words`;
    });

    // enable copy button when there is content to copy
    pandaStore.subscribe(({ originalResponseMarkdown }) => {
        copyOriginalButton.disabled = !originalResponseMarkdown;
    });

    copyEditedButton.addEventListener('click', () => {
        const { editedResponseMarkdown } = pandaStore.getState();
        if (!editedResponseMarkdown) {
            return;
        }

        navigator.clipboard.writeText(editedResponseMarkdown);
    });

    copyOriginalButton.addEventListener('click', () => {
        const { originalResponseMarkdown } = pandaStore.getState();
        if (!originalResponseMarkdown) {
            return;
        }

        navigator.clipboard.writeText(originalResponseMarkdown);
    });

    container.appendChild(wcElement);
    container.appendChild(copyEditedButton);
    container.appendChild(copyOriginalButton);
    saveButton.parentElement?.insertAdjacentElement('afterend', container);

    // when the save button is clicked, reset the state
    saveButton.addEventListener('click', () => {
        Logger.debug('Handling click on panda selected response save button.');

        pandaStore.setState({
            editedResponsePlaintext: undefined,
            editedResponseMarkdown: undefined,
            originalResponsePlaintext: undefined,
            originalResponseMarkdown: undefined,
            unselectedResponsePlaintext: undefined
        });
    });
};

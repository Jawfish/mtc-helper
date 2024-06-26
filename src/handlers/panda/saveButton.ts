import { MutHandler } from '@handlers/types';
import Logger from '@lib/logging';
import { pandaStore } from '@src/store/pandaStore';
import { getWordCount } from '@lib/textProcessing';

import { elementHasMtcHelperAttribute, addMtcHelperAttributeToElement } from '..';

import {
    createWordCountElement,
    createCopyButtonElement,
    createControlsContainerElement
} from './utils';

const selectSaveButton = (mutation: Element): HTMLButtonElement | null => {
    return Array.from(mutation.querySelectorAll('button')).find(
        button => button.textContent === 'Save' && button.classList.contains('text-xs')
    ) as HTMLButtonElement | null;
};

const createAndAppendControls = (
    saveButton: HTMLButtonElement,
    contentElement: Element | null
) => {
    const container = createControlsContainerElement();
    container.id = 'mtc-controls-container';
    const wordCount = getWordCount(contentElement?.textContent || '');
    const wcElement = createWordCountElement(wordCount);
    const copyEditedButton = createCopyButtonElement('Copy Edited');
    const copyOriginalButton = createCopyButtonElement('Copy Original');
    copyOriginalButton.disabled = true;

    container.appendChild(wcElement);
    container.appendChild(copyEditedButton);
    container.appendChild(copyOriginalButton);
    saveButton.parentElement?.insertAdjacentElement('afterend', container);

    return { wcElement, copyEditedButton, copyOriginalButton };
};

const setupWordCountSubscription = (wcElement: HTMLSpanElement) => {
    return pandaStore.subscribe(({ editedResponseMarkdown }) => {
        wcElement.textContent = `${getWordCount(editedResponseMarkdown || '')} words (edited)`;
    });
};

const setupCopyButtonSubscription = (copyOriginalButton: HTMLButtonElement) => {
    return pandaStore.subscribe(({ originalResponseMarkdown }) => {
        copyOriginalButton.disabled = !originalResponseMarkdown;
    });
};

const setupCopyButtonListeners = (
    copyEditedButton: HTMLButtonElement,
    copyOriginalButton: HTMLButtonElement
) => {
    copyEditedButton.addEventListener('click', () => {
        const { editedResponseMarkdown } = pandaStore.getState();
        if (editedResponseMarkdown) {
            navigator.clipboard.writeText(editedResponseMarkdown);
        }
    });

    copyOriginalButton.addEventListener('click', () => {
        const { originalResponseMarkdown } = pandaStore.getState();
        if (originalResponseMarkdown) {
            navigator.clipboard.writeText(originalResponseMarkdown);
        }
    });
};

const setupSaveButtonListener = (saveButton: HTMLButtonElement) => {
    saveButton.addEventListener('click', () => {
        Logger.debug('Handling click on panda selected response save button.');
        pandaStore.setState({
            editedResponseMarkdown: undefined,
            originalResponseMarkdown: undefined,
            unselectedResponsePlaintext: undefined
        });
    });
};

export const handlePandaSelectedResponseSaveButtonMutation: MutHandler = (
    mutation: Element
) => {
    const saveButton = selectSaveButton(mutation);
    if (!saveButton || elementHasMtcHelperAttribute(saveButton)) {
        return;
    }

    addMtcHelperAttributeToElement(saveButton);

    const contentElement = mutation.querySelector('div[contenteditable="true"]');
    const { wcElement, copyEditedButton, copyOriginalButton } = createAndAppendControls(
        saveButton,
        contentElement
    );

    setupWordCountSubscription(wcElement);
    setupCopyButtonSubscription(copyOriginalButton);
    setupCopyButtonListeners(copyEditedButton, copyOriginalButton);
    setupSaveButtonListener(saveButton);
};

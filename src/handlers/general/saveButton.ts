import { MutHandler } from '@handlers/types';
import Logger from '@lib/logging';
import { generalStore } from '@src/store/generalStore';

import { elementHasMtcHelperAttribute, addMtcHelperAttributeToElement } from '..';

import { createControlsContainerElement } from './utils';

const selectSaveButton = (mutation: Element): HTMLButtonElement | undefined => {
    return Array.from(mutation.querySelectorAll('button')).find(
        button => button.textContent === 'Save' && button.classList.contains('text-xs')
    ) as HTMLButtonElement | undefined;
};

const createControls = (saveButton: HTMLButtonElement): void => {
    const existingControls = generalStore.getState().selectedResponse.elements;
    if (existingControls.controlsContainer) {
        return;
    }

    const controlsContainer = createControlsContainerElement();

    saveButton.parentElement?.insertAdjacentElement('afterend', controlsContainer);
};

const setupSelectedWordCountListener = (contentElement: Element | undefined) => {
    Logger.debug('Setting up selected word count listener.');

    if (!contentElement) {
        Logger.warn('Content element not found.');

        return;
    }

    const updateSelectedWordCount = () => {
        const selection = window.getSelection();
        const selectedText = selection?.toString() || '';
        generalStore.setState(state => ({
            selectedResponse: {
                ...state.selectedResponse,
                selection: selectedText
            }
        }));
    };

    document.addEventListener('selectionchange', updateSelectedWordCount);
    contentElement.addEventListener('mouseup', updateSelectedWordCount);
    contentElement.addEventListener('blur', () => {});
};

const setupSaveButtonListener = (saveButton: HTMLButtonElement) => {
    saveButton.addEventListener('click', () => {
        Logger.debug('Handling click on general selected response save button.');
        generalStore.getState().reset();
    });
};

export const handleSaveButtonMutation: MutHandler = (mutation: Element) => {
    const saveButton = selectSaveButton(mutation);
    if (!saveButton || elementHasMtcHelperAttribute(saveButton)) {
        return;
    }
    addMtcHelperAttributeToElement(saveButton);
    const contentElement = mutation.querySelector('div[contenteditable="true"]');

    createControls(saveButton);
    setupSelectedWordCountListener(contentElement || undefined);
    setupSaveButtonListener(saveButton);
};

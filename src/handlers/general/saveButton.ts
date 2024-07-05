import { MutHandler } from '@handlers/index';
import Logger from '@lib/logging';
import { generalStore } from '@src/store/generalStore';

import { elementHasMtcHelperAttribute, addMtcHelperAttributeToElement } from '..';

import { createCopyButtonElement, createWordCountElement } from './utils';

const createControlsContainerElement = () => {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'flex gap-2 w-full justify-end mt-2 items-center';

    const editedWordCounter = createWordCountElement('edited');
    const originalWordCounter = createWordCountElement('original');
    const selectedWordCounter = createWordCountElement('selected');
    const copyEdited = createCopyButtonElement('edited');
    const copyOriginal = createCopyButtonElement('original');

    controlsContainer.appendChild(editedWordCounter.element);
    controlsContainer.appendChild(originalWordCounter.element);
    controlsContainer.appendChild(selectedWordCounter.element);
    controlsContainer.appendChild(copyEdited.element);
    controlsContainer.appendChild(copyOriginal.element);

    generalStore.setState(state => ({
        selectedResponse: {
            ...state.selectedResponse,
            elements: {
                ...state.selectedResponse.elements,
                controlsContainer,
                operatorResponseWordCounter: editedWordCounter,
                modelResponseWordCounter: originalWordCounter,
                selectionWordCounter: selectedWordCounter,
                copyEdited,
                copyOriginal
            }
        }
    }));

    return controlsContainer;
};
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

    const throttle = <T extends (...args: unknown[]) => void>(
        func: T,
        limit: number
    ): T => {
        let inThrottle = false;

        return function (this: unknown, ...args: Parameters<T>): void {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        } as T;
    };

    const updateSelectedWordCount = throttle(() => {
        const selection = window.getSelection();
        const selectedText = selection?.toString() || '';
        generalStore.setState(state => ({
            selectedResponse: {
                ...state.selectedResponse,
                selection: selectedText
            }
        }));
    }, 10);

    document.addEventListener('selectionchange', updateSelectedWordCount);
    contentElement.addEventListener('mouseup', updateSelectedWordCount);
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

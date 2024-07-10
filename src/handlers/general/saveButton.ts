import { MutHandler } from '@handlers/index';
import Logger from '@lib/logging';
import { generalStore } from '@src/store/generalStore';

import { elementHasMtcHelperAttribute, addMtcHelperAttributeToElement } from '..';

import { createCopyButtonElement } from './utils';

const createControlsContainerElement = () => {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'flex gap-2 w-full justify-end mt-2 items-center';

    const copyEdited = createCopyButtonElement("operator's");
    const copyOriginal = createCopyButtonElement("model's");

    controlsContainer.appendChild(copyEdited.element);
    controlsContainer.appendChild(copyOriginal.element);

    generalStore.setState(state => ({
        ...state,
        selectedResponse: {
            ...state.selectedResponse,
            elements: {
                ...state.selectedResponse.elements,
                controlsContainer,
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

    createControls(saveButton);
    setupSaveButtonListener(saveButton);
};

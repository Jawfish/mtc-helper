import { MutHandler } from '@handlers/index';
import Logger from '@src/lib/logging';
import { generalStore } from '@src/store/generalStore';

import { addMtcHelperAttributeToElement, elementHasMtcHelperAttribute } from '..';

import { createWordCountElement } from './utils';

const selectSelectButton = (): HTMLButtonElement | undefined => {
    const button = Array.from(document.querySelectorAll('button')).find(
        button => button.querySelector('span')?.textContent === 'Select'
    );

    if (button instanceof HTMLButtonElement) {
        return button;
    }

    return undefined;
};

const selectUnselectedResponse = (): HTMLDivElement | undefined => {
    const parentElement = selectSelectButton()?.parentElement?.parentElement;
    const responseElement = parentElement?.querySelector('div[data-cy="tab"]');

    if (responseElement instanceof HTMLDivElement) {
        return responseElement;
    }

    return undefined;
};

const createWordCounterContainer = () => {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'flex gap-2 w-full justify-end mt-2 items-center';

    const wordCounter = createWordCountElement('unselected');

    controlsContainer.appendChild(wordCounter.element);

    generalStore.setState(state => ({
        unselectedResponse: {
            ...state.unselectedResponse,
            elements: {
                wordCounter
            }
        }
    }));

    return controlsContainer;
};

export const handleUnselectedResponseMutation: MutHandler = (_target: Element) => {
    const operatorResponseElement = selectUnselectedResponse();

    if (
        !operatorResponseElement ||
        elementHasMtcHelperAttribute(operatorResponseElement)
    ) {
        return;
    }

    addMtcHelperAttributeToElement(operatorResponseElement);

    const textContentFromDOM = operatorResponseElement.textContent || undefined;

    if (!textContentFromDOM) {
        return;
    }

    const store = generalStore.getState();

    const { textContent } = store.unselectedResponse;

    if (textContentFromDOM === textContent) {
        return;
    }

    const selectButton = selectSelectButton();

    const wordCounterContainer = createWordCounterContainer();
    selectButton?.parentElement?.insertAdjacentElement(
        'afterend',
        wordCounterContainer
    );

    Logger.debug('Handling change in general edited response state.');

    generalStore.setState(state => ({
        unselectedResponse: {
            ...state.unselectedResponse,
            textContent: textContentFromDOM
        }
    }));
};

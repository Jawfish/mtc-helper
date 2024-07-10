import { MutHandler } from '@handlers/index';
import Logger from '@src/lib/logging';
import { generalStore } from '@src/store/generalStore';

import { addMtcHelperAttributeToElement, elementHasMtcHelperAttribute } from '..';

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

    Logger.debug('Handling change in general edited response state.');

    generalStore.setState(state => ({
        ...state,
        unselectedResponse: {
            ...state.unselectedResponse,
            textContent: textContentFromDOM
        }
    }));
};

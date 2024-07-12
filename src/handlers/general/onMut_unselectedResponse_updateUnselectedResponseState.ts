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

export const updateUnselectedResponseState: MutHandler = (_target: Element) => {
    const unselectedResponseElement = selectUnselectedResponse();

    if (!unselectedResponseElement) {
        generalStore.setState({ unselectedResponse: undefined });

        return;
    }

    if (
        !unselectedResponseElement ||
        elementHasMtcHelperAttribute(unselectedResponseElement)
    ) {
        return;
    }

    addMtcHelperAttributeToElement(unselectedResponseElement);

    const textContentFromDOM = unselectedResponseElement.textContent || undefined;

    if (!textContentFromDOM) {
        return;
    }

    const { unselectedResponse: unselectedResponseContentInStore } =
        generalStore.getState();

    if (textContentFromDOM === unselectedResponseContentInStore) {
        return;
    }

    Logger.debug('Handling change in general edited response state.');

    generalStore.setState({
        unselectedResponse: textContentFromDOM
    });
};

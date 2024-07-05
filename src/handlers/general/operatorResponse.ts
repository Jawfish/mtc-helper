import { MutHandler } from '@handlers/index';
import Logger from '@src/lib/logging';
import { generalStore } from '@src/store/generalStore';

const selectOperatorResponse = (): HTMLDivElement | undefined => {
    const element = document.querySelector('div[contenteditable="true"]');

    if (element instanceof HTMLDivElement) {
        return element;
    }

    return undefined;
};

export const handleOperatorResponseMutation: MutHandler = (_target: Element) => {
    const operatorResponseElement = selectOperatorResponse();

    if (!operatorResponseElement) {
        return;
    }

    const operatorResponseFromDOM = operatorResponseElement.textContent || undefined;

    if (!operatorResponseFromDOM) {
        return;
    }

    const store = generalStore.getState();

    const { operatorResponseMarkdown: editedMarkdown } = store.selectedResponse;

    if (operatorResponseFromDOM === editedMarkdown) {
        return;
    }

    Logger.debug('Handling change in general edited response state.');

    generalStore.setState(state => ({
        selectedResponse: {
            ...state.selectedResponse,
            operatorResponseMarkdown: operatorResponseFromDOM
        }
    }));
};

import { MutHandler } from '@handlers/types';
import Logger from '@src/lib/logging';
import { generalStore } from '@src/store/generalStore';

const selectGeneralEditedResponse = (): HTMLDivElement | undefined => {
    const element = document.querySelector('div[contenteditable="true"]');

    if (element instanceof HTMLDivElement) {
        return element;
    }

    return undefined;
};

export const handleGeneralEditedResponseMutation: MutHandler = (_target: Element) => {
    const editedResponseElement = selectGeneralEditedResponse();

    if (!editedResponseElement) {
        return;
    }

    const editedResponseFromDOM = editedResponseElement.textContent || undefined;

    if (!editedResponseFromDOM) {
        return;
    }

    const store = generalStore.getState();

    const { editedMarkdown } = store.selectedResponse;

    if (editedResponseFromDOM === editedMarkdown) {
        return;
    }

    Logger.debug('Handling change in general edited response state.');

    generalStore.setState(state => ({
        selectedResponse: {
            ...state.selectedResponse,
            editedMarkdown: editedResponseFromDOM
        }
    }));
};

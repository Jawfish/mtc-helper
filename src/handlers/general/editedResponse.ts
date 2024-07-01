import { MutHandler } from '@handlers/types';
import Logger from '@src/lib/logging';
import { generalStore } from '@src/store/generalStore';

const selectGeneralEditedResponse = (): HTMLDivElement | null => {
    const element = document.querySelector('div[contenteditable="true"]');

    if (element instanceof HTMLDivElement) {
        return element;
    }

    return null;
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

    const { editedResponseMarkdown: markdownInStore } = generalStore.getState();

    if (editedResponseFromDOM === markdownInStore) {
        return;
    }

    Logger.debug('Handling change in general edited response state.');

    generalStore.setState({
        editedResponseMarkdown: editedResponseFromDOM
    });
};

import { MutHandler } from '@handlers/types';
import Logger from '@src/lib/logging';
import { pandaStore } from '@src/store/pandaStore';

const selectPandaEditedResponse = (): HTMLDivElement | null => {
    const element = document.querySelector('div[contenteditable="true"]');

    if (element instanceof HTMLDivElement) {
        return element;
    }

    return null;
};

export const handlePandaEditedResponseMutation: MutHandler = (_target: Element) => {
    const editedResponseElement = selectPandaEditedResponse();

    if (!editedResponseElement) {
        return;
    }

    const editedResponseFromDOM = editedResponseElement.textContent || undefined;

    if (!editedResponseFromDOM) {
        return;
    }

    const { editedResponseMarkdown: markdownInStore } = pandaStore.getState();

    if (editedResponseFromDOM === markdownInStore) {
        return;
    }

    Logger.debug('Handling change in panda edited response state.');

    pandaStore.setState({
        editedResponseMarkdown: editedResponseFromDOM
    });
};

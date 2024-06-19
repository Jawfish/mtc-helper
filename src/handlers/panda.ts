import { useMTCStore } from '@src/store/MTCStore';
import {
    selectAllPandaEditResponseButtons,
    selectPandaEditedResponse,
    selectPandaOriginalResponse,
    selectPandaSelectedResponseSaveButton
} from '@src/selectors/panda';
import { useContentStore } from '@src/store/ContentStore';
import Logger from '@src/lib/logging';
import markdownToTxt from 'markdown-to-txt';

import {
    addMtcHelperAttributeToElement,
    elementHasMtcHelperAttribute,
    MutHandler
} from './shared';

export const standardizeNewlines = (text: string) =>
    text.replace(/(\r\n|\r|\n)+/g, '\n');

export const handlePandaOriginalResponseMutation: MutHandler = (
    mutation: MutationRecord
) => {
    const originalResponseElement = selectPandaOriginalResponse();
    const isPanda = useMTCStore.getState().process === 'PANDA';

    if (!isPanda || !originalResponseElement) {
        return;
    }

    const response = originalResponseElement.textContent || undefined;
    if (!response) {
        return;
    }

    const state = useContentStore.getState();
    const processedText = standardizeNewlines(response);

    if (processedText === state.pandaOriginalResponse) {
        return;
    }

    Logger.debug('Handling change in panda original response state.');

    state.setPandaOriginalResponse(processedText);
};

export const handlePandaEditedResponseMutation: MutHandler = (
    mutation: MutationRecord
) => {
    const editedResponseElement = selectPandaEditedResponse();
    const isPanda = useMTCStore.getState().process === 'PANDA';

    if (!isPanda || !editedResponseElement) {
        return;
    }

    const editedResponse = editedResponseElement.textContent || undefined;

    if (!editedResponse) {
        return;
    }

    const state = useContentStore.getState();
    const processedText = standardizeNewlines(markdownToTxt(editedResponse));

    if (processedText === state.pandaEditedResponse) {
        return;
    }

    Logger.debug('Handling change in panda edited response state.');

    state.setPandaEditedResponse(processedText);
};

export const handlePandaSelectedResponseSaveButtonMutation: MutHandler = (
    mutation: MutationRecord
) => {
    const isPanda = useMTCStore.getState().process === 'PANDA';
    const saveButton = selectPandaSelectedResponseSaveButton();

    if (!isPanda || !saveButton) {
        return;
    }

    const seen = elementHasMtcHelperAttribute(saveButton);
    if (seen) {
        return;
    }

    addMtcHelperAttributeToElement(saveButton);

    saveButton.addEventListener('click', () => {
        Logger.debug('Handling click on panda selected response save button.');
        const state = useContentStore.getState();

        state.setPandaEditedResponse(undefined);
        state.setPandaOriginalResponse(undefined);
    });
};

export const handlePandaEditResponseButtonMutation: MutHandler = (
    mutation: MutationRecord
) => {
    const { process, taskOpen } = useMTCStore.getState();
    if (!taskOpen || process !== 'PANDA') {
        return;
    }

    const editResponseButtons = selectAllPandaEditResponseButtons();
    if (!editResponseButtons.length) {
        return;
    }

    editResponseButtons.forEach(button => {
        const seen = elementHasMtcHelperAttribute(button);
        if (seen) {
            return;
        }

        addMtcHelperAttributeToElement(button);

        button.addEventListener('click', () => {
            Logger.debug('Handling click on panda edit response button.');
            const state = useContentStore.getState();

            state.setPandaEditedResponse(undefined);
            state.setPandaOriginalResponse(undefined);
        });
    });
};

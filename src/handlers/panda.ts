import { useMTCStore } from '@src/store/MTCStore';
import {
    selectPandaEditedResponse,
    selectPandaOriginalResponse
} from '@src/selectors/panda';
import { useContentStore } from '@src/store/ContentStore';
import Logger from '@src/lib/logging';

import { MutHandler } from './shared';

export const handlePandaResponseMutation: MutHandler = (mutation: MutationRecord) => {
    const editedResponseElement = selectPandaEditedResponse();
    const originalResponseElement = selectPandaOriginalResponse();
    const isPanda = useMTCStore.getState().process === 'PANDA';

    if (!isPanda || !editedResponseElement || !originalResponseElement) {
        return;
    }

    const editedResponse = editedResponseElement.textContent || undefined;
    const originalResponse = originalResponseElement.textContent || undefined;

    if (!editedResponse) {
        return;
    }

    const state = useContentStore.getState();
    const { pandaResponse } = state;

    Logger.debug('Handling change in panda response state.');

    state.setPandaResponse({
        ...pandaResponse,
        edited: editedResponse,
        original: originalResponse,
        previousEdited: pandaResponse.edited,
        previousOriginal: pandaResponse.original
    });
};

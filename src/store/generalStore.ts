import { useStore } from 'zustand';
import Logger from '@lib/logging';

import { createLogStore } from './storeMiddleware';
import { globalStore } from './globalStore';
import { isStateEqual } from './utils';

export type State = {
    editedResponseMarkdown: string | undefined;
    originalResponseMarkdown: string | undefined;
    originalResponseHtml: string | undefined;
    unselectedResponsePlaintext: string | undefined;
    unselectedResponseMarkdown: string | undefined;
};

type Actions = {
    reset: () => void;
};

const initialState: State = {
    editedResponseMarkdown: undefined,
    originalResponseMarkdown: undefined,
    originalResponseHtml: undefined,
    unselectedResponsePlaintext: undefined,
    unselectedResponseMarkdown: undefined
};

export const generalStore = createLogStore<State & Actions>('General store')(set => ({
    ...initialState,
    reset: () => set({ ...initialState })
}));

export const useGeneralStore = () => useStore(generalStore);

globalStore.subscribe(({ taskIsOpen: taskOpen }) => {
    if (!taskOpen && !isStateEqual(generalStore.getState(), initialState)) {
        Logger.debug(
            'Resetting General store due to state change from subscription to global store'
        );
        generalStore.getState().reset();
    }
});

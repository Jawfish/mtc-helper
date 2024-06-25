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

export const pandaStore = createLogStore<State & Actions>('Panda store')(set => ({
    ...initialState,
    reset: () => set({ ...initialState })
}));

export const usePandaStore = () => useStore(pandaStore);

globalStore.subscribe(({ taskIsOpen: taskOpen }) => {
    if (!taskOpen && !isStateEqual(pandaStore.getState(), initialState)) {
        Logger.debug(
            'Resetting Panda store due to state change from subscription to global store'
        );
        pandaStore.getState().reset();
    }
});

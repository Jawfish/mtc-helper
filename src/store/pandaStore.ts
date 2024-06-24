import { useStore } from 'zustand';

import { createLogStore } from './storeMiddleware';
import { globalStore } from './globalStore';

export type State = {
    editedResponsePlaintext: string | undefined;
    editedResponseMarkdown: string | undefined;
    originalResponsePlaintext: string | undefined;
    originalResponseMarkdown: string | undefined;
    originalResponseHtml: string | undefined;
    unselectedResponsePlaintext: string | undefined;
    unselectedResponseMarkdown: string | undefined;
};

type Actions = {
    reset: () => void;
};

const initialState: State = {
    editedResponsePlaintext: undefined,
    editedResponseMarkdown: undefined,
    originalResponsePlaintext: undefined,
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
    if (!taskOpen) {
        pandaStore.getState().reset();
    }
});

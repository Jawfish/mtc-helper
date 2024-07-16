import { useStore } from 'zustand';
import Logger from '@lib/logging';

import { createLogStore } from './storeMiddleware';
import { globalStore } from './globalStore';
import { isStateEqual } from './utils';

export type GenericProcessStoreState = {
    modelResponseMarkdown: string | undefined;
    modelResponsePlaintext: string | undefined;
    operatorResponseMarkdown: string | undefined;
    prompt: string | undefined;
    unselectedResponse: string | undefined;
    wordCountViewOpen: boolean;
};

type Actions = {
    reset: () => void;
    toggleWordCountView: () => void;
};

const initialState: GenericProcessStoreState = {
    modelResponseMarkdown: undefined,
    modelResponsePlaintext: undefined,
    operatorResponseMarkdown: undefined,
    prompt: undefined,
    unselectedResponse: undefined,
    wordCountViewOpen: false
};

export const genericProcessStore = createLogStore<GenericProcessStoreState & Actions>(
    'Generic store'
)(set => ({
    ...initialState,
    reset: () => set({ ...initialState }),

    toggleWordCountView: () =>
        set(state => ({ wordCountViewOpen: !state.wordCountViewOpen }))
}));

export const useGenericProcessStore = () => useStore(genericProcessStore);

globalStore.subscribe(({ taskIsOpen: taskOpen }) => {
    if (!taskOpen && !isStateEqual(genericProcessStore.getState(), initialState)) {
        Logger.debug(
            'Resetting Generic store due to state change from subscription to global store'
        );
        genericProcessStore.getState().reset();
    }
});

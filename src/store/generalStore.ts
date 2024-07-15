import { useStore } from 'zustand';
import Logger from '@lib/logging';

import { createLogStore } from './storeMiddleware';
import { globalStore } from './globalStore';
import { isStateEqual } from './utils';

export type State = {
    modelResponseHtml: string | undefined;
    modelResponseMarkdown: string | undefined;
    modelResponsePlaintext: string | undefined;
    operatorResponseMarkdown: string | undefined;
    prompt: string | undefined;
    unselectedResponse: string | undefined;
    wordCountViewOpen: boolean;
};

type Actions = {
    reset: () => void;
    resetPrompt: () => void;
    toggleWordCountView: () => void;
};

const initialState: State = {
    modelResponseHtml: undefined,
    modelResponseMarkdown: undefined,
    modelResponsePlaintext: undefined,
    operatorResponseMarkdown: undefined,
    prompt: undefined,
    unselectedResponse: undefined,
    wordCountViewOpen: false
};

export const generalStore = createLogStore<State & Actions>('General store')(set => ({
    ...initialState,
    reset: () => set({ ...initialState }),

    resetPrompt: () =>
        set(state => ({
            ...state,
            prompt: undefined
        })),

    toggleWordCountView: () =>
        set(state => ({ wordCountViewOpen: !state.wordCountViewOpen }))
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

import { useStore } from 'zustand';
import Logger from '@lib/logging';

import { createLogStore } from './storeMiddleware';
import { globalStore } from './globalStore';
import { isStateEqual } from './utils';

type Language = 'python' | 'unknown';

type State = {
    originalCode: string | null;
    editedCode: string | null;
    conversationTitle: string | null;
    editedResponse: string | null;
    errorLabels: string | null;
    operatorNotes: string | null;
    originalResponse: string | null;
    prompt: string | null;
    tests: string | null;
    score: number | null;
    rework: boolean | null;
    metadataRemoved: boolean;
    language: Language;
};

type Actions = {
    reset: () => void;
};

const initialState: State = {
    originalCode: null,
    editedCode: null,
    conversationTitle: null,
    editedResponse: null,
    errorLabels: null,
    operatorNotes: null,
    originalResponse: null,
    prompt: null,
    tests: null,
    score: null,
    rework: null,
    language: 'unknown',
    metadataRemoved: false
};

export const orochiStore = createLogStore<State & Actions>('Orochi store')(set => ({
    ...initialState,
    reset: () => set({ ...initialState })
}));

export const useOrochiStore = () => useStore(orochiStore);

globalStore.subscribe(({ taskIsOpen: taskOpen }) => {
    if (!taskOpen && !isStateEqual(orochiStore.getState(), initialState)) {
        Logger.debug(
            'Resetting Orochi store due to state change from subscription to global store'
        );
        orochiStore.getState().reset();
    }
});

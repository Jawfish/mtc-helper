import { useStore } from 'zustand';
import Logger from '@lib/logging';

import { createLogStore } from './storeMiddleware';
import { globalStore } from './globalStore';
import { isStateEqual } from './utils';

type Language = 'python' | 'unknown';

type State = {
    originalCode: string | undefined;
    editedCode: string | undefined;
    conversationTitle: string | undefined;
    operatorResponse: string | undefined;
    errorLabels: string | undefined;
    operatorNotes: string | undefined;
    modelResponse: string | undefined;
    prompt: string | undefined;
    tests: string | undefined;
    score: number | undefined;
    rework: boolean | undefined;
    metadataRemoved: boolean;
    language: Language;
};

type Actions = {
    reset: () => void;
};

const initialState: State = {
    originalCode: undefined,
    editedCode: undefined,
    conversationTitle: undefined,
    operatorResponse: undefined,
    errorLabels: undefined,
    operatorNotes: undefined,
    modelResponse: undefined,
    prompt: undefined,
    tests: undefined,
    score: undefined,
    rework: undefined,
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

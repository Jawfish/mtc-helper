import { useStore } from 'zustand';
import Logger from '@lib/logging';

import { createLogStore } from './storeMiddleware';
import { globalStore } from './globalStore';
import { isStateEqual } from './utils';

type Language = 'python' | 'unknown';

type State = {
    modelResponseCode: string | undefined;
    operatorResponseCode: string | undefined;
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
    conversationTitle: undefined,
    errorLabels: undefined,
    language: 'unknown',
    metadataRemoved: false,
    modelResponse: undefined,
    modelResponseCode: undefined,
    operatorNotes: undefined,
    operatorResponse: undefined,
    operatorResponseCode: undefined,
    prompt: undefined,
    rework: undefined,
    score: undefined,
    tests: undefined
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

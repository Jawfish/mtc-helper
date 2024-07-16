import { useStore } from 'zustand';
import Logger from '@lib/logging';

import { createLogStore } from './storeMiddleware';
import { globalStore } from './globalStore';
import { isStateEqual } from './utils';

export type OrochiStoreState = {
    modelResponseCode: string | undefined;
    operatorResponseCode: string | undefined;
    conversationTitle: string | undefined;
    operatorResponse: string | undefined;
    errorLabels: string | undefined;
    operatorNotes: string | undefined;
    modelResponse: string | undefined;
    prompt: string | undefined;
    tests: string | undefined;
    language: 'python' | 'unknown';
};

export type OrochiStoreActions = {
    reset: () => void;
};

const initialState: OrochiStoreState = {
    conversationTitle: undefined,
    errorLabels: undefined,
    language: 'unknown',
    modelResponse: undefined,
    modelResponseCode: undefined,
    operatorNotes: undefined,
    operatorResponse: undefined,
    operatorResponseCode: undefined,
    prompt: undefined,
    tests: undefined
};

export const orochiStore = createLogStore<OrochiStoreState & OrochiStoreActions>(
    'Orochi store'
)(set => ({
    ...initialState,
    reset: () => set({ ...initialState })
}));

export const useOrochiStore = () => useStore(orochiStore);

// Reset the Orochi store if the task is closed
globalStore.subscribe(({ taskIsOpen: taskOpen }) => {
    if (!taskOpen && !isStateEqual(orochiStore.getState(), initialState)) {
        Logger.debug(
            'Resetting Orochi store due to state change from subscription to global store'
        );
        orochiStore.getState().reset();
    }
});

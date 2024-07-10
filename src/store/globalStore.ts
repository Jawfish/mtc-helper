import { useStore } from 'zustand';

import { createLogStore } from './storeMiddleware';

export type Process = 'Orochi' | 'General';

type State = {
    process: Process;
    taskIsOpen: boolean;
};

type Actions = {
    closeTask: () => void;
};

const initialState: State = {
    process: 'General',
    taskIsOpen: false
};

export const globalStore = createLogStore<State & Actions>('Global store')(
    (set, get) => ({
        ...initialState,
        // Don't reset the process when resetting the store; it should only be set by
        // the URL observer
        closeTask: () => set({ ...initialState, process: get().process })
    })
);

export const useGlobalStore = () => useStore(globalStore);

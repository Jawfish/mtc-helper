import { useStore } from 'zustand';

import { createLogStore } from './storeMiddleware';

export type Process = 'Orochi' | 'General' | 'STEM';

type State = {
    process: Process;
    taskIsOpen: boolean;
    diffViewOpen: boolean;
    latexViewOpen: boolean;
    // ignore the list numbers in word counts
    // this is in the global store so that the setting persists across conversations
    ignoreListNumbers: boolean;
};

type Actions = {
    closeTask: () => void;
    toggleDiffView: () => void;
    toggleLatexView: () => void;
    toggleIgnoreListNumbers: () => void;
};

const initialState: State = {
    process: 'General',
    taskIsOpen: false,
    diffViewOpen: false,
    latexViewOpen: false,
    ignoreListNumbers: false
};

export const globalStore = createLogStore<State & Actions>('Global store')(
    (set, get) => ({
        ...initialState,
        // Don't reset the process or list number ignore setting when resetting
        closeTask: () =>
            set({
                ...initialState,
                process: get().process,
                ignoreListNumbers: get().ignoreListNumbers,
                taskIsOpen: false
            }),
        toggleDiffView: () => set(state => ({ diffViewOpen: !state.diffViewOpen })),
        toggleLatexView: () => set(state => ({ latexViewOpen: !state.latexViewOpen })),
        toggleIgnoreListNumbers: () =>
            set(state => ({ ignoreListNumbers: !state.ignoreListNumbers }))
    })
);
export const useGlobalStore = () => useStore(globalStore);

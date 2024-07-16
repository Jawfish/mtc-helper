import { useStore } from 'zustand';

import { createLogStore } from './storeMiddleware';

export type Process = 'Orochi' | 'Generic' | 'STEM';

export type GlobalStoreState = {
    process: Process;
    taskIsOpen: boolean;
    diffViewOpen: boolean;
    latexViewOpen: boolean;
    // ignore the list numbers in word counts
    // this is in the global store so that the setting persists across conversations
    ignoreListNumbers: boolean;
};

export type GlobalStoreActions = {
    closeTask: () => void;
    toggleDiffView: () => void;
    toggleLatexView: () => void;
    toggleIgnoreListNumbers: () => void;
};

const initialState: GlobalStoreState = {
    process: 'Generic',
    taskIsOpen: false,
    diffViewOpen: false,
    latexViewOpen: false,
    ignoreListNumbers: false
};

export const globalStore = createLogStore<GlobalStoreState & GlobalStoreActions>(
    'Global store'
)((set, get) => ({
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
}));
export const useGlobalStore = () => useStore(globalStore);

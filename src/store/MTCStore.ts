import Logger from '@src/lib/logging';
import { create } from 'zustand';

export enum Process {
    Unknown = 'Unknown',
    Orochi = 'Orochi',
    PANDA = 'PANDA',
    STEM = 'STEM'
}

type ProcessUuidMap = Record<string, Process>;

export const processUuidMap: ProcessUuidMap = {
    'ddc93c48-e857-4ffb-a442-9b2b34ac3c83': Process.Orochi,
    '1ba3bd1f-243e-46de-9f8f-eec133766f64': Process.PANDA,
    'stem-not-yet-implemented': Process.STEM
};

export type MTCStoreState = {
    process: Process;
    taskOpen: boolean;
    // TODO: when edit button is clicked, set this to true
    // when save button is clicked, set this to false
    // subscribe to this value in the EditedResponseMutHandler so it can update
    // the edited response state in the content store so it can be copied
    editViewOpen: boolean;
};

type MTCStoreActions = {
    setProcess: (process: Process) => void;
    setTaskOpen: (open: boolean) => void;
    reset: () => void;
};

const initialState: MTCStoreState = {
    process: Process.Unknown,
    taskOpen: false,
    editViewOpen: false
};

export const useMTCStore = create<MTCStoreState & MTCStoreActions>(set => ({
    ...initialState,
    setProcess: process => {
        Logger.debug(`Setting process to ${process} in store.`);
        set({ process });
    },
    setTaskOpen: open => {
        Logger.debug(`Setting task open to ${open} in store.`);
        set({ taskOpen: open });
    },
    reset: () => {
        Logger.debug('Resetting MTC store');
        set({ ...initialState });
    }
}));

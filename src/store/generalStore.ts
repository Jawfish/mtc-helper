import { useStore } from 'zustand';
import Logger from '@lib/logging';
import { CopyButton } from '@handlers/general/utils';

import { createLogStore } from './storeMiddleware';
import { globalStore } from './globalStore';
import { isStateEqual } from './utils';

export type State = {
    selectedResponse: {
        operatorResponseMarkdown: string | undefined;
        modelResponseMarkdown: string | undefined;
        modelResponseHtml: string | undefined;
        elements: {
            controlsContainer: HTMLElement | undefined;
            copyEdited: CopyButton | undefined;
            copyOriginal: CopyButton | undefined;
        };
    };
    prompt: {
        text: string | undefined;
        elements: {
            copy: CopyButton | undefined;
        };
    };
    unselectedResponse: {
        textContent: string | undefined;
    };
};

type Actions = {
    reset: () => void;
};

const initialState: State = {
    selectedResponse: {
        operatorResponseMarkdown: undefined,
        modelResponseMarkdown: undefined,
        modelResponseHtml: undefined,
        elements: {
            controlsContainer: undefined,
            copyEdited: undefined,
            copyOriginal: undefined
        }
    },
    prompt: {
        text: undefined,
        elements: {
            copy: undefined
        }
    },
    unselectedResponse: {
        textContent: undefined
    }
};

export const generalStore = createLogStore<State & Actions>('General store')(set => ({
    ...initialState,
    reset: () => set({ ...initialState })
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

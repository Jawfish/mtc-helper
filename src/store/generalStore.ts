import { useStore } from 'zustand';
import Logger from '@lib/logging';
import { CopyButton, WordCounter } from '@handlers/general/utils';

import { createLogStore } from './storeMiddleware';
import { globalStore } from './globalStore';
import { isStateEqual } from './utils';

export type State = {
    selectedResponse: {
        editedMarkdown: string | undefined;
        originalMarkdown: string | undefined;
        originalHtml: string | undefined;
        selection: string | undefined;
        elements: {
            controlsContainer: HTMLElement | undefined;
            editedWordCounter: WordCounter | undefined;
            originalWordCounter: WordCounter | undefined;
            selectedWordCounter: WordCounter | undefined;
            copyEdited: CopyButton | undefined;
            copyOriginal: CopyButton | undefined;
        };
    };
    prompt: {
        text: string | undefined;
        elements: {
            wordCounter: WordCounter | undefined;
            copy: CopyButton | undefined;
        };
    };
    // unselectedResponse: {
    //     unselectedResponsePlaintext: string | undefined;
    //     unselectedResponseMarkdown: string | undefined;
    //     elements: {
    //         copyEdited: HTMLButtonElement | undefined;
    //         copyOriginal: HTMLButtonElement | undefined;
    //         wordCount: HTMLSpanElement | undefined;
    //     };
    // };
};

type Actions = {
    reset: () => void;
};

const initialState: State = {
    selectedResponse: {
        editedMarkdown: undefined,
        originalMarkdown: undefined,
        originalHtml: undefined,
        selection: undefined,
        elements: {
            controlsContainer: undefined,
            editedWordCounter: undefined,
            originalWordCounter: undefined,
            selectedWordCounter: undefined,
            copyEdited: undefined,
            copyOriginal: undefined
        }
    },
    prompt: {
        text: undefined,
        elements: {
            wordCounter: undefined,
            copy: undefined
        }
    }
    // unselectedResponse: {
    //     unselectedResponsePlaintext: undefined,
    //     unselectedResponseMarkdown: undefined,
    //     elements: {
    //         copyEdited: undefined,
    //         copyOriginal: undefined,
    //         wordCount: undefined
    //     }
    // }
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

import { createRoot, Root } from 'react-dom/client';
import { createStore } from 'zustand/vanilla';

export type Tab = 'edited' | 'original';

export enum DiffViewState {
    BLOCKS = 'blocks',
    CLOSED = 'closed',
    LINES = 'lines'
}

type StoreState = {
    conversationOpen: boolean;
    currentTab: Tab;
    diffModalOpen: boolean;
    editedContent: string;
    editedTabHasListener: boolean;
    metadataRemoved: boolean;
    originalContent: string;
    originalTabHasListener: boolean;
    responseEditButtonHasListener: boolean;
    saveButtonHasListener: boolean;
    submitButtonHasListener: boolean;
    orochiToolbar: HTMLDivElement | undefined;
    // TODO: when "next" in the tests section is clicked, save them here to preserve
    // the content so they can be copied even after moving to the QA scoring section
    reactRoot: Root | undefined;
    testContent: string;
};

const initialState: StoreState = {
    conversationOpen: false,
    currentTab: 'edited',
    diffModalOpen: false,
    editedContent: '',
    editedTabHasListener: false,
    metadataRemoved: false,
    originalContent: '',
    originalTabHasListener: false,
    orochiToolbar: undefined,
    responseEditButtonHasListener: false,
    saveButtonHasListener: false,
    submitButtonHasListener: false,
    reactRoot: (() => {
        const rootElement = document.createElement('div');
        rootElement.id = 'orochi-helper-root';
        rootElement.style.zIndex = '999999';
        document.body.appendChild(rootElement);
        const root = createRoot(rootElement);
        return root;
    })(),
    testContent: ''
};

export const store = createStore<StoreState>(() => ({
    ...initialState
}));

export function resetStore() {
    store.getState().orochiToolbar?.remove();
    store.setState({ ...initialState, reactRoot: store.getState().reactRoot });
}

import { createRoot, Root } from 'react-dom/client';
import { createStore } from 'zustand/vanilla';
import { log } from './helpers';
import { IDisposable, editor } from 'monaco-editor';

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
    monacoEditorContent: string;
    monacoEditorDisposer: IDisposable | undefined;
    monacoEditor: editor.IStandaloneCodeEditor | undefined;
    responseCode: string;
    metadataRemoved: boolean;
    originalContent: string;
    originalCode: string;
    originalTabHasListener: boolean;
    responseEditButtonHasListener: boolean;
    saveButtonHasListener: boolean;
    submitButtonHasListener: boolean;
    orochiToolbar: HTMLDivElement | undefined;
    // TODO: when "next" in the tests section is clicked, save them here to preserve
    // the content so they can be copied even after moving to the QA scoring section
    reactRoot: Root | undefined;
    testContent: string;
    disableWordDiff: boolean;
};

const initialState: StoreState = {
    conversationOpen: false,
    currentTab: 'edited',
    diffModalOpen: false,
    editedContent: '',
    responseCode: '',
    editedTabHasListener: false,
    monacoEditorContent: '',
    monacoEditor: undefined,
    monacoEditorDisposer: undefined,
    metadataRemoved: false,
    originalContent: '',
    originalCode: '',
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
    testContent: '',
    disableWordDiff: true
};

export const store = createStore<StoreState>(() => ({
    ...initialState
}));

export function resetStore() {
    store.getState().orochiToolbar?.remove();
    try {
        store.getState().monacoEditorDisposer?.dispose();
    } catch (e) {
        log('error', 'Error disposing monaco editor listener: ' + e);
    }
    store.setState({ ...initialState, reactRoot: store.getState().reactRoot });
}

import { createStore } from 'zustand/vanilla';
import { log } from './helpers';

export type Tab = 'edited' | 'original';

type StoreState = {
  abortController: AbortController;
  conversationOpen: boolean;
  currentTab: Tab;
  diffOpen: boolean;
  diffTabInserted: boolean;
  editedContent: string;
  originalContent: string;
};

type InitialState = {
  abortController: () => AbortController;
  conversationOpen: boolean;
  currentTab: Tab;
  diffOpen: boolean;
  diffTabInserted: boolean;
  editedContent: string;
  originalContent: string;
};

const initialState: InitialState = {
  abortController: () => new AbortController(),
  conversationOpen: false,
  currentTab: 'edited',
  diffOpen: false,
  diffTabInserted: false,
  editedContent: '',
  originalContent: ''
};

const store = createStore<StoreState>(() => ({
  abortController: initialState.abortController(),
  conversationOpen: initialState.conversationOpen,
  currentTab: initialState.currentTab,
  diffOpen: initialState.diffOpen,
  diffTabInserted: initialState.diffTabInserted,
  editedContent: initialState.editedContent,
  originalContent: initialState.originalContent
}));

// These could be achieved through store.getState() and store.setState(), but I have
// chosen to abstract them to make things easier to change in the future and to allow
// for easier processing/logging/etc. in the middle.

// Store getters
export const getAbortSignal = () => {
  const signal = store.getState().abortController.signal;
  log('debug', `Getting abort signal from the store: ${signal}`);

  return signal;
};

export const getConversationOpen = () => {
  const open = store.getState().conversationOpen;
  log('debug', `Getting conversation open from the store: ${open}`);

  return open;
};

export const getDiffOpen = () => {
  const open = store.getState().diffOpen;
  log('debug', `Getting diff open from the store: ${open}`);

  return open;
};

export const getDiffTabInserted = () => {
  const inserted = store.getState().diffTabInserted;
  log('debug', `Getting diff tab inserted from the store: ${inserted}`);

  return inserted;
};

export const getEditedContent = () => {
  const content = store.getState().editedContent;
  log('debug', `Getting edited content from the store: ${content}`);

  return content;
};

export const getOriginalContent = () => {
  const content = store.getState().originalContent;
  log('debug', `Getting original content from the store: ${content}`);

  return content;
};

export const getCurrentTab = () => {
  const tab = store.getState().currentTab;
  log('debug', `Getting current tab from the store: ${tab}`);

  return tab;
};

// Store setters
export const setConversationOpen = (open: boolean) => {
  log('debug', `Setting conversation open in the store: ${open}`);
  store.setState({ conversationOpen: open });
};

export function setDiffOpen(open: boolean) {
  log('debug', `Setting diff open in the store: ${open}`);
  store.setState({ diffOpen: open });
}

export function setDiffTabInserted(inserted: boolean) {
  log('debug', `Setting diff tab inserted in the store: ${inserted}`);
  store.setState({ diffTabInserted: inserted });
}

export function setEditedContent(content: string) {
  log('debug', `Setting edited content in the store: ${content}`);
  store.setState({ editedContent: content });
}

export function setOriginalContent(content: string) {
  log('debug', `Setting original content in the store: ${content}`);
  store.setState({ originalContent: content });
}

export function setCurrentTab(tab: Tab) {
  log('debug', `Setting current tab in the store: ${tab}`);
  store.setState({ currentTab: tab });
}

export function resetStore() {
  log('debug', 'Resetting store to initial state');
  store.getState().abortController.abort();
  store.setState({
    abortController: initialState.abortController(),
    conversationOpen: initialState.conversationOpen,
    currentTab: initialState.currentTab,
    diffOpen: initialState.diffOpen,
    diffTabInserted: initialState.diffTabInserted,
    editedContent: initialState.editedContent,
    originalContent: initialState.originalContent
  });
}

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
  diffTogglesInserted: boolean;
  diffView: DiffViewState;
  editedContent: string;
  editedTabHasListener: boolean;
  metadataRemoved: boolean;
  originalContent: string;
  originalTabHasListener: boolean;
  responseEditButtonHasListener: boolean;
  saveButtonHasListener: boolean;
  submitButtonHasListener: boolean;
};

const initialState: StoreState = {
  conversationOpen: false,
  currentTab: 'edited',
  diffTogglesInserted: false,
  diffView: DiffViewState.CLOSED,
  editedContent: '',
  editedTabHasListener: false,
  metadataRemoved: false,
  originalContent: '',
  originalTabHasListener: false,
  responseEditButtonHasListener: false,
  saveButtonHasListener: false,
  submitButtonHasListener: false
};

export const store = createStore<StoreState>(() => ({
  ...initialState
}));

export function resetStore() {
  store.setState({ ...initialState });
}

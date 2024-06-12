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
  orochiToolbarElement: HTMLDivElement | undefined;
  // TODO: when "next" in the tests section is clicked, save them here to preserve
  // the content so they can be copied even after moving to the QA scoring section
  testContent: string;
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
  submitButtonHasListener: false,
  orochiToolbarElement: undefined,
  testContent: ''
};

export const store = createStore<StoreState>(() => ({
  ...initialState
}));

export function resetStore() {
  store.getState().orochiToolbarElement?.remove();
  store.setState({ ...initialState });
}

import { createStore } from 'zustand/vanilla';
import { log } from './helpers';

export type Tab = 'edited' | 'original';

export enum DiffViewState {
  LINES = 'lines',
  BLOCKS = 'blocks',
  CLOSED = 'closed'
}

type StoreState = {
  conversationOpen: boolean;
  currentTab: Tab;
  diffView: DiffViewState;
  diffTabInserted: boolean;
  editedContent: string;
  originalContent: string;
  timeouts: Array<number>;
  intervals: Array<number>;
};

const initialState: StoreState = {
  conversationOpen: false,
  currentTab: 'edited',
  diffView: DiffViewState.CLOSED,
  diffTabInserted: false,
  editedContent: '',
  originalContent: '',
  timeouts: [],
  intervals: []
};

const store = createStore<StoreState>(() => ({
  conversationOpen: initialState.conversationOpen,
  currentTab: initialState.currentTab,
  diffView: initialState.diffView,
  diffTabInserted: initialState.diffTabInserted,
  editedContent: initialState.editedContent,
  originalContent: initialState.originalContent,
  timeouts: initialState.timeouts,
  intervals: initialState.intervals
}));

// These could be achieved through store.getState() and store.setState(), but I have
// chosen to abstract them to make things easier to change in the future and to allow
// for easier processing/logging/etc. in the middle.

// Store getters
export const getConversationOpen = () => {
  const open = store.getState().conversationOpen;

  return open;
};

export const getDiffViewState = () => {
  const open = store.getState().diffView;
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

export const getTimeouts = () => {
  const timers = store.getState().timeouts;
  log('debug', `Getting timers from the store: ${timers}`);

  return timers;
};

export const getIntervals = () => {
  const timers = store.getState().intervals;
  log('debug', `Getting intervals from the store: ${timers}`);

  return timers;
};

// Store setters
export const setConversationOpen = (open: boolean) => {
  log('debug', `Setting conversation open in the store: ${open}`);
  store.setState({ conversationOpen: open });
};

export function setDiffViewState(view: DiffViewState) {
  log('debug', `Changing diff view from ${store.getState().diffView} to ${view}`);
  store.setState({ diffView: view });
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

export function addTimeout(timeout: number) {
  log('debug', `Adding timer to the store: ${timeout}`);
  store.setState({ timeouts: [...store.getState().timeouts, timeout] });
}

export function addInterval(interval: number) {
  log('debug', `Adding interval to the store: ${interval}`);
  store.setState({ intervals: [...store.getState().intervals, interval] });
}

export function resetStore() {
  log('debug', 'Resetting store to initial state');
  log('debug', `Clearing timers: ${getTimeouts()}`);
  getTimeouts().forEach(timer => clearTimeout(timer));
  log('debug', `Clearing intervals: ${getIntervals()}`);
  getIntervals().forEach(timer => clearInterval(timer));
  store.setState({
    conversationOpen: initialState.conversationOpen,
    currentTab: initialState.currentTab,
    diffView: initialState.diffView,
    diffTabInserted: initialState.diffTabInserted,
    editedContent: initialState.editedContent,
    originalContent: initialState.originalContent,
    timeouts: initialState.timeouts,
    intervals: initialState.intervals
  });
  log('debug', 'Store reset complete');
}

import { createStore } from 'zustand/vanilla';

type ListenerStoreState = {
  submitButtonHasListener: boolean;
  responseEditButtonHasListener: boolean;
};

const initialState: ListenerStoreState = {
  submitButtonHasListener: false,
  responseEditButtonHasListener: false
};

export const listenerStore = createStore<ListenerStoreState>(() => ({
  ...initialState
}));

export function resetListenerStore() {
  listenerStore.setState({ ...initialState });
}

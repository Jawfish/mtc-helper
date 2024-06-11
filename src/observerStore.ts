import { createStore } from 'zustand';
import { log } from './helpers';

type ObserverStoreState = {
  observers: Array<(mutation: MutationRecord) => void>;
  addObserver: (observer: (mutation: MutationRecord) => void) => void;
  removeObserver: (observer: (mutation: MutationRecord) => void) => void;
};

export const observerStore = createStore<ObserverStoreState>(() => ({
  observers: [],
  addObserver: (observer: (mutation: MutationRecord) => void) => {
    log('debug', `Adding observer: ${observer}`);
    observerStore.setState({
      observers: [...observerStore.getState().observers, observer]
    });
  },
  removeObserver: (observer: (mutation: MutationRecord) => void) => {
    log('debug', `Removing observer: ${observer}`);
    observerStore.setState({
      observers: observerStore.getState().observers.filter(o => o !== observer)
    });
  }
}));

export function updateObserverStore(mutation: MutationRecord) {
  const observers = observerStore.getState().observers;
  observers.forEach(observer => observer(mutation));
}

export function resetObserverStore() {
  log('debug', 'Resetting observer store.');
  observerStore.setState({ observers: [] });
}

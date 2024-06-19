import Logger from '@lib/logging';
import { create, StateCreator, StoreApi, StoreMutatorIdentifier } from 'zustand';

type StoreLogger = <
    T,
    Mps extends [StoreMutatorIdentifier, unknown][] = [],
    Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
    f: StateCreator<T, Mps, Mcs>,
    name?: string
) => StateCreator<T, Mps, Mcs>;

type StoreLoggerImpl = <T>(
    f: StateCreator<T, [], []>,
    name?: string
) => StateCreator<T, [], []>;

const storeLoggerImpl: StoreLoggerImpl = (f, name) => (set, get, store) => {
    const getChangedState = <T>(prevState: T, newState: T) => {
        const changes: Record<string, { from: unknown; to: unknown }> = {};
        for (const key in newState) {
            if (prevState[key] !== newState[key]) {
                changes[key] = { from: prevState[key], to: newState[key] };
            }
        }

        return changes;
    };

    const logChanges = (changes: Record<string, { from: unknown; to: unknown }>) => {
        if (Object.keys(changes).length > 0) {
            Logger.debug(...(name ? [`${name}:`] : []), changes);
        }
    };

    const loggedSet: typeof set = (partial, replace) => {
        const prevState = get();
        set(partial, replace);
        const newState = get();
        const changes = getChangedState(prevState, newState);
        logChanges(changes);
    };

    const { setState } = store;
    store.setState = (partial, replace) => {
        const prevState = store.getState();
        setState(partial, replace);
        const newState = store.getState();
        const changes = getChangedState(prevState, newState);
        logChanges(changes);
    };

    return f(loggedSet, get, store);
};

const logger = storeLoggerImpl as unknown as StoreLogger;

type CreateLogStore = <T extends object>(
    name?: string | undefined
) => (f: StateCreator<T, [], []>) => StoreApi<T>;

export const createLogStore: CreateLogStore = name => f => create(logger(f, name));

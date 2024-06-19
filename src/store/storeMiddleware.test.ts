import { afterEach, describe, expect, it, vi } from 'vitest';
import Logger from '@lib/logging';

import { createLogStore } from './storeMiddleware';

type MiddlewareState = {
    num: number;
    other: string;
    increase: (by: number) => void;
};

const storeName = 'Middleware test store';
const outputName = storeName.concat(':');

const useMiddlewareStore = createLogStore<MiddlewareState>(storeName)(set => ({
    num: 0,
    other: 'test',
    increase: by => set(state => ({ num: state.num + by }))
}));

const useMiddlewareStoreNoName = createLogStore<MiddlewareState>()(set => ({
    num: 0,
    other: 'test',
    increase: by => set(state => ({ num: state.num + by }))
}));

describe('Store logging middleware', () => {
    afterEach(() => {
        const initialState = useMiddlewareStore.getInitialState();
        useMiddlewareStore.setState(initialState);
    });

    it('should log without a name', () => {
        const logSpy = vi.spyOn(Logger, 'debug');

        useMiddlewareStoreNoName.setState({ num: 1 });

        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenNthCalledWith(1, {
            num: {
                from: 0,
                to: 1
            }
        });

        logSpy.mockRestore();
    });

    it('should set state and log the changed state when the value is directly set without calling an action', () => {
        const logSpy = vi.spyOn(Logger, 'debug');

        // directly setting instead of calling increase should use the increase action
        useMiddlewareStore.setState({ num: 6 });

        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenNthCalledWith(1, outputName, {
            num: {
                from: 0,
                to: 6
            }
        });

        logSpy.mockRestore();
    });

    it('should set state with an action and log the change when that action is called', () => {
        const logSpy = vi.spyOn(Logger, 'debug');
        const { increase } = useMiddlewareStore.getState();

        increase(1);

        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenNthCalledWith(1, outputName, {
            num: {
                from: 0,
                to: 1
            }
        });

        logSpy.mockRestore();
    });

    it('should log multiple changes', () => {
        const logSpy = vi.spyOn(Logger, 'debug');

        useMiddlewareStore.setState({ num: 1 });
        useMiddlewareStore.setState({ other: 'new' });

        expect(logSpy).toHaveBeenCalledTimes(2);
        expect(logSpy).toHaveBeenNthCalledWith(1, outputName, {
            num: {
                from: 0,
                to: 1
            }
        });
        expect(logSpy).toHaveBeenNthCalledWith(2, outputName, {
            other: {
                from: 'test',
                to: 'new'
            }
        });

        logSpy.mockRestore();
    });

    it('should preserve state between calls', () => {
        const { increase } = useMiddlewareStore.getState();

        increase(1);
        increase(2);

        expect(useMiddlewareStore.getState().num).toBe(3);
    });
});

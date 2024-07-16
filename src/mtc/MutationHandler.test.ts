import { createLogStore } from '@store/storeMiddleware';
import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import { StateCreator } from 'zustand';

import { MutationHandler } from './MutationHandler';

type TestState = {
    count: number;
};

describe('DOM mutation handler', () => {
    let handler: MutationHandler;
    let targetNode: HTMLElement;
    let store: ReturnType<ReturnType<typeof createLogStore<TestState>>>;

    const appendAndWait = async (element: HTMLElement) => {
        targetNode.appendChild(element);
        await new Promise(resolve => setTimeout(resolve, 0));
    };

    beforeEach(() => {
        targetNode = document.createElement('div');
        document.body.appendChild(targetNode);
        handler = new MutationHandler(targetNode);

        const initializer: StateCreator<TestState> = () => ({ count: 0 });

        store = createLogStore<TestState>('TestStore')(initializer);
    });

    afterEach(() => {
        handler.disconnect();
        document.body.removeChild(targetNode);
    });

    it('reacts to an element being added', () => {
        handler.addAction<TestState>(
            () => document.querySelector('#test-element') || undefined,
            ({ state, element }) => (element ? { count: state.count + 1 } : state),
            store,
            { runIfElementMissing: true, processes: ['Generic', 'STEM', 'Orochi'] }
        );

        const newElement = document.createElement('div');
        newElement.id = 'test-element';
        targetNode.appendChild(newElement);

        return new Promise<void>(resolve => {
            setTimeout(() => {
                expect(store.getState().count).toBe(1);
                resolve();
            }, 0);
        });
    });

    it('reacts to an element being removed', () => {
        const testElement = document.createElement('div');
        testElement.id = 'test-element';
        targetNode.appendChild(testElement);

        handler.addAction<TestState>(
            () => document.querySelector('#test-element') || undefined,
            ({ state, element }) => (element ? state : { count: state.count - 1 }),
            store,
            { runIfElementMissing: true, processes: ['Generic', 'STEM', 'Orochi'] }
        );

        targetNode.removeChild(testElement);

        return new Promise<void>(resolve => {
            setTimeout(() => {
                expect(store.getState().count).toBe(-1);
                resolve();
            }, 0);
        });
    });

    it('reacts to an element being changed', () => {
        const testElement = document.createElement('div');
        testElement.id = 'test-element';
        targetNode.appendChild(testElement);

        handler.addAction<TestState>(
            () => document.querySelector('#test-element') || undefined,
            ({ state, element }) => (element ? { count: state.count + 1 } : state),
            store,
            { runIfElementMissing: true, processes: ['Generic', 'STEM', 'Orochi'] }
        );

        testElement.setAttribute('data-test', 'value');

        return new Promise<void>(resolve => {
            setTimeout(() => {
                expect(store.getState().count).toBe(1);
                resolve();
            }, 0);
        });
    });

    it('acts consistently across multiple mutations', async () => {
        handler.addAction<TestState>(
            () => document.querySelector('.test-element') || undefined,
            ({ state, element }) => (element ? { count: state.count + 1 } : state),
            store,
            { runIfElementMissing: true, processes: ['Generic', 'STEM', 'Orochi'] }
        );

        const testElement = document.createElement('div');
        testElement.className = 'test-element';
        const dummyOne = document.createElement('div');
        const dummyTwo = document.createElement('div');

        await appendAndWait(testElement);
        await appendAndWait(dummyOne);
        await appendAndWait(dummyTwo);

        expect(store.getState().count).toBe(3);
    });

    it('can be disconnected from observing mutations', () => {
        handler.addAction<TestState>(
            () => document.querySelector('#test-element') || undefined,
            ({ state, element }) => (element ? { count: state.count + 1 } : state),
            store,
            { runIfElementMissing: true, processes: ['Generic', 'STEM', 'Orochi'] }
        );

        handler.disconnect();

        const newElement = document.createElement('div');
        newElement.id = 'test-element';
        targetNode.appendChild(newElement);

        expect(store.getState().count).toBe(0);
    });

    it('provides the target element for the action to use', () => {
        const testElement = document.createElement('div');
        testElement.id = 'test-element';
        targetNode.appendChild(testElement);

        handler.addAction<TestState>(
            () => document.querySelector('#test-element') || undefined,
            ({ state, element }) => {
                expect(element).toBe(testElement);

                return { count: state.count + 1 };
            },
            store,
            { runIfElementMissing: true, processes: ['Generic', 'STEM', 'Orochi'] }
        );
    });

    it('provides the correct store state for the action to use', () => {
        handler.addAction<TestState>(
            () => document.querySelector('#test-element') || undefined,
            ({ state, element }) => {
                if (element) {
                    expect(state.count).toBe(0);

                    return { count: state.count + 1 };
                }

                return state;
            },
            store,
            { runIfElementMissing: true, processes: ['Generic', 'STEM', 'Orochi'] }
        );

        const newElement = document.createElement('div');
        newElement.id = 'test-element';
        targetNode.appendChild(newElement);
    });

    it('marks an element and only runs the action once for that element', async () => {
        handler.addAction<TestState>(
            () => document.querySelector('#mark-test') || undefined,
            ({ state }) => ({ count: state.count + 1 }),
            store,
            {
                markElement: 'test-mark',
                runIfElementMissing: true,
                processes: ['Generic', 'STEM', 'Orochi']
            }
        );

        const element = document.createElement('div');
        element.id = 'mark-test';
        await appendAndWait(element);

        expect(store.getState().count).toBe(1);
        expect(element.getAttribute('data-mtc-helper-test-mark')).toBe('true');

        await appendAndWait(document.createElement('div'));
        expect(store.getState().count).toBe(1);
    });

    it('runs actions on an element with a different mark', async () => {
        handler.addAction<TestState>(
            () => document.querySelector('#irrelevant-mark-test') || undefined,
            ({ state }) => ({ count: state.count + 1 }),
            store,
            {
                markElement: 'test-mark',
                runIfElementMissing: true,
                processes: ['Generic', 'STEM', 'Orochi']
            }
        );

        const element = document.createElement('div');
        element.id = 'irrelevant-mark-test';
        element.setAttribute('data-mtc-helper-other-mark', 'true');
        await appendAndWait(element);

        expect(store.getState().count).toBe(1);
        expect(element.getAttribute('data-mtc-helper-test-mark')).toBe('true');
    });

    it('does not run the action when the element is missing and the option to run on missing elements is set to false', async () => {
        handler.addAction<TestState>(
            () => document.querySelector('#missing-element') || undefined,
            ({ state }) => ({ count: state.count + 1 }),
            store,
            { runIfElementMissing: false, processes: ['Generic', 'STEM', 'Orochi'] }
        );

        await appendAndWait(document.createElement('div'));

        expect(store.getState().count).toBe(0);
    });

    it('runs the action when the element is missing and the option to run on missing elements is set to true', async () => {
        handler.addAction<TestState>(
            () => document.querySelector('#missing-element') || undefined,
            ({ state }) => ({ count: state.count + 1 }),
            store,
            { runIfElementMissing: true, processes: ['Generic', 'STEM', 'Orochi'] }
        );

        await appendAndWait(document.createElement('div'));

        expect(store.getState().count).toBe(1);
    });

    it('handles both marking and missing element options correctly across multiple mutations', async () => {
        handler.addAction<TestState>(
            () => document.querySelector('#combined-test') || undefined,
            ({ state, element }) => ({
                count: element ? state.count + 1 : state.count + 2
            }),
            store,
            {
                markElement: 'combined-mark',
                runIfElementMissing: true,
                processes: ['Generic', 'STEM', 'Orochi']
            }
        );

        // First run: element is missing, should increment by 2
        await appendAndWait(document.createElement('div'));
        expect(store.getState().count).toBe(2);

        // Second run: element exists, should increment by 1 and be marked
        const element = document.createElement('div');
        element.id = 'combined-test';
        await appendAndWait(element);
        expect(store.getState().count).toBe(3);
        expect(element.getAttribute('data-mtc-helper-combined-mark')).toBe('true');

        // Third run: element exists but is marked, should not change
        await appendAndWait(document.createElement('div'));
        expect(store.getState().count).toBe(3);
    });

    it('runs multiple actions with different marks for the same element', async () => {
        handler.addAction<TestState>(
            () => document.querySelector('#multi-mark-test') || undefined,
            ({ state }) => ({ count: state.count + 1 }),
            store,
            {
                markElement: 'mark1',
                runIfElementMissing: true,
                processes: ['Generic', 'STEM', 'Orochi']
            }
        );

        handler.addAction<TestState>(
            () => document.querySelector('#multi-mark-test') || undefined,
            ({ state }) => ({ count: state.count + 10 }),
            store,
            {
                markElement: 'mark2',
                runIfElementMissing: true,
                processes: ['Generic', 'STEM', 'Orochi']
            }
        );

        const element = document.createElement('div');
        element.id = 'multi-mark-test';
        await appendAndWait(element);

        expect(store.getState().count).toBe(11);
        expect(element.getAttribute('data-mtc-helper-mark1')).toBe('true');
        expect(element.getAttribute('data-mtc-helper-mark2')).toBe('true');
    });

    it('does not update the store if the action returns the same state', async () => {
        let actionCallCount = 0;

        handler.addAction<TestState>(
            () => document.querySelector('#no-change-test') || undefined,
            ({ state }) => {
                actionCallCount++;

                return state;
            },
            store,
            { runIfElementMissing: true, processes: ['Generic', 'STEM', 'Orochi'] }
        );

        const element = document.createElement('div');
        element.id = 'no-change-test';
        await appendAndWait(element);

        expect(actionCallCount).toBe(1);
        expect(store.getState().count).toBe(0);
    });

    it('only runs an action once for multiple mutations on the same element with the same marker', async () => {
        handler.addAction<TestState>(
            () => document.querySelector('#multi-mutation-test') || undefined,
            ({ state }) => ({ count: state.count + 1 }),
            store,
            {
                markElement: 'multi-test',
                runIfElementMissing: true,
                processes: ['Generic', 'STEM', 'Orochi']
            }
        );

        const element = document.createElement('div');
        element.id = 'multi-mutation-test';
        await appendAndWait(element);

        element.setAttribute('data-test', 'value1');
        await new Promise(resolve => setTimeout(resolve, 0));

        element.setAttribute('data-test', 'value2');
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(store.getState().count).toBe(1);
        expect(element.getAttribute('data-mtc-helper-multi-test')).toBe('true');
    });
});

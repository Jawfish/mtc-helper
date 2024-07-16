import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { globalStore } from '@src/store/globalStore';

import { addListenerToTaskSubmitButton, updateTaskOpenState } from './global';

describe('handling a mutation in the conversation window element', () => {
    it('should indicate that the task is open when the element to watch is present', () => {
        const result = updateTaskOpenState({
            state: globalStore.getState(),
            element: document.createElement('div')
        });
        expect(result).toEqual({ ...globalStore.getInitialState(), taskIsOpen: true });
    });

    it('should indicate that the task is open when the element to watch is not present', () => {
        const result = updateTaskOpenState({
            state: globalStore.getState(),
            element: undefined
        });
        expect(result).toEqual({ ...globalStore.getInitialState(), taskIsOpen: false });
    });
});

describe('handling a mutation in the task submission button', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
        mockElement = document.createElement('button');
        globalStore.setState({ taskIsOpen: true });
    });

    afterEach(() => {
        mockElement.removeAttribute('data-mtc-helper');
    });

    it('should remove the listener when the task submit button is clicked', () => {
        const removeEventListenerSpy = vi.spyOn(mockElement, 'removeEventListener');
        addListenerToTaskSubmitButton({
            state: globalStore.getState(),
            element: mockElement
        });

        mockElement.click();

        expect(removeEventListenerSpy).toHaveBeenCalled();
    });

    // The purpose of this handler is to add a listener to the task submit button, not
    // to reset the state directly, so when the element isn't found we don't trigger any
    // state changes.
    it("should not specify state changes if the element can't be found", () => {
        const result = addListenerToTaskSubmitButton({
            state: globalStore.getState(),
            element: undefined
        });
        expect(result).toEqual({ ...globalStore.getInitialState(), taskIsOpen: true });
    });
});

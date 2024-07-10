import { describe, it, expect, beforeEach } from 'vitest';
import { generalStore } from '@src/store/generalStore';

import { handleOperatorResponseMutation } from './operatorResponse';

describe('handling an edited response mutation in a non-Orochi process', () => {
    beforeEach(() => {
        generalStore.getState().reset();
        document.body.innerHTML = '';
    });

    it('should not update the store if operatorResponseElement is not found', () => {
        const initialState = generalStore.getInitialState();

        handleOperatorResponseMutation(document.body);

        expect(generalStore.getState()).toEqual(initialState);
    });

    it('should not update the store if operatorResponse is empty', () => {
        document.body.innerHTML = '<div contenteditable="true"></div>';
        const initialState = generalStore.getInitialState();

        handleOperatorResponseMutation(document.body);

        expect(generalStore.getState()).toEqual(initialState);
    });

    it('should not update the store if plaintext has not changed', () => {
        document.body.innerHTML = '<div contenteditable="true">test</div>';

        handleOperatorResponseMutation(document.body);

        expect(
            generalStore.getState().selectedResponse.operatorResponseMarkdown
        ).toEqual('test');
    });

    it('should update store with new markdown when the content changes', () => {
        document.body.innerHTML = '<div contenteditable="true">old</div>';
        handleOperatorResponseMutation(document.body);
        document.body.innerHTML = '<div contenteditable="true">- new</div>';
        handleOperatorResponseMutation(document.body);

        const newState = generalStore.getState();

        expect(newState.selectedResponse.operatorResponseMarkdown).toBe('- new');
    });
});

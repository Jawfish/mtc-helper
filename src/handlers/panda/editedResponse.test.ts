import { describe, it, expect, beforeEach } from 'vitest';
import { pandaStore } from '@src/store/pandaStore';

import { handlePandaEditedResponseMutation } from './editedResponse';

describe('handlePandaEditedResponseMutation', () => {
    beforeEach(() => {
        pandaStore.getState().reset();
        document.body.innerHTML = '';
    });

    it('should not update store if editedResponseElement is not found', () => {
        const initialState = pandaStore.getInitialState();

        handlePandaEditedResponseMutation(document.body);

        expect(pandaStore.getState()).toEqual(initialState);
    });

    it('should not update store if editedResponse is empty', () => {
        document.body.innerHTML = '<div contenteditable="true"></div>';
        const initialState = pandaStore.getInitialState();

        handlePandaEditedResponseMutation(document.body);

        expect(pandaStore.getState()).toEqual(initialState);
    });

    it('should not update store if plaintext has not changed', () => {
        document.body.innerHTML = '<div contenteditable="true">test</div>';

        handlePandaEditedResponseMutation(document.body);

        expect(pandaStore.getState().editedResponseMarkdown).toEqual('test');
    });

    it('should update store with new plaintext and markdown when content changes', () => {
        document.body.innerHTML = '<div contenteditable="true">old</div>';
        handlePandaEditedResponseMutation(document.body);
        document.body.innerHTML = '<div contenteditable="true">- new</div>';
        handlePandaEditedResponseMutation(document.body);

        const newState = pandaStore.getState();
        expect(newState.editedResponseMarkdown).toBe('- new');
    });
});

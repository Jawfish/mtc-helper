import { describe, it, expect, beforeEach } from 'vitest';
import { generalStore } from '@src/store/generalStore';

import { handleGeneralEditedResponseMutation } from './editedResponse';

describe('handleGeneralEditedResponseMutation', () => {
    beforeEach(() => {
        generalStore.getState().reset();
        document.body.innerHTML = '';
    });

    it('should not update store if editedResponseElement is not found', () => {
        const initialState = generalStore.getInitialState();

        handleGeneralEditedResponseMutation(document.body);

        expect(generalStore.getState()).toEqual(initialState);
    });

    it('should not update store if editedResponse is empty', () => {
        document.body.innerHTML = '<div contenteditable="true"></div>';
        const initialState = generalStore.getInitialState();

        handleGeneralEditedResponseMutation(document.body);

        expect(generalStore.getState()).toEqual(initialState);
    });

    it('should not update store if plaintext has not changed', () => {
        document.body.innerHTML = '<div contenteditable="true">test</div>';

        handleGeneralEditedResponseMutation(document.body);

        expect(generalStore.getState().editedResponseMarkdown).toEqual('test');
    });

    it('should update store with new plaintext and markdown when content changes', () => {
        document.body.innerHTML = '<div contenteditable="true">old</div>';
        handleGeneralEditedResponseMutation(document.body);
        document.body.innerHTML = '<div contenteditable="true">- new</div>';
        handleGeneralEditedResponseMutation(document.body);

        const newState = generalStore.getState();
        expect(newState.editedResponseMarkdown).toBe('- new');
    });
});

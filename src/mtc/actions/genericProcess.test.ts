import { genericProcessStore } from '@src/store/genericProcessStore';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import MarkdownConverter from '@lib/markdown';

import {
    resetSelectedResponse,
    updateSelectedModelResponse,
    updateOperatorResponse,
    updateUnselectedModelResponse,
    updateSelectedPrompt
} from './genericProcess';

describe('Operator response handling in a generic process', () => {
    beforeEach(() => {
        genericProcessStore.getState().reset();
        vi.clearAllMocks();
    });

    it('keeps the existing operator response when no element is found', () => {
        const initialState = genericProcessStore.getInitialState();
        const result = updateOperatorResponse({
            element: undefined,
            state: initialState
        });

        expect(result).toEqual(initialState);
    });

    it('keeps the existing operator response when the content is empty', () => {
        const initialState = genericProcessStore.getInitialState();
        const element = document.createElement('div');
        element.textContent = '';

        const result = updateOperatorResponse({
            element,
            state: initialState
        });

        expect(result).toEqual(initialState);
    });

    it('keeps the existing operator response when the content has not changed', () => {
        const initialState = {
            ...genericProcessStore.getInitialState(),
            operatorResponseMarkdown: 'test'
        };
        const element = document.createElement('div');
        element.textContent = 'test';

        const result = updateOperatorResponse({
            element,
            state: initialState
        });

        expect(result).toEqual(initialState);
    });

    it('clears the model response when the element has no text content', () => {
        const initialState = {
            ...genericProcessStore.getInitialState(),
            operatorResponseMarkdown: 'Operator response'
        };
        const element = document.createElement('div');
        element.innerHTML = ''; // Empty content

        const result = updateSelectedModelResponse({
            element,
            state: initialState
        });

        expect(result).toEqual({
            ...initialState,
            modelResponsePlaintext: undefined,
            modelResponseMarkdown: ''
        });
    });

    it('updates the operator response with new markdown-formatted content when changes are detected', () => {
        const initialState = {
            ...genericProcessStore.getInitialState(),
            operatorResponseMarkdown: 'old'
        };
        const element = document.createElement('div');
        element.textContent = 'new';

        const result = updateOperatorResponse({
            element,
            state: initialState
        });

        expect(result.operatorResponseMarkdown).toBe('new');
    });
});

describe('Model response handling in a generic process', () => {
    beforeEach(() => {
        genericProcessStore.getState().reset();
        vi.clearAllMocks();
        vi.spyOn(MarkdownConverter.instance, 'htmlToMarkdown').mockImplementation(
            element => (element as HTMLElement).innerHTML
        );
    });

    it('keeps the existing model response when no element is found', () => {
        const initialState = genericProcessStore.getInitialState();
        const result = updateSelectedModelResponse({
            element: undefined,
            state: initialState
        });
        expect(result).toEqual(initialState);
    });

    it('keeps the existing model response when no operator response is present', () => {
        const initialState = genericProcessStore.getInitialState();
        const element = document.createElement('div');
        const result = updateSelectedModelResponse({
            element,
            state: initialState
        });
        expect(result).toEqual(initialState);
    });

    it('updates the stored model response when a new response is found', () => {
        const initialState = {
            ...genericProcessStore.getInitialState(),
            operatorResponseMarkdown: 'Operator response'
        };
        const element = document.createElement('div');
        element.innerHTML = '<p>Model response</p>';
        element.textContent = 'Model response';

        const result = updateSelectedModelResponse({
            element,
            state: initialState
        });

        expect(result).toEqual({
            ...initialState,
            modelResponsePlaintext: 'Model response',
            modelResponseMarkdown: 'Model response'
        });
    });

    it('converts the model response HTML to Markdown for storage', () => {
        const initialState = {
            ...genericProcessStore.getInitialState(),
            operatorResponseMarkdown: 'Operator response'
        };
        const element = document.createElement('div');
        element.innerHTML = '<p>Model response</p>';
        element.textContent = 'Model response';

        updateSelectedModelResponse({
            element,
            state: initialState
        });

        expect(MarkdownConverter.instance.htmlToMarkdown).toHaveBeenCalledWith(
            element,
            'Operator response'
        );
    });
});

describe('Resetting the selected response in a generic process', () => {
    beforeEach(() => {
        genericProcessStore.getState().reset();
        vi.clearAllMocks();
    });

    it('clears the stored response when the target element is not found', () => {
        const initialState = {
            ...genericProcessStore.getInitialState(),
            modelResponseMarkdown: 'Model response',
            modelResponsePlaintext: 'Model response',
            operatorResponseMarkdown: 'Operator response'
        };

        const result = resetSelectedResponse({
            element: undefined,
            state: initialState
        });

        expect(result).toEqual({
            ...initialState,
            modelResponseMarkdown: undefined,
            modelResponsePlaintext: undefined,
            operatorResponseMarkdown: undefined
        });
    });

    it('keeps the stored response when the target element is present', () => {
        const expectedState = {
            ...genericProcessStore.getInitialState(),
            modelResponseMarkdown: 'Model response',
            modelResponsePlaintext: 'Model response',
            operatorResponseMarkdown: 'Operator response'
        };

        const element = document.createElement('div');

        const result = resetSelectedResponse({
            element,
            state: expectedState
        });

        expect(result).toEqual(expectedState);
    });
});

describe('Unselected model response handling in a generic process', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
        genericProcessStore.getState().reset();
        vi.clearAllMocks();
        mockElement = document.createElement('div');
    });

    it('clears the unselected response when no element is found', () => {
        const initialState = {
            ...genericProcessStore.getInitialState(),
            unselectedResponse: 'existing response'
        };
        const result = updateUnselectedModelResponse({
            element: undefined,
            state: initialState
        });

        expect(result).toEqual({
            ...initialState,
            unselectedResponse: undefined
        });
    });

    it('keeps the existing state when the element is empty', () => {
        const initialState = genericProcessStore.getInitialState();
        mockElement.textContent = '';

        const result = updateUnselectedModelResponse({
            element: mockElement,
            state: initialState
        });

        expect(result).toEqual(initialState);
    });

    it('keeps the existing state when the content has not changed', () => {
        const initialState = {
            ...genericProcessStore.getInitialState(),
            unselectedResponse: 'Existing response'
        };
        mockElement.textContent = 'Existing response';

        const result = updateUnselectedModelResponse({
            element: mockElement,
            state: initialState
        });

        expect(result).toEqual(initialState);
    });
});

describe('Selected prompt handling in the generic process', () => {
    it('updates the prompt with the text content of the element', () => {
        const mockElement = document.createElement('div');
        mockElement.textContent = 'New prompt text';
        const initialState = {
            ...genericProcessStore.getInitialState(),
            prompt: 'Old prompt text'
        };
        const result = updateSelectedPrompt({
            element: mockElement,
            state: initialState
        });
        expect(result.prompt).toEqual('New prompt text');
    });

    it('clears the prompt when the element does not exist', () => {
        const initialState = {
            ...genericProcessStore.getInitialState(),
            prompt: 'Existing prompt text'
        };
        const result = updateSelectedPrompt({
            element: undefined,
            state: initialState
        });
        expect(result.prompt).toBeUndefined();
    });

    it('clears the prompt when the element has no text content', () => {
        const mockElement = document.createElement('div');
        const initialState = {
            ...genericProcessStore.getInitialState(),
            prompt: 'Existing prompt text'
        };
        const result = updateSelectedPrompt({
            element: mockElement,
            state: initialState
        });
        expect(result.prompt).toBeUndefined();
    });
});

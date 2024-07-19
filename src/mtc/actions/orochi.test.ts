import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { orochiStore } from '@store/orochiStore';
import HTMLToMarkdown from '@lib/markdown';

import {
    removeUselessMetadata,
    updateConversationTitle,
    updateLanguage,
    updateModelResponse,
    updateOperatorNotes,
    updateOperatorResponse,
    updateOperatorResponseCode,
    updatePrompt
} from './orochi';

describe('a change in the prompt of a conversation in the Orochi process', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
        mockElement = document.createElement('div');
    });

    afterEach(() => {
        mockElement.removeAttribute('data-mtc-helper');
        orochiStore.getState().reset();
    });

    it("doesn't result in invalid application state when the element is not present", () => {
        const result = updatePrompt({
            state: orochiStore.getState(),
            element: undefined
        });

        expect(result).toEqual({ ...orochiStore.getInitialState(), prompt: undefined });
    });

    it('results in the expected markdown prompt being present in the application state when the element is present', () => {
        mockElement.innerHTML = '<p>Hello <strong>world</strong></p>';

        const result = updatePrompt({
            state: orochiStore.getState(),
            element: mockElement
        });

        expect(result.prompt).toContain('Hello **world**');
    });

    it('results in the expected markdown prompt being present in the application state when parsing complex HTML', () => {
        mockElement.innerHTML = `
        <h1>Title</h1>
        <p>Paragraph with <a href="https://example.com">link</a></p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      `;
        const result = updatePrompt({
            state: orochiStore.getState(),
            element: mockElement
        });

        expect(result.prompt).toContain('# Title');
        expect(result.prompt).toContain('Paragraph with [link](https://example.com)');
        expect(result.prompt).toContain('- Item 1');
        expect(result.prompt).toContain('- Item 2');
    });
});

describe('a change in the language specified for an Orochi conversation', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
        mockElement = document.createElement('div');
    });

    it('should specify no language when the element is not present', () => {
        const result = updateLanguage({
            state: orochiStore.getState(),
            element: undefined
        });

        expect(result).toEqual({
            ...orochiStore.getInitialState(),
            language: 'unknown'
        });
    });

    it('should specify "python" when the element contains "Programming Language:Python"', () => {
        mockElement.textContent = 'Programming Language:Python';

        const result = updateLanguage({
            state: orochiStore.getInitialState(),
            element: mockElement
        });

        expect(result).toEqual({
            ...orochiStore.getInitialState(),
            language: 'python'
        });
    });

    it('should specify "python" when the element contains "Programming Language*Python"', () => {
        mockElement.textContent = 'Programming Language*Python';

        const result = updateLanguage({
            state: orochiStore.getInitialState(),
            element: mockElement
        });

        expect(result).toEqual({
            ...orochiStore.getInitialState(),
            language: 'python'
        });
    });

    it('should specify "python" when the element contains "python" in any case', () => {
        mockElement.textContent = 'This is a Python program';

        const result = updateLanguage({
            state: orochiStore.getState(),
            element: mockElement
        });

        expect(result).toEqual({
            ...orochiStore.getInitialState(),
            language: 'python'
        });
    });

    it('should specify "python" when the element has class "language-python"', () => {
        mockElement.classList.add('language-python');

        const result = updateLanguage({
            state: orochiStore.getState(),
            element: mockElement
        });

        expect(result).toEqual({
            ...orochiStore.getInitialState(),
            language: 'python'
        });
    });

    it('should specify "unknown" when the element does not indicate Python', () => {
        mockElement.textContent = 'This is a JavaScript program';

        const result = updateLanguage({
            state: orochiStore.getState(),
            element: mockElement
        });

        expect(result).toEqual({
            ...orochiStore.getInitialState(),
            language: 'unknown'
        });
    });

    it("should specify no language when the element isn't found", () => {
        const result = updateLanguage({
            state: orochiStore.getState(),
            element: undefined
        });

        expect(result).toEqual({
            ...orochiStore.getInitialState(),
            language: 'unknown'
        });
    });
});

describe('a change in the model response of a conversation in the Orochi process', () => {
    let responseElement: HTMLElement;
    let responseCodeElement: HTMLElement;

    beforeEach(() => {
        responseElement = document.createElement('div');
        const preElement = document.createElement('pre');
        responseCodeElement = document.createElement('code');

        responseElement.appendChild(preElement);
        preElement.appendChild(responseCodeElement);
    });

    afterEach(() => {
        orochiStore.getState().reset();
    });

    it('preserves the existing state when the element is not present', () => {
        const initialState = {
            ...orochiStore.getInitialState(),
            modelResponse: 'existing response'
        };
        const result = updateModelResponse({
            state: initialState,
            element: undefined
        });

        expect(result).toEqual(initialState);
    });

    it('updates the model response and code when the element is present', () => {
        const textElement = document.createElement('p');
        textElement.textContent = 'This is the non-code portion of the response';
        responseElement.appendChild(textElement);
        responseCodeElement.textContent = 'print("Hello, World!")';

        const result = updateModelResponse({
            state: {
                ...orochiStore.getInitialState(),
                operatorResponse: 'existing response'
            },
            element: responseElement
        });

        expect(result.modelResponse).toBe(
            '```\nprint("Hello, World!")\n```\n\nThis is the non-code portion of the response'
        );

        expect(result.modelResponseCode).toBe('print("Hello, World!")');
    });

    it('updates only the model response when no code is present', () => {
        const textElement = document.createElement('p');
        textElement.textContent = 'This is the non-code portion of the response';
        responseElement.appendChild(textElement);

        const result = updateModelResponse({
            state: {
                ...orochiStore.getInitialState(),
                operatorResponse: 'existing response'
            },
            element: responseElement
        });

        expect(result.modelResponse).toBe(
            'This is the non-code portion of the response'
        );
        expect(result.modelResponseCode).toBeUndefined();
    });

    it('does not update the state if the content has not changed', () => {
        const initialState = {
            ...orochiStore.getInitialState(),
            modelResponse: 'Existing response\nprint("Hello")',
            modelResponseCode: 'print("Hello")'
        };
        responseElement.textContent = 'Existing response\n';
        const codeElement = document.createElement('pre');
        const code = document.createElement('code');
        code.textContent = 'print("Hello")';
        codeElement.appendChild(code);
        responseElement.appendChild(codeElement);

        const result = updateModelResponse({
            state: initialState,
            element: responseElement
        });

        expect(result).toEqual(initialState);
    });
});

describe('a change in the operator response of a conversation in the Orochi process', () => {
    let responseElement: HTMLElement;
    let responseCodeElement: HTMLElement;

    beforeEach(() => {
        responseElement = document.createElement('div');
        const preElement = document.createElement('pre');
        responseCodeElement = document.createElement('code');

        responseElement.appendChild(preElement);
        preElement.appendChild(responseCodeElement);
    });

    afterEach(() => {
        orochiStore.getState().reset();
    });

    it('preserves the existing state when the element is not present', () => {
        const initialState = {
            ...orochiStore.getInitialState(),
            operatorResponse: 'existing response'
        };
        const result = updateOperatorResponse({
            state: initialState,
            element: undefined
        });

        expect(result).toEqual(initialState);
    });

    it('updates the operator response when the element is present', () => {
        responseCodeElement.textContent = 'This is the operator response';

        const result = updateOperatorResponse({
            state: orochiStore.getInitialState(),
            element: responseElement
        });

        expect(result.operatorResponse).toBe('This is the operator response');
    });

    it('stores the operator reponse with code when it contains code', () => {
        responseElement.textContent = 'This is the operator response\n';
        const codeElement = document.createElement('pre');
        const code = document.createElement('code');
        code.textContent = 'print("Hello, World!")';
        codeElement.appendChild(code);
        responseElement.appendChild(codeElement);

        const result = updateOperatorResponse({
            state: orochiStore.getInitialState(),
            element: responseElement
        });

        expect(result.operatorResponse).toBe(
            'This is the operator response\nprint("Hello, World!")'
        );
    });

    it('sets the operator response to undefined when the element is empty', () => {
        responseElement.textContent = '';

        const result = updateOperatorResponse({
            state: orochiStore.getInitialState(),
            element: responseElement
        });

        expect(result.operatorResponse).toBeUndefined();
    });

    it('preserves the existing state when the element is not present', () => {
        const initialState = {
            ...orochiStore.getInitialState(),
            operatorResponseCode: 'existing code'
        };
        const result = updateOperatorResponseCode({
            state: initialState,
            element: undefined
        });

        expect(result).toEqual(initialState);
    });

    it('updates the operator response code when the element is present', () => {
        responseCodeElement.textContent = 'print("Hello from operator")';

        const result = updateOperatorResponseCode({
            state: orochiStore.getInitialState(),
            element: responseElement
        });

        expect(result.operatorResponseCode).toBe('print("Hello from operator")');
    });

    it('does not include the non-code portions of the response', () => {
        const mockElementWithOuterText = document.createElement('div');
        const outerText = document.createTextNode('Outer text');
        const innerPre = document.createElement('pre');
        const innerCode = document.createElement('code');

        innerCode.textContent = 'print("Hello from operator")';
        innerPre.appendChild(innerCode);
        mockElementWithOuterText.appendChild(outerText);
        mockElementWithOuterText.appendChild(innerPre);

        const result = updateOperatorResponseCode({
            state: orochiStore.getInitialState(),
            element: mockElementWithOuterText
        });

        expect(result.operatorResponseCode).toBe('print("Hello from operator")');
    });

    it('sets the operator response code to undefined when the element is empty', () => {
        responseCodeElement.textContent = '';

        const result = updateOperatorResponseCode({
            state: orochiStore.getInitialState(),
            element: responseElement
        });

        expect(result.operatorResponseCode).toBeUndefined();
    });
});

describe('removing useless metadata from a conversation in the Orochi process', () => {
    let mockElement: HTMLElement;
    let mockParent: HTMLElement;

    beforeEach(() => {
        mockElement = document.createElement('div');
        mockParent = document.createElement('div');
        mockParent.appendChild(mockElement);
    });

    it('removes the element when it is present', () => {
        const initialState = orochiStore.getInitialState();
        const result = removeUselessMetadata({
            state: initialState,
            element: mockElement
        });

        expect(mockParent.contains(mockElement)).toBe(false);
        expect(result).toEqual(initialState);
    });

    it('does not modify the DOM when no element is present', () => {
        const initialState = orochiStore.getInitialState();
        const result = removeUselessMetadata({
            state: initialState,
            element: undefined
        });

        expect(mockParent.contains(mockElement)).toBe(true);
        expect(result).toEqual(initialState);
    });

    it('always returns the unchanged state', () => {
        const initialState = {
            ...orochiStore.getInitialState(),
            someProperty: 'someValue'
        };

        const resultWithElement = removeUselessMetadata({
            state: initialState,
            element: mockElement
        });

        const resultWithoutElement = removeUselessMetadata({
            state: initialState,
            element: undefined
        });

        expect(resultWithElement).toEqual(initialState);
        expect(resultWithoutElement).toEqual(initialState);
    });
});

describe('updating operator notes in the Orochi process', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
        mockElement = document.createElement('div');
        vi.spyOn(HTMLToMarkdown.instance, 'htmlToMarkdown').mockImplementation(
            html => (html as HTMLElement).textContent || ''
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('preserves the existing state when no element is present', () => {
        const initialState = {
            ...orochiStore.getInitialState(),
            operatorNotes: 'existing notes'
        };
        const result = updateOperatorNotes({
            state: initialState,
            element: undefined
        });

        expect(result).toEqual(initialState);
    });

    it('updates the operator notes when an element is present', () => {
        mockElement.innerHTML = '<p>These are the operator notes</p>';

        const result = updateOperatorNotes({
            state: orochiStore.getInitialState(),
            element: mockElement
        });

        expect(result.operatorNotes).toBe('These are the operator notes');
    });

    it('converts HTML to markdown for operator notes', () => {
        mockElement.innerHTML =
            '<h1>Title</h1><p>Paragraph</p><ul><li>Item 1</li><li>Item 2</li></ul>';

        const result = updateOperatorNotes({
            state: orochiStore.getInitialState(),
            element: mockElement
        });

        expect(result.operatorNotes).toBe('TitleParagraphItem 1Item 2');
        expect(HTMLToMarkdown.instance.htmlToMarkdown).toHaveBeenCalledWith(
            mockElement,
            ''
        );
    });

    it('sets operator notes to an empty string when the element is empty', () => {
        mockElement.innerHTML = '';

        const result = updateOperatorNotes({
            state: orochiStore.getInitialState(),
            element: mockElement
        });

        expect(result.operatorNotes).toBe('');
    });
});

describe('updating conversation title in the Orochi process', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
        mockElement = document.createElement('div');
    });

    it('preserves the existing state when no element is present', () => {
        const initialState = {
            ...orochiStore.getInitialState(),
            conversationTitle: 'existing title'
        };
        const result = updateConversationTitle({
            state: initialState,
            element: undefined
        });

        expect(result).toEqual(initialState);
    });

    it('updates the conversation title when an element is present', () => {
        mockElement.textContent = 'New Conversation Title';

        const result = updateConversationTitle({
            state: orochiStore.getInitialState(),
            element: mockElement
        });

        expect(result.conversationTitle).toBe('New Conversation Title');
    });

    it('sets the conversation title to undefined when the element is empty', () => {
        mockElement.textContent = '';

        const result = updateConversationTitle({
            state: orochiStore.getInitialState(),
            element: mockElement
        });

        expect(result.conversationTitle).toBeUndefined();
    });

    it('sets the conversation title to undefined when the element is entirely whitespace', () => {
        mockElement.textContent = ' ';

        const result = updateConversationTitle({
            state: orochiStore.getInitialState(),
            element: mockElement
        });

        expect(result.conversationTitle).toBeUndefined();
    });

    it('trims whitespace from the conversation title', () => {
        mockElement.textContent = '  Trimmed Title  ';

        const result = updateConversationTitle({
            state: orochiStore.getInitialState(),
            element: mockElement
        });

        expect(result.conversationTitle).toBe('Trimmed Title');
    });
});

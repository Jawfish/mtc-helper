import { describe, it, expect, beforeEach } from 'vitest';
import { generalStore } from '@src/store/generalStore';

import {
    updateModelResponseState,
    updateOperatorResponseState
} from './onMut_selectedResponse_updateSelectedResponseState';

describe("a change in the operator's response in a non-Orochi process", () => {
    beforeEach(() => {
        generalStore.getState().reset();
        document.body.innerHTML = '';
    });

    it('should not update the store if the operator response element is not found', () => {
        const initialState = generalStore.getInitialState();

        updateOperatorResponseState(document.body);

        expect(generalStore.getState()).toEqual(initialState);
    });

    it('should not update the store if the response is empty', () => {
        document.body.innerHTML = '<div contenteditable="true"></div>';
        const initialState = generalStore.getInitialState();

        updateOperatorResponseState(document.body);

        expect(generalStore.getState()).toEqual(initialState);
    });

    it('should not update the store if the operator text has not been changed', () => {
        document.body.innerHTML = '<div contenteditable="true">test</div>';

        updateOperatorResponseState(document.body);

        expect(generalStore.getState().operatorResponseMarkdown).toEqual('test');
    });

    it('should update store with new markdown when the content changes', () => {
        document.body.innerHTML = '<div contenteditable="true">old</div>';
        updateOperatorResponseState(document.body);
        document.body.innerHTML = '<div contenteditable="true">- new</div>';
        updateOperatorResponseState(document.body);

        const newState = generalStore.getState();

        expect(newState.operatorResponseMarkdown).toBe('- new');
    });
});

describe("a change in the visibility of the model's response in a non-Orochi process", () => {
    beforeEach(() => {
        generalStore.getState().reset();
        generalStore.setState({
            operatorResponseMarkdown: 'Test content'
        });
        document.body.innerHTML = '';
    });

    const createModelResponseElement = (content: string) => {
        return `
            <div>
                <div>
                    <button><span>Save</span></button>
                    <div data-cy="tab">${content}</div>
                </div>
            </div>
        `;
    };

    it('should not update the store if the model response element is not found', () => {
        document.body.innerHTML = '<div data-cy="tab">No save button</div>';
        updateModelResponseState(document.body);

        expect(generalStore.getState().modelResponseHtml).toBeUndefined();
        expect(generalStore.getState().modelResponseMarkdown).toBeUndefined();
    });

    it('should update the store with markdown and HTML when content is present', () => {
        document.body.innerHTML = createModelResponseElement('<p>Test content</p>');
        updateModelResponseState(document.body);

        const newState = generalStore.getState();

        expect(newState.modelResponseMarkdown).toBe('Test content');
        expect(newState.modelResponseHtml).toBe('<p>Test content</p>');
    });

    it('should handle complex HTML and convert it to markdown', () => {
        const complexContent = `
            <h1>Title</h1>
            <p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
            <ul>
                <li>Item 1</li>
                <li>Item 2</li>
            </ul>
        `;
        document.body.innerHTML = createModelResponseElement(complexContent);

        updateModelResponseState(document.body);

        const newState = generalStore.getState();
        expect(newState.modelResponseMarkdown).toBe(
            '# Title\n\nParagraph with **bold** and *italic* text.\n\n- Item 1\n- Item 2'
        );
        expect(newState.modelResponseHtml).toContain('<h1>Title</h1>');
    });

    it('should handle code blocks correctly', () => {
        const codeContent = `
            <pre><code>function test() {\n console.log("Hello, world!");\n}\n</code></pre>
        `;
        document.body.innerHTML = createModelResponseElement(codeContent);

        updateModelResponseState(document.body);

        const newState = generalStore.getState();

        expect(newState.modelResponseMarkdown).toBe(
            '```\nfunction test() {\n console.log("Hello, world!");\n}\n```'
        );
    });

    it('should handle empty paragraphs and preserve newlines', () => {
        const content = `
            <p>First paragraph</p>
            <p></p>
            <p>Third paragraph</p>
        `;
        document.body.innerHTML = createModelResponseElement(content);

        updateModelResponseState(document.body);

        const newState = generalStore.getState();
        expect(newState.modelResponseMarkdown).toBe(
            'First paragraph\n\nThird paragraph'
        );
    });

    it('should handle special characters correctly', () => {
        const content = `
            <p>Special characters: &amp; &lt; &gt; &quot; &#39;</p>
        `;
        document.body.innerHTML = createModelResponseElement(content);

        updateModelResponseState(document.body);

        const newState = generalStore.getState();

        expect(newState.modelResponseMarkdown).toBe('Special characters: & < > " \'');
    });

    it('should not update store when the operator response is in the DOM', () => {
        document.body.innerHTML = `
            <div contenteditable="true">Operator content</div>
            ${createModelResponseElement('<p>Model content</p>')}
        `;
        updateModelResponseState(document.body);
        expect(generalStore.getState().modelResponseHtml).toBeUndefined();
        expect(generalStore.getState().modelResponseMarkdown).toBeUndefined();
    });

    it('should update store only for the correct tab with Save button', () => {
        document.body.innerHTML = `
            <div>
                <div>
                    <button><span>Other</span></button>
                    <div data-cy="tab"><p>Incorrect tab</p></div>
                </div>
            </div>
            ${createModelResponseElement('<p>Correct tab</p>')}
        `;
        updateModelResponseState(document.body);

        const newState = generalStore.getState();
        expect(newState.modelResponseMarkdown).toBe('Correct tab');
        expect(newState.modelResponseHtml).toBe('<p>Correct tab</p>');
    });
});

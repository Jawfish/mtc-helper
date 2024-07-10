import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach } from 'vitest';
import { generalStore } from '@src/store/generalStore';

import {
    createModelResponseMutationHandler,
    handleModelResponseMutation
} from './modelResponse';

describe('Handling a mutation in the original response element of a non-Orochi process', () => {
    beforeEach(() => {
        generalStore.getState().reset();
        generalStore.setState(state => ({
            selectedResponse: {
                ...state.selectedResponse,
                operatorResponseMarkdown: 'Test content'
            }
        }));
        document.body.innerHTML = '';
    });

    it('should not update the store if the original response element is not found', () => {
        handleModelResponseMutation(document.body);

        expect(
            generalStore.getState().selectedResponse.modelResponseHtml
        ).toBeUndefined();
        expect(
            generalStore.getState().selectedResponse.modelResponseMarkdown
        ).toBeUndefined();
    });

    it('should not update the store if the original response is empty', () => {
        document.body.innerHTML =
            '<div><div id="2" class="text-theme-main"></div><div data-cy="tab"></div></div>';

        handleModelResponseMutation(document.body);

        expect(
            generalStore.getState().selectedResponse.modelResponseHtml
        ).toBeUndefined();
        expect(
            generalStore.getState().selectedResponse.modelResponseMarkdown
        ).toBeUndefined();
    });

    it('should update the store with markdown and HTML when content is present', () => {
        document.body.innerHTML = `<div><p>Test content</p></div>`;
        const selector = () => document.body.querySelector('div') || undefined;
        const handler = createModelResponseMutationHandler(selector);

        handler(document.body);

        const newState = generalStore.getState();

        expect(newState.selectedResponse.modelResponseMarkdown).toBe('Test content');
        expect(newState.selectedResponse.modelResponseHtml).toBe('<p>Test content</p>');
    });

    it('should handle complex HTML and convert it to markdown', () => {
        document.body.innerHTML = `
            <div>
                <div id="2" class="text-theme-main"></div>
                <div data-cy="tab">
                    <h1>Title</h1>
                    <p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
                    <ul>
                        <li>Item 1</li>
                        <li>Item 2</li>
                    </ul>
                </div>
            </div>
        `;
        const selector = () => document.body.querySelector('div') || undefined;
        const handler = createModelResponseMutationHandler(selector);

        handler(document.body);

        const newState = generalStore.getState();
        expect(newState.selectedResponse.modelResponseMarkdown).toBe(
            '# Title\n\nParagraph with **bold** and *italic* text.\n\n- Item 1\n- Item 2'
        );
        expect(newState.selectedResponse.modelResponseHtml).toContain('<h1>Title</h1>');
    });

    it('should handle code blocks correctly', () => {
        document.body.innerHTML = `
            <div>
                <div id="2" class="text-theme-main"></div>
                <div data-cy="tab">
                    <pre><code>function test() {\n console.log("Hello, world!");\n}\n</code></pre>
                </div>
            </div>
        `;
        const selector = () => document.body.querySelector('div') || undefined;
        const handler = createModelResponseMutationHandler(selector);

        handler(document.body);

        const newState = generalStore.getState();

        expect(newState.selectedResponse.modelResponseMarkdown).toBe(
            '```\nfunction test() {\n console.log("Hello, world!");\n}\n```'
        );
    });

    it('should handle empty paragraphs and preserve newlines', () => {
        document.body.innerHTML = `
            <div>
                <div id="2" class="text-theme-main"></div>
                <div data-cy="tab">
                    <p>First paragraph</p>
                    <p></p>
                    <p>Third paragraph</p>
                </div>
            </div>
        `;
        const selector = () => document.body.querySelector('div') || undefined;
        const handler = createModelResponseMutationHandler(selector);

        handler(document.body);

        const newState = generalStore.getState();
        expect(newState.selectedResponse.modelResponseMarkdown).toBe(
            'First paragraph\n\nThird paragraph'
        );
    });

    it('should handle special characters correctly', () => {
        document.body.innerHTML = `
            <div>
                <div id="2" class="text-theme-main"></div>
                <div data-cy="tab">
                    <p>Special characters: &amp; &lt; &gt; &quot; &#39;</p>
                </div>
            </div>
        `;
        const selector = () => document.body.querySelector('div') || undefined;
        const handler = createModelResponseMutationHandler(selector);

        handler(document.body);

        const newState = generalStore.getState();
        expect(newState.selectedResponse.modelResponseMarkdown).toBe(
            'Special characters: & < > " \''
        );
    });

    it('should not update store when tab is not selected', () => {
        document.body.innerHTML = `
            <div>
                <div id="2"></div>
                <div data-cy="tab"><p>Test content</p></div>
            </div>
        `;
        handleModelResponseMutation(document.body);
        expect(
            generalStore.getState().selectedResponse.modelResponseHtml
        ).toBeUndefined();
        expect(
            generalStore.getState().selectedResponse.modelResponseMarkdown
        ).toBeUndefined();
    });
});

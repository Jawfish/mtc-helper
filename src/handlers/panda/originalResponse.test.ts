import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { pandaStore } from '@src/store/pandaStore';

import { handlePandaOriginalResponseMutation } from './originalResponse';
import * as selectors from './selectors';

describe('handlePandaOriginalResponseMutation', () => {
    beforeEach(() => {
        pandaStore.getState().reset();
        pandaStore.setState({
            editedResponseMarkdown: 'Test content'
        });
        document.body.innerHTML = '';
        vi.spyOn(selectors, 'selectPandaSelectedResponse').mockImplementation(() => {
            return document.querySelector('div') || null;
        });
    });

    it('should not update store if originalResponseElement is not found', () => {
        handlePandaOriginalResponseMutation(document.body);
        expect(pandaStore.getState().originalResponseHtml).toBeUndefined();
        expect(pandaStore.getState().originalResponseHtml).toBeUndefined();
    });

    it('should not update store if originalResponse is empty', () => {
        document.body.innerHTML =
            '<div><div id="2" class="text-theme-main"></div><div data-cy="tab"></div></div>';

        handlePandaOriginalResponseMutation(document.body);

        expect(pandaStore.getState().originalResponseHtml).toBeUndefined();
        expect(pandaStore.getState().originalResponseHtml).toBeUndefined();
    });

    it('should update store with markdown and HTML when content is present', () => {
        document.body.innerHTML = `
            <div>
                <div id="2" class="text-theme-main"></div>
                <div data-cy="tab"><p>Test content</p></div>
            </div>
        `;
        handlePandaOriginalResponseMutation(document.body);
        const newState = pandaStore.getState();
        expect(newState.originalResponseMarkdown).toBe('Test content');
        expect(newState.originalResponseHtml).toBe('<p>Test content</p>');
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
        handlePandaOriginalResponseMutation(document.body);
        const newState = pandaStore.getState();
        expect(newState.originalResponseMarkdown).toBe(
            '# Title\n\nParagraph with **bold** and *italic* text.\n\n- Item 1\n- Item 2'
        );
        expect(newState.originalResponseHtml).toContain('<h1>Title</h1>');
    });

    it('should handle code blocks correctly', () => {
        document.body.innerHTML = `
            <div>
                <div id="2" class="text-theme-main"></div>
                <div data-cy="tab">
                    <pre><code>function test() {
    console.log("Hello, world!");
}</code></pre>
                </div>
            </div>
        `;
        handlePandaOriginalResponseMutation(document.body);
        const newState = pandaStore.getState();
        expect(newState.originalResponseMarkdown).toBe(
            '```\nfunction test() {\n    console.log("Hello, world!");\n}\n```'
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
        handlePandaOriginalResponseMutation(document.body);
        const newState = pandaStore.getState();
        expect(newState.originalResponseMarkdown).toBe(
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
        handlePandaOriginalResponseMutation(document.body);
        const newState = pandaStore.getState();
        expect(newState.originalResponseMarkdown).toBe(
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
        handlePandaOriginalResponseMutation(document.body);
        expect(pandaStore.getState().originalResponseHtml).toBeUndefined();
        expect(pandaStore.getState().originalResponseHtml).toBeUndefined();
    });
});

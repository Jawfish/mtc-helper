import { describe, it, expect } from 'vitest';

import HTMLToMarkdown from './markdown';

describe('Markdown converter', () => {
    const md = HTMLToMarkdown.instance;

    it('should be a singleton', () => {
        const instance1 = HTMLToMarkdown.instance;
        const instance2 = HTMLToMarkdown.instance;
        expect(instance1).toBe(instance2);
    });

    it('should convert basic HTML to Markdown', () => {
        const html = '<p>Hello, world!</p>';
        const inputString = 'Hello, world!';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe('Hello, world!');
    });

    it('should use underscore for emphasis based on input string', () => {
        const html = '<p>This is <em>italic</em> text.</p>';
        const inputString = 'This is _italic_ text.';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe('This is _italic_ text.');
    });

    it('should use double underscore for strong emphasis based on input string', () => {
        const html = '<p>This is <strong>bold</strong> text.</p>';
        const inputString = 'This is __bold__ text.';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe('This is __bold__ text.');
    });

    it('should use asterisks for emphasis and strong emphasis when input string uses them', () => {
        const html = '<p>This is <em>italic</em> and <strong>bold</strong> text.</p>';
        const inputString = 'This is *italic* and **bold** text.';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe('This is *italic* and **bold** text.');
    });

    it('should add no empty lines after headings when input string has none', () => {
        const html = '<h1>Heading</h1><p>Paragraph</p>';
        const inputString = '# Heading\nParagraph';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe('# Heading\nParagraph');
    });

    it('should add 2 empty liness after headings when input string has two', () => {
        const html = '<h1>Heading</h1><p>Paragraph</p>';
        const inputString = '# Heading\n\nParagraph';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe('# Heading\n\nParagraph');
    });

    it('should add 3 empty liness after headings when input string has three', () => {
        const html = '<h1>Heading</h1><p>Paragraph</p>';
        const inputString = '# Heading\n\n\nParagraph';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe('# Heading\n\n\nParagraph');
    });

    it('should add 4 empty liness after headings when input string has four', () => {
        const html = '<h1>Heading</h1><p>Paragraph</p>';
        const inputString = '# Heading\n\n\n\nParagraph';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe('# Heading\n\n\n\nParagraph');
    });

    it('should add 3 spaces after list item markers when input string has them', () => {
        const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
        const inputString = '-   Item 1\n-   Item 2';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe('-   Item 1\n-   Item 2');
    });

    it('should add 2 spaces after list item markers when input string has them', () => {
        const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
        const inputString = '-  Item 1\n-  Item 2';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe('-  Item 1\n-  Item 2');
    });

    it('should add 1 space after list item markers when input string has them', () => {
        const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
        const inputString = '- Item 1\n- Item 2';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe('- Item 1\n- Item 2');
    });

    // TODO: Make these tests pass
    // it('should not add a space after list item markers when input string does not have them', () => {
    //     const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    //     const inputString = '-Item 1\n-Item 2';
    //     const result = turndown.htmlToMarkdown(html, inputString);
    //     expect(result).toBe('-Item 1\n-Item 2');
    // });

    // it('should handle ordered lists with no spaces', () => {
    //     const html = '<ol><li>First</li><li>Second</li></ol>';
    //     const inputString = '1.First\n2.Second';
    //     const result = turndown.htmlToMarkdown(html, inputString);
    //     expect(result).toBe('1.First\n2.Second');
    // });

    it('should handle mixed formatting correctly', () => {
        const html =
            '<h1>Title</h1><p>This is <em>italic</em> and <strong>bold</strong> text.</p><ul><li>Item 1</li><li>Item 2</li></ul>';
        const inputString =
            '# Title\n\nThis is _italic_ and __bold__ text.\n\n-   Item 1\n-   Item 2';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe(
            '# Title\n\nThis is _italic_ and __bold__ text.\n\n-   Item 1\n-   Item 2'
        );
    });

    it("should maintain default formatting when input string doesn't specify preferences", () => {
        const html =
            '<h1>Title</h1><p>This is <em>italic</em> and <strong>bold</strong> text.</p><ul><li>Item 1</li><li>Item 2</li></ul>';
        const inputString =
            'Title\n\nThis is italic and bold text.\n\n- Item 1\n- Item 2';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe(
            '# Title\n\nThis is *italic* and **bold** text.\n\n- Item 1\n- Item 2'
        );
    });

    it('should handle empty input correctly', () => {
        const html = '';
        const inputString = '';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe('');
    });

    it('should handle complex HTML structures', () => {
        const html =
            '<div><h1>Title</h1><p>Paragraph with <a href="https://example.com">link</a></p><pre><code>const x = 1;</code></pre></div>';
        const inputString =
            '# Title\n\nParagraph with [link](https://example.com)\n\n```\nconst x = 1;\n```';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe(
            '# Title\n\nParagraph with [link](https://example.com)\n\n```\nconst x = 1;\n```'
        );
    });
});

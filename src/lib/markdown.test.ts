import { describe, it, expect } from 'vitest';

import HTMLToMarkdown from './markdown';

describe('HTML to markdown converter', () => {
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

    it('should use underscore for emphasis if the input string uses that', () => {
        const html = '<p>This is <em>italic</em> text.</p>';
        const inputString = 'This is _italic_ text.';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe('This is _italic_ text.');
    });

    it('should use double underscore for strong emphasis if the input string uses that', () => {
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

    it('should add 2 empty lines after headings when input string has two', () => {
        const html = '<h1>Heading</h1><p>Paragraph</p>';
        const inputString = '# Heading\n\nParagraph';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe('# Heading\n\nParagraph');
    });

    it('should add 3 empty lines after headings when input string has three', () => {
        const html = '<h1>Heading</h1><p>Paragraph</p>';
        const inputString = '# Heading\n\n\nParagraph';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe('# Heading\n\n\nParagraph');
    });

    it('should add 4 empty lines after headings when input string has four', () => {
        const html = '<h1>Heading</h1><p>Paragraph</p>';
        const inputString = '# Heading\n\n\n\nParagraph';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe('# Heading\n\n\n\nParagraph');
    });

    it('should handle unordered lists', () => {
        const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
        const inputString = '- Item 1\n- Item 2';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe('- Item 1\n- Item 2');
    });

    it('should handle ordered lists', () => {
        const html = '<ol><li>Item 1</li><li>Item 2</li></ol>';
        const inputString = '1. Item 1\n2. Item 2';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe('1. Item 1\n2. Item 2');
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

    it('should handle multiple lines within a single paragraph element correctly', () => {
        const html = '<p>Line 1<br>Line 2</p>';
        const inputString = 'Line 1\nLine 2';
        const result = md.htmlToMarkdown(html, inputString);
        expect(result).toBe('Line 1\nLine 2');
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

    it('should not insert escape characters for certain symbols', () => {
        const symbols = '! @ # $ % ^ & * ( ) _ + { } | : " < > ? - = [ ] \\ ; \' , . /';
        const html = `<p>${symbols}</p>`;

        const result = md.htmlToMarkdown(html, symbols);

        expect(result).toBe(symbols);
    });
});

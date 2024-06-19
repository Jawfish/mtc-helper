import '@testing-library/jest-dom/vitest';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
    codeContainsHtml,
    codeContainsMarkdownFence,
    truncateString,
    getTextFromElement,
    wordCount,
    isValidUUID
} from './textProcessing';

describe('Checking for HTML in code', () => {
    it('detects HTML tags in code', () => {
        const code = 'some code </div>';
        const result = codeContainsHtml(code);
        expect(result).toBe(true);
    });

    it('does not give a false positive', () => {
        const code = '<so<m/>e< <<>><><><code<>';
        const result = codeContainsHtml(code);
        expect(result).toBe(false);
    });
});

describe('Determining if code contains markdown', () => {
    let code: string;

    beforeEach(() => {
        code = '';
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('detects improperly opened markdown code block', () => {
        code = '```javascript\nsome code';
        const result = codeContainsMarkdownFence(code);
        expect(result).toBe(true);
    });

    it('detects improperly closed markdown code block', () => {
        code = 'some\ncode```';
        const result = codeContainsMarkdownFence(code);
        expect(result).toBe(true);
    });
});

describe('Truncating a string', () => {
    it('truncates a string to 50 characters by default', () => {
        const str = 'a'.repeat(51);
        expect(truncateString(str)).toBe(`${'a'.repeat(50)}...`);
    });

    it('handles undefined strings', () => {
        expect(truncateString(undefined)).toBe('undefined');
    });

    it('truncates to a custom length', () => {
        const str = 'a'.repeat(51);
        expect(truncateString(str, 10)).toBe('aaaaaaaaaa...');
    });

    it('handles empty strings', () => {
        expect(truncateString('')).toBe('empty string');
    });

    it('does not truncate short strings', () => {
        expect(truncateString('short string')).toBe('short string');
    });

    it('replaces newlines with spaces', () => {
        const str = 'a\n'.repeat(50);
        expect(truncateString(str)).toBe(`${'a '.repeat(50 / 2)}...`);
    });
});

describe('Getting the text from an HTML element', () => {
    let element: HTMLElement | null;

    beforeEach(() => {
        element = null;
    });

    it('returns an empty string for undefined elements', () => {
        expect(getTextFromElement(element)).toBe('');
    });

    it('returns text from a single element', () => {
        element = document.createElement('p');
        element.textContent = 'normal text';
        expect(getTextFromElement(element)).toBe('normal text');
    });

    it('returns text from a nested element', () => {
        element = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = 'nested bold';
        element.appendChild(strong);
        expect(getTextFromElement(element)).toBe('**nested bold**');
    });

    it('returns text from a list element', () => {
        element = document.createElement('li');
        element.textContent = 'list element';
        expect(getTextFromElement(element)).toBe('- list element');
    });

    it('returns text from a code element', () => {
        element = document.createElement('code');
        element.textContent = 'inline code';
        expect(getTextFromElement(element)).toBe('`inline code`');
    });

    it('returns text from a level 1 heading element', () => {
        element = document.createElement('h1');
        element.textContent = 'heading';
        expect(getTextFromElement(element)).toBe('# heading');
    });

    it('returns text from a level 2 heading element', () => {
        element = document.createElement('h2');
        element.textContent = 'heading';
        expect(getTextFromElement(element)).toBe('## heading');
    });

    it('returns text from a level 3 heading element', () => {
        element = document.createElement('h3');
        element.textContent = 'heading';
        expect(getTextFromElement(element)).toBe('### heading');
    });

    it('returns text from a level 4 heading element', () => {
        element = document.createElement('h4');
        element.textContent = 'heading';
        expect(getTextFromElement(element)).toBe('#### heading');
    });

    it('returns text from a level 5 heading element', () => {
        element = document.createElement('h5');
        element.textContent = 'heading';
        expect(getTextFromElement(element)).toBe('##### heading');
    });

    it('returns text from a level 6 heading element', () => {
        element = document.createElement('h6');
        element.textContent = 'heading';
        expect(getTextFromElement(element)).toBe('###### heading');
    });

    it('returns text from a strong element', () => {
        element = document.createElement('strong');
        element.textContent = 'bold text';
        expect(getTextFromElement(element)).toBe('**bold text**');
    });

    it('returns text from an emphasis element', () => {
        element = document.createElement('em');
        element.textContent = 'emphasized text';
        expect(getTextFromElement(element)).toBe('*emphasized text*');
    });

    it('returns the text content as the default case', () => {
        element = document.createElement('div');
        element.textContent = 'default text';
        expect(getTextFromElement(element)).toBe('default text');
    });

    it('returns text from a paragraph element with multiple children', () => {
        element = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = 'bold';
        const em = document.createElement('em');
        em.textContent = 'emphasis';
        element.appendChild(strong);
        element.appendChild(document.createTextNode(', '));
        element.appendChild(em);
        expect(getTextFromElement(element)).toBe('**bold**, *emphasis*');
    });
});

describe('Counting words', () => {
    it('counts the correct number of space-separated words', () => {
        expect(wordCount('one two three')).toBe(3);
    });

    it('handles leading and trailing whitespace', () => {
        expect(wordCount('  start   end  ')).toBe(2);
    });

    it('handles multiple spaces between words', () => {
        expect(wordCount('word1    word2     word3')).toBe(3);
    });

    it('returns 0 for an empty string', () => {
        expect(wordCount('')).toBe(0);
    });

    it('returns 0 for a string with only whitespace', () => {
        expect(wordCount('   \t   \n   ')).toBe(0);
    });

    it('handles a mix of spaces and tabs', () => {
        expect(wordCount('word1\t\tword2 \t word3')).toBe(3);
    });
});

describe('Validating a UUID', () => {
    it('should return true for valid UUIDs', () => {
        const validUUIDs = [
            '2df25fda-fa6c-4e1e-bf16-c73ef5bf0759', // Lowercase
            'AE99654F-BD06-4290-92E1-D193C1E5071C' // Uppercase
        ];

        validUUIDs.forEach(uuid => {
            expect(isValidUUID(uuid)).toBe(true);
        });
    });

    it('should return false for invalid UUIDs', () => {
        const invalidUUIDs = [
            '',
            'not-a-uuid',
            '123e4567-e89b-12d3-a456-42661417400', // Too short
            '2df25fda-fa6c-4e1e-bf16-c73ef5bf07590', // Too long
            '2df25fda-fa6c-4e1e-bf16-c73ef5bf075g', // Invalid character
            '2df25fda-fa6c-4e1e-bf16_c73ef5bf0759', // Invalid separator
            '2df25fda-fa6c-4e1e-cf16-c73ef5bf0759', // Invalid version (4th group should start with a, b, 8, or 9)
            '2df25fda-fa6c-5e1e-bf16-c73ef5bf0759', // Invalid version (3rd group should start with 4)
            '2df25fda-fa6c-4e1ebf16-c73ef5bf0759', // Missing hyphen
            '2df25fda-fa6c-4e1e-bf16c-73ef5bf0759' // Incorrect hyphen placement
        ];

        invalidUUIDs.forEach(uuid => {
            expect(isValidUUID(uuid)).toBe(false);
        });
    });

    it('should be case-insensitive', () => {
        const uuid = '2df25fda-fa6c-4e1e-bf16-c73ef5bf0759';
        expect(isValidUUID(uuid)).toBe(true);
    });

    it('should handle whitespace', () => {
        const uuidWithWhitespace = '  2df25fda-fa6c-4e1e-bf16-c73ef5bf0759  ';
        expect(isValidUUID(uuidWithWhitespace)).toBe(false);
    });
});

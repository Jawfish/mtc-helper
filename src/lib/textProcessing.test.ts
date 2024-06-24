import '@testing-library/jest-dom/vitest';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
    codeContainsHtml,
    codeContainsMarkdownFence,
    truncateString,
    getTextFromElement,
    getWordCount,
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
        expect(getWordCount('one two three')).toBe(3);
    });

    it('handles leading and trailing whitespace', () => {
        expect(getWordCount('  start   end  ')).toBe(2);
    });

    it('handles multiple spaces between words', () => {
        expect(getWordCount('word1    word2     word3')).toBe(3);
    });

    it('returns 0 for an empty string', () => {
        expect(getWordCount('')).toBe(0);
    });

    it('returns 0 for a string with only whitespace', () => {
        expect(getWordCount('   \t   \n   ')).toBe(0);
    });

    it('handles a mix of spaces and tabs', () => {
        expect(getWordCount('word1\t\tword2 \t word3')).toBe(3);
    });

    it('handles numbers', () => {
        expect(getWordCount('1 word')).toBe(2);
    });

    it('handles hyphens', () => {
        expect(getWordCount('word - word word-word word- -word')).toBe(5);
    });

    it('handles apostrophes', () => {
        expect(getWordCount("don't can't won't")).toBe(3);
    });

    it('handles punctuation', () => {
        expect(getWordCount('word! word? word. word,')).toBe(4);
    });

    it('handles newlines', () => {
        expect(getWordCount('word\nword\nword')).toBe(3);
    });

    it('counts words with accented characters', () => {
        expect(getWordCount('Café au lait')).toBe(3);
    });

    it('counts words with umlauts', () => {
        expect(getWordCount('Über Äpfel und Öl')).toBe(4);
    });

    it('counts Cyrillic words', () => {
        expect(getWordCount('Россия и Україна')).toBe(3);
    });

    it('counts Japanese words', () => {
        expect(getWordCount('こんにちは 世界')).toBe(2);
    });

    it('handles mixed words and numbers', () => {
        expect(getWordCount("It's 20 degrees outside")).toBe(4);
    });

    it('handles contractions and possessives', () => {
        expect(getWordCount("It's John's book")).toBe(3);
    });

    it('handles numbered list', () => {
        expect(getWordCount('1. Lake One\n2. Lake Two\n3. Lake Three')).toBe(6);
    });

    it('handles markdown', () => {
        expect(getWordCount('*one* _two_ **three** __four__')).toBe(4);
    });

    it('handles example sentence in the same way Obsidian and Google Docs do', () => {
        const sentence =
            '“Example Product Direct: Product Direct courses offer individualized study focused on state standards, while supported by certified teachers.”';
        expect(getWordCount(sentence)).toBe(18);
    });

    it('handles example sentence that contains "K-8" and "9" in the same way Obsidian and Google Docs do', () => {
        const sentence =
            'Students in grades K-8 complete 9 units and the correlating checkpoint worksheets each semester, submitting one worksheet every two weeks.';
        expect(getWordCount(sentence)).toBe(20);
    });

    it('handles standalone special characters', () => {
        const one = 'one " two \' three" / four';
        expect(getWordCount(one)).toBe(4);

        const two = 'one ! two . three ? four';
        expect(getWordCount(two)).toBe(4);
    });

    it('handles alphanumeric combinations', () => {
        expect(getWordCount('COVID-19 A1 B-52 3D-printed')).toBe(4);
    });

    it('counts slash-separated words as separate words', () => {
        expect(getWordCount('one/two three/four/five')).toBe(5);
    });

    it('handles mixed scenarios with slashes', () => {
        expect(getWordCount('apple/banana 2/3 cup COVID-19/SARS-CoV-2')).toBe(7);
    });

    it('handles multiple consecutive slashes', () => {
        expect(getWordCount('one//two///three')).toBe(3);
    });

    it('handles slashes at the beginning or end of words', () => {
        expect(getWordCount('/start middle/ /both/')).toBe(3);
    });

    it('handles complex scenarios with slashes, hyphens, and numbers', () => {
        expect(
            getWordCount('1. item-one/sub-item 2. item-two/sub-item/third-part')
        ).toBe(5);
    });

    it('handles emojis', () => {
        const paragraph = 'chicken: 🐤 (chicken) turtle:🐢 (turtle).';
        expect(getWordCount(paragraph)).toBe(6);
    });

    it('counts colon-separated words as separate words', () => {
        expect(getWordCount('one:two three:four:five')).toBe(5);
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

import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach } from 'vitest';

import * as textUtils from './textProcessing';

describe('Identifying HTML content', () => {
    it('recognizes the presence of HTML tags', () => {
        const contentWithHtml = 'some code </div>';
        expect(textUtils.codeContainsHtml(contentWithHtml)).toBe(true);
    });

    it('does not misidentify text without HTML tags', () => {
        const contentWithoutHtml = '<so<m/>e< <<>><><><code<>';
        expect(textUtils.codeContainsHtml(contentWithoutHtml)).toBe(false);
    });
});

describe('Detecting malformed markdown code blocks', () => {
    it('identifies an unclosed markdown code block', () => {
        const unclosedCodeBlock = '```javascript\nsome code';
        expect(textUtils.codeContainsMarkdownFence(unclosedCodeBlock)).toBe(true);
    });

    it('identifies an unopened markdown code block', () => {
        const unopenedCodeBlock = 'some\ncode```';
        expect(textUtils.codeContainsMarkdownFence(unopenedCodeBlock)).toBe(true);
    });
});

describe('String truncation', () => {
    it('shortens long text and adds ellipsis', () => {
        const longText = 'a'.repeat(51);
        expect(textUtils.truncateString(longText)).toBe(`${'a'.repeat(50)}...`);
    });

    it('handles undefined input', () => {
        expect(textUtils.truncateString(undefined)).toBe('undefined');
    });

    it('allows custom truncation length', () => {
        const text = 'a'.repeat(51);
        expect(textUtils.truncateString(text, 10)).toBe('aaaaaaaaaa...');
    });

    it('returns empty output for empty input', () => {
        expect(textUtils.truncateString('')).toBe('');
    });

    it('leaves short text unchanged', () => {
        expect(textUtils.truncateString('short text')).toBe('short text');
    });

    it('replaces line breaks with spaces', () => {
        const textWithLineBreaks = 'a\n'.repeat(50);
        expect(textUtils.truncateString(textWithLineBreaks)).toBe(
            `${'a '.repeat(50 / 2)}...`
        );
    });
});

describe('Extracting text from HTML elements', () => {
    let element: HTMLElement;

    beforeEach(() => {
        element = document.createElement('div');
    });

    it('extracts empty text for empty elements', () => {
        expect(textUtils.getTextFromElement(undefined)).toBe('');
    });

    it('extracts plain text from a simple element', () => {
        element.textContent = 'normal text';
        expect(textUtils.getTextFromElement(element)).toBe('normal text');
    });

    it('formats text from nested elements', () => {
        const nestedElement = document.createElement('strong');
        nestedElement.textContent = 'nested bold';
        element.appendChild(nestedElement);
        expect(textUtils.getTextFromElement(element)).toBe('**nested bold**');
    });

    it('formats list items with a leading dash', () => {
        const listItem = document.createElement('li');
        listItem.textContent = 'list item';
        expect(textUtils.getTextFromElement(listItem)).toBe('- list item');
    });

    it('wraps inline code with backticks', () => {
        const codeElement = document.createElement('code');
        codeElement.textContent = 'inline code';
        expect(textUtils.getTextFromElement(codeElement)).toBe('`inline code`');
    });

    it('formats headings with appropriate markdown', () => {
        const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        headings.forEach((tag, index) => {
            const heading = document.createElement(tag);
            heading.textContent = 'heading';
            expect(textUtils.getTextFromElement(heading)).toBe(
                `${'#'.repeat(index + 1)} heading`
            );
        });
    });

    it('bolds text within strong elements', () => {
        const strongElement = document.createElement('strong');
        strongElement.textContent = 'bold text';
        expect(textUtils.getTextFromElement(strongElement)).toBe('**bold text**');
    });

    it('italicizes text within emphasis elements', () => {
        const emphasisElement = document.createElement('em');
        emphasisElement.textContent = 'emphasized text';
        expect(textUtils.getTextFromElement(emphasisElement)).toBe('*emphasized text*');
    });

    it('handles complex nested elements', () => {
        const paragraph = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = 'bold';
        const em = document.createElement('em');
        em.textContent = 'emphasis';
        paragraph.appendChild(strong);
        paragraph.appendChild(document.createTextNode(', '));
        paragraph.appendChild(em);
        expect(textUtils.getTextFromElement(paragraph)).toBe('**bold**, *emphasis*');
    });
});

describe('Word counting', () => {
    describe('Basic functionality', () => {
        it('counts space-separated words correctly', () => {
            expect(textUtils.getWordCount('one two three')).toBe(3);
        });

        it('ignores leading and trailing whitespace', () => {
            expect(textUtils.getWordCount('  start   end  ')).toBe(2);
        });

        it('handles multiple spaces between words', () => {
            expect(textUtils.getWordCount('word1    word2     word3')).toBe(3);
        });

        it('counts words in a sentence the same way Google Docs does (1)', () => {
            const sentence =
                '“Example Product Direct: Product Direct courses offer individualized study focused on state standards, while supported by certified teachers.”';
            expect(textUtils.getWordCount(sentence)).toBe(18);
        });

        it('counts words in a sentence the same way Google Docs does (2)', () => {
            const sentence =
                'Students in grades K-8 complete 9 units and the correlating checkpoint worksheets each semester, submitting one worksheet every two weeks.';
            expect(textUtils.getWordCount(sentence)).toBe(20);
        });
    });

    describe('Special cases', () => {
        it('counts empty input as zero', () => {
            expect(textUtils.getWordCount('')).toBe(0);
        });

        it('counts whitespace-only input as zero', () => {
            expect(textUtils.getWordCount('   \t   \n   ')).toBe(0);
        });

        it('handles a mix of spaces and tabs', () => {
            expect(textUtils.getWordCount('word1\t\tword2 \t word3')).toBe(3);
        });

        it('ignores list numbers', () => {
            expect(textUtils.getWordCount('1. word')).toBe(1);
            expect(textUtils.getWordCount('10. word')).toBe(1);
            expect(textUtils.getWordCount('100. word')).toBe(1);
        });

        it("doesn't count a list number as a word when the list spans multiple lines", () => {
            expect(
                textUtils.getWordCount('1. Lake One\n2. Lake Two\n3. Lake Three')
            ).toBe(6);
        });

        it('counts standalone numbers as words', () => {
            expect(textUtils.getWordCount("It's 20 degrees outside")).toBe(4);
        });

        it('treats hyphenated words as single words', () => {
            expect(textUtils.getWordCount('word - word word-word word- -word')).toBe(5);
        });

        it('counts contractions as single words', () => {
            expect(textUtils.getWordCount("don't can't won't")).toBe(3);
        });

        it('ignores punctuation', () => {
            expect(textUtils.getWordCount('word! word? word. word,')).toBe(4);
        });

        it('handles newlines', () => {
            expect(textUtils.getWordCount('word\nword\nword')).toBe(3);
        });

        it("doesn't count standalone special characters", () => {
            expect(
                textUtils.getWordCount(
                    'one " two \' three" / four one ! two . three ? four'
                )
            ).toBe(8);

            expect(
                textUtils.getWordCount(
                    '! @ # $ % ^ & * ( ) \\ | / \' ; , . [ ] { } | < > ? : " !! @@ ## $$ %^&% ($%*#%()* (@#*%() *@<:{ >:?|} <:)) ***'
                )
            ).toBe(0);
        });
    });

    describe('STEM', () => {
        it('counts a LaTeX function the same way as Google Docs', () => {
            expect(textUtils.getWordCount('$$f(10) = (10^3)/3 = 1000/3$$')).toBe(7);
        });

        it('counts multi-line LaTeX the same way as Google Docs', () => {
            const latex = `$$
\\begin{align*}
f(x) &= \\int f'(x) \\, \\mathrm{d}x \\\\
    &= \\int x^2 \\, \\mathrm{d}x  \\\\
    &= \\frac{x^3}{3} + C \\, .
\\end{align*}
$$`;

            expect(textUtils.getWordCount(latex)).toBe(23);
        });

        it('counts additional multi-line LaTeX the same way as Google Docs', () => {
            const latex = `$$
\\begin{align*}
f(0) &= 0\\\\
\\frac{0^3}{3} + C  &= 0  \\\\
  C  &= 0 \\, .
\\end{align*}
$$

So, $$f(x) =\\frac{x^3}{3}\\, ,$$ and

$$
\\begin{align*}
f(10) &= \\frac{10^3}{3} \\\\
		&= \\frac{1 000}{3} \\\\
		& \\approx 333.33 \\, .
\\end{align*}
$$`;

            expect(textUtils.getWordCount(latex)).toBe(40);
        });

        it('counts a sentence with math the same way as Google Docs', () => {
            expect(
                textUtils.getWordCount(
                    "If F(x) is the definite integral of f(x), then F'(x) = f(x)."
                )
            ).toBe(15);
        });

        it('counts LaTeX numbers as two words to keep parity with Google Docs', () => {
            expect(textUtils.getWordCount('$$99.2$$')).toBe(2);
        });
    });

    describe('Internationalization', () => {
        it('counts words with accented characters', () => {
            expect(textUtils.getWordCount('Café au lait')).toBe(3);
        });

        it('counts words with umlauts', () => {
            expect(textUtils.getWordCount('Über Äpfel und Öl')).toBe(4);
        });

        it('counts Cyrillic words', () => {
            expect(textUtils.getWordCount('Россия и Україна')).toBe(3);
        });

        it('counts Japanese words', () => {
            expect(textUtils.getWordCount('こんにちは 世界')).toBe(2);
        });

        it('counts RTL words', () => {
            const phraseOne =
                '10. بريتوريا (العاصمة التنفيذية) بلومفونتين (العاصمة القضائية) كيب تاون (العاصمة التشريعية)، جنوب أفريقيا';
            expect(textUtils.getWordCount(phraseOne)).toBe(14);

            const phraseTwo = '5. أنتاناناريفو، مدغشقر';
            expect(textUtils.getWordCount(phraseTwo)).toBe(3);
        });
    });

    describe('Special formatting', () => {
        it('ignores markdown formatting', () => {
            expect(textUtils.getWordCount('*one* _two_ **three** __four__')).toBe(4);
        });

        it('counts alphanumeric combinations as single words', () => {
            expect(textUtils.getWordCount('COVID-19')).toBe(1);
            expect(textUtils.getWordCount('A1')).toBe(1);
            expect(textUtils.getWordCount('3D-printed')).toBe(1);
            expect(textUtils.getWordCount('COVID-19 A1')).toBe(2);
            expect(textUtils.getWordCount('COVID-19 A1 3D-printed')).toBe(3);
        });

        it('treats slash-separated items as separate words', () => {
            expect(textUtils.getWordCount('yes/no three/four/five')).toBe(5);
        });

        it('counts multiple consecutive slashes the same as single slashes', () => {
            expect(textUtils.getWordCount('one//two///three')).toBe(3);
        });

        it('counts colon-separated words as separate words', () => {
            expect(textUtils.getWordCount('one:two three:four:five')).toBe(5);
        });

        it('counts emojis as words', () => {
            expect(
                textUtils.getWordCount('chicken: 🐤 (chicken) turtle:🐢 (turtle).')
            ).toBe(6);
        });

        it('counts monetary values as two words', () => {
            expect(textUtils.getWordCount('An advance of $20,000 upon signing.')).toBe(
                7
            );
        });

        it('counts decimal values as two words', () => {
            expect(textUtils.getWordCount('3.14')).toBe(2);
            expect(textUtils.getWordCount('3.14.')).toBe(2);
            expect(textUtils.getWordCount('.14')).toBe(1);
            expect(textUtils.getWordCount('.14.')).toBe(1);
            expect(textUtils.getWordCount('The value is 3.14.')).toBe(5);
        });

        it('treats words separated by en or em dashes as separate', () => {
            expect(textUtils.getWordCount('1–2 em—dash hy-phen')).toBe(5);
        });
    });
});

describe('UUID validation', () => {
    it('accepts valid UUIDs', () => {
        const validUUIDs = [
            '2df25fda-fa6c-4e1e-bf16-c73ef5bf0759',
            'AE99654F-BD06-4290-92E1-D193C1E5071C'
        ];
        validUUIDs.forEach(uuid => {
            expect(textUtils.isValidUUID(uuid)).toBe(true);
        });
    });

    it('rejects invalid UUIDs', () => {
        const invalidUUIDs = [
            '',
            'not-a-uuid',
            '123e4567-e89b-12d3-a456-42661417400',
            '2df25fda-fa6c-4e1e-bf16-c73ef5bf07590',
            '2df25fda-fa6c-4e1e-bf16-c73ef5bf075g',
            '2df25fda-fa6c-4e1e-bf16_c73ef5bf0759',
            '2df25fda-fa6c-4e1e-cf16-c73ef5bf0759',
            '2df25fda-fa6c-5e1e-bf16-c73ef5bf0759',
            '2df25fda-fa6c-4e1ebf16-c73ef5bf0759',
            '2df25fda-fa6c-4e1e-bf16c-73ef5bf0759'
        ];
        invalidUUIDs.forEach(uuid => {
            expect(textUtils.isValidUUID(uuid)).toBe(false);
        });
    });

    it('is case-insensitive', () => {
        const mixedCaseUUID = '2df25fda-FA6C-4e1e-BF16-c73ef5bf0759';
        expect(textUtils.isValidUUID(mixedCaseUUID)).toBe(true);
    });

    it('rejects UUIDs with surrounding whitespace', () => {
        const uuidWithWhitespace = '  2df25fda-fa6c-4e1e-bf16-c73ef5bf0759  ';
        expect(textUtils.isValidUUID(uuidWithWhitespace)).toBe(false);
    });
});

describe('RTL text detection', () => {
    it('identifies RTL text', () => {
        const rtlText = 'مرحبا بالعالم';
        expect(textUtils.isRTL(rtlText)).toBe(true);
    });

    it('identifies LTR text', () => {
        const ltrText = 'Hello, world!';
        expect(textUtils.isRTL(ltrText)).toBe(false);
    });

    it('ignores whitespace', () => {
        const rtlText = 'مرحبا بالعالم';
        const ltrText = 'Hello, world!';
        expect(textUtils.isRTL(`  ${rtlText}  `)).toBe(true);
        expect(textUtils.isRTL(`  ${ltrText}  `)).toBe(false);
    });

    it('ignores empty input', () => {
        expect(textUtils.isRTL('')).toBe(false);
    });
});

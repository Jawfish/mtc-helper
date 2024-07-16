import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';

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

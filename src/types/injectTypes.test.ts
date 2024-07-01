import { describe, it, expect } from 'vitest';

import {
    isURLMessage,
    isMonacoMessage,
    URLMessage,
    MonacoMessage,
    injectScriptSrc,
    injectScriptDest
} from './injectTypes';

describe('injectTypes', () => {
    describe('Constants', () => {
        it('should have correct values for injectScriptSrc and injectScriptDest', () => {
            expect(injectScriptSrc).toBe('inject/inject.ts');
            expect(injectScriptDest).toBe('inject/inject.js');
        });
    });

    describe('isURLMessage', () => {
        it('should return true for valid URLMessage', () => {
            const validMessage: URLMessage = {
                source: 'inject-script',
                type: 'url-changed',
                url: 'https://example.com'
            };
            expect(isURLMessage(validMessage)).toBe(true);
        });

        it('should return false for invalid messages', () => {
            expect(isURLMessage(undefined)).toBe(false);
            expect(isURLMessage({})).toBe(false);
            expect(isURLMessage({ source: 'inject-script' })).toBe(false);
            expect(isURLMessage({ source: 'inject-script', type: 'url-changed' })).toBe(
                false
            );
            expect(
                isURLMessage({
                    source: 'other-source',
                    type: 'url-changed',
                    url: 'https://example.com'
                })
            ).toBe(false);
        });
    });

    describe('isMonacoMessage', () => {
        it('should return true for valid MonacoMessage', () => {
            const validMessage: MonacoMessage = {
                source: 'inject-script',
                type: 'test-editor-changed',
                content: 'Some test content'
            };
            expect(isMonacoMessage(validMessage)).toBe(true);
        });

        it('should return false for invalid messages', () => {
            expect(isMonacoMessage(undefined)).toBe(false);
            expect(isMonacoMessage({})).toBe(false);
            expect(isMonacoMessage({ source: 'inject-script' })).toBe(false);
            expect(
                isMonacoMessage({
                    source: 'inject-script',
                    type: 'test-editor-changed'
                })
            ).toBe(false);
            expect(
                isMonacoMessage({
                    source: 'other-source',
                    type: 'test-editor-changed',
                    content: 'Some content'
                })
            ).toBe(false);
        });
    });
});

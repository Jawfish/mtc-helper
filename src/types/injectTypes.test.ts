import { describe, it, expect } from 'vitest';

import {
    injectScriptSrc,
    injectScriptDest,
    isMessageFromInjectScript,
    Message
} from './injectTypes';

describe('injectTypes', () => {
    describe('Constants', () => {
        it('should have correct values for injectScriptSrc and injectScriptDest', () => {
            expect(injectScriptSrc).toBe('inject/inject.ts');
            expect(injectScriptDest).toBe('inject/inject.js');
        });
    });

    describe('Evaluating if a message is from the injected script', () => {
        it('should consider messages shaped like the inject script messages as originating from the inject script', () => {
            const validMessage: Message = {
                source: 'inject-script',
                content: 'Some test content'
            };
            expect(isMessageFromInjectScript(validMessage)).toBe(true);
        });

        it('should not consider messages not shaped like inject script messages as originating from the inject script', () => {
            expect(isMessageFromInjectScript(undefined)).toBe(false);
            expect(isMessageFromInjectScript({})).toBe(false);
            expect(isMessageFromInjectScript({ source: 'inject-script' })).toBe(false);
            expect(
                isMessageFromInjectScript({
                    source: 'inject-script',
                    type: 'test-editor-changed'
                })
            ).toBe(false);
            expect(
                isMessageFromInjectScript({
                    source: 'other-source',
                    type: 'test-editor-changed',
                    content: 'Some content'
                })
            ).toBe(false);
        });
    });
});

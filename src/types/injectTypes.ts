/**
 * Types and constants of the inject script.
 */

export const injectScriptSrc = 'inject/inject.ts';
export const injectScriptDest = 'inject/inject.js';

export type Message = {
    source: 'inject-script';
    content: string;
};

export function isMessageFromInjectScript(obj: unknown): obj is Message {
    return (
        typeof obj === 'object' &&
        obj !== undefined &&
        obj !== null &&
        'source' in obj &&
        obj['source'] === 'inject-script' &&
        'content' in obj
    );
}

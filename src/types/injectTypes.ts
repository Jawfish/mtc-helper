/**
 * Types and constants of the inject script.
 */

export const injectScriptSrc = 'inject/inject.ts';
export const injectScriptDest = 'inject/inject.js';

type MessageSource = 'inject-script';
type MessageType = 'url-changed' | 'test-editor-changed';

type Message = {
    source: MessageSource;
    type: MessageType;
};

export interface URLMessage extends Message {
    url: string;
}

export interface MonacoMessage extends Message {
    content: string;
}

function isMessageFromInjectScript(obj: unknown): obj is Message {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'source' in obj &&
        obj['source'] === 'inject-script' &&
        'type' in obj
    );
}

export function isURLMessage(obj: unknown): boolean {
    return (
        isMessageFromInjectScript(obj) && 'url' in obj && typeof obj['url'] === 'string'
    );
}

export function isMonacoMessage(obj: unknown): boolean {
    return (
        isMessageFromInjectScript(obj) &&
        'content' in obj &&
        typeof obj['content'] === 'string'
    );
}

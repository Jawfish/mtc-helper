import { MonacoMessage, URLMessage } from '@src/types/injectTypes';
/**
 * This file is injected onto the MTC page so that:
 * 1. The Monaco editor object can be accessed from the extension's content script (so
 *    that the test editor content can be read).
 * 2. The extension can be notified when the URL changes.
 *
 * This script must be isolated from the rest of the extension, so don't import anything
 * other than types.
 */

function customLog(message: string) {
    const prefix = '%c[MTC Inject]';
    const defaultStyle = 'color: orange; font-weight: bold;';
    // eslint-disable-next-line no-console
    console.debug(prefix, defaultStyle, message);
}

function postMonacoEditorContent(message: MonacoMessage) {
    window.postMessage(
        {
            source: message.source,
            type: message.type,
            content: message.content
        },
        '*'
    );
}

function postUrlChanged(message: URLMessage) {
    window.postMessage(
        {
            source: message.source,
            type: message.type,
            url: message.url
        },
        '*'
    );
}

/**
 * Initializes a Monaco editor listener that sends a message to the extension via
 * window.postMessage when the editor content changes.
 */
function initializeMonacoListener() {
    setTimeout(initializeMonacoListener, 1000);

    const createMessage = (content: string) => {
        const message: MonacoMessage = {
            source: 'inject-script',
            type: 'test-editor-changed',
            content
        };

        return message;
    };

    if (!window.monaco) {
        return;
    }

    // at the time of writing, there is only one editor on the page
    const editors = window.monaco.editor.getEditors();
    const [editor] = editors;

    if (!editor || editor.__listenerAttached) {
        return;
    }

    const content = editor.getValue();
    const message = createMessage(content);
    // Post the initial content
    postMonacoEditorContent(message);

    // Post content each time it changes
    editor.onDidChangeModelContent(() => {
        customLog(
            `Monaco editor content changed, sending ${editor.getValue().length} characters.`
        );

        const message = createMessage(editor.getValue());

        postMonacoEditorContent(message);
    });
    editor.__listenerAttached = true;

    customLog('Monaco listener attached');
}

/**
 * Initializes a URL change listener that sends a message to the extension via
 * window.postMessage when the URL changes.
 */
function initializeUrlChangeListener() {
    const createMessage = (url: string) => {
        const message: URLMessage = {
            source: 'inject-script',
            type: 'url-changed',
            url
        };

        return message;
    };

    window.scriptInjected = true;

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
        originalPushState.apply(history, args);
        window.dispatchEvent(new Event('pushstate'));
        window.dispatchEvent(new Event('locationchange'));
    };
    history.replaceState = function (...args) {
        originalReplaceState.apply(history, args);
        window.dispatchEvent(new Event('replacestate'));
        window.dispatchEvent(new Event('locationchange'));
    };

    const message = createMessage(window.location.href);

    // Post the initial URL
    postUrlChanged(message);

    // Listen for popstate events (caused by user navigating MTC)
    window.addEventListener('popstate', () => {
        window.dispatchEvent(new Event('locationchange'));
    });

    // Post URL each time it changes
    window.addEventListener('locationchange', () => {
        customLog(`URL changed: ${window.location.href}`);
        const message = createMessage(window.location.href);
        postUrlChanged(message);
    });

    customLog('URL change listener attached');
}
initializeUrlChangeListener();
initializeMonacoListener();

customLog(
    `MTC Helper injection script injected into the page: ${window.location.href}`
);

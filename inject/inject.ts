import { Message } from '@src/types/injectTypes';
/**
 * This file is injected onto the MTC page so that the Monaco editor object can be accessed from the extension's content script (so the test editor content can be read).
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

function postMonacoEditorContent(message: Message) {
    window.postMessage(
        {
            source: message.source,
            content: message.content
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
        const message: Message = {
            source: 'inject-script',
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

initializeMonacoListener();

customLog(
    `MTC Helper injection script injected into the page: ${window.location.href}`
);

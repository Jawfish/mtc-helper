// oldVersionScripts/urlWatcher.ts
import { Process, processUuidMap, useMTCStore } from '@src/store/MTCStore';
import {
    isMonacoMessage,
    isURLMessage,
    MonacoMessage,
    URLMessage
} from '@src/types/injectTypes';
import { useContentStore } from '@src/store/ContentStore';
import { MutHandler } from '@handlers/shared';

import Logger from './logging';

/**
 * Initializes the URL observer which listens for changes to the URL from
 * window.postMessage events where `type: url-changed` and updates the store
 * accordingly.
 */
export function initializeUrlObserver() {
    /**
     * Returns the process based on the UUID found in the URL. Returns undefined if the
     * UUID is not found in the processUuidMap.
     */
    const getProcess = (url: string | undefined): Process => {
        if (!url) {
            return Process.Unknown;
        }

        const [cleanUrl] = url.split('?');
        const [, , , , uuid] = cleanUrl.split('/');
        const uuidRegex =
            /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

        if (!uuid || !uuidRegex.test(uuid)) {
            return Process.Unknown;
        }

        Logger.debug(`URL observer: UUID found in URL: ${uuid}`);

        const process = processUuidMap[uuid];
        if (!process) {
            Logger.debug(`URL observer: Process not found for UUID ${uuid}`);

            return Process.Unknown;
        }

        return process;
    };

    // on initial load, we need to manually check the URL because the listener hasn't
    // seen any URL changes yet
    const process = getProcess(window.location.href);
    if (process) {
        Logger.debug(
            `URL observer: Process changed to ${process} using URL ${window.location.href}`
        );
        // useMTCStore.setState({ process });
        useMTCStore.getState().setProcess(process);
    }

    Logger.debug('Initializing URL change observer');
    try {
        window.addEventListener('message', event => {
            if (!isURLMessage(event.data)) {
                return;
            }

            const message = event.data as URLMessage;

            if (message.type !== 'url-changed') {
                return;
            }

            Logger.debug(`URL observer: URL changed to ${message.url}`);

            const process = getProcess(message.url);
            // useMTCStore.setState({ process });
            useMTCStore.getState().setProcess(process);
        });

        Logger.debug('URL change observer initialized');
    } catch (e) {
        Logger.error(`Error initializing URL change observer: ${(e as Error).message}`);
    }
}

/**
 * Initializes the Monaco editor observer which listens for changes to the Monaco editor
 * from window.postMessage events where `type: test-editor-changed` and updates the
 * store accordingly.
 */
export function initializeMonacoObserver() {
    Logger.debug('Initializing Monaco editor observer');
    try {
        window.addEventListener('message', event => {
            if (!isMonacoMessage(event.data)) {
                return;
            }

            const message = event.data as MonacoMessage;

            if (message.type !== 'test-editor-changed') {
                return;
            }

            Logger.debug(
                `Monaco editor observer received payload of ${message.content.length} characters`
            );

            // useContentStore.setState({ testEditorContent: message.content });
            useContentStore.getState().setOrochiTests(message.content);
        });

        Logger.debug('Monaco editor observer initialized');
    } catch (e) {
        Logger.error(
            `Error initializing Monaco editor observer: ${(e as Error).message}`
        );
    }
}

/**
 * Initializes the MutationObserver, which listens for changes to the DOM and updates.
 * The observer is external to the React app. It updates the store based on the state of
 * important elements in the DOM so that the React app can respond accordingly. Utilizes
 * an async IIFE to wait for the target to exist (MTC's Next.js root element). The
 * observer does not observe changes to the extension's own elements.
 */
export function initializeMutationObserver(
    handlers: MutHandler[],
    target: HTMLDivElement
) {
    Logger.debug('Creating MutationObserver');
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.target.nodeType === Node.ELEMENT_NODE) {
                handlers.forEach(handler => {
                    handler(mutation);
                });
            }
        });
    });

    Logger.debug('Observing global target');

    observer.observe(target, {
        childList: true,
        subtree: true
    });

    Logger.debug('MutationObserver created and observing.');
}

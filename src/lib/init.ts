import {
    injectScriptDest,
    isMonacoMessage,
    isURLMessage,
    MonacoMessage,
    URLMessage
} from '@src/types/injectTypes';
import { handlers } from '@handlers/index';
import { selectGlobalObserverTarget } from '@lib/selectors';
import { orochiStore } from '@src/store/orochiStore';
import { globalStore } from '@src/store/globalStore';
import { Handlers } from '@handlers/types';

import Logger from './logging';
import { updateProcess } from './process';

/**
 * Initializes the URL observer which listens for changes to the URL from
 * window.postMessage events where `type: url-changed` and updates the store
 * accordingly.
 */
export function initializeUrlObserver() {
    updateProcess(window.location.href);

    Logger.debug('Initializing URL change observer');
    try {
        window.addEventListener('message', event => {
            if (!isURLMessage(event.data)) {
                return;
            }

            const message = event.data as URLMessage;

            if (message.type !== 'url-changed') {
                Logger.warn('Message type was not url-changed');

                return;
            }

            Logger.debug(`URL observer: URL changed to ${message.url}`);

            updateProcess(message.url);
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

            orochiStore.setState({ tests: message.content });
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
export function initializeMutationObserver(handlers: Handlers, target: HTMLDivElement) {
    Logger.debug('Creating MutationObserver');
    const observer = new MutationObserver(mutations => {
        const { process, taskIsOpen } = globalStore.getState();
        mutations.forEach(mutation => {
            if (mutation.target.nodeType !== Node.ELEMENT_NODE) {
                return;
            }

            const target = mutation.target as Element;

            handlers.global.forEach(handler => {
                handler(target);
            });

            if (!taskIsOpen) {
                return;
            }

            if (process === 'Orochi') {
                handlers.orochi.forEach(handler => {
                    handler(target);
                });
            }

            if (process === 'PANDA') {
                handlers.panda.forEach(handler => {
                    handler(target);
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

export function initializeObservers() {
    /**
     * This is an async IIFE because it needs to wait for the observer target element to
     * exist for the extension to work at all. In the future this can probably done within
     * the React app and there can be much less reliance on the stores, keeping state local
     * to the components.
     */
    (async () => {
        try {
            Logger.info('MTC Helper initializing...');

            const observerTarget = await selectGlobalObserverTarget();

            initializeMutationObserver(handlers, observerTarget);

            initializeUrlObserver();
            initializeMonacoObserver();

            Logger.debug('Injecting extension onto page');

            const injectScriptElement = document.createElement('script');
            injectScriptElement.src = chrome.runtime.getURL(injectScriptDest);
            (document.head || document.documentElement).appendChild(
                injectScriptElement
            );

            Logger.info('MTC Helper initialized.');
        } catch (e) {
            Logger.error(`Error initializing MTC Helper: ${(e as Error).message}`);
        }
    })();
}

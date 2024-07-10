import {
    injectScriptDest,
    isMessageFromInjectScript,
    Message
} from '@src/types/injectTypes';
import { Handlers, handlers } from '@handlers/index';
import { selectGlobalObserverTarget } from '@lib/selectors';
import { orochiStore } from '@src/store/orochiStore';
import { globalStore } from '@src/store/globalStore';
import { initializeTitleObserver } from '@handlers/global/title';

import Logger from './logging';

/**
 * Initializes the Monaco editor observer which listens for changes to the Monaco editor
 * from window.postMessage events where `type: test-editor-changed` and updates the
 * store accordingly.
 */
export function initializeMonacoObserver() {
    Logger.debug('Initializing Monaco editor observer');
    try {
        window.addEventListener('message', event => {
            if (!isMessageFromInjectScript(event.data)) {
                return;
            }

            const message = event.data as Message;

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
 * The observer is external to the extension's React app. It updates the store based on
 * the state of important elements in the DOM so that the React app can respond
 * accordingly. Utilizes an async IIFE to wait for the target to exist (MTC's Next.js
 * root element). The observer does not observe changes to the extension's own elements.
 */
function initializeMutationObserver(handlers: Handlers, target: HTMLDivElement) {
    Logger.debug('Creating MutationObserver');
    const observer = new MutationObserver(mutations => {
        const { process, taskIsOpen } = globalStore.getState();
        mutations.forEach(mutation => {
            // Rapidly-updating elements within the Monaco editor (i.e. while scrolling)
            // can cause some slowdown and it is not necessary to observe them.
            const monacoEditor = document.querySelector('.monaco-editor');
            if (monacoEditor?.contains(mutation.target)) {
                return;
            }
            Logger.debug('MutationObserver: Mutation detected');

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

            if (process === 'General') {
                handlers.general.forEach(handler => {
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
    initializeTitleObserver();

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

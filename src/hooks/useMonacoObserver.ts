import { useEffect } from 'react';
import {
    injectScriptDest,
    isMessageFromInjectScript,
    Message
} from '@src/types/injectTypes';
import { orochiStore } from '@src/store/orochiStore';
import Logger from '@lib/logging';

/**
 * Initializes and manages an observer for Monaco editor changes.
 *
 * - Sets up an event listener for 'message' events on the window.
 * - Filters messages to only process those from the inject script.
 * - Updates the orochiStore with new test content when a valid message is received.
 * - Injects the extension script onto the page.
 *
 * @returns void
 */
function useMonacoObserver() {
    useEffect(() => {
        Logger.debug('Initializing Monaco editor observer');

        const handleMessage = (event: MessageEvent) => {
            if (!isMessageFromInjectScript(event.data)) {
                return;
            }
            const message = event.data as Message;
            Logger.debug(
                `Monaco editor observer received payload of ${message.content.length} characters`
            );
            orochiStore.setState({ tests: message.content });
        };

        window.addEventListener('message', handleMessage);

        // Inject the extension script responsible for sending the Monaco editor content
        const injectScriptElement = document.createElement('script');
        injectScriptElement.src = chrome.runtime.getURL(injectScriptDest);
        (document.head || document.documentElement).appendChild(injectScriptElement);

        Logger.debug('Monaco editor observer initialized');

        return () => {
            window.removeEventListener('message', handleMessage);
            Logger.debug('Monaco editor observer disconnected');
        };
    }, []);
}

export default useMonacoObserver;

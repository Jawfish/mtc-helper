import Logger from '@lib/logging';
import { useGlobalStore } from '@src/store/globalStore';
import { useEffect, useRef, useState } from 'react';

type Handler = (target: Element) => void;

interface Handlers {
    global: Handler[];
    orochi: Handler[];
    general: Handler[];
}

const selectGlobalObserverTarget = async () => {
    let element = document.getElementById('__next');

    while (!element) {
        await new Promise(resolve => setTimeout(resolve, 100)); // wait for 100ms before checking again
        element = document.getElementById('__next');
    }

    return element as HTMLDivElement;
};

/**
 * Initializes and manages a MutationObserver to watch for DOM changes on the MTC app.
 * The observer updates the global store based on DOM changes. This allows the React app
 * to respond to changes in the observed DOM.
 *
 * The observer ignores changes within Monaco editor elements to prevent unnecessary
 * processing.
 *
 * @param handlers An object containing arrays of handler functions for different
 * processes.
 * @returns A reference to the created MutationObserver, or null if not yet initialized.
 */
function useAppObserver(handlers: Handlers) {
    const observerRef = useRef<MutationObserver | null>(null);
    const { process, taskIsOpen } = useGlobalStore();
    const [target, setTarget] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        const fetchTarget = async () => {
            try {
                const selectedTarget = await selectGlobalObserverTarget();
                setTarget(selectedTarget);
            } catch (error) {
                Logger.error('Failed to select global observer target:', error);
            }
        };

        fetchTarget();
    }, []);

    useEffect(() => {
        if (!target) return;

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.target.nodeType !== Node.ELEMENT_NODE) return;
                const target = mutation.target as Element;

                // Ignore Monaco editor changes
                const monacoEditor = document.querySelector('.monaco-editor');
                if (monacoEditor?.contains(target)) return;

                Logger.debug('MutationObserver: Mutation detected');

                handlers.global.forEach(handler => handler(target));

                if (!taskIsOpen) return;

                if (process === 'Orochi') {
                    handlers.orochi.forEach(handler => handler(target));
                }

                if (process === 'General' || process === 'STEM') {
                    handlers.general.forEach(handler => handler(target));
                }
            });
        });

        observer.observe(target, { childList: true, subtree: true });
        observerRef.current = observer;

        Logger.debug('MutationObserver created and observing.');

        return () => {
            observer.disconnect();
            Logger.debug('MutationObserver disconnected.');
        };
    }, [handlers, target, process, taskIsOpen]);

    return observerRef.current;
}

export default useAppObserver;

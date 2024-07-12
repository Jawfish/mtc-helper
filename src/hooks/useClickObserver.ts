import { useEffect, useCallback } from 'react';
import { useGlobalStore } from '@src/store/globalStore';
import Logger from '@lib/logging';

type ClickHandler = (event: MouseEvent, target: Element) => void;

interface Handlers {
    global: ClickHandler[];
    orochi: ClickHandler[];
    general: ClickHandler[];
}

/**
 * Initializes and manages a global click listener for the MTC app. The observer
 * triggers appropriate handlers based on the current process and task state. The
 * purpose of this is to prevent having to inject a bunch of event listeners into the
 * DOM.
 *
 * @param handlers An object containing arrays of handler functions for different
 * processes.
 */
function useClickObserver(handlers: Handlers) {
    const { process, taskIsOpen } = useGlobalStore();

    const handleClick = useCallback(
        (event: MouseEvent) => {
            const target = event.target as Element;

            handlers.global.forEach(handler => handler(event, target));

            if (!taskIsOpen) return;

            if (process === 'Orochi') {
                handlers.orochi.forEach(handler => handler(event, target));
            }

            if (process === 'General' || process === 'STEM') {
                handlers.general.forEach(handler => handler(event, target));
            }
        },
        [handlers, process, taskIsOpen]
    );

    useEffect(() => {
        document.addEventListener('click', handleClick);
        Logger.debug('ClickObserver: Global click listener attached.');

        return () => {
            document.removeEventListener('click', handleClick);
            Logger.debug('ClickObserver: Global click listener removed.');
        };
    }, [handleClick]);
}

export default useClickObserver;

/**
 * Handle mutations of the <title> tag of the page to set the current process.
 *
 * NOTE: This handler is treated differently than all others since it checks the <title>
 * tag; the rest of the handlers listen for mutations on the Next.js root element. As
 * such, the mutation observer initialization function is defined here instead of in the
 * main initialization file.
 */

import Logger from '@lib/logging';
import { globalStore, Process } from '@src/store/globalStore';

const handleTitleMutation = () => {
    const title = document.title.toLowerCase();
    Logger.debug(`Title changed to: ${title}`);
    const isOrochi = title.includes('orochi');
    const process: Process = isOrochi ? 'Orochi' : 'General';
    globalStore.setState({ process });
};

/**
 * Initializes the MutationObserver for the <title> tag, which listens for changes to the <title>
 * element of the document. This is necessary to update the global store based on the current
 * process indicated by the page title. Utilizes an async IIFE to wait for the <title> element
 * to exist before initializing the observer.
 */
export const initializeTitleObserver = () => {
    (async () => {
        try {
            Logger.debug('Initializing title observer');

            // Wait for the <title> element to exist in the document
            while (!document.querySelector('title')) {
                await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms before checking again
            }

            const observer = new MutationObserver(mutations => {
                Logger.debug('Title observer: Mutation detected');
                mutations.forEach(_ => {
                    handleTitleMutation();
                });
            });

            observer.observe(document.querySelector('title')!, {
                childList: true,
                subtree: true
            });

            // Manually check the title element when the initialization function is first called,
            // since no mutation will have occurred yet
            handleTitleMutation();

            Logger.debug('Title observer created and observing.');
        } catch (e) {
            Logger.error(`Error initializing title observer: ${(e as Error).message}`);
        }
    })();
};

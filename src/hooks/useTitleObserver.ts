import { useEffect } from 'react';
import Logger from '@lib/logging';
import { globalStore, Process } from '@src/store/globalStore';

/**
 * Observes changes to the document title and updates the global store
 * with the current process based on the title content.
 * @returns void
 */
function useTitleObserver() {
    useEffect(() => {
        const titleToProcessMap: Record<string, Process> = {
            orochi: 'Orochi',
            stem: 'STEM'
        };

        const handleTitleMutation = () => {
            const title = document.title.toLowerCase();
            Logger.debug(`Title changed to: ${title}`);

            let process: Process = 'Generic';
            for (const [key, value] of Object.entries(titleToProcessMap)) {
                if (title.includes(key)) {
                    process = value;
                    break;
                }
            }

            Logger.debug(`Setting process to: ${process}`);
            globalStore.setState({ process });
        };

        const initializeObserver = async () => {
            try {
                Logger.debug('Initializing title observer');

                while (!document.querySelector('title')) {
                    await new Promise(resolve => setTimeout(resolve, 100));
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

                // Directly check the title element when the hook is first called
                handleTitleMutation();

                Logger.debug('Title observer created and observing.');

                return () => {
                    observer.disconnect();
                    Logger.debug('Title observer disconnected.');
                };
            } catch (e) {
                Logger.error(
                    `Error initializing title observer: ${(e as Error).message}`
                );
            }
        };

        initializeObserver();
    }, []);
}

export default useTitleObserver;

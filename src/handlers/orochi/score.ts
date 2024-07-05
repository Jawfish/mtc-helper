import { MutHandler } from '@handlers/index';
import { orochiStore } from '@src/store/orochiStore';

/**
 * This handler retrieves the QA's alignment score from the DOM and stores it in the
 * application's store to be used for checking if a conversation's score is low but the
 * conversation is not marked as a rework.
 */
export const handleScoreMutation: MutHandler = (_target: Element) => {
    const element =
        Array.from(document.querySelectorAll('span')).find(
            span => span.textContent?.trim() === 'Alignment %'
        )?.parentElement || undefined;

    if (!element) {
        return;
    }

    const content = element.textContent?.split(':')[1].trim();
    if (!content) {
        return;
    }

    const score = parseInt(content, 10);
    orochiStore.setState({ score });
};

import { MutHandler } from '@handlers/index';
import Logger from '@lib/logging';
import { orochiStore } from '@src/store/orochiStore';

const selectUselessMetadataSection = (): HTMLDivElement | undefined => {
    const h4Elements = Array.from(document.querySelectorAll('h4'));
    const metadataElement = h4Elements.find(h4 => {
        const span = h4.querySelector('span');

        return span && span.textContent === 'Metadata info';
    });

    return metadataElement?.parentElement instanceof HTMLDivElement
        ? metadataElement.parentElement
        : undefined;
};

/**
 * This handler removes the empty metadata section with the non-functioning save button
 * at the bottom of a response while editing it.
 */
export const onMut_uselessMetadata_removeUselessMetadata: MutHandler = (
    _target: Element
) => {
    const { metadataRemoved } = orochiStore.getState();
    if (metadataRemoved) {
        return;
    }

    const element = selectUselessMetadataSection();
    if (!element) {
        return;
    }

    element.remove();

    Logger.debug('Metadata section removed.');
};

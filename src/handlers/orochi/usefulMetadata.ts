import { MutHandler } from '@handlers/types';
import { getTextFromElement } from '@lib/textProcessing';
import { orochiStore } from '@src/store/orochiStore';

const selectUsefulMetadataSection = (): HTMLDivElement | undefined => {
    const conversationTitleElement = Array.from(document.querySelectorAll('div')).find(
        div => div.textContent === 'Conversations > Title'
    );

    return conversationTitleElement?.parentElement?.parentElement as
        | HTMLDivElement
        | undefined;
};

export const handleUsefulMetadataSection: MutHandler = (_target: Element) => {
    const metadataElement = selectUsefulMetadataSection();

    if (!metadataElement) {
        return;
    }

    const operatorNotesElement = metadataElement?.children[2]?.children[1]
        ?.lastElementChild as HTMLElement | undefined;

    if (operatorNotesElement) {
        const operatorNotes = getTextFromElement(operatorNotesElement);
        orochiStore.setState({ operatorNotes });
    }

    const conversationTitle =
        metadataElement?.children[0]?.children[1]?.lastElementChild?.textContent ||
        undefined;

    const errorLabels =
        metadataElement?.children[1]?.children[1]?.lastElementChild?.textContent ||
        undefined;

    orochiStore.setState({ conversationTitle, errorLabels });
};

import { MutHandler } from '@handlers/types';
import { getTextFromElement } from '@lib/textProcessing';
import { orochiStore } from '@src/store/orochiStore';

const selectUsefulMetadataSection = (): HTMLDivElement | null => {
    const conversationTitleElement = Array.from(document.querySelectorAll('div')).find(
        div => div.textContent === 'Conversations > Title'
    );

    return conversationTitleElement?.parentElement
        ?.parentElement as HTMLDivElement | null;
};

export const handleUsefulMetadataSection: MutHandler = (_target: Element) => {
    const metadataElement = selectUsefulMetadataSection();

    if (!metadataElement) {
        return;
    }

    const operatorNotesElement = metadataElement?.children[2]?.children[1]
        ?.lastElementChild as HTMLElement | null;

    if (operatorNotesElement) {
        const operatorNotes = getTextFromElement(operatorNotesElement);
        orochiStore.setState({ operatorNotes });
    }

    const conversationTitle =
        metadataElement?.children[0]?.children[1]?.lastElementChild?.textContent ||
        null;

    const errorLabels =
        metadataElement?.children[1]?.children[1]?.lastElementChild?.textContent ||
        null;

    orochiStore.setState({ conversationTitle, errorLabels });
};

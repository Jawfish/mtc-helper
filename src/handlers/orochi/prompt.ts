import { MutHandler } from '@handlers/types';
import { getTextFromElement } from '@lib/textProcessing';
import { orochiStore } from '@src/store/orochiStore';

export const handlePromptMutation: MutHandler = (_target: Element) => {
    // target.querySelector results in inconsistent behavior
    const element = document.querySelector(
        'div.rounded-xl.bg-indigo-100 p.whitespace-pre-wrap'
    )?.parentElement;

    if (!element) {
        return;
    }

    const processedText = getTextFromElement(element);

    orochiStore.setState({ prompt: processedText });
};

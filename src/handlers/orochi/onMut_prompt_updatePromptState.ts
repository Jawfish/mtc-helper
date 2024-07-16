import { MutHandler } from '@handlers/index';
import { getTextFromElement } from '@lib/textProcessing';
import { orochiStore } from '@src/store/orochiStore';

/**
 * This handles mutations in the element that contains the prompt that the operator
 * wrote and the model responded to (the element with the light blue background).
 */
export const onMut_prompt_updatePromptState: MutHandler = (_target: Element) => {
    // target.querySelector results in inconsistent behavior
    const element = document.querySelector(
        'div.rounded-xl.bg-indigo-100 p.whitespace-pre-wrap'
    )?.parentElement;

    if (!element) {
        return;
    }

    const processedText = getTextFromElement(element).replaceAll('"', "'");

    orochiStore.setState({ prompt: processedText });
};

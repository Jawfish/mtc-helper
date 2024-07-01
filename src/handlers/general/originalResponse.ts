import { MutHandler } from '@handlers/types';
import Logger from '@src/lib/logging';
import { generalStore } from '@src/store/generalStore';
import MarkdownConverter from '@lib/markdown';
import { getWordCount } from '@lib/textProcessing';

import { selectGeneralSelectedResponse } from './selectors';
import { createWordCountElement } from './utils';

const selectGeneralOriginalResponse = (): HTMLDivElement | null => {
    const selectedResponse = selectGeneralSelectedResponse();
    const tab = selectedResponse?.querySelector('div[id="2"]');

    // if tab doesn't have "text-theme-main" class, it is not selected, so the
    // original content is not visible
    if (!tab?.classList.contains('text-theme-main')) {
        return null;
    }

    const element = selectedResponse?.querySelector('div[data-cy="tab"]');

    return element instanceof HTMLDivElement ? element : null;
};

const insertOriginalResponseWordCount = (text: string) => {
    const container = document.getElementById('mtc-controls-container');
    if (!container) {
        return;
    }

    Logger.debug('Inserting word count element for original response.');

    const wordCount = getWordCount(text);
    const wcElement = createWordCountElement(wordCount, 'original');

    container.insertBefore(wcElement, container.children[1]);
};

export const handleGeneralOriginalResponseMutation: MutHandler = (_target: Element) => {
    const originalResponseElement = selectGeneralOriginalResponse();
    if (!originalResponseElement) {
        return;
    }

    const { editedResponseMarkdown } = generalStore.getState();
    if (!editedResponseMarkdown) {
        return;
    }

    const htmlAsMarkdown = MarkdownConverter.instance.htmlToMarkdown(
        originalResponseElement,
        editedResponseMarkdown
    );

    if (
        !htmlAsMarkdown ||
        htmlAsMarkdown === generalStore.getState().originalResponseMarkdown
    ) {
        return;
    }

    Logger.debug('Handling change in general original response state.');

    generalStore.setState({
        originalResponseMarkdown: htmlAsMarkdown,
        originalResponseHtml: originalResponseElement.innerHTML
    });

    insertOriginalResponseWordCount(htmlAsMarkdown);
};

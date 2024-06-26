import { MutHandler } from '@handlers/types';
import Logger from '@src/lib/logging';
import { pandaStore } from '@src/store/pandaStore';
import MarkdownConverter from '@lib/markdown';
import { getWordCount } from '@lib/textProcessing';

import { selectPandaSelectedResponse } from './selectors';
import { createWordCountElement } from './utils';

const selectPandaOriginalResponse = (): HTMLDivElement | null => {
    const selectedResponse = selectPandaSelectedResponse();
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

export const handlePandaOriginalResponseMutation: MutHandler = (_target: Element) => {
    const originalResponseElement = selectPandaOriginalResponse();
    if (!originalResponseElement) {
        return;
    }

    const { editedResponseMarkdown } = pandaStore.getState();
    if (!editedResponseMarkdown) {
        return;
    }

    const htmlAsMarkdown = MarkdownConverter.instance.htmlToMarkdown(
        originalResponseElement,
        editedResponseMarkdown
    );

    if (
        !htmlAsMarkdown ||
        htmlAsMarkdown === pandaStore.getState().originalResponseMarkdown
    ) {
        return;
    }

    Logger.debug('Handling change in panda original response state.');

    pandaStore.setState({
        originalResponseMarkdown: htmlAsMarkdown,
        originalResponseHtml: originalResponseElement.innerHTML
    });

    insertOriginalResponseWordCount(htmlAsMarkdown);
};

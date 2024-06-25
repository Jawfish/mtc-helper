import { MutHandler } from '@handlers/types';
import Logger from '@src/lib/logging';
import { pandaStore } from '@src/store/pandaStore';
import MarkdownConverter from '@lib/markdown';

import { selectPandaSelectedResponse } from './selectors';

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

    if (!htmlAsMarkdown) {
        return;
    }

    Logger.debug('Handling change in panda original response state.');

    pandaStore.setState({
        originalResponseMarkdown: htmlAsMarkdown,
        originalResponseHtml: originalResponseElement.innerHTML
    });
};

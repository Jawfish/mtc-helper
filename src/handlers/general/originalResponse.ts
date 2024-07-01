import { MutHandler } from '@handlers/types';
import Logger from '@src/lib/logging';
import { generalStore } from '@src/store/generalStore';
import MarkdownConverter from '@lib/markdown';

import { selectGeneralSelectedResponse } from './selectors';

const selectGeneralOriginalResponse = (): HTMLDivElement | undefined => {
    const selectedResponse = selectGeneralSelectedResponse();
    const tab = selectedResponse?.querySelector('div[id="2"]');
    if (!tab?.classList.contains('text-theme-main')) {
        return undefined;
    }
    const element = selectedResponse?.querySelector('div[data-cy="tab"]');

    return element instanceof HTMLDivElement ? element : undefined;
};

export const handleGeneralOriginalResponseMutation: MutHandler = (_target: Element) => {
    const originalResponseElement = selectGeneralOriginalResponse();
    if (!originalResponseElement) {
        return;
    }
    const { editedMarkdown } = generalStore.getState().selectedResponse;
    if (!editedMarkdown) {
        return;
    }
    const htmlAsMarkdown = MarkdownConverter.instance.htmlToMarkdown(
        originalResponseElement,
        editedMarkdown
    );
    if (
        !htmlAsMarkdown ||
        htmlAsMarkdown === generalStore.getState().selectedResponse.originalMarkdown
    ) {
        return;
    }
    Logger.debug('Handling change in general original response state.');

    generalStore.setState(state => ({
        selectedResponse: {
            ...state.selectedResponse,
            originalMarkdown: htmlAsMarkdown,
            originalHtml: originalResponseElement.innerHTML
        }
    }));
};

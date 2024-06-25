import { MutHandler } from '@handlers/types';
import Logger from '@src/lib/logging';
import { pandaStore } from '@src/store/pandaStore';
import { standardizeNewlines } from '@lib/textProcessing';
import Turndown from '@lib/turndown';

import { selectPandaOriginalResponse } from './selectors';

export const handlePandaOriginalResponseMutation: MutHandler = (_target: Element) => {
    const originalResponseElement = selectPandaOriginalResponse();
    if (!originalResponseElement) {
        return;
    }

    const response = originalResponseElement.textContent || undefined;
    if (!response) {
        return;
    }

    const { originalResponsePlaintext: plaintextInStore } = pandaStore.getState();
    const plaintextFromDOM = standardizeNewlines(response);
    // Turndown takes a node or a string of HTML, not textContent
    const markdownFromDOM = Turndown.getInstance()?.turndown(originalResponseElement);

    if (plaintextFromDOM === plaintextInStore) {
        return;
    }

    Logger.debug('Handling change in panda original response state.');

    pandaStore.setState({
        originalResponsePlaintext: plaintextFromDOM,
        originalResponseMarkdown: markdownFromDOM
    });
};

import { MutHandler } from '@handlers/types';
import Logger from '@src/lib/logging';
import { pandaStore } from '@src/store/pandaStore';
import { getWordCount } from '@lib/textProcessing';
import Turndown from '@lib/turndown';
import markdownToTxt from 'markdown-to-txt';

import { elementHasMtcHelperAttribute, addMtcHelperAttributeToElement } from '..';

import { getWordCountElement, getCopyButton, getControlsContainer } from './utils';

export const handlePandaUnselectedResponseMutation: MutHandler = (
    mutation: Element
) => {
    const selectButton = Array.from(mutation.querySelectorAll('button')).find(
        button => button.textContent === 'Select'
    );

    if (
        !selectButton ||
        selectButton.textContent !== 'Select' ||
        elementHasMtcHelperAttribute(selectButton)
    ) {
        return;
    }

    addMtcHelperAttributeToElement(selectButton);

    const buttonContainer = selectButton.parentElement;
    const contentContainer = buttonContainer?.parentElement;
    const unselectedResponseElement = contentContainer?.children[1]?.children[1];

    if (!unselectedResponseElement) {
        Logger.debug('Unselected response element not found.');

        return;
    }

    const unselectedResponsePlaintext =
        unselectedResponseElement.textContent || undefined;

    if (!unselectedResponsePlaintext) {
        Logger.debug('Unselected response has no content.');

        return;
    }

    const container = getControlsContainer();
    const wordCount = getWordCount(unselectedResponsePlaintext);
    const wcElement = getWordCountElement(wordCount);
    const markdownCopyButton = getCopyButton('Copy Markdown');
    const plaintextCopyButton = getCopyButton('Copy Plaintext');

    // update word count in the word count element when unselectedResponse changes
    pandaStore.subscribe(({ unselectedResponsePlaintext }) => {
        wcElement.textContent = `${getWordCount(unselectedResponsePlaintext || '')} words`;
    });

    markdownCopyButton.addEventListener('click', () => {
        const { unselectedResponseMarkdown } = pandaStore.getState();
        if (!unselectedResponseMarkdown) {
            return;
        }
        navigator.clipboard.writeText(unselectedResponseMarkdown);
    });

    plaintextCopyButton.addEventListener('click', () => {
        const { unselectedResponsePlaintext } = pandaStore.getState();
        if (!unselectedResponsePlaintext) {
            return;
        }

        // no need to double space unselcted response
        const plaintext = markdownToTxt(unselectedResponsePlaintext);
        navigator.clipboard.writeText(plaintext);
    });

    container.appendChild(wcElement);
    container.appendChild(plaintextCopyButton);
    container.appendChild(markdownCopyButton);
    buttonContainer?.insertAdjacentElement('afterend', container);

    Logger.debug('Handling panda unselected response mutation.');

    pandaStore.setState({
        unselectedResponsePlaintext,
        // Turndown takes a node or a string of HTML, not textContent
        unselectedResponseMarkdown: Turndown.getInstance()?.turndown(
            unselectedResponseElement as HTMLElement
        )
    });
};

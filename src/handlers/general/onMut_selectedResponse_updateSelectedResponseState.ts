/**
 * Contains handlers that update state based on changes in the selected response (the
 * model response that the operator chose and their changes to that response). This
 * includes resetting the state when the response is deselected.
 */

import { MutHandler } from '@handlers/index';
import Logger from '@src/lib/logging';
import { generalStore } from '@src/store/generalStore';
import MarkdownConverter from '@lib/markdown';

const selectOperatorResponse = (): HTMLDivElement | undefined => {
    const element = document.querySelector('div[contenteditable="true"]');

    if (element instanceof HTMLDivElement) {
        return element;
    }

    return undefined;
};

const selectModelResponse = (): HTMLDivElement | undefined => {
    if (selectOperatorResponse()) {
        return;
    }

    // 'div[data-cy="tab"]' where it's parent's parent's first child contains within it
    // a button that contains a span that has the text Save
    const element = Array.from(document.querySelectorAll('div[data-cy="tab"]')).find(
        div => {
            const grandparent = div.parentElement?.parentElement;
            if (!grandparent || !grandparent.firstElementChild) return false;

            const saveButton = grandparent.firstElementChild.querySelector('button');
            if (!saveButton) return false;

            const spanWithSaveText = Array.from(
                saveButton.getElementsByTagName('span')
            ).find(span => span.textContent?.trim().toLowerCase() === 'save');

            return !!spanWithSaveText;
        }
    );

    return element instanceof HTMLDivElement ? element : undefined;
};

export const onMut_operatorResponse_updateOperatorResponseState: MutHandler = (
    _target: Element
) => {
    const operatorResponseElement = selectOperatorResponse();

    if (!operatorResponseElement) {
        return;
    }

    const operatorResponseFromDOM = operatorResponseElement?.textContent || undefined;

    if (!operatorResponseFromDOM) {
        return;
    }

    const { operatorResponseMarkdown } = generalStore.getState();

    if (operatorResponseFromDOM === operatorResponseMarkdown) {
        return;
    }

    Logger.debug("Handling change in operator's response state.");

    generalStore.setState({
        operatorResponseMarkdown: operatorResponseFromDOM
    });
};

function processModelResponse(
    modelResponseElement: HTMLDivElement,
    editedMarkdown: string
): {
    modelResponseMarkdown: string | undefined;
    modelResponseHtml: string | undefined;
} {
    const htmlAsMarkdown = MarkdownConverter.instance.htmlToMarkdown(
        modelResponseElement,
        editedMarkdown
    );

    return {
        modelResponseMarkdown: htmlAsMarkdown.replaceAll('\\*', '*'),
        modelResponseHtml: modelResponseElement.innerHTML
    };
}

export const onMut_modelResponse_updateModelResponseState: MutHandler = (
    _target: Element
) => {
    const modelResponseElement = selectModelResponse();
    if (!modelResponseElement) {
        return;
    }

    const { operatorResponseMarkdown } = generalStore.getState();
    if (!operatorResponseMarkdown) {
        return;
    }

    const result = processModelResponse(modelResponseElement, operatorResponseMarkdown);

    Logger.debug('Handling change in general original response state.');

    generalStore.setState({
        ...result,
        modelResponsePlaintext: modelResponseElement.textContent || undefined
    });
};

export const onMut_selectedResponse_resetSelectedResponseState: MutHandler = (
    _target: Element
) => {
    // if no tab with id 0 can be found, there is no selected response, so reset the
    // store to prevent stale data
    if (!document.querySelector('div[id="0"]')) {
        generalStore.setState({
            modelResponseHtml: undefined,
            modelResponseMarkdown: undefined,
            modelResponsePlaintext: undefined,
            operatorResponseMarkdown: undefined
        });
    }
};

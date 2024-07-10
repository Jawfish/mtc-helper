import { MutHandler } from '@handlers/index';
import Logger from '@src/lib/logging';
import { generalStore } from '@src/store/generalStore';
import MarkdownConverter from '@lib/markdown';

import { selectSelectedResponse } from './selectors';

type Selector = () => HTMLDivElement | undefined;

function processModelResponse(
    modelResponseElement: HTMLDivElement,
    editedMarkdown: string,
    currentmodelResponseMarkdown: string | undefined
): { modelResponseMarkdown: string; modelResponseHtml: string } | null {
    const htmlAsMarkdown = MarkdownConverter.instance.htmlToMarkdown(
        modelResponseElement,
        editedMarkdown
    );

    if (!htmlAsMarkdown || htmlAsMarkdown === currentmodelResponseMarkdown) {
        return null;
    }

    return {
        modelResponseMarkdown: htmlAsMarkdown,
        modelResponseHtml: modelResponseElement.innerHTML
    };
}

// TODO: decide if using a factory function is the best approach
export function createModelResponseMutationHandler(
    selectModelResponse: Selector
): MutHandler {
    return (_target: Element) => {
        const modelResponseElement = selectModelResponse();
        if (!modelResponseElement) {
            return;
        }

        const { operatorResponseMarkdown, modelResponseMarkdown } =
            generalStore.getState().selectedResponse;
        if (!operatorResponseMarkdown) {
            return;
        }

        const result = processModelResponse(
            modelResponseElement,
            operatorResponseMarkdown,
            modelResponseMarkdown
        );

        if (result) {
            Logger.debug('Handling change in general original response state.');
            generalStore.setState(state => ({
                selectedResponse: {
                    ...state.selectedResponse,
                    ...result
                }
            }));
        }
    };
}

const selectModelResponse = (): HTMLDivElement | undefined => {
    const selectedResponse = selectSelectedResponse();
    const tab = selectedResponse?.querySelector('div[id="2"]');
    if (!tab?.classList.contains('text-theme-main')) {
        return undefined;
    }
    const element = selectedResponse?.querySelector('div[data-cy="tab"]');

    return element instanceof HTMLDivElement ? element : undefined;
};

export const handleModelResponseMutation =
    createModelResponseMutationHandler(selectModelResponse);

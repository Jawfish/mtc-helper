import { MutHandler } from '@handlers/index';
import Logger from '@lib/logging';
import { orochiStore } from '@src/store/orochiStore';

import { elementHasMtcHelperAttribute, addMtcHelperAttributeToElement } from '..';

type ResponseElement = {
    element: HTMLDivElement;
    isModelResponse: boolean;
};

const selectOperatorResponseElement = (): HTMLDivElement | undefined => {
    const taskElements = Array.from(document.querySelectorAll('div.rounded-xl'));

    return taskElements.length >= 2 && taskElements[1] instanceof HTMLDivElement
        ? taskElements[1]
        : undefined;
};

const selectModelResponseElement = (): HTMLDivElement | undefined => {
    const element = document.querySelector("div[data-cy='tab'] > div");

    return element instanceof HTMLDivElement &&
        // the tab with 'contenteditable="true"' is the edited response tab, not the
        // original response tab
        element.getAttribute('contenteditable') !== 'true'
        ? element
        : undefined;
};

const getResponseElement = (): ResponseElement | undefined => {
    const modelResponseElement = selectModelResponseElement();
    if (modelResponseElement)
        return { element: modelResponseElement, isModelResponse: true };

    const operatorResponseElement = selectOperatorResponseElement();
    if (operatorResponseElement)
        return { element: operatorResponseElement, isModelResponse: false };

    return undefined;
};

const extractContent = (
    element: HTMLDivElement,
    isModelResponse: boolean
): string | undefined => {
    const content = element.textContent || undefined;

    return isModelResponse ? content : content?.slice(1) || undefined;
};

const extractCode = (element: HTMLDivElement): string | undefined =>
    element.querySelector('pre code')?.textContent || undefined;

const hasContentChanged = (
    isModelResponse: boolean,
    content: string | undefined,
    code: string | undefined,
    state: ReturnType<typeof orochiStore.getState>
): boolean => {
    const { modelResponse, modelResponseCode, operatorResponse, operatorResponseCode } =
        state;
    const responseChanged = isModelResponse
        ? content !== modelResponse
        : content !== operatorResponse;
    const codeChanged = isModelResponse
        ? code !== modelResponseCode
        : code !== operatorResponseCode;

    return responseChanged || codeChanged;
};

/**
 * This handles mutations in the following elements:
 * - The element that contains the operator's edited response content (the element with
 *   the pink background), before opening it in edit mode.
 * - The element that contains the model's response (the "Original" tab).
 */
export const onMut_response_updateResponseState: MutHandler = (_target: Element) => {
    const responseElement = getResponseElement();
    if (!responseElement) return;

    const { element, isModelResponse } = responseElement;
    const seen = elementHasMtcHelperAttribute(element);
    const content = extractContent(element, isModelResponse);
    const code = extractCode(element);

    const state = orochiStore.getState();
    if (seen && !hasContentChanged(isModelResponse, content, code, state)) return;

    Logger.debug(
        `Handling change in ${isModelResponse ? 'original' : 'edited'} response element state.`
    );

    if (!seen) {
        addMtcHelperAttributeToElement(element);
    }

    orochiStore.setState(
        isModelResponse
            ? { modelResponse: content, modelResponseCode: code }
            : { operatorResponse: content, operatorResponseCode: code }
    );
};

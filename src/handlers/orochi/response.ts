import { MutHandler } from '@handlers/types';
import Logger from '@lib/logging';
import { orochiStore } from '@src/store/orochiStore';

import { elementHasMtcHelperAttribute, addMtcHelperAttributeToElement } from '..';

type ResponseElement = {
    element: HTMLDivElement;
    isOriginal: boolean;
};

const selectResponseElement = (): HTMLDivElement | null => {
    const taskElements = Array.from(document.querySelectorAll('div.rounded-xl'));

    return taskElements.length >= 2 && taskElements[1] instanceof HTMLDivElement
        ? taskElements[1]
        : null;
};

const selectOriginalContentElement = (): HTMLDivElement | null => {
    const element = document.querySelector("div[data-cy='tab'] > div");

    return element instanceof HTMLDivElement &&
        element.getAttribute('contenteditable') !== 'true'
        ? element
        : null;
};

const getResponseElement = (): ResponseElement | null => {
    const originalElement = selectOriginalContentElement();
    if (originalElement) return { element: originalElement, isOriginal: true };

    const editedElement = selectResponseElement();
    if (editedElement) return { element: editedElement, isOriginal: false };

    return null;
};

const extractContent = (
    element: HTMLDivElement,
    isOriginal: boolean
): string | null => {
    const content = element.textContent || null;

    return isOriginal ? content : content?.slice(1) || null;
};

const extractCode = (element: HTMLDivElement): string | null =>
    element.querySelector('pre code')?.textContent || null;

const hasContentChanged = (
    isOriginal: boolean,
    content: string | null,
    code: string | null,
    state: ReturnType<typeof orochiStore.getState>
): boolean => {
    const { originalResponse, originalCode, editedResponse, editedCode } = state;
    const responseChanged = isOriginal
        ? content !== originalResponse
        : content !== editedResponse;
    const codeChanged = isOriginal ? code !== originalCode : code !== editedCode;

    return responseChanged || codeChanged;
};

export const handleResponseMutation: MutHandler = (_target: Element) => {
    const responseElement = getResponseElement();
    if (!responseElement) return;

    const { element, isOriginal } = responseElement;
    const seen = elementHasMtcHelperAttribute(element);
    const content = extractContent(element, isOriginal);
    const code = extractCode(element);

    const state = orochiStore.getState();
    if (seen && !hasContentChanged(isOriginal, content, code, state)) return;

    Logger.debug(
        `Handling change in ${isOriginal ? 'original' : 'edited'} response element state.`
    );

    if (!seen) {
        addMtcHelperAttributeToElement(element);
    }

    orochiStore.setState(
        isOriginal
            ? { originalResponse: content, originalCode: code }
            : { editedResponse: content, editedCode: code }
    );
};

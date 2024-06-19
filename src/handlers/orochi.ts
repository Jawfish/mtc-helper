import Logger from '@src/lib/logging';
import { getTextFromElement } from '@lib/textProcessing';
import { selectMetadataSectionElement } from '@lib/selectors';
import { orochiStore } from '@src/store/orochiStore';

import {
    addMtcHelperAttributeToElement,
    elementHasMtcHelperAttribute,
    MutHandler
} from '.';

export const handlePromptMutation: MutHandler = (target: Element) => {
    const element = target.querySelector(
        'div.rounded-xl.bg-indigo-100 p.whitespace-pre-wrap'
    )?.parentElement;

    if (!element) {
        return;
    }

    const processedText = getTextFromElement(element);

    orochiStore.setState({ prompt: processedText });
};

export const handleResponseMutation: MutHandler = (_target: Element) => {
    const originalElement = selectOriginalContentElement();
    const editedElement = selectResponseElement();

    let element, isOriginal;

    if (originalElement) {
        element = originalElement;
        isOriginal = true;
    } else if (editedElement) {
        element = editedElement;
        isOriginal = false;
    } else {
        return;
    }

    const seen = elementHasMtcHelperAttribute(element);

    const content = isOriginal
        ? element.textContent || null
        : element.textContent?.slice(1) || null; // Remove first character for edited response

    const code = element.querySelector('pre code')?.textContent || null;

    const { originalResponse, originalCode, editedResponse, editedCode } =
        orochiStore.getState();

    const responseChanged = isOriginal
        ? content !== originalResponse
        : content !== editedResponse;

    const codeChanged = isOriginal ? code !== originalCode : code !== editedCode;

    if (seen && !responseChanged && !codeChanged) {
        return;
    }

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

export const handleMetadataSection: MutHandler = (_target: Element) => {
    const { metadataRemoved } = orochiStore.getState();
    if (metadataRemoved) {
        return;
    }

    const element = selectMetadataSectionElement();
    if (!element) {
        return;
    }

    element.remove();

    Logger.debug('Metadata section removed.');
};

export const handleOrochiTaskWindowMetadataSectionMutation: MutHandler = (
    _target: Element
) => {
    const element = selectOrochiTaskWindowMetadataSectionElement();
    if (!element) {
        return;
    }

    const operatorNotes = getTextFromElement(selectOrochiOperatorNotesElement());
    const conversationTitle = selectOrochiConversationTitle()?.textContent || null;
    const errorLabels = selectOrochiErrorLabels()?.textContent || null;

    orochiStore.setState({ operatorNotes, conversationTitle, errorLabels });
};

export const handleLanguageMutation: MutHandler = (_target: Element) => {
    const hasPythonDiv = Array.from(document.querySelectorAll('div')).find(
        div => div.textContent === 'Programming Language:Python'
    );

    if (hasPythonDiv) {
        orochiStore.setState({ language: 'python' });

        return;
    }

    const responseCodeElement = selectResponseCodeElement();
    const pythonInClass = responseCodeElement?.classList.contains('language-python');

    if (pythonInClass) {
        orochiStore.setState({ language: 'python' });
    }
};

export const handleScoreMutation: MutHandler = (_target: Element) => {
    const element = selectScoreElement();
    if (!element) {
        return;
    }

    const content = element.textContent?.split(':')[1].trim();
    if (!content) {
        return;
    }

    const score = parseInt(content, 10);
    orochiStore.setState({ score });
};

export const handleReturnTargetMutation: MutHandler = (_target: Element) => {
    const element = selectFeedbackSectionElement();
    if (!element) {
        return;
    }

    const rework = element.textContent?.includes('Rework (Same Operator)');
    if (rework === undefined) {
        return;
    }

    orochiStore.setState({ rework });
};

/**
 * Get the response code element from the QA task.
 * @returns The response code element.
 */
const selectResponseCodeElement = (): Element | null =>
    document.querySelector('div.rounded-xl.bg-pink-100 pre code');

/**
 * Get the alignment score element from the page.
 * @returns The alignment score element.
 */
const selectScoreElement = (): HTMLElement | null =>
    Array.from(document.querySelectorAll('span')).find(
        span => span.textContent?.trim() === 'Alignment %'
    )?.parentElement || null;

/**
 * Select the task's response element.
 * @returns The task response element.
 */
const selectResponseElement = (): HTMLDivElement | null => {
    const taskElements = Array.from(document.querySelectorAll('div.rounded-xl'));

    if (taskElements.length < 2) {
        return null;
    }

    const [, responseElement] = taskElements;

    return responseElement instanceof HTMLDivElement ? responseElement : null;
};

/**
 * Select the QA feedback section element (the section that contains the feedback, send case button, submit QA result button, etc.)
 * @returns The send case button if found, otherwise `undefined`.
 */
const selectFeedbackSectionElement = (): HTMLElement | null =>
    Array.from(document.querySelectorAll('button')).find(
        button => button.textContent === 'Send case to'
    )?.parentElement?.parentElement || null;

const selectOrochiTaskWindowMetadataSectionElement = (): HTMLDivElement | null => {
    const [, outerContainer] =
        document.querySelector('.react-grid-layout')?.children || [];
    const [, element] = outerContainer?.children || [];

    return element instanceof HTMLDivElement ? element : null;
};

const selectOrochiConversationTitle = (): HTMLDivElement | null => {
    const element =
        selectOrochiTaskWindowMetadataSectionElement()?.children[0]?.children[1]
            ?.lastElementChild;

    return element instanceof HTMLDivElement ? element : null;
};

const selectOrochiErrorLabels = (): HTMLDivElement | null => {
    const element =
        selectOrochiTaskWindowMetadataSectionElement()?.children[1]?.children[1]
            ?.lastElementChild;

    return element instanceof HTMLDivElement ? element : null;
};

const selectOrochiOperatorNotesElement = (): HTMLDivElement | null => {
    const element =
        selectOrochiTaskWindowMetadataSectionElement()?.children[2]?.children[1]
            ?.lastElementChild;

    return element instanceof HTMLDivElement ? element : null;
};

/**
 * Get the tab content for the specified tab.
 * @returns  The content of the tab.
 */
const selectOriginalContentElement = (): HTMLDivElement | null => {
    const element = document.querySelector("div[data-cy='tab'] > div");
    if (!element) {
        return null;
    }

    // If the content is editable, then it's the edited tab, not the original tab
    if (element.getAttribute('contenteditable') === 'true') {
        return null;
    }

    return element instanceof HTMLDivElement ? element : null;
};

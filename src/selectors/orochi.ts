/**
 * Get the response code element from the QA task.
 * @returns The response code element.
 */

export const selectResponseCodeElement = (): Element | undefined =>
    document.querySelector('div.rounded-xl.bg-pink-100 pre code') || undefined;

/**
 * Get the alignment score element from the page.
 * @returns The alignment score element.
 */
export const selectScoreElement = (): HTMLElement | undefined =>
    Array.from(document.querySelectorAll('span')).find(
        span => span.textContent?.trim() === 'Alignment %'
    )?.parentElement || undefined;

export const selectPromptElement = (): HTMLDivElement | undefined => {
    const element = document.querySelector(
        'div.rounded-xl p.whitespace-pre-wrap'
    )?.parentElement;

    return element instanceof HTMLDivElement ? element : undefined;
};

/**
 * Select the task's response element.
 * @returns The task response element.
 */
export const selectResponseElement = (): HTMLDivElement | undefined => {
    const taskElements = Array.from(document.querySelectorAll('div.rounded-xl'));

    if (taskElements.length < 2) {
        return undefined;
    }

    const [, responseElement] = taskElements;

    return responseElement instanceof HTMLDivElement ? responseElement : undefined;
}; /**
 * Select the QA feedback section element (the section that contains the feedback, send case button, submit QA result button, etc.)
 * @returns The send case button if found, otherwise `undefined`.
 */
export const selectFeedbackSectionElement = (): HTMLElement | undefined =>
    Array.from(document.querySelectorAll('button')).find(
        button => button.textContent === 'Send case to'
    )?.parentElement?.parentElement || undefined;
/**
 * Select the return target element from the feedback section, i.e. the Rework dropdown.
 * @returns The return element if found, otherwise `undefined`.
 */

export const selectReturnTargetElement = (): Element | undefined => {
    const feedbackSection = selectFeedbackSectionElement();
    if (!feedbackSection) {
        return undefined;
    }
    const { children } = feedbackSection;
    if (children.length < 3) {
        return undefined;
    }

    return children[2];
};
/**
 * Select the main task submission button element from a QA task.
 * @returns The task submit button element if found, otherwise `undefined`.
 */

export const selectSubmitButtonElement = (): HTMLButtonElement | undefined => {
    const element = Array.from(document.querySelectorAll('span')).find(span =>
        span.textContent?.trim()?.includes('Submit QA Task')
    )?.parentElement;

    return element instanceof HTMLButtonElement ? element : undefined;
};

export const selectOrochiTaskWindowMetadataSectionElement = ():
    | HTMLDivElement
    | undefined => {
    const [, outerContainer] =
        document.querySelector('.react-grid-layout')?.children || [];
    const [, element] = outerContainer?.children || [];

    return element instanceof HTMLDivElement ? element : undefined;
};

export const selectOrochiConversationTitle = (): HTMLDivElement | undefined => {
    const element =
        selectOrochiTaskWindowMetadataSectionElement()?.children[0]?.children[1]
            ?.lastElementChild;

    return element instanceof HTMLDivElement ? element : undefined;
};

export const selectOrochiErrorLabels = (): HTMLDivElement | undefined => {
    const element =
        selectOrochiTaskWindowMetadataSectionElement()?.children[1]?.children[1]
            ?.lastElementChild;

    return element instanceof HTMLDivElement ? element : undefined;
};

export const selectOrochiOperatorNotesElement = (): HTMLDivElement | undefined => {
    const element =
        selectOrochiTaskWindowMetadataSectionElement()?.children[2]?.children[1]
            ?.lastElementChild;

    return element instanceof HTMLDivElement ? element : undefined;
};

import Logger from '@src/lib/logging';
import markdownToTxt from 'markdown-to-txt';
import { selectTaskWindowElement } from '@lib/selectors';
import { pandaStore } from '@src/store/pandaStore';
import { getWordCount, doubleSpace } from '@lib/textProcessing';
import Turndown from '@lib/turndown';

import {
    addMtcHelperAttributeToElement,
    elementHasMtcHelperAttribute,
    MutHandler,
    standardizeNewlines
} from '.';

const getWordCountElement = (count: number) => {
    const wcElement = document.createElement('span');
    wcElement.textContent = `${count.toString()} words`;
    wcElement.className = 'text-xs self-center';

    return wcElement;
};

const getCopyButton = (label: string = 'Copy') => {
    const copyButton = document.createElement('button');
    copyButton.textContent = label;
    copyButton.className =
        'relative box-border flex cursor-pointer items-center justify-center whitespace-nowrap bg-void border border-solid border-main hover:bg-weak-2 hover:border-main text-header w-fit h-6 py-0.5 px-2 text-xs rounded-md disabled:bg-weak-2 disabled:border-main disabled:text-main disabled:cursor-not-allowed disabled:shadow-none space-x-1';

    return copyButton;
};

const getControlsContainer = () => {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'flex gap-2 w-full justify-end mt-2 items-center';

    return controlsContainer;
};

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

export const handlePandaEditedResponseMutation: MutHandler = (_target: Element) => {
    const editedResponseElement = selectPandaEditedResponse();

    if (!editedResponseElement) {
        return;
    }

    const editedResponse = editedResponseElement.textContent || undefined;

    if (!editedResponse) {
        return;
    }

    const { editedResponsePlaintext: plaintextInStore } = pandaStore.getState();
    const plaintextFromDOM = standardizeNewlines(markdownToTxt(editedResponse));

    if (plaintextFromDOM === plaintextInStore) {
        return;
    }

    Logger.debug('Handling change in panda edited response state.');

    pandaStore.setState({
        editedResponsePlaintext: plaintextFromDOM,
        editedResponseMarkdown: editedResponse
    });
};

export const handlePandaSelectedResponseSaveButtonMutation: MutHandler = (
    mutation: Element
) => {
    const saveButton = Array.from(mutation.querySelectorAll('button')).find(
        button => button.textContent === 'Save' && button.classList.contains('text-xs')
    );

    if (!saveButton) {
        return;
    }

    const seen = elementHasMtcHelperAttribute(saveButton);
    if (seen) {
        return;
    }

    addMtcHelperAttributeToElement(saveButton);

    const contentElement = mutation.querySelector('div[contenteditable="true"]');
    const container = getControlsContainer();
    const wordCount = getWordCount(contentElement?.textContent || '');
    const wcElement = getWordCountElement(wordCount);
    const copyEditedButton = getCopyButton('Copy Edited');
    const copyOriginalButton = getCopyButton('Copy Original');
    copyOriginalButton.disabled = true;

    // update word count in the word count element when editedResponse changes
    pandaStore.subscribe(({ editedResponseMarkdown }) => {
        wcElement.textContent = `${getWordCount(editedResponseMarkdown || '')} words`;
    });

    // enable copy button when there is content to copy
    pandaStore.subscribe(({ originalResponseMarkdown }) => {
        copyOriginalButton.disabled = !originalResponseMarkdown;
    });

    copyEditedButton.addEventListener('click', () => {
        const { editedResponseMarkdown } = pandaStore.getState();
        if (!editedResponseMarkdown) {
            return;
        }

        navigator.clipboard.writeText(editedResponseMarkdown);
    });

    copyOriginalButton.addEventListener('click', () => {
        const { originalResponseMarkdown } = pandaStore.getState();
        if (!originalResponseMarkdown) {
            return;
        }

        navigator.clipboard.writeText(originalResponseMarkdown);
    });

    container.appendChild(wcElement);
    container.appendChild(copyEditedButton);
    container.appendChild(copyOriginalButton);
    saveButton.parentElement?.insertAdjacentElement('afterend', container);

    // when the save button is clicked, reset the state
    saveButton.addEventListener('click', () => {
        Logger.debug('Handling click on panda selected response save button.');

        pandaStore.setState({
            editedResponsePlaintext: undefined,
            editedResponseMarkdown: undefined,
            originalResponsePlaintext: undefined,
            originalResponseMarkdown: undefined,
            unselectedResponsePlaintext: undefined
        });
    });
};

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

export const handlePandaEditResponseButtonMutation: MutHandler = (_target: Element) => {
    const editResponseButtons = selectAllPandaEditResponseButtons();
    if (!editResponseButtons.length) {
        return;
    }

    editResponseButtons.forEach(button => {
        const seen = elementHasMtcHelperAttribute(button);
        if (seen) {
            return;
        }

        addMtcHelperAttributeToElement(button);

        button.addEventListener('click', () => {
            Logger.debug('Handling click on panda edit response button.');

            pandaStore.setState({
                editedResponsePlaintext: undefined,
                originalResponsePlaintext: undefined
            });
        });
    });
};

export const handlePandaPromptMutation: MutHandler = (mutation: Element) => {
    const closeButton = Array.from(mutation.querySelectorAll('button')).find(
        button => button.textContent === 'Close'
    );

    if (!closeButton || elementHasMtcHelperAttribute(closeButton)) {
        return;
    }

    Logger.debug('Handling panda prompt mutation.');
    addMtcHelperAttributeToElement(closeButton);

    const promptElement = closeButton.parentElement?.parentElement?.children[1];
    if (!promptElement || !(promptElement instanceof HTMLElement)) {
        Logger.debug('Prompt element not found.');

        return;
    }

    const promptContent = promptElement.textContent || '';
    const wordCount = getWordCount(promptContent);

    const container = getControlsContainer();
    const wcElement = getWordCountElement(wordCount);
    const markdownCopyButton = getCopyButton('Copy Markdown');
    const plaintextCopyButton = getCopyButton('Copy Plaintext');

    markdownCopyButton.addEventListener('click', () => {
        const markdown = Turndown.getInstance()?.turndown(promptElement);
        if (markdown) {
            navigator.clipboard.writeText(markdown);
        }
    });

    plaintextCopyButton.addEventListener('click', () => {
        const plaintext = markdownToTxt(promptContent);

        const processedPlaintext = doubleSpace(plaintext);

        navigator.clipboard.writeText(processedPlaintext);
    });

    container.appendChild(wcElement);
    container.appendChild(plaintextCopyButton);
    container.appendChild(markdownCopyButton);

    closeButton.parentElement?.insertAdjacentElement('afterend', container);
};

const selectPandaSelectedResponseSaveButton = (): HTMLButtonElement | undefined => {
    const taskWindow = selectTaskWindowElement();
    const selectedResponseSaveButton = Array.from(
        taskWindow?.querySelectorAll('button') || []
    ).find(
        button =>
            button.classList.contains('text-xs') &&
            button.querySelector('span')?.textContent === 'Save'
    );

    return selectedResponseSaveButton instanceof HTMLButtonElement
        ? selectedResponseSaveButton
        : undefined;
};

const selectPandaSelectedResponse = (): HTMLDivElement | undefined => {
    const saveButton = selectPandaSelectedResponseSaveButton();

    const selectedResponse = saveButton?.parentElement?.parentElement;

    return selectedResponse instanceof HTMLDivElement ? selectedResponse : undefined;
};

const selectPandaEditedResponse = (): HTMLDivElement | undefined => {
    const selectedResponse = selectPandaSelectedResponse();
    const element = selectedResponse?.querySelector('div[contenteditable="true"]');

    return element instanceof HTMLDivElement ? element : undefined;
};

const selectPandaOriginalResponse = (): HTMLDivElement | undefined => {
    const selectedResponse = selectPandaSelectedResponse();
    const tab = selectedResponse?.querySelector('div[id="2"]');

    // if tab doesn't have "text-theme-main" class, it is not selected, so the
    // original content is not visible
    if (!tab?.classList.contains('text-theme-main')) {
        return undefined;
    }

    const element = selectedResponse?.querySelector('div[data-cy="tab"]');

    return element instanceof HTMLDivElement ? element : undefined;
};

const selectAllPandaEditResponseButtons = (): HTMLButtonElement[] | [] => {
    const editButtons = Array.from(
        document.querySelectorAll('button[title="Edit"]')
    ).filter(button => button.querySelector('svg'));

    return editButtons as HTMLButtonElement[];
};

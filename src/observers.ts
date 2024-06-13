import { handleSubmitButtonClicked } from './handlers';
import { log } from './helpers';
import {
    selectEditButton,
    selectEditedTabElement,
    selectMetadataSectionElement,
    selectOriginalTabContentElement,
    selectOriginalTabElement,
    selectResponseCodeElement,
    selectResponseElement,
    selectSaveButtonElement,
    selectSnoozeButtonElement,
    selectSubmitButtonElement
} from './selectors';
import { DiffViewState, store, resetStore } from './store';

import { insertOrochiHelperToolbar } from './elements';
import { editor } from 'monaco-editor';

class Observe {
    private observers: Array<(mutation: MutationRecord) => void>;

    constructor(...observers: Array<(mutation: MutationRecord) => void>) {
        this.observers = observers;
    }

    addObserver(observer: (mutation: MutationRecord) => void) {
        log('debug', `Adding observer: ${observer.name}`);
        this.observers.push(observer);
    }

    removeObserver(observer: (mutation: MutationRecord) => void) {
        log('debug', `Removing observer: ${observer}`);
        this.observers = this.observers.filter(o => o !== observer);
    }

    updateObservers(mutation: MutationRecord) {
        this.observers.forEach(observer => observer(mutation));
    }

    resetObservers() {
        log('debug', 'Resetting observers.');
        this.observers = [];
    }
}

/**
 * NOTE: Presumably due to the use of React, it does not seem possible to query the mutation for
 * some elements in MTC directly; the addition of some nodes never seems to appear in the mutation
 * record. This is why the functions query the document directly.
 */

// TODO perform checks against an FSM state (i.e. only check for submit button if the conversation
// is open)

// TODO: reduce the scope of the observers to only the elements that are needed where possible
// also consider adding observers from other observers since, for example, the save button will
// only exist after the response edit button is clicked

function observeSnoozeButton(mutation: MutationRecord) {
    const convoOpen = store.getState().conversationOpen;
    const snoozeButton = selectSnoozeButtonElement();

    if (!snoozeButton && convoOpen) {
        log('info', 'Conversation closed.');
        resetStore();
        return;
    }

    if (snoozeButton && !convoOpen) {
        log('info', 'New conversation detected.');
        store.setState({ conversationOpen: true });
        insertOrochiHelperToolbar();
        return;
    }
}

function observeSubmitButton(mutation: MutationRecord) {
    if (store.getState().submitButtonHasListener) {
        return;
    }

    const submitButton = selectSubmitButtonElement();
    if (!submitButton) {
        return;
    }

    // no need to reset the listener state here, since the conversation closes after the submit
    // button is clicked
    store.setState({ submitButtonHasListener: true });
    submitButton.addEventListener('click', handleSubmitButtonClicked);
    log('debug', 'Conversation submit button listener added.');
}

function observeResponseEditButton(mutation: MutationRecord) {
    if (store.getState().responseEditButtonHasListener) {
        return;
    }

    const responseButton = selectEditButton();
    if (!responseButton) {
        return;
    }

    // State needs to be reset when the response button is clicked because there's a delay between the
    // save button being clicked and the DOM finalizing, meaning a bunch of listeners try to add
    // themselves to elements that immediately get removed
    responseButton.addEventListener('click', e => {
        log('info', 'Response edit button clicked.');
        store.setState({
            editedTabHasListener: false,
            metadataRemoved: false,
            originalTabHasListener: false,
            responseEditButtonHasListener: false,
            saveButtonHasListener: false
        });
    });

    store.setState({ responseEditButtonHasListener: true });
    log('debug', 'Response edit button listener added.');
}

function observeEditedContent(mutation: MutationRecord) {
    const element = selectResponseElement();
    if (!element?.textContent) {
        return;
    }

    // remove the first character which is the number associated with the response
    const editedContent = element.textContent.slice(1);
    const responseCode = selectResponseCodeElement()?.textContent || '';
    store.setState({ editedContent, responseCode });
}

function observeOriginalContent(mutation: MutationRecord) {
    if (store.getState().originalContent) {
        return;
    }

    const element = selectOriginalTabContentElement();
    if (!element?.textContent) {
        return;
    }

    const originalContent = element.textContent;
    const originalCode = element.querySelector('pre code')?.textContent || '';
    store.setState({ originalContent, originalCode });
}

// Remove the useless metadata section with the useless save button
function observeMetadataSection(mutation: MutationRecord) {
    if (store.getState().metadataRemoved) {
        return;
    }

    const element = selectMetadataSectionElement();
    if (!element) {
        return;
    }

    element.remove();
    store.setState({ metadataRemoved: true });
    log('debug', 'Metadata section removed.');
}

function observeOriginalTab(mutation: MutationRecord) {
    if (store.getState().originalTabHasListener) {
        return;
    }

    const tab = selectOriginalTabElement();
    if (!tab) {
        return;
    }

    log('debug', 'Adding listener to original tab.');
    tab.addEventListener('click', e => {
        store.setState({ currentTab: 'original' });
    });
    store.setState({ originalTabHasListener: true });
}

function observeEditedTab(mutation: MutationRecord) {
    if (store.getState().editedTabHasListener) {
        return;
    }

    const tab = selectEditedTabElement();
    if (!tab) {
        return;
    }

    log('debug', 'Adding listener to edited tab.');
    tab.addEventListener('click', e => {
        store.setState({ currentTab: 'edited' });
    });
    store.setState({ editedTabHasListener: true });
}

function observeSaveButton(mutation: MutationRecord) {
    if (store.getState().saveButtonHasListener) {
        return;
    }

    const saveButton = selectSaveButtonElement();
    if (!saveButton) {
        return;
    }

    log('debug', 'Adding listener to save button.');

    // when the save button is clicked, the edit view closes, so we need to reset the
    // state of the diff tab as well as re-add the listener for the edit button that is
    // re-added to the DOM
    saveButton.addEventListener('click', e => {
        log('info', 'Save button clicked.');
        // We can't reset the original tab/edited tab state here because the time between the save
        // button being clicked and the DOM settling is too great, so the observers for those elements
        // try to re-add themselves to the DOM too early
        store.setState({
            saveButtonHasListener: false
        });
    });

    store.setState({ saveButtonHasListener: true });
}

function observeMonacoTestEditor(mutation: MutationRecord) {
    if (store.getState().monacoEditorContent || !window.monaco?.editor?.getEditors()) {
        return;
    }

    const editors = window.monaco.editor.getEditors();
    if (!editors.length) {
        return;
    }

    const editor: editor.IStandaloneCodeEditor = editors[0];

    // add a listener so that when the editor is changed it updates the value in the store
    const monacoEditorDisposer = editor.onDidChangeModelContent(() => {
        if (!window.monaco?.editor?.getEditors()) {
            monacoEditorDisposer.dispose();
            return;
        }
        const monacoEditorContent = editor.getValue();
        store.setState({
            monacoEditorContent
        });
    });

    const monacoEditorContent = editor.getValue();
    store.setState({
        monacoEditorContent,
        monacoEditorDisposer
    });
}

export const observe = new Observe(
    observeEditedContent,
    observeEditedTab,
    observeMetadataSection,
    observeOriginalContent,
    observeOriginalTab,
    observeResponseEditButton,
    observeSaveButton,
    observeSnoozeButton,
    observeSubmitButton,
    observeMonacoTestEditor
);

import { insertDiffElement, insertDiffToggles, removeDiffElement } from './elements';
import { formatMessages, determineWarnings, log, waitForElement } from './helpers';
import {
  observeResponseEditButton,
  observeEditedContent,
  observeSubmitButton
} from './observers';

import {
  DiffViewState,
  getDiffViewState,
  getEditedContent,
  getOriginalContent,
  resetStore,
  setConversationOpen,
  setCurrentTab,
  setDiffTabInserted,
  setDiffViewState,
  setEditedContent,
  setOriginalContent,
  Tab
} from './store';
import { elementStore } from './elementStore';
import { observerStore, resetObserverStore } from './observerStore';
import { resetListenerStore } from './listenerStore';

export function handleConversationSubmit(e: Event) {
  e.preventDefault();
  e.stopImmediatePropagation();
  log('debug', 'Attempting to submit conversation...');

  const messages = determineWarnings();
  log('debug', `Found ${messages.length} issues.`);
  const prefix =
    'Are you sure you want to submit? The following issues were detected:\n\n';
  const suffix = 'Click OK to submit anyway or Cancel to cancel the submission.';
  const conversationButton = elementStore.getState().submitButtonElement;

  if (!conversationButton) {
    log('error', 'Conversation submit button not found.');
    return;
  }

  log('debug', 'Conversation submit button found.');

  if (messages.length > 0) {
    const formattedMessages = formatMessages(messages).join('');
    if (confirm(prefix + formattedMessages + suffix)) {
      log('debug', 'Conversation submit confirmed. Removing listener.');
      conversationButton.removeEventListener('click', handleConversationSubmit);
      log('debug', 'Clicking conversation submit button.');
      conversationButton.click();
    } else {
      log('debug', 'Conversation submit cancelled.');
    }
  } else {
    log('debug', 'No issues detected, submitting conversation.');
    conversationButton.removeEventListener('click', handleConversationSubmit);
    conversationButton.click();
  }
}

export async function handleResponseEditButtonClicked(e: Event) {
  log('debug', 'Response edit button clicked.');
  const editedTab = await waitForElement(
    () => elementStore.getState().editedTabElement
  );
  const originalTab = await waitForElement(
    () => elementStore.getState().originalTabElement
  );
  const saveButton = await waitForElement(
    () => elementStore.getState().saveButtonElement
  );

  editedTab.addEventListener('click', e => handleTabClicked(e, 'edited'));
  originalTab.addEventListener('click', e => handleTabClicked(e, 'original'));
  // when the save button is clicked, the edit view closes, so we need to reset the
  // state of the diff tab as well as re-add the listener for the edit button that is
  // re-added to the DOM
  saveButton.addEventListener('click', async e => {
    setDiffTabInserted(false);
    setDiffViewState(DiffViewState.CLOSED);
    const newResponseEditButton = await waitForElement(
      () => elementStore.getState().editButtonElement
    );
    newResponseEditButton.addEventListener('click', handleResponseEditButtonClicked);
  });

  // The edited tab is open by default
  const nullEvent = new Event('');
  handleTabClicked(nullEvent, 'edited');
}

async function handleTabClicked(e: Event, tab: Tab) {
  if (e.type === 'click') {
    log('debug', tab === 'edited' ? 'Edited tab clicked.' : 'Original tab clicked.');
    setCurrentTab(tab);
  }

  removeDiffElement();

  if (tab === 'edited') {
    return;
  }

  const tabElement = await waitForElement(
    () => elementStore.getState().originalTabContentElement
  );

  if (!tabElement?.textContent) {
    log(
      'error',
      'Failed to retrieve tab content after the original content tab has been clicked.'
    );
    return;
  }

  setOriginalContent(tabElement.textContent);
  insertDiffToggles();
}

export function handleDiffToggleClicked(e: Event, state: DiffViewState) {
  const currentState = getDiffViewState();
  if (currentState !== DiffViewState.CLOSED) {
    removeDiffElement();
  }

  if (currentState === state) {
    setDiffViewState(DiffViewState.CLOSED);
    return;
  }

  const originalContent = getOriginalContent();
  const editedContent = getEditedContent();

  if (!editedContent || !originalContent) {
    log(
      'error',
      `Failed to get content for diff tab. Missing ${editedContent ? (originalContent ? 'both' : 'edited') : 'original'} content.`
    );
    return;
  }

  insertDiffElement(originalContent, editedContent, state);
}

function addObservers() {
  const addObserver = observerStore.getState().addObserver;

  addObserver(observeSubmitButton);
  addObserver(observeResponseEditButton);
  addObserver(observeEditedContent);
}

export async function handleConversationOpen() {
  log('info', 'New conversation detected.');

  setConversationOpen(true);
  addObservers();
}

export async function handleConversationClose() {
  log('info', 'Conversation closed.');

  resetObserverStore();
  resetListenerStore();
  resetStore();
  setConversationOpen(false);
}

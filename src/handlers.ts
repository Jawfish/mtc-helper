import { insertDiffElement, insertDiffToggles, removeDiffElement } from './elements';
import { formatMessages, determineWarnings, log, waitForElement } from './helpers';
import { addResponseEditButtonListener, addSubmitButtonListener } from './listeners';

import {
  DiffViewState,
  getDiffViewState,
  getEditedContent,
  getOriginalContent,
  resetStore,
  setConversationOpen,
  setCurrentTab,
  setDiffViewState,
  setEditedContent,
  setOriginalContent,
  Tab
} from './store';
import { elementStore } from './elementStore';

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
  const editedTab = await waitForElement(
    () => elementStore.getState().editedTabElement
  );
  const originalTab = await waitForElement(
    () => elementStore.getState().originalTabElement
  );

  if (!editedTab || !originalTab) {
    log(
      'error',
      'Failed to retrieve tab elements while handling response edit button click.'
    );
    return;
  }

  editedTab.addEventListener('click', e => handleTabClicked(e, 'edited'));
  originalTab.addEventListener('click', e => handleTabClicked(e, 'original'));

  // The edited tab is open by default
  const nullEvent = new Event('');
  handleTabClicked(nullEvent, 'edited');
}

export async function handleTabClicked(e: Event, tab: Tab) {
  if (e.type === 'click') {
    log('debug', tab === 'edited' ? 'Edited tab clicked.' : 'Original tab clicked.');
    setCurrentTab(tab);
  }

  removeDiffElement();

  if (tab === 'edited') {
    return;
  }

  // TODO: this can be replaced with a mutation observer to check for when the content changes
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

export async function handleConversationOpen() {
  log('info', 'New conversation detected.');
  setConversationOpen(true);
  addSubmitButtonListener();
  addResponseEditButtonListener();

  let contentElement = await waitForElement(
    () => elementStore.getState().responseElement
  );

  if (!contentElement.textContent) {
    log('error', 'Failed to retrieve conversation content.');
  } else {
    const content = contentElement.textContent?.slice(1);
    setEditedContent(content);
  }
}

export async function handleConversationClose() {
  log('info', 'Conversation closed.');
  resetStore();
}

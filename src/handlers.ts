import { insertDiffElement, insertDiffTab, removeDiffElement } from './elements';
import { formatMessages, determineWarnings, log, retry } from './helpers';
import { injectListener, injectListeners } from './listeners';
import {
  getConversationContent,
  getConversationSubmitButton,
  getEditedTab,
  getOriginalTab,
  getOriginalTabContent
} from './selectors';
import {
  getDiffOpen,
  getEditedContent,
  getOriginalContent,
  resetStore,
  setConversationOpen,
  setCurrentTab,
  setEditedContent,
  setOriginalContent,
  Tab
} from './store';

export function handleConversationSubmit(e: Event) {
  e.preventDefault();
  e.stopImmediatePropagation();
  log('debug', 'Attempting to submit conversation...');

  const messages = determineWarnings();
  log('debug', `Found ${messages.length} issues.`);
  const prefix =
    'Are you sure you want to submit? The following issues were detected:\n\n';
  const suffix = 'Click OK to submit anyway or Cancel to cancel the submission.';
  const conversationButton = getConversationSubmitButton();

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
  const editedTab = await retry('retrieving edited tab', () => getEditedTab());
  const originalTab = await retry('retrieving original tab', () => getOriginalTab());
  await retry(
    'removing metadata element in the conversation edit window after response button clicked',
    () => document.querySelector('h4')?.parentElement?.remove()
  );

  if (!editedTab || !originalTab) {
    log(
      'error',
      'Failed to retrieve tab elements while handling response edit button click.'
    );
    return;
  }

  injectListener(editedTab, 'Edited response tab', 'click', e =>
    handleTabClicked(e, 'edited')
  );
  injectListener(originalTab, 'Original response tab', 'click', e =>
    handleTabClicked(e, 'original')
  );

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

  try {
    // TODO: this can be replaced with a mutation observer to check for when the content changes
    const tabContent = await retry(
      'retrieving tab content after the original content tab has been clicked',
      () => getOriginalTabContent()
    );
    if (!tabContent) {
      throw new Error('No tab content found');
    }
    setOriginalContent(tabContent);
    insertDiffTab(handleDiffTabClicked);
  } catch (error) {
    log('error', `Failed to get tab content: ${(error as Error).message}`);
  }
}

export function handleDiffTabClicked(e: Event) {
  if (getDiffOpen()) {
    removeDiffElement();
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

  insertDiffElement(originalContent, editedContent);
}

export async function handleConversationOpen() {
  log('info', 'New conversation detected.');
  setConversationOpen(true);

  try {
    let content = await retry(
      'retrieving conversation content while handing conversation open event',
      () => getConversationContent()
    );
    if (!content) {
      throw new Error('No conversation content found');
    }

    setEditedContent(content);
  } catch (error) {
    console.error('Failed to get content:', error);
  }

  injectListeners();
}

export async function handleConversationClose() {
  log('info', 'Conversation closed.');
  resetStore();
}

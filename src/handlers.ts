import { insertDiffElement, insertDiffTab, removeDiffElement } from './elements';
import { formatMessages, getResponseStatusMessages, log } from './helpers';
import { injectListener, injectListeners } from './listeners';
import {
  getConversationSubmitButton,
  getEditedTab,
  getOriginalTab,
  getTabContainer,
  getTabContent
} from './selectors';
import {
  getDiffOpen,
  getDiffTabInserted,
  getEditedContent,
  getOriginalContent,
  resetStore,
  setConversationOpen,
  setCurrentTab,
  setEditedContent,
  setOriginalContent
} from './store';

export function handleConversationSubmit(e: Event) {
  e.preventDefault();
  e.stopImmediatePropagation();
  log('debug', 'Attempting to submit conversation...');

  const messages = getResponseStatusMessages();
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

export function handleResponseEditButtonClicked(e: Event) {
  injectListener(getEditedTab, 'Edited response tab', 'click', e =>
    handleTabClicked(e, 'edited')
  );
  injectListener(getOriginalTab, 'Original response tab', 'click', e =>
    handleTabClicked(e, 'original')
  );

  // The edited tab is open by default
  const nullEvent = new Event('');
  handleTabClicked(nullEvent, 'edited');
}

export async function handleTabClicked(e: Event, tab: 'edited' | 'original') {
  if (e.type === 'click') {
    log('debug', tab === 'edited' ? 'Edited tab clicked.' : 'Original tab clicked.');
  }

  removeDiffElement();

  const tabContent = await getTabContent(tab);

  if (!tabContent) {
    log('error', 'Failed to get tab content.');
  } else if (tab === 'original') {
    setCurrentTab('original');
    setOriginalContent(tabContent);
    if (!getDiffTabInserted()) {
      insertDiffTab(getTabContainer, handleDiffTabClicked);
    }
  }
}

export function handleDiffTabClicked(e: Event) {
  if (!getOriginalContent() || !getEditedContent()) {
    log(
      'error',
      `Failed to get content for diff tab. Missing ${getOriginalContent() ? (getEditedContent() ? 'both' : 'edited') : 'original'} content.`
    );
    return;
  }

  if (getDiffOpen()) {
    removeDiffElement();
    return;
  }

  insertDiffElement(getOriginalContent(), getEditedContent());
}

export async function handleConversationOpen() {
  log('info', 'New conversation detected.');
  setConversationOpen(true);

  // wait for the DOM element to be available
  const getContent = async () => {
    return new Promise<string>((resolve, reject) => {
      let intervalId: number;

      const checkElement = () => {
        const element = document.querySelectorAll('div.rounded-xl')[1];
        if (element) {
          clearInterval(intervalId);
          resolve(element.textContent || '');
        }
      };

      // check immediately, then every 100ms
      checkElement();
      intervalId = setInterval(checkElement, 100);

      setTimeout(() => {
        clearInterval(intervalId);
        reject(new Error('Element not found within timeout'));
      }, 10000);
    });
  };

  try {
    let content = await getContent();
    // remove very first character, which is the response number
    content = content.slice(1);
    setEditedContent(content);
  } catch (error) {
    console.error('Failed to get content:', error);
  }

  injectListeners();
}

export async function handleConversationClose() {
  resetStore();
}

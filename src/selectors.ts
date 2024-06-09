import { log, poll } from './helpers';
import { getConversationOpen } from './store';

export function getQaFeedbackSection(): HTMLElement | null {
  return getSendCaseButton()?.parentElement?.parentElement ?? null;
}

/**
 * Get the conversation submit button from a QA task. Returns null if not found.
 */
export function getConversationSubmitButton(): HTMLButtonElement | null {
  log('debug', 'Getting conversation submit button...');
  const span = Array.from(document.querySelectorAll('span')).find(span =>
    span.textContent?.trim()?.includes('Submit QA Task')
  );

  return span?.parentElement as HTMLButtonElement | null;
}

export async function getConversationSubmitButtonAsync(
  timeout: number = 10000
): Promise<HTMLButtonElement> {
  const findButton = async (): Promise<HTMLButtonElement | null> =>
    getConversationSubmitButton();

  return poll(findButton, 100, timeout);
}

/**
 * Get the response code from the QA task. Throws an error if not found within the timeout.
 * @returns {string} A promise that resolves with the response code as a string.
 */
export function getResponseCode(): string | null {
  log('debug', 'Getting response code...');
  const contentElement: HTMLElement | null = document.querySelector(
    'div.rounded-xl pre code'
  );

  if (!contentElement) {
    log('error', 'Failed to get response code');
    return null;
  }

  log('debug', `Found response code: ${contentElement.textContent}`);
  return contentElement.textContent;
}

// const hasMultipleCodeBlocks = () =>
//     document.querySelectorAll("div.rounded-xl pre code")?.length > 1;

/**
 * Get the snooze button from the page. Used as a cheap way to detect if a conversation
 * is open.
 */
export function getSnoozeButton(): HTMLButtonElement | null {
  return document.querySelector("button[title='Snooze']") ?? null;
}

function getSendCaseButton(): HTMLButtonElement | null {
  return (
    Array.from(document.querySelectorAll('button')).find(
      button => button.textContent === 'Send case to'
    ) ?? null
  );
}

/**
 * Get the alignment score from the page.
 */
export function getAlignmentScore(): number | null {
  const span = Array.from(document.querySelectorAll('span')).find(
    span => span.textContent?.trim() === 'Alignment %'
  );

  if (!span) {
    return null;
  }

  const scoreText = span.parentElement?.textContent?.split(':')[1]?.trim() ?? '-1';
  return parseInt(scoreText, 10);
}

/**
 * Get the response edit button. Throws an error if not found within the timeout.
 * @param {number} [timeout=10000] - The timeout in milliseconds.
 * @returns {Promise<HTMLButtonElement>} A promise that resolves with the response edit button.
 */
export async function getResponseEditButton(
  timeout: number = 10000
): Promise<HTMLButtonElement> {
  const findEditButton = async (): Promise<HTMLButtonElement | null> => {
    const buttons = Array.from(document.querySelectorAll("button[title='Edit']"));
    return (buttons[1] as HTMLButtonElement) ?? null;
  };

  return poll(findEditButton, 100, timeout);
}

export async function getTabContainer(
  timeout: number = 10000
): Promise<HTMLDivElement | null> {
  const findTabContainer = async (): Promise<HTMLDivElement | null> =>
    (Array.from(
      document.querySelectorAll("div[data-cy='tabsHeaderContainer']")
    )[1] as HTMLDivElement) ?? null;

  return poll(findTabContainer, 100, timeout);
}

/**
 * Get the edited tab. Throws an error if not found within the timeout.
 * @param {number} [timeout=10000] - The timeout in milliseconds.
 * @returns {Promise<HTMLDivElement>} A promise that resolves with the edited tab.
 */
export async function getEditedTab(timeout: number = 10000): Promise<HTMLDivElement> {
  const findEditedTab = async (): Promise<HTMLDivElement | null> => {
    const element = (document.getElementById('1') as HTMLDivElement) ?? null;
    return element;
  };

  return poll(findEditedTab, 100, timeout);
}

/**
 * Get the original tab. Throws an error if not found within the timeout.
 * @param {number} [timeout=10000] - The timeout in milliseconds.
 * @returns {Promise<HTMLDivElement>} A promise that resolves with the original tab.
 */
export async function getOriginalTab(timeout: number = 10000): Promise<HTMLDivElement> {
  const findOriginalTab = async (): Promise<HTMLDivElement | null> => {
    const element = (document.getElementById('2') as HTMLDivElement) ?? null;
    return element;
  };

  return poll(findOriginalTab, 100, timeout);
}

export async function getTabContent(
  tab: 'edited' | 'original',
  timeout: number = 10000
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    let intervalId: number;

    const checkContent = () => {
      if (!getConversationOpen()) {
        clearInterval(intervalId);
        log('debug', 'Conversation is closed, cancelling diff tab insertion');
        reject(new Error('Conversation is closed, cancelling diff tab insertion'));
        return;
      }
      const tabs = document.querySelectorAll("div[data-cy='tab']");
      const content =
        tab === 'edited'
          ? document.querySelector("div[contenteditable='true']")?.textContent
          : tabs[tabs.length - 1].textContent;
      if (content) {
        clearInterval(intervalId);
        resolve(content);
      }
    };

    // check immediately, then every 100ms
    // checkContent();
    intervalId = setInterval(checkContent, 100);

    setTimeout(() => {
      clearInterval(intervalId);
      resolve(null);
    }, timeout);
  });
}

export function getTabContentParentElement() {
  return document.querySelectorAll("div[data-cy='tab']")[1] as HTMLDivElement | null;
}

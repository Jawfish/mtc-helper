/**
 * @file selectors.ts
 * @description This file contains functions that are used to select elements from the
 * DOM. These are the lowest-level synchronous functions that are used to retrieve
 * elements from the page.
 *
 * The convention for the selectors within this file is to return the element if found
 * and throw an error if not found.
 */

import { log } from './helpers';
import { getConversationOpen, Tab } from './store';

/**
 * Get the send case button from the page. Throws an error if not found.
 * @returns {HTMLButtonElement} The send case button.
 */
export function getQaFeedbackSection(): HTMLElement {
  try {
    const element = getSendCaseButton()?.parentElement?.parentElement;
    if (!element) {
      throw new Error('QA feedback section not found');
    }
    return element;
  } catch (error) {
    throw new Error(`Failed to get QA feedback section: ${error}`);
  }
}

/**
 * Get the conversation submit button from a QA task. Throws an error if not found.
 * @returns {HTMLButtonElement} The conversation submit button.
 */
export function getConversationSubmitButton(): HTMLButtonElement {
  log('debug', 'Getting conversation submit button...');
  const span = Array.from(document.querySelectorAll('span')).find(span =>
    span.textContent?.trim()?.includes('Submit QA Task')
  );

  const button = span?.parentElement as HTMLButtonElement;

  if (!button) {
    throw new Error('Submit QA Task button not found');
  }

  return button;
}

/**
 * Get the conversation content from a QA task. Throws an error if not found.
 * @returns {string} The conversation content as a string.
 */
export function getConversationContent(): string {
  const element = document.querySelectorAll('div.rounded-xl')[1];
  if (!element) {
    throw new Error('Conversation element not found');
  }
  if (!element.textContent) {
    throw new Error('Conversation element was found but the content is empty');
  }

  // remove the first character which is the number of the response
  return element.textContent.slice(1);
}

/**
 * Get the response code from the QA task. Throws an error if not found.
 * @returns {string} The response code as a string.
 */
export function getResponseCode(): string {
  log('debug', 'Getting response code...');
  const contentElement: HTMLElement | null = document.querySelector(
    'div.rounded-xl.bg-pink-100 pre code'
  );

  if (!contentElement) {
    throw new Error('Response code not found');
  }
  if (!contentElement.textContent) {
    throw new Error('Response code element was found but the content is empty');
  }

  log('debug', `Found response code: ${contentElement.textContent}`);
  return contentElement.textContent;
}

// const hasMultipleCodeBlocks = () =>
//     document.querySelectorAll("div.rounded-xl pre code")?.length > 1;

function getSendCaseButton(): HTMLButtonElement {
  const buttons = document.querySelectorAll('button');
  if (buttons.length === 0) {
    throw new Error('No buttons found when trying to get send case button');
  }

  const sendCaseButton = Array.from(buttons).find(
    button => button.textContent === 'Send case to'
  );
  if (!sendCaseButton) {
    throw new Error('Send case button not found');
  }

  return buttons[0];
}

/**
 * Get the alignment score from the page. Throws an error if not found.
 * @returns {number} The alignment score as a number.
 */
export function getAlignmentScore(): number {
  const span = Array.from(document.querySelectorAll('span')).find(
    span => span.textContent?.trim() === 'Alignment %'
  );

  if (!span) {
    throw new Error('Alignment score element not found');
  }

  const scoreText = span.parentElement?.textContent?.split(':')[1]?.trim();
  if (!scoreText) {
    throw new Error(
      'Alignment score element was found but the score was not found in its content'
    );
  }

  return parseInt(scoreText, 10);
}

/**
 * Get the response edit button. Throws an error if not found.
 * @returns {HTMLButtonElement} The response edit button.
 */
export function getResponseEditButton(): HTMLButtonElement {
  const buttons: HTMLButtonElement[] = Array.from(
    document.querySelectorAll("button[title='Edit']")
  );

  if (buttons.length < 2) {
    throw new Error('Response edit button not found');
  }

  return buttons[1];
}

/**
 * Get the container for the tabs within the conversation window. Throws an error if not found.
 * @returns {HTMLDivElement} The tab container.
 */
export function getConversationTabContainer(): HTMLDivElement {
  const tabContainers = document.querySelectorAll("div[data-cy='tabsHeaderContainer']");

  if (!tabContainers) {
    throw new Error('No tab containers found');
  }

  if (tabContainers.length < 2) {
    throw new Error('Not enough tab containers found');
  }

  return tabContainers[1] as HTMLDivElement;
}

/**
 * Get the edited content's tab element. Throws an error if not found.
 * @returns {HTMLDivElement} The tab for the edited conversation content.
 */
export function getEditedTab(): HTMLDivElement {
  const element = document.getElementById('1');

  if (!element) {
    throw new Error('Edited tab not found');
  }

  return element as HTMLDivElement;
}

/**
 * Get the original content's tab element. Throws an error if not found.
 * @returns {HTMLDivElement} The tab for the original conversation content.
 */
export function getOriginalTab(): HTMLDivElement {
  const element = document.getElementById('2');

  if (!element) {
    throw new Error('Original tab not found');
  }

  return element as HTMLDivElement;
}

/**
 * Get the tab content for the specified tab. Throws an error if the conversation is
 * closed, the tabs can't be found, or the tab content is empty.
 * @returns {string} The content of the tab.
 */
export function getOriginalTabContent(): string {
  const element = document.querySelector("div[data-cy='tab'] > div");

  if (!element) {
    throw new Error('Original tab content not found');
  }
  if (element?.getAttribute('contenteditable') === 'true') {
    throw new Error(
      'Tried to get original tab content but found an editable field, indicating that it is not from the original tab'
    );
  }
  if (!element.textContent) {
    throw new Error('Original tab content was found but the content is empty');
  }

  return element.textContent;
}

/**
 * Get the parent element for the tab content. Throws an error if not found.
 * @returns {HTMLDivElement} The parent element for the tab content.
 */
export function getTabContentParentElement(): HTMLDivElement {
  const tabs = document.querySelectorAll("div[data-cy='tab']");

  if (!tabs) {
    throw new Error('No tabs found when trying to get tab content parent element');
  }
  if (tabs.length < 2) {
    throw new Error(
      'Not enough tabs found when trying to get tab content parent element'
    );
  }

  return tabs[tabs.length - 1] as HTMLDivElement;
}

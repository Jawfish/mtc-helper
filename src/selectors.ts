/**
 * @file selectors.ts
 * @description This file contains functions that are used to select elements from the
 * DOM. These are the lowest-level synchronous functions that are used to retrieve
 * elements from the page.
 *
 * The convention for the selectors within this file is to return the element if found
 * or undefined if not found.
 */

import { log } from './helpers';

/**
 * Select the QA feedback section element (the section that contains the feedback, send case button, submit QA result button, etc.)
 * @returns {(HTMLElement|undefined)} The send case button if found, otherwise `undefined`.
 */
export const selectFeedbackSectionElement = (): HTMLElement | undefined =>
  Array.from(document.querySelectorAll('button')).find(
    button => button.textContent === 'Send case to'
  )?.parentElement?.parentElement || undefined;

/**
 * Select the return target element from the feedback section, i.e. the Rework dropdown.
 * @returns {(Element|undefined)} The return element if found, otherwise `undefined`.
 */
export const selectReturnTargetElement = (): Element | undefined => {
  const feedbackSection = selectFeedbackSectionElement();
  if (!feedbackSection) {
    return undefined;
  }
  const children = feedbackSection.children;
  if (children.length < 3) {
    log('debug', 'Feedback section does not contain a return target');
    return undefined;
  }

  return children[2];
};

/**
 * Select the main conversation submission button element from a QA task.
 * @returns {(HTMLButtonElement|undefined)} The conversation submit button.
 */
export const selectSubmitButtonElement = (): HTMLButtonElement | undefined => {
  const element = Array.from(document.querySelectorAll('span')).find(span =>
    span.textContent?.trim()?.includes('Submit QA Task')
  )?.parentElement;

  return element instanceof HTMLButtonElement ? element : undefined;
};

/**
 * Select the conversation's response element.
 * @returns {(Element|undefined)} The conversation response element.
 */
export const selectResponseElement = (): Element | undefined => {
  const conversationElements = Array.from(document.querySelectorAll('div.rounded-xl'));

  if (conversationElements.length < 2) {
    return undefined;
  }

  return conversationElements[1];
};

/**
 * Get the response code element from the QA task.
 * @returns {(Element|undefined)} The response code element.
 */
export const selectResponseCodeElement = (): Element | undefined =>
  document.querySelector('div.rounded-xl.bg-pink-100 pre code') || undefined;

// const hasMultipleCodeBlocks = () =>
//     document.querySelectorAll("div.rounded-xl pre code")?.length > 1;

/**
 * Get the alignment score element from the page.
 * @returns {(HTMLElement|undefined)} The alignment score element.
 */
export const selectScoreElement = (): HTMLElement | undefined =>
  Array.from(document.querySelectorAll('span')).find(
    span => span.textContent?.trim() === 'Alignment %'
  )?.parentElement || undefined;

/**
 * Select the response edit button.
 * @returns {(HTMLButtonElement|undefined)} The response edit button.
 */
export function selectEditButton(): HTMLButtonElement | undefined {
  const buttons: HTMLButtonElement[] = Array.from(
    document.querySelectorAll("button[title='Edit']")
  );

  if (buttons.length < 2) {
    return undefined;
  }

  return buttons[1];
}

/**
 * Get the container for the tabs within the conversation window.
 * @returns {HTMLDivElement} The tab container.
 */
export function selectTabContainerElement(): HTMLDivElement | undefined {
  const tabContainers: NodeListOf<HTMLDivElement> = document.querySelectorAll(
    "div[data-cy='tabsHeaderContainer']"
  );

  if (!tabContainers || tabContainers.length < 2) {
    return undefined;
  }

  return tabContainers[1];
}

/**
 * Get the edited content's tab element.
 * @returns  The tab for the edited conversation content.
 */
export const selectEditedTabElement = (): HTMLElement | undefined =>
  document.getElementById('1') || undefined;

/**
 * Get the original content's tab element.
 * @returns {HTMLElement} The tab for the original conversation content.
 */
export const selectOriginalTabElement = (): HTMLElement | undefined =>
  document.getElementById('2') || undefined;

/**
 * Get the tab content for the specified tab. Throws an error if the conversation is
 * closed, the tabs can't be found, or the tab content is empty.
 * @returns  The content of the tab.
 */
export function selectOriginalTabContentElement(): Element | undefined {
  const element = document.querySelector("div[data-cy='tab'] > div");

  if (!element) {
    return undefined;
  }

  // if the content is editable, then it's the edited tab, not the original tab
  if (element.getAttribute('contenteditable') === 'true') {
    return undefined;
  }

  return element;
}

/**
 * Get the parent element for the tab content. Throws an error if not found.
 * @returns The parent element for the tab content.
 */
export function selectTabContentParentelement(): Element | undefined {
  const tabs = document.querySelectorAll("div[data-cy='tab']");

  if (!tabs) {
    return undefined;
  }
  if (tabs.length < 2) {
    return undefined;
  }

  return tabs[tabs.length - 1];
}

/**
 * Select the snooze button element.
 * @returns {(Element|undefined)} The snooze button element.
 */
export const selectSnoozeButtonElement = (): Element | undefined =>
  document.querySelector("button[title='Snooze']") || undefined;

export const selectSaveButtonElement = (): HTMLButtonElement | undefined => {
  const element = Array.from(document.querySelectorAll('span')).find(
    span => span.textContent === 'Save'
  )?.parentElement;

  return (element as HTMLButtonElement) || undefined;
};

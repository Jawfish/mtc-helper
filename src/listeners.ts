import { handleConversationSubmit, handleResponseEditButtonClicked } from './handlers';
import { log, retry } from './helpers';
import { getConversationSubmitButton, getResponseEditButton } from './selectors';

export async function injectListener(
  element: HTMLElement,
  elementName: string,
  event: string,
  handler: (e: Event) => void
): Promise<void> {
  log('debug', `Adding ${event} listener for ${elementName}`);

  if (!element) {
    throw new Error(`Element not found: ${elementName}`);
  }

  element.addEventListener(event, handler);
  log('debug', `${event} listener added for ${elementName}`);
}

export async function injectListeners() {
  try {
    const conversationSubmitButton = await retry(
      'retrieving conversation submit button',
      () => getConversationSubmitButton()
    );
    if (!conversationSubmitButton) {
      throw new Error('Failed to retrieve button element to injecting listener on.');
    }
    injectListener(
      conversationSubmitButton,
      'conversation button',
      'click',
      handleConversationSubmit
    );
  } catch (error) {
    log(
      'error',
      `Error injecting listener for conversation submit button: ${(error as Error).message}`
    );
  }
  try {
    const responseEditButton = await retry('retrieving response edit button', () =>
      getResponseEditButton()
    );

    if (!responseEditButton) {
      throw new Error('Failed to retrieve button element to injecting listener on.');
    }

    injectListener(
      responseEditButton,
      'response edit button',
      'click',
      handleResponseEditButtonClicked
    );
  } catch (error) {
    log(
      'error',
      `Error injecting listeners for response edit button: ${(error as Error).message}`
    );
  }
}

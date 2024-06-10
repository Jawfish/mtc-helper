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
  const conversationSubmitButton = await retry(
    'retrieving conversation submit button',
    () => getConversationSubmitButton()
  );
  const responseEditButton = await retry('retrieving response edit button', () =>
    getResponseEditButton()
  );

  if (!conversationSubmitButton || !responseEditButton) {
    log(
      'error',
      'Failed to retrieve elements for injecting listeners on the conversation submit button and response edit button.'
    );
    return;
  }

  injectListener(
    conversationSubmitButton,
    'conversation button',
    'click',
    handleConversationSubmit
  );
  injectListener(
    responseEditButton,
    'response edit button',
    'click',
    handleResponseEditButtonClicked
  );
}

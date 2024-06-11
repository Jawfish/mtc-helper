import { handleConversationSubmit, handleResponseEditButtonClicked } from './handlers';
import { log, waitForElement } from './helpers';
import { elementStore } from './elementStore';

export async function addSubmitButtonListener() {
  log('debug', 'Waiting for conversation submit button...');
  const submitButton = await waitForElement(
    () => elementStore.getState().submitButtonElement
  );
  submitButton.addEventListener('click', handleConversationSubmit);
  log('info', 'Conversation submit button listener added.');
}

export async function addResponseEditButtonListener() {
  log('debug', 'Waiting for response edit button...');
  const responseButton = await waitForElement(
    () => elementStore.getState().editButtonElement
  );
  responseButton.addEventListener('click', handleResponseEditButtonClicked);
  log('info', 'Response edit button listener added.');
}

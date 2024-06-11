import { handleConversationSubmit, handleResponseEditButtonClicked } from './handlers';
import { log } from './helpers';
import {
  selectEditButton,
  selectMetadataSectionElement,
  selectResponseElement,
  selectSubmitButtonElement
} from './selectors';
import { listenerStore } from './listenerStore';
import { getEditedContent, setEditedContent, store } from './store';

export function observeSubmitButton(mutation: MutationRecord) {
  if (listenerStore.getState().submitButtonHasListener) {
    return;
  }

  // TODO: only perform this check if the state in the FSM is that the conversation window is open
  const submitButton = selectSubmitButtonElement();

  if (submitButton) {
    // no need to reset the listener state here, since the conversation closes after the submit
    // button is clicked
    submitButton.addEventListener('click', () => handleConversationSubmit);
    listenerStore.setState({ submitButtonHasListener: true });
    log('info', 'Conversation submit button listener added.');
  }
}

export function observeResponseEditButton(mutation: MutationRecord) {
  if (listenerStore.getState().responseEditButtonHasListener) {
    return;
  }

  // TODO: only perform this check if the state in the FSM is that the conversation window is open
  const responseButton = selectEditButton();
  if (responseButton) {
    responseButton.addEventListener('click', e => {
      // once the button is clicked, the element is removed, so reset the "added" state to false
      listenerStore.setState({ responseEditButtonHasListener: false });
      handleResponseEditButtonClicked(e);
    });
    listenerStore.setState({ responseEditButtonHasListener: true });
    log('info', 'Response edit button listener added.');
  }
}

export function observeEditedContent(mutation: MutationRecord) {
  if (store.getState().editedContent) {
    return;
  }

  const element = selectResponseElement();
  if (!element?.textContent) {
    return;
  }

  // remove the first character which is the number associated with the response
  const editedContent = element.textContent.slice(1);
  setEditedContent(editedContent);
}

// Remove the useless metadata section with the useless save button
export function observeMetadataSection(mutation: MutationRecord) {
  const element = selectMetadataSectionElement();
  if (!element) {
    return;
  }
  element.remove();
  log('debug', 'Metadata section removed.');
}

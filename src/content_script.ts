import './elements';
import './handlers';
import { handleConversationClose, handleConversationOpen } from './handlers';
import './helpers';
import { log } from './helpers';
import './listeners';
import './selectors';
import { getConversationOpen } from './store';

/**
 * Initializes the Orochi Helper by setting up a MutationObserver that checks for the
 * presence of the snooze button in the DOM on each mutation. This is used to determine
 * when a new conversation has been opened or closed.
 *
 * The MutationObserver callback uses a forEach loop to handle each mutation
 * synchronously. This is because the callback is triggered on each DOM change, so there
 * is no need to use `retry` or any other asynchronous operation.
 * @returns {void}
 */
function initializeOrochiHelper(): void {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      const convoOpen = getConversationOpen();
      const snoozeButton = document.querySelector("button[title='Snooze']");

      if (!snoozeButton) {
        if (convoOpen) {
          handleConversationClose();
          return;
        }

        log(
          'debug',
          'Snooze button not found and no conversation was open, ignoring DOM change.'
        );
        return;
      }

      if (!convoOpen) {
        handleConversationOpen();
        return;
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

initializeOrochiHelper();

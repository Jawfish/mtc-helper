import './elements';
import './handlers';
import { handleConversationClose, handleConversationOpen } from './handlers';
import './helpers';
import './listeners';
import './selectors';
import { getSnoozeButton } from './selectors';
import { getConversationOpen } from './store';

/**
 * Begin checking for the snooze button to appear in the DOM to determine when a new
 * conversation has been opened.
 */
function initializeOrochiHelper(): void {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(() => {
      if (getSnoozeButton() && !getConversationOpen()) {
        handleConversationOpen();
      } else if (!getSnoozeButton() && getConversationOpen()) {
        handleConversationClose();
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

initializeOrochiHelper();

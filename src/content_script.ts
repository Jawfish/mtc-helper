// import all the files that are needed to run the content script so that webpack can bundle them
import './elements';
import './handlers';
import './helpers';
import './observers';
import './store';
import './selectors';

import { log } from './helpers';
import { observe } from './observers';

/**
 * Initializes the Orochi Helper by setting up a MutationObserver that checks for the
 * presence of the snooze button in the DOM on each mutation. This is used to determine
 * when a new conversation has been opened or closed.
 *
 * The MutationObserver callback uses a forEach loop to handle each mutation
 * synchronously. This is because the callback is triggered on each DOM change, so there
 * is no need to use any asynchronous operations.
 * @returns
 */
function initializeOrochiHelper(): void {
  log('info', 'Orochi Helper initializing...');

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      observe.updateObservers(mutation);
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  log('info', 'Orochi Helper initialized.');
}

initializeOrochiHelper();

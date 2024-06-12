import { diffLines } from 'diff';
import {
  copyConversation,
  copyEmail,
  copyId,
  determineWarnings,
  isPython,
  log,
  logDiff
} from './helpers';

import { handleDiffToggleClicked } from './handlers';
import {
  selectSubmitButtonElement,
  selectTabContentParentelement as selectTabContentParentElement
} from './selectors';
import { DiffViewState, store } from './store';

export function insertDiffToggles(tabContainer: HTMLElement): void {
  log('debug', 'Inserting diff toggles');
  const diffLineToggle = document.createElement('div');
  const diffBlockToggle = document.createElement('div');

  diffLineToggle.className = 'tab hover:text-theme-main';
  diffBlockToggle.className = 'tab hover:text-theme-main';

  diffLineToggle.textContent = 'Toggle Diff (Lines)';
  diffBlockToggle.textContent = 'Toggle Diff (Blocks)';

  diffLineToggle.style.cursor = 'pointer';
  diffBlockToggle.style.cursor = 'pointer';

  diffLineToggle.addEventListener('click', e =>
    handleDiffToggleClicked(e, DiffViewState.LINES)
  );
  diffBlockToggle.addEventListener('click', e =>
    handleDiffToggleClicked(e, DiffViewState.BLOCKS)
  );

  tabContainer.appendChild(diffLineToggle);
  tabContainer.appendChild(diffBlockToggle);
}

export function insertDiffElement(
  originalContent: string,
  editedContent: string,
  state: DiffViewState
): void {
  logDiff(originalContent, editedContent);

  const diffViewState = store.getState().diffView;

  if (diffViewState === state) {
    log('warn', `Diff element already inserted with state ${state}`);
    return;
  }

  store.setState({ diffView: state });

  const diff = diffLines(originalContent, editedContent, {
    newlineIsToken: state === DiffViewState.LINES
  });

  const leftFragment = document.createDocumentFragment();
  const rightFragment = document.createDocumentFragment();
  const container = selectTabContentParentElement();

  if (!container) {
    log('error', 'Tab content element not found, unable to insert diff element');
    return;
  }

  diff.forEach(part => {
    const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
    const bgColor = part.added ? '#E3F4E4' : part.removed ? '#F7E8E9' : '#f8f9fa';

    const pre = document.createElement('pre');

    pre.style.color = color;
    pre.style.backgroundColor = bgColor;
    pre.textContent = part.value;

    if (part.added) {
      rightFragment.appendChild(pre);
    } else if (part.removed) {
      leftFragment.appendChild(pre);
    } else {
      leftFragment.appendChild(pre.cloneNode(true));
      rightFragment.appendChild(pre.cloneNode(true));
    }
  });

  const diffView = document.createElement('div');
  diffView.style.display = 'flex';
  diffView.id = 'diffView';

  const leftDiv = document.createElement('div');
  const rightDiv = document.createElement('div');

  leftDiv.style.width = '50%';
  rightDiv.style.width = '50%';

  leftDiv.appendChild(leftFragment);
  rightDiv.appendChild(rightFragment);

  diffView.appendChild(leftDiv);
  diffView.appendChild(rightDiv);

  container.prepend(diffView);
}

export function removeDiffElement(): void {
  log('debug', 'Removing diff element');
  store.setState({ diffView: DiffViewState.CLOSED });
  const diffView = document.getElementById('diffView');
  diffView?.parentNode?.removeChild(diffView);
}

// TODO: These buttons are ported functionality from bookmarklets. They're a bit hacked-together right now and the code can be cleaned up, but they work fine.
export function insertCheckButton(): void {
  log('debug', 'Inserting check button');
  const checkButton = document.createElement('button');
  const submitButton = selectSubmitButtonElement();
  const span = document.createElement('span');

  span.textContent = 'Check Task';
  checkButton.className = submitButton?.className || '';
  checkButton.addEventListener('click', () => {
    log('debug', 'Check button clicked');
    const messages = determineWarnings();
    if (messages.length === 0) {
      alert('No issues detected.');
      return;
    }
    alert(messages.join('\n'));
  });
  checkButton.appendChild(span);

  const toolbar = store.getState().orochiToolbarElement;
  if (!toolbar) {
    log('error', 'Orochi toolbar not found while inserting check button');
    return;
  }

  toolbar.appendChild(checkButton);
}

export function insertConvoCopyButton(): void {
  log('debug', 'Inserting conversation copy button');
  const copyButton = document.createElement('button');
  const submitButton = selectSubmitButtonElement();
  const span = document.createElement('span');

  span.textContent = 'Copy Conversation';
  copyButton.className = submitButton?.className || '';
  copyButton.addEventListener('click', () => {
    log('debug', 'Copy button clicked');
    copyConversation();
  });
  copyButton.appendChild(span);

  const toolbar = store.getState().orochiToolbarElement;
  if (!toolbar) {
    log('error', 'Orochi toolbar not found while inserting copy convo button');
    return;
  }

  toolbar.appendChild(copyButton);
}

export function insertCopyIdButton(): void {
  log('debug', 'Inserting copy ID button');
  const copyIdButton = document.createElement('button');
  const submitButton = selectSubmitButtonElement();
  const span = document.createElement('span');

  span.textContent = 'Copy ID';
  copyIdButton.className = submitButton?.className || '';
  copyIdButton.addEventListener('click', () => {
    log('debug', 'Copy ID button clicked');
    copyId();
  });
  copyIdButton.appendChild(span);

  const toolbar = store.getState().orochiToolbarElement;
  if (!toolbar) {
    log('error', 'Orochi toolbar not found while inserting copy ID button');
    return;
  }

  toolbar.appendChild(copyIdButton);
}

export function insertCopyEmailButton(): void {
  log('debug', 'Inserting copy email button');
  const copyEmailButton = document.createElement('button');
  const submitButton = selectSubmitButtonElement();
  const span = document.createElement('span');

  span.textContent = 'Copy Email';
  copyEmailButton.className = submitButton?.className || '';
  copyEmailButton.addEventListener('click', () => {
    log('debug', 'Copy email button clicked');
    copyEmail();
  });
  copyEmailButton.appendChild(span);

  const toolbar = store.getState().orochiToolbarElement;
  if (!toolbar) {
    log('error', 'Orochi toolbar not found while inserting copy email button');
    return;
  }

  toolbar.appendChild(copyEmailButton);
}

/**
 * Inserts a toolbar that is always visible at the top of the page and on top of all other elements.
 */
export function insertOrochiHelperToolbar(): void {
  log('debug', 'Inserting Orochi Helper toolbar');
  const toolbar = document.createElement('div');

  toolbar.id = 'orochiToolbar';
  toolbar.style.position = 'fixed';
  toolbar.style.top = '0';
  toolbar.style.left = '50%';
  toolbar.style.transform = 'translateX(-50%)';
  toolbar.style.display = 'flex';
  toolbar.style.gap = '1em';
  toolbar.style.backgroundColor = '#FFFFFFCC';
  toolbar.style.borderBottomLeftRadius = '0.5em';
  toolbar.style.borderBottomRightRadius = '0.5em';
  toolbar.style.backdropFilter = 'blur(2px)';
  toolbar.style.boxShadow = '0 0 1em 0.5em #00000022';
  toolbar.style.padding = '1em';
  toolbar.style.flexDirection = 'row';
  toolbar.style.justifyContent = 'center';
  toolbar.style.alignItems = 'center';
  toolbar.style.width = 'auto';
  toolbar.style.zIndex = '1000';

  store.setState({ orochiToolbarElement: toolbar });

  document.body.appendChild(toolbar);
  if (isPython()) {
    insertConvoCopyButton();
  }
  // TODO: make these take the toolbar and their styles as an argument
  insertCopyIdButton();
  insertCopyEmailButton();
  insertCheckButton();
}

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
  const sxsDiffToggle = document.createElement('div');

  diffLineToggle.className = 'tab hover:text-theme-main';
  diffBlockToggle.className = 'tab hover:text-theme-main';
  sxsDiffToggle.className = 'tab hover:text-theme-main';

  diffLineToggle.textContent = 'Toggle Diff (Lines)';
  diffBlockToggle.textContent = 'Toggle Diff (Blocks)';
  sxsDiffToggle.textContent = 'Open SxS Diff';

  diffLineToggle.style.cursor = 'pointer';
  diffBlockToggle.style.cursor = 'pointer';
  sxsDiffToggle.style.cursor = 'pointer';

  diffLineToggle.addEventListener('click', e =>
    handleDiffToggleClicked(e, DiffViewState.LINES)
  );
  diffBlockToggle.addEventListener('click', e =>
    handleDiffToggleClicked(e, DiffViewState.BLOCKS)
  );
  sxsDiffToggle.addEventListener('click', e => {
    const originalContent = store.getState().originalContent;
    const editedContent = store.getState().editedContent;
    openDiffModal(originalContent, editedContent, DiffViewState.LINES);
  });

  tabContainer.appendChild(diffLineToggle);
  tabContainer.appendChild(diffBlockToggle);
  tabContainer.appendChild(sxsDiffToggle);
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
  const fragment = document.createDocumentFragment();
  const container = selectTabContentParentElement();

  if (!container) {
    log('error', 'Tab content element not found, unable to insert diff element');
    return;
  }

  diff.forEach(part => {
    if (part.value.trim() === '') {
      return;
    }

    part.value = part.value.replace(/^\s*[\r\n]+|[\r\n]+\s*$/g, '');

    const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
    const bgColor = part.added ? '#E3F4E4' : part.removed ? '#F7E8E9' : '#f8f9fa';

    const pre = document.createElement('pre');

    pre.style.color = color;
    pre.style.margin = '0';
    pre.style.padding = '0';
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.backgroundColor = bgColor;
    pre.textContent = part.value;

    fragment.appendChild(pre);
  });

  const diffView = document.createElement('div');
  diffView.id = 'diffView';
  diffView.appendChild(fragment);
  container.prepend(diffView);
}

export function openDiffModal(
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

  diff.forEach(part => {
    part.value = part.value.replace(/^\s*[\r\n]+|[\r\n]+\s*$/g, '');
    if (part.value.trim() === '') {
      return;
    }

    let color = part.added ? 'green' : part.removed ? 'red' : 'grey';
    let bgColor = part.added ? '#E3F4E4' : part.removed ? '#F7E8E9' : '#f8f9fa';
    const pre = document.createElement('pre');

    pre.style.color = color;
    pre.style.backgroundColor = bgColor;
    pre.style.whiteSpace = 'pre-wrap';
    pre.textContent = part.value;
    pre.style.margin = '0';
    pre.style.padding = '0';

    if (part.added) {
      leftFragment.appendChild(pre);
    } else if (part.removed) {
      rightFragment.appendChild(pre);
    } else {
      rightFragment.appendChild(pre.cloneNode(true));
      leftFragment.appendChild(pre.cloneNode(true));
    }
  });

  const diffView = document.createElement('div');
  diffView.style.display = 'flex';

  const leftDiv = document.createElement('div');
  const rightDiv = document.createElement('div');

  leftDiv.style.width = '50%';
  rightDiv.style.width = '50%';

  leftDiv.appendChild(leftFragment);
  rightDiv.appendChild(rightFragment);

  diffView.appendChild(leftDiv);
  diffView.appendChild(rightDiv);

  // Create a modal with a close button
  const modal = document.createElement('div');
  modal.style.display = 'block';
  modal.style.position = 'fixed';
  modal.style.zIndex = '1';
  modal.style.left = '0';
  modal.style.top = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.overflow = 'auto';
  modal.style.backgroundColor = 'rgba(0,0,0,0.4)';

  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = '#fefefe';
  modalContent.style.margin = '15% auto';
  modalContent.style.padding = '20px';
  modalContent.style.border = '1px solid #888';
  modalContent.style.width = '80%';

  const closeButton = document.createElement('span');
  closeButton.textContent = 'x';
  closeButton.style.color = '#aaa';
  closeButton.style.float = 'right';
  closeButton.style.fontSize = '28px';
  closeButton.style.fontWeight = 'bold';
  closeButton.style.cursor = 'pointer';

  closeButton.onclick = function () {
    removeDiffElement();
  };
  modal.onclick = function (e) {
    if (e.target === modal) removeDiffElement();
  };

  modalContent.appendChild(closeButton);
  modalContent.appendChild(diffView);
  modal.appendChild(modalContent);

  // Append the modal to the document body
  modal.style.zIndex = '1000';
  modal.id = 'diffView';

  document.body.appendChild(modal);
}

export function removeDiffElement(): void {
  log('debug', 'Removing diff element');
  store.setState({ diffView: DiffViewState.CLOSED });
  const diffView = document.getElementById('diffView');
  diffView?.remove();
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

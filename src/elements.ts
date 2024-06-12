import { diffLines } from 'diff';
import {
  checkAlignmentScore,
  copyConversation,
  copyEmail,
  copyId,
  determineWarnings,
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
  submitButton?.parentElement?.prepend(checkButton);
  checkButton.appendChild(span);
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
  submitButton?.parentElement?.prepend(copyButton);
  copyButton.appendChild(span);
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
  submitButton?.parentElement?.prepend(copyIdButton);
  copyIdButton.appendChild(span);
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
  submitButton?.parentElement?.prepend(copyEmailButton);
  copyEmailButton.appendChild(span);
}

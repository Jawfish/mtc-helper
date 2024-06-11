import { diffLines } from 'diff';
import { log, waitForElement } from './helpers';

import {
  getConversationOpen,
  getDiffTabInserted as getDiffTogglesInserted,
  setDiffViewState,
  setDiffTabInserted as setDiffTogglesInserted,
  DiffViewState,
  getDiffViewState
} from './store';
import { elementStore } from './elementStore';
import { handleDiffToggleClicked } from './handlers';

export function insertDiffToggles() {
  if (getDiffTogglesInserted()) {
    log('warn', 'Diff toggles already inserted');
    return;
  }

  try {
    const tabContainer = elementStore.getState().tabContainerElement;
    if (!tabContainer) {
      log('error', 'Tab container not found, cancelling diff tab insertion');
      throw new Error('Tab container not found, cancelling diff tab insertion');
    }

    if (!getConversationOpen()) {
      log('error', 'No conversation, cancelling diff tab insertion');
      throw new Error('No conversation, cancelling diff tab insertion');
    }

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
    setDiffTogglesInserted(true);
  } catch (error) {
    log(
      'error',
      `Error getting tab container during diff tab insertion: ${(error as Error).message}`
    );
  }
}

export function insertDiffElement(
  originalContent: string,
  editedContent: string,
  state: DiffViewState
): void {
  log(
    'debug',
    `Inserting diff element
Original content:

${originalContent}

--------------------------------------------------------------------------------------

Edited content:
${editedContent}

--------------------------------------------------------------------------------------
`
  );

  const diffViewState = getDiffViewState();

  if (diffViewState === state) {
    log('warn', `Diff element already inserted with state ${state}`);
    return;
  }

  setDiffViewState(state);

  const diff = diffLines(originalContent, editedContent, {
    newlineIsToken: state === DiffViewState.LINES
  });
  const fragment = document.createDocumentFragment();
  const container = elementStore.getState().tabContentParentElement;

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
  setDiffViewState(DiffViewState.CLOSED);
  const diffView = document.getElementById('diffView');
  diffView?.parentNode?.removeChild(diffView);
}

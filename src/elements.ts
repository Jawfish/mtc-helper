import { diffLines } from 'diff';
import { log, retry } from './helpers';
import { getConversationTabContainer, getTabContentParentElement } from './selectors';
import {
  getConversationOpen,
  getDiffTabInserted,
  setDiffOpen,
  setDiffTabInserted
} from './store';

export async function insertDiffTab(onClick: (e: Event) => void): Promise<void> {
  if (getDiffTabInserted()) {
    log('warn', 'Diff tab already inserted');
    return;
  }

  try {
    const tabContainer = await retry(
      'retrieving conversation tab container while inserting diff tab',
      () => getConversationTabContainer()
    );
    if (!tabContainer) {
      log('error', 'Tab container not found, cancelling diff tab insertion');
      throw new Error('Tab container not found, cancelling diff tab insertion');
    }

    if (!getConversationOpen()) {
      log('error', 'No conversation, cancelling diff tab insertion');
      throw new Error('No conversation, cancelling diff tab insertion');
    }

    log('debug', 'Inserting diff tab');
    const diffTab = document.createElement('div');

    diffTab.className = 'tab hover:text-theme-main';
    diffTab.textContent = 'Toggle Diff';
    diffTab.style.cursor = 'pointer';
    diffTab.addEventListener('click', onClick);

    tabContainer.appendChild(diffTab);
    setDiffTabInserted(true);
  } catch (error) {
    log(
      'error',
      `Error getting tab container during diff tab insertion: ${(error as Error).message}`
    );
  }
}

export function insertDiffElement(
  originalContent: string,
  editedContent: string
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

  setDiffOpen(true);

  const diff = diffLines(originalContent, editedContent, {});
  const fragment = document.createDocumentFragment();
  const container = getTabContentParentElement();

  if (!container) {
    log('error', 'Tab content element not found, unable to insert diff element');
    return;
  }

  diff.forEach(part => {
    if (part.value === '\n' || part.value.trim() === '') {
      return;
    }

    const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
    const bgColor = part.added ? '#E3F4E4' : part.removed ? '#F7E8E9' : '#f8f9fa';

    const prefix = part.added ? '+ ' : part.removed ? '- ' : '';
    const style = document.createElement('style');
    const pre = document.createElement('pre');

    pre.style.color = color;
    pre.style.backgroundColor = bgColor;
    pre.textContent = prefix + part.value;
    pre.classList.add('diff-pre');

    document.head.append(style);
    fragment.appendChild(pre);
  });

  const diffView = document.createElement('div');
  diffView.id = 'diffView';
  diffView.appendChild(fragment);
  container.prepend(diffView);
}

export function removeDiffElement(): void {
  log('debug', 'Removing diff element');
  setDiffOpen(false);
  const diffView = document.getElementById('diffView');
  diffView?.parentNode?.removeChild(diffView);
}

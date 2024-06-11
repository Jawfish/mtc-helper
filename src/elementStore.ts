import { createStore } from 'zustand';
import {
  selectSnoozeButtonElement,
  selectTabContainerElement,
  selectEditedTabElement,
  selectOriginalTabElement,
  selectSubmitButtonElement,
  selectOriginalTabContentElement,
  selectResponseElement,
  selectResponseCodeElement,
  selectReturnTargetElement,
  selectScoreElement,
  selectEditButton,
  selectTabContentParentelement as selectTabContentParentElement
} from './selectors';
import { log } from './helpers';

type ElementStoreState = {
  snoozeButtonElement: Element | undefined;
  tabContainerElement: HTMLDivElement | undefined;
  editedTabElement: HTMLElement | undefined;
  originalTabElement: HTMLElement | undefined;
  submitButtonElement: HTMLButtonElement | undefined;
  editButtonElement: Element | undefined;
  originalTabContentElement: Element | undefined;
  responseElement: Element | undefined;
  responseCodeElement: Element | undefined;
  returnTargetElement: Element | undefined;
  scoreElement: HTMLElement | undefined;
  metadataElement: HTMLElement | undefined;
  tabContentParentElement: Element | undefined;
};

const initialElementStoreState: ElementStoreState = {
  snoozeButtonElement: undefined,
  tabContainerElement: undefined,
  editedTabElement: undefined,
  originalTabElement: undefined,
  submitButtonElement: undefined,
  editButtonElement: undefined,
  originalTabContentElement: undefined,
  responseElement: undefined,
  responseCodeElement: undefined,
  returnTargetElement: undefined,
  scoreElement: undefined,
  metadataElement: undefined,
  tabContentParentElement: undefined
};

export const elementStore = createStore<ElementStoreState>(() => ({
  ...initialElementStoreState
}));

export function updateElementStore() {
  elementStore.setState({
    snoozeButtonElement: selectSnoozeButtonElement(),
    tabContainerElement: selectTabContainerElement(),
    editedTabElement: selectEditedTabElement(),
    originalTabElement: selectOriginalTabElement(),
    submitButtonElement: selectSubmitButtonElement(),
    editButtonElement: selectEditButton(),
    originalTabContentElement: selectOriginalTabContentElement(),
    responseElement: selectResponseElement(),
    responseCodeElement: selectResponseCodeElement(),
    returnTargetElement: selectReturnTargetElement(),
    scoreElement: selectScoreElement(),
    metadataElement: document.querySelector('h4')?.parentElement || undefined,
    tabContentParentElement: selectTabContentParentElement()
  });

  const metadataElement = elementStore.getState().metadataElement;

  // remove the useless metadata with the useless save button
  if (metadataElement) {
    metadataElement.remove();
  }
}

export function resetElementStore() {
  elementStore.setState({ ...initialElementStoreState });
}

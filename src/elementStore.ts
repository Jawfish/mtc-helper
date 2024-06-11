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
  selectTabContentParentelement as selectTabContentParentElement,
  selectSaveButtonElement,
  selectMetadataSectionElement
} from './selectors';

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
  saveButtonElement: HTMLButtonElement | undefined;
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
  tabContentParentElement: undefined,
  saveButtonElement: undefined
};

export const elementStore = createStore<ElementStoreState>(() => ({
  ...initialElementStoreState
}));

// TODO: pub/sub - Have a list of listeners that are called when the DOM is updated. Those listeners
// can then conditionally check elements specific to them, do what they need to do if they haven't
// done it already, and unsubscribe themselves if they don't need to listen anymore. This would
// improve performance by not having to check all elements on every update. Also consider switching
// to a state machine, since so much stuff relies on the state of the conversation window.
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
    metadataElement: selectMetadataSectionElement(),
    tabContentParentElement: selectTabContentParentElement(),
    saveButtonElement: selectSaveButtonElement()
  });
}

export function resetElementStore() {
  elementStore.setState({ ...initialElementStoreState });
}

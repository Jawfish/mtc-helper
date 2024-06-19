import Logger from '@src/lib/logging';
import { selectSubmitButtonElement } from '@src/selectors/orochi';
import {
    selectTaskWindowCloseButton,
    selectTaskIdElement,
    selectTaskWindowElement
} from '@src/selectors/shared';
import { useContentStore } from '@src/store/ContentStore';
import { useMTCStore } from '@src/store/MTCStore';

/**
 * Handlers that satisfy this type will be  called by the MutationObserver on each
 * mutation where target.nodeType === Node.ELEMENT_NODE.
 *
 * These originally had selectors injected as an argument to help with testing. Given a
 * choice between mocking selectors and mocking the DOM, a mocked DOM that is structured
 * like the real DOM is more useful than fake selectors.
 *
 * Similarly, I used to inject the store as an argument to help with testing. However,
 * it's much simpler to just access the Zustand store directly. It can still be tested
 * simply by setting state in the Zustand store without even needing to mock it.
 *
 * TODO: look into creating selectors local to the mutation rather than the entire
 * document.
 */
export type MutHandler = (mutation: MutationRecord) => void;

export const addMtcHelperAttributeToElement = (element: HTMLElement | SVGElement) => {
    element.setAttribute('data-mtc-helper', 'true');
};

export const elementHasMtcHelperAttribute = (element: HTMLElement | SVGElement) => {
    return Boolean(element.attributes.getNamedItem('data-mtc-helper'));
};

export const handleAnyTaskWindowMutation: MutHandler = (mutation: MutationRecord) => {
    const windowElement = selectTaskWindowElement();
    const taskIdElement = selectTaskIdElement();

    if (windowElement) {
        if (elementHasMtcHelperAttribute(windowElement)) {
            return;
        }
        Logger.debug('Handling change in task window state.');

        addMtcHelperAttributeToElement(windowElement);
        useMTCStore.getState().setTaskOpen(true);
        useContentStore.getState().setTaskId(taskIdElement?.textContent || undefined);
    } else {
        useContentStore.getState().reset();
    }

    const state = Boolean(windowElement);
    const stateFromStore = useMTCStore.getState().taskOpen;

    if (state === stateFromStore) {
        return;
    }

    Logger.debug('Handling change in task window state.');
    useMTCStore.getState().setTaskOpen(Boolean(windowElement));
};

export const handleAnySubmitButtonMutation: MutHandler = (mutation: MutationRecord) => {
    const element = selectSubmitButtonElement();
    if (!element || elementHasMtcHelperAttribute(element)) {
        return;
    }

    Logger.debug('Handling change in submit button state.');
    addMtcHelperAttributeToElement(element);

    element.addEventListener('click', () => {
        useContentStore.getState().reset();
        useMTCStore.getState().setTaskOpen(false);
    });
};

export const handleAnyCloseButtonMutation: MutHandler = (mutation: MutationRecord) => {
    const buttonElement = selectTaskWindowCloseButton();
    if (!buttonElement) {
        return;
    }
    const seen = elementHasMtcHelperAttribute(buttonElement);
    if (seen) {
        return;
    }

    Logger.debug('Handling change in task window close button state.');
    addMtcHelperAttributeToElement(buttonElement);

    buttonElement.addEventListener('click', () => {
        useMTCStore.getState().setTaskOpen(false);
        useContentStore.getState().reset();
    });
};

import Logger from '@src/lib/logging';
import {
    selectTaskWindowCloseButton,
    selectTaskWindowElement,
    selectSubmitButtonElement
} from '@lib/selectors';
import { globalStore } from '@src/store/globalStore';

import {
    addMtcHelperAttributeToElement,
    elementHasMtcHelperAttribute,
    MutHandler
} from '.';

export const handleAnyTaskWindowMutation: MutHandler = (_target: Element) => {
    const windowElement = selectTaskWindowElement();

    if (windowElement) {
        // Sometimes there's a bit of a delay before the task ID is set in the DOM, so
        // check against that as well as the presence of the MTC helper attribute
        if (elementHasMtcHelperAttribute(windowElement)) {
            return;
        }
        Logger.debug('Handling change in task window state.');

        addMtcHelperAttributeToElement(windowElement);

        globalStore.setState({
            taskIsOpen: true
        });
    } else {
        // if the task window is not present, reset the content store because the task
        // was closed
        globalStore.getState().closeTask();
    }

    const state = Boolean(windowElement);
    const stateFromStore = globalStore.getState().taskIsOpen;

    if (state === stateFromStore) {
        return;
    }

    Logger.debug('Handling change in task window state.');
    globalStore.setState({
        taskIsOpen: state
    });
};

export const handleAnySubmitButtonMutation: MutHandler = (_target: Element) => {
    const element = selectSubmitButtonElement();
    if (!element || elementHasMtcHelperAttribute(element)) {
        return;
    }

    Logger.debug('Handling change in submit button state.');
    addMtcHelperAttributeToElement(element);

    element.addEventListener('click', () => {
        globalStore.getState().closeTask();
        globalStore.setState({
            taskIsOpen: false
        });
    });
};

export const handleAnyCloseButtonMutation: MutHandler = (_target: Element) => {
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
        globalStore.getState().closeTask();
        globalStore.setState({
            taskIsOpen: false
        });
    });
};

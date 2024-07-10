import { MutHandler } from '@handlers/index';
import Logger from '@lib/logging';
import { selectTaskWindowCloseButton } from '@lib/selectors';
import { globalStore } from '@src/store/globalStore';

import { elementHasMtcHelperAttribute, addMtcHelperAttributeToElement } from '..';

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

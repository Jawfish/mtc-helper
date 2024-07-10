import { MutHandler } from '@handlers/index';
import Logger from '@lib/logging';
import { selectSubmitButtonElement } from '@lib/selectors';
import { globalStore } from '@src/store/globalStore';

import { elementHasMtcHelperAttribute, addMtcHelperAttributeToElement } from '..';

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

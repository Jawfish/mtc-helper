import { MutHandler } from '@handlers/index';
import Logger from '@lib/logging';
import { globalStore } from '@src/store/globalStore';

import { elementHasMtcHelperAttribute, addMtcHelperAttributeToElement } from '..';

/**
 * Select the main task submission button element from a QA task.
 * @returns The task submit button element if found, otherwise `undefined`.
 */
const selectSubmitButtonElement = (): HTMLButtonElement | undefined => {
    const element = Array.from(document.querySelectorAll('span')).find(span =>
        span.textContent?.trim()?.includes('Submit QA Task')
    )?.parentElement;

    return element instanceof HTMLButtonElement ? element : undefined;
};

/**
 * Reset the state between tasks when the submit button is clicked. This is necessary
 * because the onMut_taskWindow_updateTaskOpenState handler's mutation does not fire
 * when a task is submitted, only when it is opened or closed.
 */
export const onMut_submitButton_updateTaskOpenState: MutHandler = (
    _target: Element
) => {
    const element = selectSubmitButtonElement();
    if (!element || elementHasMtcHelperAttribute(element)) {
        return;
    }

    Logger.debug('Handling change in submit button state.');
    addMtcHelperAttributeToElement(element);

    element.addEventListener('click', () => {
        globalStore.getState().closeTask();
    });
};

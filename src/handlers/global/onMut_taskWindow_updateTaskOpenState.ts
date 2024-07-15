import { MutHandler } from '@handlers/index';
import Logger from '@lib/logging';
import { globalStore } from '@src/store/globalStore';

import { elementHasMtcHelperAttribute, addMtcHelperAttributeToElement } from '..';

/**
 * Select the task window element that contains the conversation.
 * @returns The task window element if found, otherwise `undefined`.
 */
const selectTaskWindowElement = (): HTMLDivElement | undefined => {
    const taskWindow = document.querySelector(
        '#__next > div > div > div > div > div.fixed.top-0.left-0.flex.h-screen.w-screen.items-center.justify-center'
    );

    return taskWindow instanceof HTMLDivElement ? taskWindow : undefined;
};

export const onMut_taskWindow_updateTaskOpenState: MutHandler = (_target: Element) => {
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

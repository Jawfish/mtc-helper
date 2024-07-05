import { MutHandler } from '@handlers/index';
import Logger from '@src/lib/logging';
import { generalStore } from '@src/store/generalStore';

import { elementHasMtcHelperAttribute, addMtcHelperAttributeToElement } from '..';

import { selectAllEditResponseButtons } from './selectors';

/**
 * Handles the click event on the response edit button. This resets the state of the
 * store for non-Orochi processes when the button is clicked to prevent stale state once
 * the response is saved. This will not resolve issues where the state doesn't update
 * when it is edited, it's simply a protection against showing outdated information -
 * it's better to show no information or have an error than to show incorrect
 * information or silently act incorrectly.
 */
export const handleEditResponseButtonMutation: MutHandler = (_target: Element) => {
    const editResponseButtons = selectAllEditResponseButtons();
    if (!editResponseButtons.length) {
        return;
    }

    editResponseButtons.forEach(button => {
        const seen = elementHasMtcHelperAttribute(button);
        if (seen) {
            return;
        }

        addMtcHelperAttributeToElement(button);

        button.addEventListener('click', () => {
            Logger.debug('Handling click on general edit response button.');

            generalStore.getState().reset();
        });
    });
};

import { MutHandler } from '@handlers/types';
import Logger from '@src/lib/logging';
import { generalStore } from '@src/store/generalStore';

import { elementHasMtcHelperAttribute, addMtcHelperAttributeToElement } from '..';

import { selectAllGeneralEditResponseButtons } from './selectors';

export const handleGeneralEditResponseButtonMutation: MutHandler = (
    _target: Element
) => {
    const editResponseButtons = selectAllGeneralEditResponseButtons();
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

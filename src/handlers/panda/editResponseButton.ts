import { MutHandler } from '@handlers/types';
import Logger from '@src/lib/logging';
import { pandaStore } from '@src/store/pandaStore';

import { elementHasMtcHelperAttribute, addMtcHelperAttributeToElement } from '..';

import { selectAllPandaEditResponseButtons } from './selectors';

export const handlePandaEditResponseButtonMutation: MutHandler = (_target: Element) => {
    const editResponseButtons = selectAllPandaEditResponseButtons();
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
            Logger.debug('Handling click on panda edit response button.');

            pandaStore.setState({
                editedResponsePlaintext: undefined,
                originalResponsePlaintext: undefined
            });
        });
    });
};

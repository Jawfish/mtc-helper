import { Action } from '@src/mtc/MutationHandler';
import Logger from '@lib/logging';
import { globalStore, GlobalStoreState } from '@src/store/globalStore';

/**
 * Returns task open state based on the conversation window element. If the element
 * exists, the task is open. If the element is removed, the task is closed.
 *
 * @returns the current state with the task open state updated
 */
export const updateTaskOpenState: Action<GlobalStoreState> = ({ state, element }) => {
    if (element) {
        return { ...state, taskIsOpen: true };
    }

    return { ...state, taskIsOpen: false };
};

/**
 * Adds a listener to the task submit button to reset the state when the submit
 * button is clicked. This is necessary because the handler for checking the task
 * open state based on the conversation window does not fire when a task is
 * submitted, only when the window is opened or closed.
 *
 * This function is only called for its side effects.
 *
 * @returns always returns the current state with no changes
 */
export const addListenerToTaskSubmitButton: Action<GlobalStoreState> = ({
    state,
    element
}) => {
    const handleTaskSubmit = () => {
        globalStore.getState().closeTask();
        Logger.error('Removing listener from task submit button');
        element?.removeEventListener('click', handleTaskSubmit);
    };

    element?.addEventListener('click', handleTaskSubmit);

    return state;
};

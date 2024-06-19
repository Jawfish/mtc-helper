import { useCallback, useMemo } from 'react';
import { useToast } from '@src/contexts/ToastContext';
import { isValidUUID } from '@lib/textProcessing';
import { useGlobalStore } from '@src/store/globalStore';

import { useClipboard } from './useClipboard';

export function useTask() {
    const { copy } = useClipboard();
    const { notify } = useToast();
    const { operatorName, taskId } = useGlobalStore();

    const operatorEmail = useMemo(() => {
        if (!operatorName) return null;

        return `${operatorName}invisible.email`;
    }, [operatorName]);

    const copyTaskId = useCallback(async () => {
        if (!taskId || !isValidUUID(taskId)) {
            const err =
                'Task ID could not be found in a row from the task list. This may happen if the task list in the background updates and the task you are working on moves to the next page.';
            notify(err, 'error');

            return false;
        }
        try {
            await copy(taskId);
            notify('Task ID copied to clipboard.', 'success');
        } catch (error) {
            notify(`Error copying task ID: ${error}`, 'error');

            return false;
        }

        return true;
    }, [copy, notify, taskId]);

    const copyOperatorEmail = useCallback(async () => {
        if (!operatorEmail) {
            notify('Operator email could not be found.', 'error');

            return false;
        }
        try {
            await copy(operatorEmail);
            notify('Operator email copied to clipboard.', 'success');
        } catch (error) {
            notify(`Error copying operator email: ${error}`, 'error');

            return false;
        }

        return true;
    }, [copy, notify, operatorEmail]);

    return { taskId, copyTaskId, operatorEmail, copyOperatorEmail };
}

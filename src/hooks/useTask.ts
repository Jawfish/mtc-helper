import { useCallback } from 'react';
import { useToast } from '@src/contexts/ToastContext';
import { isValidUUID } from '@lib/textProcessing';

import { useClipboard } from './useClipboard';

const SELECTORS = {
    operatorName: '.MuiTypography-root.MuiTypography-body2.MuiTypography-noWrap',
    taskRow: 'tr',
    taskIdDiv: 'div[title]',
    inProgressButton: 'button:not(:disabled)'
};

const selectElement = <T extends HTMLElement>(selector: string): T | null => {
    const element = document.querySelector(selector);

    return element instanceof HTMLElement ? (element as T) : null;
};

const findTaskIdElement = (): HTMLDivElement | null => {
    const buttons = document.querySelectorAll<HTMLButtonElement>(
        SELECTORS.inProgressButton
    );
    for (const button of buttons) {
        const span = button.querySelector('span');
        if (span?.textContent?.includes('In Progress')) {
            const row = button.closest(SELECTORS.taskRow);
            if (row) {
                return row.querySelector<HTMLDivElement>(SELECTORS.taskIdDiv) || null;
            }
        }
    }

    return null;
};

export function useTask() {
    const { copy } = useClipboard();
    const { notify } = useToast();

    const copyToClipboard = useCallback(
        async (
            getValue: () => string | null,
            successMessage: string,
            errorPrefix: string
        ): Promise<boolean> => {
            try {
                const value = getValue();
                if (!value) {
                    throw new Error(`${errorPrefix} could not be found.`);
                }
                await copy(value);
                notify(successMessage, 'success');

                return true;
            } catch (error) {
                notify(
                    `${errorPrefix}: ${error instanceof Error ? error.message : String(error)}`,
                    'error'
                );

                return false;
            }
        },
        [copy, notify]
    );

    const copyTaskId = useCallback(
        () =>
            copyToClipboard(
                () => {
                    const taskId = findTaskIdElement()?.textContent ?? null;
                    if (!taskId || !isValidUUID(taskId)) {
                        throw new Error(
                            'Invalid or missing Task ID. The task list may have updated.'
                        );
                    }

                    return taskId;
                },
                'Task ID copied to clipboard.',
                'Error copying task ID'
            ),
        [copyToClipboard]
    );

    const copyOperatorEmail = useCallback(
        () =>
            copyToClipboard(
                () => {
                    const operatorName =
                        selectElement<HTMLParagraphElement>(SELECTORS.operatorName)
                            ?.textContent ?? null;
                    if (!operatorName) {
                        throw new Error('Operator name not found.');
                    }

                    return `${operatorName}invisible.email`;
                },
                'Operator email copied to clipboard.',
                'Error copying operator email'
            ),
        [copyToClipboard]
    );

    return { copyTaskId, copyOperatorEmail };
}

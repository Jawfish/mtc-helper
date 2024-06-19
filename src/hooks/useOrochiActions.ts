import { useCallback } from 'react';
import { useToast } from '@src/contexts/ToastContext';
import { useOrochiStore } from '@src/store/orochiStore';

import { useClipboard } from './useClipboard';

export function useOrochiActions() {
    const { copy } = useClipboard();
    const { notify } = useToast();

    const { editedCode, originalCode, tests, prompt, operatorNotes } = useOrochiStore();

    const copyEditedCode = useCallback(async () => {
        try {
            await copy(editedCode);
            notify('Edited code copied to clipboard.', 'success');
        } catch (error) {
            notify(`Error copying edited code: ${error}`, 'error');
        }
    }, [copy, notify, editedCode]);

    const copyOriginalCode = useCallback(async () => {
        try {
            await copy(originalCode);
            notify('Original code copied to clipboard.', 'success');
        } catch (error) {
            if ((error as Error).message === 'No text to copy') {
                notify(
                    'No original code found. The original code must be viewed before it can be copied.',
                    'error'
                );

                return;
            }
            notify(`Error copying original code: ${error}`, 'error');
        }
    }, [copy, notify, originalCode]);

    const copyPrompt = useCallback(async () => {
        try {
            await copy(prompt);
            notify('Prompt copied to clipboard.', 'success');
        } catch (error) {
            notify(`Error copying prompt: ${error}`, 'error');
        }
    }, [copy, notify, prompt]);

    const copyTests = useCallback(async () => {
        try {
            await copy(tests);
            notify('Tests copied to clipboard.', 'success');
        } catch (error) {
            notify(`Error copying tests: ${error}`, 'error');
        }
    }, [copy, notify, tests]);

    const copyOperatorNotes = useCallback(async () => {
        try {
            await copy(operatorNotes);
            notify('Operator notes copied to clipboard.', 'success');
        } catch (error) {
            notify(`Error copying operator notes: ${error}`, 'error');
        }
    }, [copy, notify, operatorNotes]);

    const copyAllAsPython = useCallback(async () => {
        const errors: string[] = [];
        const content = {
            prompt: prompt || 'prompt could not be found',
            code: editedCode || 'code could not be found',
            tests: tests || 'tests could not be found',
            reason: operatorNotes || 'operator reason could not be found'
        };

        Object.entries(content).forEach(([, value]) => {
            if (value.includes('could not be found')) {
                errors.push(value);
            }
        });

        try {
            const formattedContent = formatPythonConversation(
                content.prompt,
                content.code,
                content.tests,
                content.reason
            );
            await copy(formattedContent);

            if (errors.length === 4) {
                throw new Error(errors.join(', '));
            }

            if (errors.length > 0) {
                notify(`Copied, but ${errors.join(', ')}`, 'warning');
            } else {
                notify('Conversation copied', 'success');
            }
        } catch (err) {
            notify(`Error copying task: ${(err as Error).message}`, 'error');
        }
    }, [prompt, editedCode, tests, operatorNotes, copy, notify]);

    return {
        copyAllAsPython,
        copyEditedCode,
        copyOperatorNotes,
        copyPrompt,
        copyTests,
        copyOriginalCode
    };
}

const formatPythonConversation = (
    prompt: string,
    code: string,
    tests: string,
    operatorReason: string
) => {
    const formattedText = `
"""
${prompt}
"""

################################# REASON #################################

"""
${operatorReason}
"""

################################ RESPONSE ################################

${code}

################################# TESTS ##################################

${tests}`;

    return formattedText;
};

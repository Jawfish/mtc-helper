import { useCallback } from 'react';
import { useToast } from '@src/contexts/ToastContext';
import { useOrochiStore } from '@src/store/orochiStore';

import { useClipboard } from './useClipboard';

type CopyAction =
    | 'Edited Code'
    | 'Original Code'
    | 'Tests'
    | 'Prompt'
    | 'Operator Notes';

export function useOrochiActions() {
    const { copy } = useClipboard();
    const { notify } = useToast();
    const { editedCode, originalCode, tests, prompt, operatorNotes } = useOrochiStore();

    const copyContent = useCallback(
        async (content: string | null, action: CopyAction) => {
            if (!content) {
                notify(
                    `No ${action.toLowerCase()} found. The ${action.toLowerCase()} must be viewed before it can be copied.`,
                    'error'
                );

                return;
            }
            try {
                await copy(content);
                notify(`${action} copied to clipboard.`, 'success');
            } catch (error) {
                notify(`Error copying ${action.toLowerCase()}: ${error}`, 'error');
            }
        },
        [copy, notify]
    );

    const copyEditedCode = useCallback(
        () => copyContent(editedCode, 'Edited Code'),
        [copyContent, editedCode]
    );
    const copyOriginalCode = useCallback(
        () => copyContent(originalCode, 'Original Code'),
        [copyContent, originalCode]
    );
    const copyPrompt = useCallback(
        () => copyContent(prompt, 'Prompt'),
        [copyContent, prompt]
    );
    const copyTests = useCallback(
        () => copyContent(tests, 'Tests'),
        [copyContent, tests]
    );
    const copyOperatorNotes = useCallback(
        () => copyContent(operatorNotes, 'Operator Notes'),
        [copyContent, operatorNotes]
    );

    const copyAllAsPython = useCallback(async () => {
        const content = {
            prompt: prompt || 'prompt could not be found',
            code: editedCode || 'code could not be found',
            tests: tests || 'tests could not be found',
            operatorNotes: operatorNotes || 'operator notes could not be found'
        };

        const errors = Object.entries(content)
            .filter(([, value]) => value.includes('could not be found'))
            .map(
                ([key]) =>
                    `${key === 'operatorNotes' ? 'operator notes' : key} could not be found`
            );

        try {
            const formattedContent = formatPythonConversation(
                content.prompt,
                content.code,
                content.tests,
                content.operatorNotes
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
    operatorNotes: string
) => {
    return `
"""
${prompt}
"""

############################# OPERATOR NOTES #############################

"""
${operatorNotes}
"""

################################ RESPONSE ################################

${code}

################################# TESTS ##################################

${tests}`;
};

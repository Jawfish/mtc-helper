import { useCallback } from 'react';
import { useToast } from '@src/contexts/ToastContext';
import { useGeneralStore } from '@src/store/generalStore';

import { useClipboard } from './useClipboard';

type CopyAction = 'Operator Response' | 'Model Response' | 'Prompt';

export function useGeneralActions() {
    const { copy } = useClipboard();
    const { notify } = useToast();
    const { operatorResponseMarkdown, modelResponseMarkdown, prompt } =
        useGeneralStore();

    const copyContent = useCallback(
        async (content: string | undefined, action: CopyAction) => {
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

    const copyOperatorResponse = useCallback(
        () => copyContent(operatorResponseMarkdown, 'Operator Response'),
        [copyContent, operatorResponseMarkdown]
    );

    const copyModelResponse = useCallback(
        () => copyContent(modelResponseMarkdown, 'Model Response'),
        [copyContent, modelResponseMarkdown]
    );

    const copyPrompt = useCallback(
        () => copyContent(prompt, 'Prompt'),
        [copyContent, prompt]
    );

    return {
        copyOperatorResponse,
        copyModelResponse,
        copyPrompt
    };
}

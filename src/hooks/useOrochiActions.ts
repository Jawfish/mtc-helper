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
    const { operatorResponseCode, modelResponseCode, tests, prompt, operatorNotes } =
        useOrochiStore();

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

    const copyEditedCode = useCallback(
        () => copyContent(operatorResponseCode, 'Edited Code'),
        [copyContent, operatorResponseCode]
    );
    const copyOriginalCode = useCallback(
        () => copyContent(modelResponseCode, 'Original Code'),
        [copyContent, modelResponseCode]
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
            code: operatorResponseCode || 'code could not be found',
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
            const formattedContent = formatPythonConversation(content);
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
    }, [prompt, operatorResponseCode, tests, operatorNotes, copy, notify]);

    return {
        copyAllAsPython,
        copyEditedCode,
        copyOperatorNotes,
        copyPrompt,
        copyTests,
        copyOriginalCode
    };
}

type ConversationParts = {
    prompt: string;
    code: string;
    tests: string;
    operatorNotes: string;
};

type SectionType = 'commented' | 'uncommented';

const createSection = (title: string, content: string, type: SectionType): string => {
    const titleLength = title.length;
    const padding = Math.floor((86 - titleLength) / 2);

    let header = `${'#'.repeat(padding)} ${title} ${'#'.repeat(padding)}`;
    // add extra # if title is odd length; theoretically should only ever need 1 more,
    // but use .repeat to be sure
    if (header.length < 88) {
        header += '#'.repeat(88 - header.length);
    }
    const trimmedContent = content.trim();

    if (type === 'commented') {
        return [header, '', '"""', trimmedContent, '"""'].join('\n');
    } else {
        return [header, '', trimmedContent].join('\n');
    }
};

const formatPythonConversation = ({
    prompt,
    code,
    tests,
    operatorNotes
}: ConversationParts): string => {
    const sections: string[] = [];

    sections.push(createSection('PROMPT', prompt, 'commented'));

    // TODO: I don't like the string matching here
    if (operatorNotes !== 'operator notes could not be found' && operatorNotes.trim()) {
        sections.push(createSection('OPERATOR NOTES', operatorNotes, 'commented'));
    }

    sections.push(createSection('RESPONSE', code, 'uncommented'));
    sections.push(createSection('TESTS', tests, 'uncommented'));

    return sections.join('\n\n').trim();
};

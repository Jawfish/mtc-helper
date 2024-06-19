import { useCallback } from 'react';
import { useToast } from '@src/contexts/ToastContext';
import { codeContainsMarkdownFence, codeContainsHtml } from '@lib/textProcessing';
import Logger from '@lib/logging';
import { validatePython } from '@lib/validatePython';
import { checkAlignmentScore } from '@lib/checkAlignmentScore';
import { useOrochiStore } from '@src/store/orochiStore';

enum ValidationMessage {
    NO_CODE = 'No code found.',
    MARKDOWN_FENCE = 'Code block appears to be improperly opened or closed.',
    HTML_DETECTED = 'The bot response appears to contain HTML.',
    NO_ISSUES = 'No issues detected.'
}

const ALIGNMENT_SCORE_THRESHOLD = 85;

type NotificationStatus = 'success' | 'warning' | 'error';

export function useValidation() {
    const { notify } = useToast();
    const { editedCode, language } = useOrochiStore();

    const validateCode = useCallback(
        (code: string | null): string[] => {
            if (!code) {
                return [ValidationMessage.NO_CODE];
            }

            const messages = [
                ...(codeContainsMarkdownFence(code)
                    ? [ValidationMessage.MARKDOWN_FENCE]
                    : []),
                ...(language === 'python' ? validatePython(code) : []),
                checkAlignmentScore(ALIGNMENT_SCORE_THRESHOLD) ?? '',
                ...(codeContainsHtml(code) ? [ValidationMessage.HTML_DETECTED] : [])
            ].filter(Boolean);

            return messages;
        },
        [language]
    );

    const validateResponse = useCallback(() => {
        try {
            const messages = validateCode(editedCode);
            const messageText =
                messages.length > 0 ? messages.join('\n') : ValidationMessage.NO_ISSUES;
            const status: NotificationStatus =
                messages.length > 0 ? 'warning' : 'success';

            notify(messageText, status);
        } catch (error) {
            Logger.error(`Error checking response: ${error}`);
            notify(`Error checking response: ${error}`, 'error');
        }
    }, [editedCode, notify, validateCode]);

    return { validateResponse, validateCode };
}

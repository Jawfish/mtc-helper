import { useCallback } from 'react';
import { useToast } from '@src/contexts/ToastContext';
import { codeContainsMarkdownFence, codeContainsHtml } from '@lib/textProcessing';
import Logger from '@lib/logging';
import { validatePython } from '@lib/validatePython';
import { useOrochiStore } from '@src/store/orochiStore';

enum ValidationMessage {
    NO_CODE = 'No code found.',
    MARKDOWN_FENCE = 'Code block appears to be improperly opened or closed.',
    HTML_DETECTED = 'The bot response appears to contain HTML.',
    NO_ISSUES = 'No issues detected.'
}

type NotificationStatus = 'success' | 'warning' | 'error';

export function useValidation() {
    const { notify } = useToast();
    const { editedCode, language } = useOrochiStore();

    const validateCode = useCallback(
        (code: string | null): string[] => {
            if (!code) {
                return [ValidationMessage.NO_CODE];
            }

            const messages: string[] = [];

            if (codeContainsMarkdownFence(code)) {
                messages.push(ValidationMessage.MARKDOWN_FENCE);
            }

            if (codeContainsHtml(code)) {
                messages.push(ValidationMessage.HTML_DETECTED);
            }

            if (language === 'python') {
                messages.push(...validatePython(code));
            }

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

            notify(
                `${status === 'warning' ? 'Partial success: ' : ''}${messageText}`,
                status
            );
        } catch (error) {
            Logger.error(`Error checking response: ${error}`);
            notify(
                `Error checking response: ${error instanceof Error ? error.message : String(error)}`,
                'error'
            );
        }
    }, [editedCode, notify, validateCode]);

    return { validateResponse, validateCode };
}

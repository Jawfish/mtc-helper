import { useCallback } from 'react';
import { useToast } from '@src/contexts/ToastContext';
import { codeContainsMarkdownFence, codeContainsHtml } from '@lib/textProcessing';
import { validatePython } from '@lib/validatePython';
import { useOrochiStore } from '@src/store/orochiStore';
import { selectResponseCodeElement } from '@lib/selectors';

enum ValidationMessage {
    NO_CODE = 'No code found.',
    MARKDOWN_FENCE = 'Code block appears to be improperly opened or closed.',
    HTML_DETECTED = 'The bot response appears to contain HTML.',
    NO_ISSUES = 'No issues detected.',
    NO_LANGUAGE = 'The code block does not specify the language.'
}

type NotificationStatus = 'success' | 'warning' | 'error';

export function useValidation() {
    const { notify } = useToast();
    const { operatorResponseCode, language } = useOrochiStore();

    /**
     * Checks if the response code element is missing a language class, indicating that the
     * operator did not specify the language in the opening of the markdown code fence.
     */
    const responseCodeMissingLanguage = (element: Element | undefined) => {
        const hasLanguageClass = Array.from(element?.classList || []).some(className =>
            className.startsWith('language-')
        );

        return !hasLanguageClass;
    };

    const validateCode = useCallback(
        (code: string | undefined): string[] => {
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
            } else {
                const responseCodeElement = selectResponseCodeElement();
                if (responseCodeMissingLanguage(responseCodeElement)) {
                    messages.push(ValidationMessage.NO_LANGUAGE);
                }
            }

            return messages;
        },
        [language]
    );

    const validateResponse = useCallback(() => {
        const messages = validateCode(operatorResponseCode);
        const messageText =
            messages.length > 0 ? messages.join('\n') : ValidationMessage.NO_ISSUES;
        const status: NotificationStatus = messages.length > 0 ? 'warning' : 'success';

        notify(`${status === 'warning' ? 'Warning: ' : ''}${messageText}`, status);
    }, [operatorResponseCode, notify, validateCode]);

    return { validateResponse, validateCode };
}

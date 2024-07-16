import { useCallback } from 'react';
import { useToast } from '@src/contexts/ToastContext';
import { codeContainsMarkdownFence, codeContainsHtml } from '@lib/textProcessing';
import { useOrochiStore } from '@src/store/orochiStore';
import Logger from '@lib/logging';

enum ValidationMessage {
    NO_CODE = 'No code found.',
    MARKDOWN_FENCE = 'Code block appears to be improperly opened or closed.',
    HTML_DETECTED = 'The bot response appears to contain HTML.',
    NO_ISSUES = 'No issues detected.',
    NO_LANGUAGE = 'The code block does not specify the language.'
}

type NotificationStatus = 'success' | 'warning' | 'error';

const MAX_LINE_LENGTH = 240;
const TRUNCATE_LENGTH = 26;

type ValidationResult = {
    isValid: boolean;
    message: string | undefined;
};

type ValidationRule = (line: string) => ValidationResult;

const truncateLine = (line: string): string =>
    line.length > TRUNCATE_LENGTH ? `${line.slice(0, TRUNCATE_LENGTH)}...` : line;

const createValidationResult = (
    isValid: boolean,
    message: string | undefined = undefined
): ValidationResult => ({
    isValid,
    message
});

const isConstant = (line: string): boolean => /^[A-Z_]+/.test(line.split(' ')[0]);

const isFunctionOrClass = (line: string): boolean =>
    line.startsWith('def ') ||
    line.startsWith('class ') ||
    line.startsWith('@') ||
    line.startsWith('async def ');

const isImport = (line: string): boolean =>
    line.startsWith('import ') || line.startsWith('from ');

const isIndented = (line: string): boolean => line.startsWith('    ');

const isCommented = (line: string): boolean => line.trim().startsWith('#');

const isMultilineFunctionDefinition = (line: string): boolean =>
    line.startsWith(') ->');

const isBlockStart = (line: string): boolean =>
    line.trim().endsWith(':') || // For try/except, with, and other block starts
    line.trim().startsWith('except') || // For except lines without colon
    line.trim().startsWith('finally:'); // For finally blocks

const validateLineLength: ValidationRule = line =>
    line.length > MAX_LINE_LENGTH
        ? createValidationResult(
              false,
              `A line in the bot response is suspiciously long: ${truncateLine(line)}`
          )
        : createValidationResult(true);

const validateIndentation: ValidationRule = line => {
    if (
        isConstant(line) ||
        isImport(line) ||
        isFunctionOrClass(line) ||
        isIndented(line) ||
        isCommented(line) ||
        line.trim().length === 0 ||
        isMultilineFunctionDefinition(line) ||
        isBlockStart(line)
    ) {
        return createValidationResult(true);
    }

    return createValidationResult(
        false,
        `The bot response contains a non-indented line: ${truncateLine(line)}`
    );
};

const validateInlineComments: ValidationRule = line =>
    line.includes('#') && !line.trim().startsWith('#')
        ? createValidationResult(
              false,
              `The bot response contains an inline comment: ${truncateLine(line)}`
          )
        : createValidationResult(true);

const validationRules: ValidationRule[] = [
    validateLineLength,
    validateIndentation,
    validateInlineComments
];

export function useValidation() {
    const { notify } = useToast();
    const { operatorResponseCode, language } = useOrochiStore();

    const validatePython = (code: string): string[] => {
        const lines = code.split('\n');
        const messages: string[] = [];

        lines.forEach((line, index) => {
            if (line.trim().length === 0) return;

            validationRules.forEach(rule => {
                const result = rule(line);
                if (!result.isValid && result.message) {
                    Logger.debug(`Line ${index + 1}: ${result.message}`);
                    messages.push(result.message);
                }
            });
        });

        return messages;
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
                if (!operatorResponseCode) {
                    messages.push(ValidationMessage.NO_LANGUAGE);
                }
            }

            return messages;
        },
        [operatorResponseCode, language]
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

import Logger from '@lib/logging';

const MAX_LINE_LENGTH = 240;
const TRUNCATE_LENGTH = 26;

type ValidationResult = {
    isValid: boolean;
    message: string | null;
};

type ValidationRule = (line: string) => ValidationResult;

const truncateLine = (line: string): string =>
    line.length > TRUNCATE_LENGTH ? `${line.slice(0, TRUNCATE_LENGTH)}...` : line;

const createValidationResult = (
    isValid: boolean,
    message: string | null = null
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

/**
 * Validate the Python code in the bot response.
 *
 * @param code - The Python code to validate.
 * @returns An array of validation messages.
 */
export const validatePython = (code: string): string[] => {
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

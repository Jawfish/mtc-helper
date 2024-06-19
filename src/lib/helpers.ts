import Logger from '@src/lib/logging';
import { selectReturnTargetElement, selectScoreElement } from '@src/selectors/orochi';

/**
 * Check if the task window contains Python code.
 *
 * @returns - True if the task window contains Python code.
 */
export const isPython = (): boolean => {
    const span = Array.from(document.querySelectorAll('span')).find(
        span => span.textContent?.trim() === 'Programming Language'
    );

    const hasPythonInSpan =
        span?.parentElement?.textContent?.split(':')[1]?.trim() === 'Python';
    const hasPythonInCode =
        document.querySelector('pre > code')?.classList.contains('language-python') ||
        false;

    const pythonButton = Array.from(document.querySelectorAll('button')).find(
        button => {
            const grandparent = button.parentElement?.parentElement?.parentElement;
            const firstChildDiv = grandparent?.firstElementChild;

            return (
                button.textContent?.trim() === 'Python' &&
                !button.hasAttribute('data-disabled') &&
                firstChildDiv?.textContent?.includes('Programming Language')
            );
        }
    );

    const hasPythonInButton = Boolean(pythonButton);

    return hasPythonInSpan || hasPythonInCode || hasPythonInButton;
};

/**
 * Validate the Python code in the bot response. This is a relatively naive check that
 * performs the following validations:
 *
 * - Ensures the code has more than two lines.
 * - Checks for excessively long lines of code.
 * - Ensures non-indented lines are either constants, imports, function/class
 *   definitions, or comments.
 *
 * @param code - The Python code to validate.
 * @param messages - The array to which validation messages will be appended.
 * @returns
 */
export const validatePython = (code: string, messages: string[]): void => {
    const maxLineLength = 240;

    const lines = code.split('\n');

    const truncateLine = (line: string): string => {
        const truncateLength = 26;

        return line.length > truncateLength
            ? `${line.slice(0, truncateLength)}...`
            : line;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isConstant = /^[A-Z_]+/.test(line.split(' ')[0]);
        const isFunctionOrClass =
            line.startsWith('def ') ||
            line.startsWith('class ') ||
            line.startsWith('@') || // Account for decorators
            line.startsWith('async def ');
        const isImport = line.startsWith('import ') || line.startsWith('from ');
        const isIndented = line.startsWith('    ');
        const isCommented = line.startsWith('#');

        const shortenedLine = truncateLine(line);

        // Ignore empty lines
        if (line.trim().length === 0) {
            continue;
        }

        if (line.length > maxLineLength) {
            Logger.debug(`A line is suspiciously long: ${line}`);
            messages.push(
                `A line in the bot response is suspiciously long: ${shortenedLine}`
            );
        }

        if (
            !isConstant &&
            !isImport &&
            !isFunctionOrClass &&
            !isIndented &&
            !isCommented &&
            line.trim().length > 0 && // Ignore empty lines
            !line.startsWith(') ->') // For multi-line function definitions
        ) {
            Logger.debug(
                `Found non-indented line that doesn't appear to be an import, class definition, comment, or function definition: ${line}`
            );
            messages.push(
                `The bot response contains a non-indented line: ${shortenedLine}`
            );
        }

        if (line.includes('#') && !line.trim().startsWith('#')) {
            Logger.debug(`Found inline comment: ${line}`);
            messages.push(
                `The bot response contains an inline comment: ${shortenedLine}`
            );
        }
    }
};

/**
 * Check for ending HTML tag, since that signifies a broken response. Will have false
 * positives for any code that contains a closing HTML tag as part of the actual code,
 * but the QA can just ignore the alert.
 *
 * @param code - The code to be checked for HTML tags.
 * @param messages - The array to which validation messages will be appended.
 * @returns
 */
export const checkForHtmlInCode = (code: string, messages: string[]): void => {
    try {
        const closingTagRegex = /<\/[^>]+>/;
        if (closingTagRegex.test(code)) {
            Logger.debug(
                'Something that appears to be a closing HTML tag was found in the bot response.'
            );
            messages.push('The bot response appears to contain HTML.');
        }
    } catch (e) {
        Logger.error(`Error checking for closing HTML tag: ${e}`);
    }
};

/**
 * Format the messages with a prefix and newline character.
 *
 * @param messages - The messages to be formatted.
 * @returns The formatted messages.
 */
export const formatMessages = (messages: string[]): string[] => {
    return messages.map((message, idx) => `${idx + 1}. ${message}\n\n`);
};

/**
 * Check if the bot response is invalid. This function checks for the following:
 * - The bot response is not found.
 * - The bot response does not contain a `<code>` element.
 * - The bot response contains a closing HTML tag.
 * - The bot response contains malformed Python.
 *
 * @param code The code to be checked.
 *
 * @returns An array of strings containing the issues found with the bot
 * response.
 */
export function determineWarnings(code: string): string[] {
    const messages: string[] = [];

    // TODO: pass a dependency in rather than calling this directly
    checkAlignmentScore(85, messages);

    if (!code) {
        Logger.debug('The code cannot be found in the response.');
        messages.push('The code cannot be found in the response.');

        return messages;
    }

    if (code.includes('```')) {
        Logger.debug(
            'The code does not appear to be in a properly-closed markdown code block.'
        );
        messages.push(
            'The code does not appear to be in a properly-closed markdown code block.'
        );
    }

    checkForHtmlInCode(code, messages);

    if (code.split('\n').length <= 3) {
        Logger.debug('The bot response has suspiciously few lines.');
        messages.push('The bot response has suspiciously few lines.');
    }

    if (isPython()) {
        Logger.debug('The code appears to be Python.');
        validatePython(code, messages);
    }

    return messages;
}

/**
 * Checks if the alignment score is considered low and if the bot response should be
 * reworked.
 *
 * @param threshold - The alignment score threshold below which the response
 * @param messages - The array to which validation messages will be appended.
 *
 * @returns `true` if the alignment score is below the threshold and the
 * response should not be sent to rework; `false` otherwise.
 */
export function checkAlignmentScore(threshold: number, messages: string[]): void {
    try {
        Logger.debug('Checking if alignment score is low...');
        const sendToRework =
            selectReturnTargetElement()?.textContent?.includes('Rework');
        const scoreText = selectScoreElement()?.textContent?.split(':')[1]?.trim();
        if (!scoreText) {
            Logger.debug('Alignment score not found.');

            return;
        }

        const score = parseInt(scoreText, 10);

        Logger.debug(`Alignment score: ${score}, send to rework: ${sendToRework}`);
        if (score < threshold && sendToRework === false) {
            messages.push(
                `The alignment score is ${score}, but the task is not marked as a rework.`
            );
        }
    } catch (err) {
        Logger.error(`Error checking if alignment score is low: ${err}`);
    }
}

export function logDiff(originalContent: string, editedContent: string) {
    Logger.debug(
        `Inserting diff element
Original content:

${originalContent}

--------------------------------------------------------------------------------------

Edited content:
${editedContent}

--------------------------------------------------------------------------------------
`
    );
}

export function truncateString(str: string | undefined, num: number = 50): string {
    if (str === undefined) {
        return 'undefined';
    }
    if (str.trim().length === 0) {
        return 'empty string';
    }
    if (str.length <= num) {
        return str;
    }
    str = str.replace(/\n/g, ' ');

    return `${str.slice(0, num)}...`;
}

export function getTextFromElement(element: HTMLElement | undefined): string {
    let text = '';
    if (element) {
        element.childNodes.forEach((child: Node) => {
            if (child.nodeType === Node.TEXT_NODE) {
                if (element.tagName === 'P') {
                    text += `${child.nodeValue}`;
                } else if (element.tagName === 'LI') {
                    text += `- ${child.nodeValue}`;
                } else if (element.tagName === 'CODE') {
                    text += `\`${child.nodeValue}\``;
                } else {
                    text += child.nodeValue;
                }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                text += getTextFromElement(child as HTMLElement);
            }
        });
    }

    return text;
}

export async function copyToClipboard(text: string) {
    text = text.replace(/&nbsp;/g, '').replace(/\u00A0/g, '');
    try {
        await navigator.clipboard.writeText(text);
        Logger.debug('Text copied to clipboard successfully!');
    } catch (err) {
        Logger.error(`Failed to copy text: ${err}`);
    }
}

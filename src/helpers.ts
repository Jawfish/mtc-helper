import { getAlignmentScore, getQaFeedbackSection, getResponseCode } from './selectors';
import { getAbortSignal } from './store';

export function log(
  level: 'log' | 'debug' | 'info' | 'warn' | 'error',
  message: string
) {
  const prefix = '%c[Orochi Helper]';
  const defaultStyle = 'color: blue; font-weight: bold;';
  switch (level) {
    case 'log':
      console.log(prefix, defaultStyle, message);
      break;
    case 'debug':
      console.debug(prefix, 'color: black; font-weight: bold;', message);
      break;
    case 'info':
      console.info(prefix, defaultStyle, message);
      break;
    case 'warn':
      console.warn(prefix, 'color: orange; font-weight: bold;', message);
      break;
    case 'error':
      console.error(prefix, 'color: red; font-weight: bold;', message);
      break;
    default:
      console.log(prefix, defaultStyle, message);
      break;
  }
}

/**
 * Check if the conversation window contains Python code.
 *
 * @returns {boolean} - True if the conversation window contains Python code.
 */
export const isPython = (): boolean => {
  const span = Array.from(document.querySelectorAll('span')).find(
    span => span.textContent?.trim() === 'Programming Language'
  );

  const hasPythonInSpan =
    span?.parentElement?.textContent?.split(':')[1]?.trim() === 'Python';

  const hasPythonInButton = Array.from(document.querySelectorAll('button')).some(
    button => button.textContent?.includes('Python')
  );

  return hasPythonInSpan || hasPythonInButton;
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
 * @param {string} code - The Python code to validate.
 * @param {string[]} messages - The array to which validation messages will be appended.
 * @returns {void}
 */
export const validatePython = (code: string, messages: string[]): void => {
  const maxLineLength = 240;

  const lines = code.split('\n');

  const truncateLine = (line: string): string => {
    const truncateLength = 26;
    return line.length > truncateLength ? `${line.slice(0, truncateLength)}...` : line;
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
      log('warn', `A line is suspiciously long: ${line}`);
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
      log(
        'warn',
        `Found non-indented line that doesn't appear to be an import, class definition, comment, or function definition: ${line}`
      );
      messages.push(`The bot response contains a non-indented line: ${shortenedLine}`);
    }

    if (line.includes('#') && !line.trim().startsWith('#')) {
      log('warn', `Found inline comment: ${line}`);
      messages.push(`The bot response contains an inline comment: ${shortenedLine}`);
    }
  }
};

/**
 * Check for ending HTML tag, since that signifies a broken response. Will have false
 * positives for any code that contains a closing HTML tag as part of the actual code,
 * but the QA can just ignore the alert.
 *
 * @param {string} code - The code to be checked for HTML tags.
 * @param {string[]} messages - The array to which validation messages will be appended.
 * @returns {void}
 */
export const checkForHtmlInCode = (code: string, messages: string[]): void => {
  try {
    const closingTagRegex = /<\/[^>]+>/;
    if (closingTagRegex.test(code)) {
      log(
        'warn',
        'Something that appears to be a closing HTML tag was found in the bot response.'
      );
      messages.push('The bot response appears to contain HTML.');
    }
  } catch (error) {
    log('error', `Error checking for closing HTML tag: ${error}`);
  }
};

/**
 * Format the messages with a prefix and newline character.
 *
 * @param {string[]} messages - The messages to be formatted.
 * @returns {string[]} The formatted messages.
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
 * @returns {string[]} An array of strings containing the issues found with the bot
 * response.
 */
export function determineWarnings(): string[] {
  const messages: string[] = [];
  try {
    const code = getResponseCode();
    checkAlignmentScore(85, messages);

    if (code.includes('```')) {
      log(
        'warn',
        'The code does not appear to be in a properly-closed markdown code block.'
      );
      messages.push(
        'The code does not appear to be in a properly-closed markdown code block.'
      );
    }

    checkForHtmlInCode(code, messages);

    if (code.split('\n').length <= 3) {
      log('warn', 'The bot response has suspiciously few lines.');
      messages.push('The bot response has suspiciously few lines.');
    }

    if (isPython()) {
      log('debug', 'The code appears to be Python.');
      validatePython(code, messages);
    }

    return messages;
  } catch (error) {
    log('error', `Error getting messages for response warnings: ${error}`);
    messages.push(
      'The code cannot be found in the response. Is it in a markdown block?'
    );
    return messages;
  }
}

/**
 * Checks if the alignment score is considered low and if the bot response should be
 * reworked.
 *
 * @param {number} threshold - The alignment score threshold below which the response
 * @param {string[]} messages - The array to which validation messages will be appended.
 *
 * @returns {boolean} `true` if the alignment score is below the threshold and the
 * response should not be sent to rework; `false` otherwise.
 */
export function checkAlignmentScore(threshold: number, messages: string[]): void {
  try {
    log('debug', 'Checking if alignment score is low...');
    const element = getQaFeedbackSection();
    const sendToRework =
      element?.children?.length &&
      element.children.length >= 2 &&
      element?.children[2]?.textContent?.includes('Rework');
    const score = getAlignmentScore();

    if (!score || score == -1) {
      log('warn', 'Alignment score not found.');
      return;
    }

    log('debug', `Alignment score: ${score}, send to rework: ${sendToRework}`);
    if (score < threshold && !sendToRework) {
      messages.push(
        `The alignment score is ${score}, but the conversation is not marked as a rework.`
      );
    }
  } catch (error) {
    log('error', `Error checking if alignment score is low: ${error}`);
  }
}

/**
 * Retries a synchronous operation (fn) until no error is thrown, the timeout is
 * reached, or the operation is aborted.
 * @param {string} purpose - The purpose of the operation for logging purposes.
 * @param {() => T} fn - The function to poll.
 * @param {number} [interval=100] - The interval in milliseconds between polls.
 * @param {number} [timeout=10000] - The timeout in milliseconds before the operation is
 * aborted.
 * @returns {Promise<T>} A promise that resolves with the result of the function or
 * rejects with a timeout or abort error.
 */
export async function retry<T>(
  purpose: string,
  fn: () => T,
  interval: number = 100,
  timeout: number = 10000
): Promise<T | null> {
  log(
    'debug',
    `Polling with interval ${interval} and timeout ${timeout} for ${purpose}`
  );

  const endTime = Date.now() + timeout;
  const abortSignal = getAbortSignal();

  return new Promise<T | null>((resolve, reject) => {
    const checkCondition = () => {
      if (abortSignal.aborted) {
        return reject(
          new Error(
            `Abort signal sent to store (probably because conversation window closed), polling operation aborted for ${purpose}`
          )
        );
      }

      try {
        const result = fn();
        resolve(result);
      } catch (error) {
        if (Date.now() < endTime) {
          setTimeout(checkCondition, interval);
        } else {
          resolve(null);
        }
      }
    };

    checkCondition();
  });
}

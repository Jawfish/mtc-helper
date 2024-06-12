import {
  selectResponseCodeElement,
  selectReturnTargetElement,
  selectScoreElement
} from './selectors';

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
 * @returns - True if the conversation window contains Python code.
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
 * @param code - The Python code to validate.
 * @param messages - The array to which validation messages will be appended.
 * @returns
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
 * @param code - The code to be checked for HTML tags.
 * @param messages - The array to which validation messages will be appended.
 * @returns
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
 * @returns An array of strings containing the issues found with the bot
 * response.
 */
export function determineWarnings(): string[] {
  const messages: string[] = [];
  checkAlignmentScore(85, messages);

  const code = selectResponseCodeElement()?.textContent;

  if (!code) {
    log('warn', 'The code cannot be found in the response.');
    messages.push('The code cannot be found in the response.');
    return messages;
  }

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
    log('debug', 'Checking if alignment score is low...');
    const sendToRework = selectReturnTargetElement()?.textContent?.includes('Rework');
    const scoreText = selectScoreElement()?.textContent?.split(':')[1]?.trim();
    if (!scoreText) {
      log('warn', 'Alignment score not found.');
      return;
    }

    const score = parseInt(scoreText, 10);

    log('debug', `Alignment score: ${score}, send to rework: ${sendToRework}`);
    if (score < threshold && sendToRework === false) {
      messages.push(
        `The alignment score is ${score}, but the conversation is not marked as a rework.`
      );
    }
  } catch (error) {
    log('error', `Error checking if alignment score is low: ${error}`);
  }
}

export function logDiff(originalContent: string, editedContent: string) {
  log(
    'debug',
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

declare global {
  interface Window {
    monaco: any;
  }
}

// TODO: this is ported from a bookmarklet, so the code is a bit messy
export function copyConversation() {
  function getEditorContent() {
    console.log('Checking for editor content...');
    if (window.monaco && window.monaco.editor) {
      return window.monaco.editor.getEditors()[0].getValue();
    } else {
      return '';
    }
  }
  function getTextFromElement(element: HTMLElement | null): string {
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
  function copyToClipboard(text: string) {
    text = text.replace(/&nbsp;/g, '').replace(/\u00A0/g, '');
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log('Text copied to clipboard successfully!');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  }
  const userPrompt = document.querySelector(
    'div.rounded-xl p.whitespace-pre-wrap'
  )?.parentElement;
  const botResponse = document.querySelector(
    'div.rounded-xl.bg-pink-100 pre code'
  )?.textContent;
  const editorContent = getEditorContent();
  const operatorReason =
    document.querySelectorAll('div[data-grid]>div>div>div>div>p.whitespace-pre-wrap')[2]
      ?.textContent || '';
  const formattedText = `"""\n${getTextFromElement(
    userPrompt as HTMLElement
  )}\n"""\n\n################################# REASON #################################\n\n"""\n${operatorReason.trim() ? operatorReason : 'No reason provided'}\n""" \n\n################################ RESPONSE ################################\n\n${botResponse} \n\n################################# TESTS ##################################\n\n${editorContent}`;
  copyToClipboard(formattedText);
}

// TODO: this is ported from a bookmarklet, so the code is a bit messy
export function copyId() {
  const buttons = document.querySelectorAll('button');
  let titleToCopy = '';

  for (let button of buttons) {
    if (
      !button.disabled &&
      button.querySelector('span') &&
      button.classList.contains('cursor-pointer') &&
      button.querySelector('span')?.textContent?.includes('In Progress')
    ) {
      const row = button.closest('tr');
      if (row) {
        const titledDiv = row.querySelector('div[title]');
        if (titledDiv) {
          titleToCopy = titledDiv.getAttribute('title') || '';
          break;
        }
      }
    }
  }

  // check if it appears to be UUID
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

  if (uuidRegex.test(titleToCopy)) {
    navigator.clipboard.writeText(titleToCopy);
  } else {
    alert(
      'ID could not be found. Sometimes the ID becomes unavailable as the rows in the backgrond update, causing the current task to fall out of view.'
    );
  }
}

// TODO: this is ported from a bookmarklet, so the code is a bit messy
export function copyEmail() {
  const element = document.querySelector(
    '.MuiTypography-root.MuiTypography-body2.MuiTypography-noWrap'
  );
  if (element) {
    const modifiedText = element.textContent + 'invisible.email';
    navigator.clipboard.writeText(modifiedText);
  }
}

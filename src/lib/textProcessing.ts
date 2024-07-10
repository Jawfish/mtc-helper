/**
 * Check for ending HTML tag, since that signifies a broken response. Will have false
 * positives for any code that contains a closing HTML tag as part of the actual code,
 * but the QA can just ignore the alert.
 *
 * @param code - The code to be checked for HTML tags.
 * @returns
 */
export const codeContainsHtml = (code: string): boolean => /<\/[^>]+>/.test(code);

/**
 * Check for markdown code fences in the code which will usually indicate that the
 * markdown code fence was not properly closed.
 * @param code The code to be checked.
 * @returns `true` if the code contains a markdown code fence, `false` otherwise.
 */
export const codeContainsMarkdownFence = (code: string): boolean =>
    code.includes('```');

export function truncateString(str: string | undefined, num: number = 50): string {
    if (str === undefined) {
        return 'undefined';
    }
    if (str.trim().length === 0) {
        return '';
    }
    if (str.length <= num) {
        return str;
    }
    str = str.replace(/\n/g, ' ');

    return `${str.slice(0, num)}...`;
}

export const getTextFromElement = (element: HTMLElement | undefined): string => {
    let text = '';

    if (!element) {
        return text;
    }

    element.childNodes.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
            text += getTextFromElement(child as HTMLElement);

            return;
        }
        if (child.nodeType === Node.TEXT_NODE) {
            switch (element.tagName) {
                case 'P':
                    text += `${child.nodeValue}`;
                    break;
                case 'LI':
                    text += `- ${child.nodeValue}`;
                    break;
                case 'CODE':
                    text += `\`${child.nodeValue}\``;
                    break;
                case 'H1':
                    text += `# ${child.nodeValue}`;
                    break;
                case 'H2':
                    text += `## ${child.nodeValue}`;
                    break;
                case 'H3':
                    text += `### ${child.nodeValue}`;
                    break;
                case 'H4':
                    text += `#### ${child.nodeValue}`;
                    break;
                case 'H5':
                    text += `##### ${child.nodeValue}`;
                    break;
                case 'H6':
                    text += `###### ${child.nodeValue}`;
                    break;
                case 'STRONG':
                    text += `**${child.nodeValue}**`;
                    break;
                case 'EM':
                    text += `*${child.nodeValue}*`;
                    break;
                default:
                    text += child.nodeValue;
            }
        }
    });

    return text;
};

export const isValidUUID = (uuid: string): boolean => {
    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    return uuidRegex.test(uuid);
};

export const isRTL = (text: string): boolean => {
    const rtlRegex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;

    return rtlRegex.test(text);
};

export const getWordCount = (text: string): number => {
    // Remove any numbering at the start of each line (e.g. "1. "; LTR only)
    const PREPROCESS_PATTERN = /^\d+\. /gm;

    // What to count as a word
    const WORD_PATTERN = /(?<!^|\n)\d+\.|\S+/gu;

    // If a string is made of entirely these characters, don't count it as a word
    const IGNORE_PATTERN = /^[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~“”]+$/;

    // Use the preprocessed text for LTR languages, otherwise use the original text
    const preprocessedText = isRTL(text) ? text : text.replace(PREPROCESS_PATTERN, '');
    const matches = preprocessedText.match(WORD_PATTERN);
    if (!matches) return 0;

    return matches
        .flatMap(word => {
            // Count decimal numbers as two words
            if (/^.\d+\.?$/.test(word)) {
                return word.replace(/\.$/, '').split('.');
            }

            // Split on delimiters
            return word.split(/[[\]/:—–,.^(){}]/);
        })
        .filter(word => word.length > 0 && !IGNORE_PATTERN.test(word)).length;
};

export const doubleSpace = (text: string): string =>
    text
        .split('\n')
        .map(line => `${line}\n\n`)
        .join('');

export const standardizeNewlines = (text: string) => {
    const lines: string[] = text.split('\n');

    return lines
        .map(line => line.trim().replaceAll(/(\r\n|\r|\n)+/g, ''))
        .filter(line => line.length > 0)
        .join('\n');
};

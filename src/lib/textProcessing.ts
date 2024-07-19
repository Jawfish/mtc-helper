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

export const isValidUUID = (uuid: string): boolean => {
    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    return uuidRegex.test(uuid);
};

export const isRTL = (text: string): boolean => {
    const rtlRegex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;

    return rtlRegex.test(text);
};

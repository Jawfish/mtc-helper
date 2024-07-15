/**
 * Select the response code element from the bot response.
 * @returns The response code element if found, otherwise `undefined`.
 */
export const selectResponseCodeElement = () =>
    document.querySelector('div.rounded-xl.bg-pink-100 pre code') || undefined;

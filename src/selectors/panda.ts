export const selectPandaResponse = (): HTMLDivElement | undefined => {
    const element = document.querySelector('div.flex.items-center>div.mt-3.flex.gap-4');

    return element instanceof HTMLDivElement ? element : undefined;
};

export const selectPandaEditedResponse = (): HTMLDivElement | undefined => {
    const element = selectPandaResponse()?.querySelector('div[contenteditable="true"]');

    return element instanceof HTMLDivElement ? element : undefined;
};

export const selectPandaOriginalResponse = (): HTMLDivElement | undefined => {
    const element = selectPandaResponse()?.querySelector('div.my-3.overflow-auto');

    return element instanceof HTMLDivElement ? element : undefined;
};

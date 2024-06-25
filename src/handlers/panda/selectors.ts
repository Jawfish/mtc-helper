import { selectTaskWindowElement } from '@lib/selectors';

export const selectPandaSelectedResponseSaveButton = ():
    | HTMLButtonElement
    | undefined => {
    const taskWindow = selectTaskWindowElement();
    const selectedResponseSaveButton = Array.from(
        taskWindow?.querySelectorAll('button') || []
    ).find(
        button =>
            button.classList.contains('text-xs') &&
            button.querySelector('span')?.textContent === 'Save'
    );

    return selectedResponseSaveButton instanceof HTMLButtonElement
        ? selectedResponseSaveButton
        : undefined;
};

export const selectPandaSelectedResponse = (): HTMLDivElement | undefined => {
    const saveButton = selectPandaSelectedResponseSaveButton();

    const selectedResponse = saveButton?.parentElement?.parentElement;

    return selectedResponse instanceof HTMLDivElement ? selectedResponse : undefined;
};

export const selectPandaOriginalResponse = (): HTMLDivElement | undefined => {
    const selectedResponse = selectPandaSelectedResponse();
    const tab = selectedResponse?.querySelector('div[id="2"]');

    // if tab doesn't have "text-theme-main" class, it is not selected, so the
    // original content is not visible
    if (!tab?.classList.contains('text-theme-main')) {
        return undefined;
    }

    const element = selectedResponse?.querySelector('div[data-cy="tab"]');

    return element instanceof HTMLDivElement ? element : undefined;
};

export const selectAllPandaEditResponseButtons = (): HTMLButtonElement[] | [] => {
    const editButtons = Array.from(
        document.querySelectorAll('button[title="Edit"]')
    ).filter(button => button.querySelector('svg'));

    return editButtons as HTMLButtonElement[];
};

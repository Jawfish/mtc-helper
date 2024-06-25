import { selectTaskWindowElement } from '@lib/selectors';

export const selectPandaSelectedResponseSaveButton = (): HTMLButtonElement | null => {
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
        : null;
};

export const selectPandaSelectedResponse = (): HTMLDivElement | null => {
    const saveButton = selectPandaSelectedResponseSaveButton();

    const selectedResponse = saveButton?.parentElement?.parentElement;

    return selectedResponse instanceof HTMLDivElement ? selectedResponse : null;
};

export const selectAllPandaEditResponseButtons = (): HTMLButtonElement[] | [] => {
    const editButtons = Array.from(
        document.querySelectorAll('button[title="Edit"]')
    ).filter(button => button.querySelector('svg'));

    return editButtons as HTMLButtonElement[];
};

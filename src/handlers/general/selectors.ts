import { selectTaskWindowElement } from '@lib/selectors';

export const selectSelectedResponseSaveButton = (): HTMLButtonElement | undefined => {
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

export const selectSelectedResponse = (): HTMLDivElement | undefined => {
    const saveButton = selectSelectedResponseSaveButton();

    const selectedResponse = saveButton?.parentElement?.parentElement;

    return selectedResponse instanceof HTMLDivElement ? selectedResponse : undefined;
};

export const selectAllEditResponseButtons = (): HTMLButtonElement[] | [] => {
    const editButtons = Array.from(
        document.querySelectorAll('button[title="Edit"]')
    ).filter(button => button.querySelector('svg'));

    return editButtons as HTMLButtonElement[];
};

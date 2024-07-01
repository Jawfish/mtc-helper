import { selectTaskWindowElement } from '@lib/selectors';

export const selectGeneralSelectedResponseSaveButton = ():
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

export const selectGeneralSelectedResponse = (): HTMLDivElement | undefined => {
    const saveButton = selectGeneralSelectedResponseSaveButton();

    const selectedResponse = saveButton?.parentElement?.parentElement;

    return selectedResponse instanceof HTMLDivElement ? selectedResponse : undefined;
};

export const selectAllGeneralEditResponseButtons = (): HTMLButtonElement[] | [] => {
    const editButtons = Array.from(
        document.querySelectorAll('button[title="Edit"]')
    ).filter(button => button.querySelector('svg'));

    return editButtons as HTMLButtonElement[];
};

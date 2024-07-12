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

// Make sure to exclude the prompt edit button
export const selectAllEditResponseButtons = (): HTMLButtonElement[] | [] => {
    // when the button's parent.parent.child[1] has a class of bg-indigo-100, it's a
    // prompt
    const editButtons = Array.from(
        document.querySelectorAll('button[title="Edit"]')
    ).filter(button =>
        button.parentElement?.parentElement?.children[1]?.classList.contains(
            'bg-indigo-100'
        )
    );

    return editButtons as HTMLButtonElement[];
};

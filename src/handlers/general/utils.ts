export const createWordCountElement = (count: number, label?: string) => {
    const wcElement = document.createElement('span');
    wcElement.textContent = `${count.toString()} words${label ? ` (${label})` : ''}`;
    wcElement.className = 'text-xs self-center';

    return wcElement;
};

export const createCopyButtonElement = (label: string = 'Copy') => {
    const copyButton = document.createElement('button');
    copyButton.textContent = label;
    copyButton.className =
        'relative box-border flex cursor-pointer items-center justify-center whitespace-nowrap bg-void border border-solid border-main hover:bg-weak-2 hover:border-main text-header w-fit h-6 py-0.5 px-2 text-xs rounded-md disabled:bg-weak-2 disabled:border-main disabled:text-main disabled:cursor-not-allowed disabled:shadow-none space-x-1';

    return copyButton;
};

export const createControlsContainerElement = () => {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'flex gap-2 w-full justify-end mt-2 items-center';

    return controlsContainer;
};

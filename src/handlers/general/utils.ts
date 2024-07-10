import { generalStore } from '@src/store/generalStore';

export type CopyButton = {
    element: HTMLButtonElement;
    update: () => void;
    unsubscribe: () => void;
};

type CopyButtonType = "operator's" | "model's" | 'prompt';

export const createCopyButtonElement = (type: CopyButtonType): CopyButton => {
    const copyButton = document.createElement('button');
    copyButton.textContent = `Copy ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    copyButton.className =
        'relative box-border flex cursor-pointer items-center justify-center whitespace-nowrap bg-void border border-solid border-main hover:bg-weak-2 hover:border-main text-header w-fit h-6 py-0.5 px-2 text-xs rounded-md disabled:bg-weak-2 disabled:border-main disabled:text-main disabled:cursor-not-allowed disabled:shadow-none space-x-1';

    const update = () => {
        const state = generalStore.getState();
        let content: string | undefined;

        switch (type) {
            case "operator's":
                content = state.selectedResponse.operatorResponseMarkdown;
                break;
            case "model's":
                content = state.selectedResponse.modelResponseMarkdown;
                break;
            case 'prompt':
                content = state.prompt.text;
                break;
        }

        copyButton.disabled = !content;
    };

    copyButton.addEventListener('click', () => {
        const state = generalStore.getState();
        let content: string | undefined;

        switch (type) {
            case "operator's":
                content = state.selectedResponse.operatorResponseMarkdown;
                break;
            case "model's":
                content = state.selectedResponse.modelResponseMarkdown;
                break;
            case 'prompt':
                content = state.prompt.text;
                break;
        }

        if (content) {
            navigator.clipboard.writeText(content);
        }
    });

    update();

    const unsubscribe = generalStore.subscribe(update);

    return {
        element: copyButton,
        update,
        unsubscribe
    };
};

export function debounce<T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    return (...args: Parameters<T>) => {
        const later = () => {
            timeoutId = undefined;
            func(...args);
        };

        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(later, wait);
    };
}

import { getWordCount } from '@lib/textProcessing';
import { generalStore } from '@src/store/generalStore';

export type WordCounter = {
    element: HTMLSpanElement;
    unsubscribe: () => void;
};

type WordCountType = 'edited' | 'original' | 'selected' | 'prompt' | 'unselected';

export const createWordCountElement = (type: WordCountType): WordCounter => {
    const wcElement = document.createElement('span');
    wcElement.className = 'text-xs self-center';

    const calculateAndUpdateDisplay = (
        state: ReturnType<typeof generalStore.getState>
    ) => {
        let text: string | undefined;

        switch (type) {
            case 'edited':
                text = state.selectedResponse.operatorResponseMarkdown;
                break;
            case 'original':
                text = state.selectedResponse.modelResponseMarkdown;
                break;
            case 'selected':
                text = state.selectedResponse.selection;
                break;
            case 'prompt':
                // eslint-disable-next-line prefer-destructuring
                text = state.prompt.text;
                break;
            case 'unselected':
                text = state.unselectedResponse.textContent;
                break;
        }

        const count = text ? getWordCount(text) : undefined;
        const countText = count === undefined || count === 0 ? '?' : count.toString();
        wcElement.textContent = `${countText} words ${type !== 'prompt' && type !== 'unselected' ? `(${type})` : ''}`;
    };

    calculateAndUpdateDisplay(generalStore.getState());

    const unsubscribe = generalStore.subscribe(calculateAndUpdateDisplay);

    return {
        element: wcElement,
        unsubscribe
    };
};

export type CopyButton = {
    element: HTMLButtonElement;
    update: () => void;
    unsubscribe: () => void;
};

type CopyButtonType = 'edited' | 'original' | 'prompt';

export const createCopyButtonElement = (type: CopyButtonType): CopyButton => {
    const copyButton = document.createElement('button');
    copyButton.textContent = `Copy ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    copyButton.className =
        'relative box-border flex cursor-pointer items-center justify-center whitespace-nowrap bg-void border border-solid border-main hover:bg-weak-2 hover:border-main text-header w-fit h-6 py-0.5 px-2 text-xs rounded-md disabled:bg-weak-2 disabled:border-main disabled:text-main disabled:cursor-not-allowed disabled:shadow-none space-x-1';

    const update = () => {
        const state = generalStore.getState();
        let content: string | undefined;

        switch (type) {
            case 'edited':
                content = state.selectedResponse.operatorResponseMarkdown;
                break;
            case 'original':
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
            case 'edited':
                content = state.selectedResponse.operatorResponseMarkdown;
                break;
            case 'original':
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

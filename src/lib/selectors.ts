/**
 * Select the target for the MutationObserver that watches for changes at the highest
 * level of MTC. Currently targets MTC's Next.js root element. Does not include the
 * extension's UI.
 */
export const selectGlobalObserverTarget = async () => {
    let element = document.getElementById('__next');

    while (!element) {
        await new Promise(resolve => setTimeout(resolve, 100)); // wait for 100ms before checking again
        element = document.getElementById('__next');
    }

    return element as HTMLDivElement;
};

/**
 * Select the task window element that contains the conversation.
 * @returns The task window element if found, otherwise `undefined`.
 */
export const selectTaskWindowElement = (): HTMLDivElement | undefined => {
    const taskWindow = document.querySelector(
        '#__next > div > div > div > div > div.fixed.top-0.left-0.flex.h-screen.w-screen.items-center.justify-center'
    );

    return taskWindow instanceof HTMLDivElement ? taskWindow : undefined;
};

/**
 * Select the task window close button element.
 * @returns The task window close button element if found, otherwise `undefined`.
 */
export const selectTaskWindowCloseButton = (): SVGElement | undefined => {
    const closeButton = selectTaskWindowHeaderControlsElement()?.children[2];

    return closeButton instanceof SVGElement ? closeButton : undefined;
};

/**
 * Select the snooze button element. Used as an easy way to determine where the
 * task window is.
 * @returns The snooze button element.
 */
const selectSnoozeButtonElement = (): HTMLButtonElement | undefined => {
    const button = document.querySelector("button[title='Snooze']");

    return button instanceof HTMLButtonElement ? button : undefined;
};

const selectTaskWindowHeaderElement = (): HTMLDivElement | undefined => {
    const header =
        selectSnoozeButtonElement()?.parentElement?.parentElement?.parentElement;

    return header instanceof HTMLDivElement ? header : undefined;
};

const selectTaskWindowHeaderControlsElement = (): HTMLDivElement | undefined => {
    const controls = selectTaskWindowHeaderElement()?.children[1];

    return controls instanceof HTMLDivElement ? controls : undefined;
};

/**
 * Select the main task submission button element from a QA task.
 * @returns The task submit button element if found, otherwise `undefined`.
 */
export const selectSubmitButtonElement = (): HTMLButtonElement | undefined => {
    const element = Array.from(document.querySelectorAll('span')).find(span =>
        span.textContent?.trim()?.includes('Submit QA Task')
    )?.parentElement;

    return element instanceof HTMLButtonElement ? element : undefined;
};

/**
 * Select the response code element from the bot response.
 * @returns The response code element if found, otherwise `undefined`.
 */
export const selectResponseCodeElement = () =>
    document.querySelector('div.rounded-xl.bg-pink-100 pre code');

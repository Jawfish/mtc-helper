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

export const selectTaskWindowElement = (): HTMLDivElement | null => {
    const taskWindow = document.querySelector(
        '#__next > div > div > div > div > div.fixed.top-0.left-0.flex.h-screen.w-screen.items-center.justify-center'
    );

    return taskWindow instanceof HTMLDivElement ? taskWindow : null;
};

export const selectTaskWindowCloseButton = (): SVGElement | null => {
    const closeButton = selectTaskWindowHeaderControlsElement()?.children[2];

    return closeButton instanceof SVGElement ? closeButton : null;
};

/**
 * Select the snooze button element. Used as an easy way to determine where the
 * task window is.
 * @returns The snooze button element.
 */
const selectSnoozeButtonElement = (): HTMLButtonElement | null => {
    const button = document.querySelector("button[title='Snooze']");

    return button instanceof HTMLButtonElement ? button : null;
};

const selectTaskWindowHeaderElement = (): HTMLDivElement | null => {
    const header =
        selectSnoozeButtonElement()?.parentElement?.parentElement?.parentElement;

    return header instanceof HTMLDivElement ? header : null;
};
const selectTaskWindowHeaderControlsElement = (): HTMLDivElement | null => {
    const controls = selectTaskWindowHeaderElement()?.children[1];

    return controls instanceof HTMLDivElement ? controls : null;
};

/**
 * Select the main task submission button element from a QA task.
 * @returns The task submit button element if found, otherwise `null`.
 */

export const selectSubmitButtonElement = (): HTMLButtonElement | null => {
    const element = Array.from(document.querySelectorAll('span')).find(span =>
        span.textContent?.trim()?.includes('Submit QA Task')
    )?.parentElement;

    return element instanceof HTMLButtonElement ? element : null;
};

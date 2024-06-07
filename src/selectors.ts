import { log } from "./helpers";
import { cssStore, viewStore } from "./store";

export function getQaFeedbackSection(): HTMLElement | null {
    return getSendCaseButton()?.parentElement?.parentElement ?? null;
}

/**
 * Get the conversation submit button from a QA task. Returns null if not found.
 */
export function getConversationSubmitButton(): HTMLButtonElement | null {
    const span = Array.from(document.querySelectorAll("span")).find((span) =>
        span.textContent?.trim()?.includes("Submit QA Task"),
    );

    if (!span) {
        return null;
    }

    return span.parentElement as HTMLButtonElement | null;
}

export function getResponseCode(): string | null {
    return (
        document.querySelector("div.rounded-xl pre code")?.textContent ?? null
    );
}
// const hasMultipleCodeBlocks = () =>
//     document.querySelectorAll("div.rounded-xl pre code")?.length > 1;

/**
 * Get the snooze button from the page. Used as a cheap way to detect if a conversation
 * is open.
 */
export function getSnoozeButton(): HTMLButtonElement | null {
    return document.querySelector("button[title='Snooze']") ?? null;
}

function getSendCaseButton(): HTMLButtonElement | null {
    return (
        Array.from(document.querySelectorAll("button")).find(
            (button) => button.textContent === "Send case to",
        ) ?? null
    );
}

/**
 * Get the alignment score from the page. Returns -1 if not found.
 */
export function getAlignmentScore(): number {
    const span = Array.from(document.querySelectorAll("span")).find(
        (span) => span.textContent?.trim() === "Alignment %",
    );

    if (!span) {
        return -1;
    }

    const scoreText =
        span.parentElement?.textContent?.split(":")[1]?.trim() ?? "-1";
    return parseInt(scoreText, 10);
}

export function getResponseEditButton(): HTMLButtonElement | null {
    return (
        (Array.from(
            document.querySelectorAll("button[title='Edit']"),
        )[1] as HTMLButtonElement) ?? null
    );
}

export function getTabContainer(): HTMLDivElement | null {
    return (
        (Array.from(
            document.querySelectorAll("div[data-cy='tabsHeaderContainer']"),
        )[1] as HTMLDivElement) ?? null
    );
}

export function getEditedTab(): HTMLDivElement | null {
    const element = (document.getElementById("1") as HTMLDivElement) ?? null;
    if (!element) {
        return null;
    }

    cssStore.setState({ tabCss: element.style.cssText });

    return element;
}

export function getOriginalTab(): HTMLDivElement | null {
    return (document.getElementById("2") as HTMLDivElement) ?? null;
}

function editedTabSelected(): boolean {
    return getEditedTab()?.firstChild?.textContent === "Edited";
}

function originalTabSelected(): boolean {
    return (
        getOriginalTab()?.classList.contains("hover:text-theme-main") ?? false
    );
}

export async function getTabContent(
    tab: "edited" | "original",
    timeout: number = 10000,
): Promise<string | null> {
    return new Promise((resolve, reject) => {
        let intervalId: number;

        const checkContent = () => {
            const conversationOpen = viewStore.getState().conversationOpen;

            if (!conversationOpen) {
                clearInterval(intervalId);
                log(
                    "debug",
                    "Conversation is closed, cancelling diff tab insertion",
                );
                reject(
                    new Error(
                        "Conversation is closed, cancelling diff tab insertion",
                    ),
                );
                return;
            }
            const tabs = document.querySelectorAll("div[data-cy='tab']");
            const content =
                tab === "edited"
                    ? document.querySelector("div[contenteditable='true']")
                          ?.textContent
                    : tabs[tabs.length - 1].textContent;
            if (content) {
                clearInterval(intervalId);
                resolve(content);
            }
        };

        // check immediately, then every 100ms
        // checkContent();
        intervalId = setInterval(checkContent, 100);

        setTimeout(() => {
            clearInterval(intervalId);
            resolve(null);
        }, timeout);
    });
}

export function getTabContentParentElement() {
    return document.querySelectorAll(
        "div[data-cy='tab']",
    )[1] as HTMLDivElement | null;
}

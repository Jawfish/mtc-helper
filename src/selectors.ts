const getQaFeedbackSection = (): HTMLElement | null =>
    getSendCaseButton()?.parentElement?.parentElement ?? null;

/**
 * Get the conversation submit button from the page. Returns null if not found.
 */
const getConversationSubmitButton = (): HTMLButtonElement | null => {
    const span = Array.from(document.querySelectorAll("span")).find((span) =>
        span.textContent?.trim()?.includes("Submit QA Task"),
    );

    if (!span) {
        return null;
    }

    return span.parentElement as HTMLButtonElement | null;
};

const getResponseCode = (): string | null =>
    document.querySelector("div.rounded-xl pre code")?.textContent ?? null;
// const hasMultipleCodeBlocks = () =>
//     document.querySelectorAll("div.rounded-xl pre code")?.length > 1;

/**
 * Get the snooze button from the page. Used as a cheap way to detect if a conversation
 * is open.
 */
const getSnoozeButton = (): HTMLButtonElement | null =>
    document.querySelector("button[title='Snooze']") ?? null;

const getSendCaseButton = (): HTMLButtonElement | null =>
    Array.from(document.querySelectorAll("button")).find(
        (button) => button.textContent === "Send case to",
    ) ?? null;

/**
 * Get the alignment score from the page. Returns -1 if not found.
 */
const getAlignmentScore = (): number => {
    const span = Array.from(document.querySelectorAll("span")).find(
        (span) => span.textContent?.trim() === "Alignment %",
    );

    if (!span) {
        return -1;
    }

    const scoreText =
        span.parentElement?.textContent?.split(":")[1]?.trim() ?? "-1";
    return parseInt(scoreText, 10);
};

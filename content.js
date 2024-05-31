let testsModifiedWithoutSaving = false;
let conversationOpen = false;

function log(level, message) {
    const prefix = "%c[Orochi Helper]";
    const defaultStyle = "color: blue; font-weight: bold;";
    switch (level) {
        case "log":
            console.log(prefix, defaultStyle, message);
            break;
        case "debug":
            console.debug(prefix, "color: black; font-weight: bold;", message);
            break;
        case "info":
            console.info(prefix, defaultStyle, message);
            break;
        case "warn":
            console.warn(prefix, "color: orange; font-weight: bold;", message);
            break;
        case "error":
            console.error(prefix, "color: red; font-weight: bold;", message);
            break;
        default:
            console.log(prefix, defaultStyle, message);
            break;
    }
}

log("info", "Orochi Helper starting...");

// SELECTORS

// const qaFeedbackText = () => {
//     const textAreas = document?.querySelectorAll("textarea");
//     const qaFeedbackTextArea = Array.from(textAreas)?.find(
//         (textArea) => textArea?.innerHTML === "Provide rework/QA feedback"
//     );
//     return qaFeedbackTextArea;
// };

// Use at(-1) because the test editor is the last one to be created
// this is important when creating a new bot response and toggling on "code",
// because that will create a new monaco editor at index 0
const getMonacoEditor = () => window?.monaco?.editor?.getEditors().at(-1);

const getQaFeedbackSection = () =>
    getSendCaseButton().parentElement.parentElement;

const getTestSubmitButton = () => {
    const spans = document.querySelectorAll("span");
    return Array.from(spans).find((span) => {
        const spanText = span.textContent.trim();
        const taskDataText =
            span.parentElement?.parentElement?.parentElement?.firstChild?.firstChild?.firstChild?.textContent?.trim();
        return spanText === "Submit" && taskDataText === "Task Data";
    })?.parentElement;
};

const getConversationSubmitButton = () => {
    const spans = document.querySelectorAll("span");
    return Array.from(spans).find((span) => {
        const spanText = span.textContent.trim();
        return spanText.includes("Submit QA Task");
    })?.parentElement;
};

/**
 * Get the snooze button from the page. Used as a cheap way to detect if a conversation
 * is open.
 */
const getSnoozeButton = () => document.querySelector("button[title='Snooze']");

const getSendCaseButton = () =>
    Array.from(document.querySelectorAll("button")).find(
        (button) => button.textContent === "Send case to"
    );

/**
 * Get the alignment score from the page. Returns -1 if not found.
 */
const getAlignmentScore = () =>
    parseInt(
        Array.from(document.querySelectorAll("input[type='number']")).find(
            (input) =>
                input.parentElement.parentElement.parentElement.parentElement.firstChild.textContent.includes(
                    "Alignment"
                )
        )?.value
    ) || -1;

// LISTENERS

/**
 * Try to attach a listener to the Monaco editor.
 * @param {number} maxRetries - The maximum number of retries.
 * @param {number} retryInterval - The interval between retries in milliseconds.
 * @returns {void}
 */
const attachTestListener = (maxRetries = 10, retryInterval = 1000) => {
    let testEditor = getMonacoEditor();

    if (testEditor) {
        testEditor.onDidChangeModelContent(() => {
            log("debug", "Tests modified without saving.");
            testsModifiedWithoutSaving = true;
        });
    } else if (maxRetries > 0) {
        log("debug", "Monaco editor not found, retrying...");
        setTimeout(
            () => attachTestListener(maxRetries - 1, retryInterval),
            retryInterval
        );
    } else {
        log("error", "Monaco editor not found after maximum retries.");
    }
};

/**
 * Try to attach a listener to the bot response element.
 * @param {number} maxRetries - The maximum number of retries.
 * @param {number} retryInterval - The interval between retries in milliseconds.
 * @returns {void}
 */
const attachBotResponseListener = (maxRetries = 10, retryInterval = 1000) => {
    const botResponse = getBotResponseParentElement();
    if (botResponse) {
        botResponse.addEventListener("dblclick", (event) => {
            event.stopPropagation();
            event.preventDefault();
            log("debug", "Bot response editing prevented.");
        });
        log("debug", "Bot response listener attached to prevent editing.");
    } else if (maxRetries > 0) {
        log("debug", "Bot response element not found, retrying...");
        setTimeout(
            () => attachBotResponseListener(maxRetries - 1, retryInterval),
            retryInterval
        );
    } else {
        log("error", "Bot response element not found after maximum retries.");
    }
};

const injectListeners = () => {
    attachTestListener(5, 1000);
    attachBotResponseListener(10, 1000);
    const testButton = getTestSubmitButton();
    if (testButton) {
        testButton.addEventListener("click", handleTestSubmit);
    }

    const conversationButton = getConversationSubmitButton();
    if (conversationButton) {
        conversationButton.addEventListener("click", handleConversationSubmit);
    }
};

// HANDLERS

const handleTestSubmit = (_) => {
    log("debug", "Attempting to submit tests...");
    testsModifiedWithoutSaving = false;
};

// TODO: make this more specific by checking each case individually
const handleConversationSubmit = (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    log("debug", "Attempting to submit conversation...");
    if (
        testsModifiedWithoutSaving ||
        isBotResponseInvalid() ||
        isAlignmentScoreLow()
    ) {
        const testsModifiedMessage =
            "- The tests may have been modified without saving.";
        const botResponseMessage = "- The bot response may be malformed.";
        const alignmentScoreMessage =
            "- The alignment score is below 85, but the conversation is not marked as a rework.";

        if (
            confirm(
                "Are you sure you want to submit? The following issues were detected:\n" +
                    (testsModifiedWithoutSaving
                        ? testsModifiedMessage + "\n"
                        : "") +
                    (isBotResponseInvalid() ? botResponseMessage + "\n" : "") +
                    (isAlignmentScoreLow()
                        ? alignmentScoreMessage + "\n"
                        : "") +
                    "Click OK to submit anyway or Cancel to cancel the submission."
            )
        ) {
            testsModifiedWithoutSaving = false;
            const conversationButton = getConversationSubmitButton();
            conversationButton.removeEventListener(
                "click",
                handleConversationSubmit
            );
            conversationButton.click();
        } else {
            log("debug", "Conversation submit cancelled.");
        }
    } else {
        log("debug", "No issues detected, submitting conversation.");
        const conversationButton = getConversationSubmitButton();
        conversationButton.removeEventListener(
            "click",
            handleConversationSubmit
        );
        conversationButton.click();
    }
};

// HELPERS

/**
 * Check if the conversation window contains Python code. If any <p> element contains
 * the text "Python", then the code is Python in the onboarding process. If a <button>
 * element with the name attribute "Select Language" contains the text "Python", then
 * the code is Python in the live process.
 *
 * **NOTE:** This will return false positives if the text "Python" is present in the
 * user-submitted prompt.
 *
 * @returns {boolean} - True if the conversation window contains Python code.
 */
const isPython = () => {
    // Can be made more robust in the future by excluding the user prompt from the <p> element check.
    const hasPythonInParagraphs = Array.from(
        document.querySelectorAll("p")
    ).some((p) => p.textContent.includes("Python"));

    const hasPythonInButton = Array.from(
        document.querySelectorAll('button[name="Select Language"]')
    ).some((button) => button.textContent.includes("Python"));

    return hasPythonInParagraphs || hasPythonInButton;
};

const getBotResponseSpanElement = () =>
    Array.from(document.querySelectorAll("span")).find((span) =>
        span.textContent.trim().includes("bot_response")
    );

const getBotResponseParentElement = () =>
    getBotResponseSpanElement()?.parentElement.parentElement;

const getBotResponseCodeElement = () =>
    getBotResponseSpanElement()?.parentElement?.parentElement?.children[1]
        ?.children[0];

// TODO: make this return a message so that the alert can be more specific about what's
// wrong with the bot response. Consider creating an object to provide context about the
// result here. Alternatively, set a global variable that the alert can check to see
// what's wrong.
/**
 * Check if the bot response is invalid. This function checks for the following:
 * - The bot response is not found.
 * - The bot response does not contain a `<code>` element.
 * - The bot response contains a closing HTML tag.
 * - The bot response contains malformed Python.
 *
 * @returns {boolean} - True if the bot response is invalid.
 */
const isBotResponseInvalid = () => {
    // Lines longer than this are suspicious
    const maxLineLength = 240;
    // Select bot response (code submitted by agent)
    // and check for ending HTML tags or Python indentation
    const botCode = getBotResponseCodeElement()?.textContent;
    if (!botCode) {
        log("warn", "Bot response not found.");
        alert("Bot response not found.");
        return true;
    }

    if (!getBotResponseCodeElement()?.querySelector("code")) {
        log("warn", "The bot response does not contain a <code> element.");
        return true;
    }

    // Check for ending HTML tag, since that signifies a broken response. Will
    // have false positives for any code that contains a closing HTML tag as
    // part of the actual code, but the QA can just ignore the alert.
    try {
        const closingTagRegex = /<\/[^>]+>/;
        if (closingTagRegex.test(botCode)) {
            log(
                "warn",
                "Something that appears to be a closing HTML tag was found in the bot response."
            );
            return true;
        }
    } catch (error) {
        log("error", "Error checking for closing HTML tag:", error);
    }

    // Check for malformed Python. Relatively naive.
    try {
        if (!isPython()) {
            log("debug", "The code does not appear to be Python.");
            return false;
        }
        log("debug", "The code appears to be Python.");

        const lines = botCode.split("\n");
        if (lines.length < 2) {
            log("warn", "There are 2 or fewer lines in the bot response.");
            return true;
        }

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isConstant = /^[A-Z_]+/.test(line.split(" ")[0]);
            const isFunctionOrClass =
                line.startsWith("def ") ||
                line.startsWith("class ") ||
                line.startsWith("@") || // Account for decorators
                line.startsWith("async def ");
            const isImport =
                line.startsWith("import ") || line.startsWith("from ");
            const isIndented = line.startsWith("    ");
            const isCommented = line.startsWith("#");

            // Ignore empty lines
            if (line.trim().length === 0) {
                continue;
            }

            if (isCommented) {
                return true;
            }

            if (line.length > maxLineLength) {
                log("warn", `A line is suspiciously long: ${line}`);
                return true;
            }

            if (
                !isConstant &&
                !isImport &&
                !isFunctionOrClass &&
                !isIndented &&
                line.trim().length > 0 && // Ignore empty lines
                !line.startsWith(") ->") // For multi-line function definitions
            ) {
                log(
                    "warn",
                    `Found non-indented line that doesn't appear to be an import, class definition, or function definition: ${line}`
                );
                return true;
            }
        }
    } catch (error) {
        log("error", "Error checking for malformed Python:", error);
    }

    return false;
};

const isAlignmentScoreLow = () => {
    try {
        const element = getQaFeedbackSection();
        const sendToRework =
            element?.children?.length >= 2 &&
            element.children[2]?.textContent?.includes("Rework");

        return getAlignmentScore() < 85 && !sendToRework;
    } catch (error) {
        log("error", "Error checking if alignment score is low:", error);
        return false;
    }
};

// MAIN

const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
        log(
            "debug",
            `Detected DOM change, ${
                getSnoozeButton()
                    ? "waiting for conversation to close..."
                    : "checking for conversation..."
            }`
        );
        if (getSnoozeButton() && !conversationOpen) {
            log("info", "New conversation detected.");
            conversationOpen = true;
            setTimeout(() => {
                injectListeners();
            }, 1000);
        } else if (!getSnoozeButton() && conversationOpen) {
            log("debug", "No conversation detected.");
            conversationOpen = false;
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});

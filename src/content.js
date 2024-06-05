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

const getQaFeedbackSection = () =>
    getSendCaseButton().parentElement.parentElement;

const getConversationSubmitButton = () => {
    const spans = document.querySelectorAll("span");
    return Array.from(spans).find((span) => {
        const spanText = span.textContent.trim();
        return spanText.includes("Submit QA Task");
    })?.parentElement;
};

const getResponseCode = () =>
    document.querySelector("div.rounded-xl pre code")?.textContent;
const hasMultipleCodeBlocks = () =>
    document.querySelectorAll("div.rounded-xl pre code")?.length > 1;

/**
 * Get the snooze button from the page. Used as a cheap way to detect if a conversation
 * is open.
 */
const getSnoozeButton = () => document.querySelector("button[title='Snooze']");

const getSendCaseButton = () =>
    Array.from(document.querySelectorAll("button")).find(
        (button) => button.textContent === "Send case to",
    );

/**
 * Get the alignment score from the page. Returns -1 if not found.
 */
const getAlignmentScore = () =>
    parseInt(
        Array.from(document.querySelectorAll("span"))
            .find((span) => span.textContent.trim() === "Alignment %")
            ?.parentElement?.textContent.split(":")[1],
    ) || -1;

// LISTENERS

const injectListeners = () => {
    const conversationButton = getConversationSubmitButton();
    conversationButton?.addEventListener("click", handleConversationSubmit);
};

// HANDLERS

// TODO: make this more specific by checking each case individually
const handleConversationSubmit = (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    log("debug", "Attempting to submit conversation...");

    const responseStatusMessages = getResponseStatusMessages();

    if (isAlignmentScoreLow()) {
        responseStatusMessages.push(
            "The alignment score is below 85, but the conversation is not marked as a rework.",
        );
    }

    if (responseStatusMessages) {
        if (
            confirm(
                "Are you sure you want to submit? The following issues were detected:\n" +
                    "- " +
                    responseStatusMessages.join("\n") +
                    "Click OK to submit anyway or Cancel to cancel the submission.",
            )
        ) {
            const conversationButton = getConversationSubmitButton();
            conversationButton.removeEventListener(
                "click",
                handleConversationSubmit,
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
            handleConversationSubmit,
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
        document.querySelectorAll("p"),
    ).some((p) => p.textContent.includes("Python"));

    const hasPythonInButton = Array.from(
        document.querySelectorAll('button[name="Select Language"]'),
    ).some((button) => button.textContent.includes("Python"));

    return hasPythonInParagraphs || hasPythonInButton;
};

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
 * @returns An array of strings containing the issues found with the bot response.
 */
const getResponseStatusMessages = () => {
    const messages = [];
    const maxLineLength = 240;
    const responseCode = getResponseCode();

    if (!responseCode?.trim()) {
        log("error", "cannot find bot response");
        return [
            "The code cannot be found in the response. Is it in a markdown block?",
        ];
    }

    // Check for ending HTML tag, since that signifies a broken response. Will
    // have false positives for any code that contains a closing HTML tag as
    // part of the actual code, but the QA can just ignore the alert.
    try {
        const closingTagRegex = /<\/[^>]+>/;
        if (closingTagRegex.test(responseCode)) {
            log(
                "warn",
                "Something that appears to be a closing HTML tag was found in the bot response.",
            );
            messages.push("The bot response appears to contain HTML.");
        }
    } catch (error) {
        log("error", "Error checking for closing HTML tag:", error);
    }

    // Check for malformed Python. Relatively naive.
    try {
        if (!isPython()) {
            log("debug", "The code does not appear to be Python.");
        } else {
            log("debug", "The code appears to be Python.");

            const lines = responseCode.split("\n");
            if (lines.length < 2) {
                log("warn", "There are 2 or fewer lines in the bot response.");
                messages.push("The bot response has suspiciously few lines.");
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

                if (line.length > maxLineLength) {
                    log("warn", `A line is suspiciously long: ${line}`);
                    messages.push(
                        "A line in the bot response is suspiciously long.",
                    );
                }

                if (
                    !isConstant &&
                    !isImport &&
                    !isFunctionOrClass &&
                    !isIndented &&
                    !isCommented &&
                    line.trim().length > 0 && // Ignore empty lines
                    !line.startsWith(") ->") // For multi-line function definitions
                ) {
                    log(
                        "warn",
                        `Found non-indented line that doesn't appear to be an import, class definition, comment, or function definition: ${line}`,
                    );
                    messages.push(
                        `The bot response contains a non-indented line that doesn't appear to be an import, class definition, comment, or function definition: ${line}`,
                    );
                }
            }
        }
    } catch (error) {
        log("error", "Error checking for malformed Python:", error);
    }

    return messages;
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
            }`,
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

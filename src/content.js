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
// const hasMultipleCodeBlocks = () =>
//     document.querySelectorAll("div.rounded-xl pre code")?.length > 1;

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

    const messages = getResponseStatusMessages();
    const prefix =
        "Are you sure you want to submit? The following issues were detected:\n\n";
    const suffix =
        "Click OK to submit anyway or Cancel to cancel the submission.";

    if (messages.length > 0) {
        const formattedMessages = formatMessages(messages).join("");
        if (confirm(prefix + formattedMessages + "\n" + suffix)) {
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
 * Check if the conversation window contains Python code.
 *
 * @returns {boolean} - True if the conversation window contains Python code.
 */
const isPython = () => {
    const hasPythonInSpan =
        Array.from(document.querySelectorAll("span"))
            .find((span) => span.textContent.trim() === "Programming Language")
            ?.parentElement?.textContent.split(":")[1] === "Python";

    const hasPythonInButton = Array.from(
        document.querySelectorAll("button"),
    ).some((button) => button.textContent.includes("Python"));

    return hasPythonInSpan || hasPythonInButton;
};

/**
 * Validate the Python code in the bot response. This is a relatively naive check that
 * performs the following validations:
 *
 * - Ensures the code has more than two lines.
 * - Checks for excessively long lines of code.
 * - Ensures non-indented lines are either constants, imports, function/class
 *   definitions, or comments.
 *
 * @param {string} code - The Python code to validate.
 * @param {string[]} messages - The array to which validation messages will be appended.
 * @returns {void}
 */
const validatePython = (code, messages) => {
    const maxLineLength = 240;

    const lines = code.split("\n");

    const truncateLine = (line) => {
        const truncateLength = 32;
        return line.length > truncateLength
            ? `${line.slice(0, truncateLength)}...`
            : line;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isConstant = /^[A-Z_]+/.test(line.split(" ")[0]);
        const isFunctionOrClass =
            line.startsWith("def ") ||
            line.startsWith("class ") ||
            line.startsWith("@") || // Account for decorators
            line.startsWith("async def ");
        const isImport = line.startsWith("import ") || line.startsWith("from ");
        const isIndented = line.startsWith("    ");
        const isCommented = line.startsWith("#");

        const shortenedLine = truncateLine(line);

        // Ignore empty lines
        if (line.trim().length === 0) {
            continue;
        }

        if (line.length > maxLineLength) {
            log("warn", `A line is suspiciously long: ${line}`);
            messages.push(
                `A line in the bot response is suspiciously long: ${shortenedLine}`,
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
                `[PYTHON] The bot response contains a non-indented line that doesn't appear to be an import, class definition, comment, or function definition: ${shortenedLine}`,
            );
        }

        if (line.includes("#") && !line.trim().startsWith("#")) {
            const suspectedComment = line.split("#")[1].trim();
            log("warn", `Found inline comment: ${line}`);
            messages.push(
                `[PYTHON] The bot response may contain an inline comment: ${suspectedComment}`,
            );
        }
    }
};

/**
 * Check for ending HTML tag, since that signifies a broken response. Will have false
 * positives for any code that contains a closing HTML tag as part of the actual code,
 * but the QA can just ignore the alert.
 *
 * @param {string} code - The code to be checked for HTML tags.
 * @param {string[]} messages - The array to which validation messages will be appended.
 * @returns {void}
 */
const checkForHtmlInCode = (code, messages) => {
    try {
        const closingTagRegex = /<\/[^>]+>/;
        if (closingTagRegex.test(code)) {
            log(
                "warn",
                "Something that appears to be a closing HTML tag was found in the bot response.",
            );
            messages.push("The bot response appears to contain HTML.");
        }
    } catch (error) {
        log("error", "Error checking for closing HTML tag:", error);
    }
};

/**
 * Format the messages with a prefix and newline character.
 *
 * @param {string[]} messages - The messages to be formatted.
 * @returns {string[]} The formatted messages.
 */
const formatMessages = (messages) => {
    return messages.map((message, idx) => `${idx + 1}. ${message}\n`);
};

/**
 * Check if the bot response is invalid. This function checks for the following:
 * - The bot response is not found.
 * - The bot response does not contain a `<code>` element.
 * - The bot response contains a closing HTML tag.
 * - The bot response contains malformed Python.
 *
 * @returns {string[]} An array of strings containing the issues found with the bot
 * response.
 */
const getResponseStatusMessages = () => {
    const messages = [];
    const code = getResponseCode();

    checkAlignmentScore(85, messages);

    if (!code?.trim()) {
        log("error", "cannot find bot response");
        messages.push(
            "The code cannot be found in the response. Is it in a markdown block?",
        );
        return messages;
    }

    if (code.includes("```")) {
        log(
            "warn",
            "The code does not appear to be in a properly-closed markdown code block.",
        );
        messages.push(
            "The code does not appear to be in a properly-closed markdown code block.",
        );
    }

    checkForHtmlInCode(code, messages);

    console.log(code.split("\n").length);
    if (code.split("\n").length <= 3) {
        log("warn", "The bot response has suspiciously few lines.");
        messages.push("The bot response has suspiciously few lines.");
    }

    if (isPython()) {
        log("debug", "The code appears to be Python.");
        validatePython(code, messages);
    }

    return messages;
};

/**
 * Checks if the alignment score is considered low and if the bot response should be
 * reworked.
 *
 * @param {number} threshold - The alignment score threshold below which the response
 * @param {string[]} messages - The array to which validation messages will be appended.
 *
 * @returns {boolean} `true` if the alignment score is below the threshold and the
 * response should not be sent to rework; `false` otherwise.
 */
const checkAlignmentScore = (threshold, messages) => {
    try {
        log("debug", "Checking if alignment score is low...");
        const element = getQaFeedbackSection();
        const sendToRework =
            element?.children?.length >= 2 &&
            element.children[2]?.textContent?.includes("Rework");
        const score = getAlignmentScore();
        if (!score || score == -1) {
            log("warn", "Alignment score not found.");
            return;
        }

        log(
            "debug",
            `Alignment score: ${score}, send to rework: ${sendToRework}`,
        );
        if (score < threshold && !sendToRework) {
            messages.push(
                `The alignment score is ${score}, but the conversation is not marked as a rework.`,
            );
            return true;
        }
    } catch (error) {
        log("error", "Error checking if alignment score is low:", error);
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

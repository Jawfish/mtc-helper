import {
    insertDiffElement,
    insertElements,
    removeDiffElement,
} from "./elements";
import { formatMessages, getResponseStatusMessages, log } from "./helpers";
import { injectListener } from "./listeners";
import {
    getConversationSubmitButton,
    getEditedTab,
    getOriginalTab,
    getTabContent,
} from "./selectors";
import { responseContentStore, viewStore } from "./store";

// TODO: make this more specific by checking each case individually
export function handleConversationSubmit(e: Event) {
    e.preventDefault();
    e.stopImmediatePropagation();
    log("debug", "Attempting to submit conversation...");

    const messages = getResponseStatusMessages();
    const prefix =
        "Are you sure you want to submit? The following issues were detected:\n\n";
    const suffix =
        "Click OK to submit anyway or Cancel to cancel the submission.";
    const conversationButton = getConversationSubmitButton();

    if (!conversationButton) {
        log("error", "Conversation submit button not found.");
        return;
    }

    if (messages.length > 0) {
        const formattedMessages = formatMessages(messages).join("");
        if (confirm(prefix + formattedMessages + "\n" + suffix)) {
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
        conversationButton.removeEventListener(
            "click",
            handleConversationSubmit,
        );
        conversationButton.click();
    }
}

export function handleResponseEditButtonClicked(e: Event) {
    injectListener(getEditedTab, "Edited response tab", "click", (e) =>
        handleTabClicked(e, "edited"),
    );
    injectListener(getOriginalTab, "Original response tab", "click", (e) =>
        handleTabClicked(e, "original"),
    );

    // The edited tab is open by default
    const nullEvent = new Event("");
    handleTabClicked(nullEvent, "edited");

    insertElements();
}

export async function handleTabClicked(e: Event, tab: "edited" | "original") {
    if (e.type === "click") {
        log(
            "debug",
            tab === "edited" ? "Edited tab clicked." : "Original tab clicked.",
        );
    }

    removeDiffElement();

    const tabContent = await getTabContent(tab);

    if (!tabContent) {
        log("error", "Failed to get tab content.");
    } else {
        log(
            "debug",
            `Found content in ${tab === "edited" ? "edited" : "original"} tab.`,
        );

        if (tab === "edited") {
            viewStore.setState({ currentTab: "edited" });
            responseContentStore.getState().setEditedContent(tabContent);
        } else {
            viewStore.setState({ currentTab: "original" });
            responseContentStore.getState().setOriginalContent(tabContent);
        }
    }
}

export function handleDiffTabClicked(e: Event) {
    const originalContent = responseContentStore.getState().originalContent;
    const editedContent = responseContentStore.getState().editedContent;

    if (!originalContent || !editedContent) {
        log(
            "error",
            `Failed to get content for diff tab. Missing ${originalContent ? (editedContent ? "both" : "edited") : "original"} content.`,
        );
        return;
    }

    const diffIsOpen = viewStore.getState().diffOpen;

    if (diffIsOpen) {
        removeDiffElement();
        return;
    }

    insertDiffElement(originalContent, editedContent);
}

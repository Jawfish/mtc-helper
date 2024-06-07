import "./elements";
import "./handlers";
import "./helpers";
import { log } from "./helpers";
import "./listeners";
import { injectListeners } from "./listeners";
import "./selectors";
import { getSnoozeButton } from "./selectors";
import { responseContentStore, viewStore } from "./store";

/**
 * Begin checking for the snooze button to appear in the DOM to determine when a new
 * conversation has been opened.
 */
function initializeOrochiHelper(): void {
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
            if (getSnoozeButton() && !viewStore.getState().conversationOpen) {
                log("info", "New conversation detected.");
                viewStore.setState({ conversationOpen: true });
                responseContentStore.getState().resetContent();
                injectListeners();
            } else if (
                !getSnoozeButton() &&
                viewStore.getState().conversationOpen
            ) {
                log("debug", "No conversation detected.");
                viewStore.setState({ conversationOpen: false });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

initializeOrochiHelper();

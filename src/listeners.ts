import {
    handleConversationSubmit,
    handleResponseEditButtonClicked,
} from "./handlers";
import { log } from "./helpers";
import {
    getConversationSubmitButton,
    getResponseEditButton,
} from "./selectors";

export function injectListener(
    selector: () => HTMLElement | null,
    elementName: string,
    event: string,
    handler: (e: Event) => void,
    retries = 10,
    timeBetweenRetries = 1000,
) {
    const element = selector();

    if (!element) {
        log("warn", `${elementName} element not found`);
        setTimeout(() => {
            if (retries > 0) {
                injectListener(
                    selector,
                    elementName,
                    event,
                    handler,
                    retries - 1,
                    timeBetweenRetries,
                );
            }
        }, timeBetweenRetries);
    } else {
        log("debug", `Adding ${event} listener for ${elementName}`);
        element.addEventListener(event, handler);
    }

    if (retries === 0) {
        log("error", `Failed to add ${event} listener for ${elementName}`);
    }
}

export function injectListeners() {
    injectListener(
        getConversationSubmitButton,
        "conversation button",
        "click",
        handleConversationSubmit,
    );
    injectListener(
        getResponseEditButton,
        "response edit button",
        "click",
        handleResponseEditButtonClicked,
    );
}

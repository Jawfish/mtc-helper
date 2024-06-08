import {
    handleConversationSubmit,
    handleResponseEditButtonClicked,
} from "./handlers";
import { log } from "./helpers";
import {
    getConversationSubmitButtonAsync,
    getResponseEditButton,
} from "./selectors";

export async function injectListener(
    selector: () => Promise<HTMLElement | null>,
    elementName: string,
    event: string,
    handler: (e: Event) => void,
): Promise<void> {
    log("debug", `Adding ${event} listener for ${elementName}`);
    const element = await selector();

    if (!element) {
        throw new Error(`Element not found: ${elementName}`);
    }

    element.addEventListener(event, handler);
    log("debug", `${event} listener added for ${elementName}`);
}

export function injectListeners() {
    injectListener(
        getConversationSubmitButtonAsync,
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

import {
    handleConversationSubmit,
    handleResponseEditButtonClicked,
} from "./handlers";
import { log } from "./helpers";
import {
    getConversationSubmitButton,
    getResponseEditButton,
} from "./selectors";

export async function injectListener(
    selector: () => Promise<HTMLElement | null>,
    elementName: string,
    event: string,
    handler: (e: Event) => void,
    timeout: number = 10000,
): Promise<void> {
    log("debug", `Adding ${event} listener for ${elementName}`);

    try {
        const element = await Promise.race([
            selector(),
            new Promise<HTMLElement>((_, reject) =>
                setTimeout(() => reject(new Error(`Timeout waiting for element: ${elementName}`)), timeout)
            )
        ]);

        if (!element) {
            throw new Error(`Element not found: ${elementName}`);
            }

        element.addEventListener(event, handler);
        log("debug", `${event} listener added for ${elementName}`);
    } catch (error) {
        log("error", `Failed to add ${event} listener for ${elementName}: ${(error as Error).message}`);
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

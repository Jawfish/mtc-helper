import { diffLines } from "diff";
import { log } from "./helpers";
import { getTabContentParentElement } from "./selectors";
import { viewStore } from "./store";

export async function insertDiffTab(
    tabContainerSelector: () => HTMLDivElement | null,
    styles: string,
    onClick: (e: Event) => void,
    timeout: number = 10000,
): Promise<void> {
    return new Promise((resolve, reject) => {
        let intervalId: number;

        const insertTab = () => {
            const tabContainer = tabContainerSelector();
            const diffTabInserted = viewStore.getState().diffTabInserted;
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

            if (tabContainer && !diffTabInserted) {
                clearInterval(intervalId);

                log("debug", "Inserting diff tab");

                const diffTab = document.createElement("div");

                diffTab.className = "tab hover:text-theme-main";
                diffTab.textContent = "Toggle Diff";
                diffTab.style.cssText = styles;
                diffTab.style.cursor = "pointer";
                diffTab.addEventListener("click", onClick);

                tabContainer.appendChild(diffTab);
                viewStore.setState({ diffTabInserted: true });

                resolve();
            }
        };

        // check immediately, then every 100ms
        insertTab();
        intervalId = setInterval(insertTab, 100);

        setTimeout(() => {
            clearInterval(intervalId);
            log("error", "Failed to insert diff tab");
            reject(new Error("Failed to insert diff tab"));
        }, timeout);
    });
}

export function insertDiffElement(
    originalContent: string,
    editedContent: string,
): void {
    log(
        "debug",
        `Inserting diff element
Original content:

${originalContent}

--------------------------------------------------------------------------------------

Edited content:
${editedContent}

--------------------------------------------------------------------------------------
`,
    );

    viewStore.setState({ diffOpen: true });

    const diff = diffLines(originalContent, editedContent, {});
    const fragment = document.createDocumentFragment();
    const container = getTabContentParentElement();

    diff.forEach((part) => {
        const color = part.added ? "green" : part.removed ? "red" : "grey";
        const bgColor = part.added
            ? "#E3F4E4"
            : part.removed
              ? "#F7E8E9"
              : "#f8f9fa";

        const prefix = part.added ? "-" : part.removed ? "+" : "";
        const style = document.createElement("style");
        const pre = document.createElement("pre");

        pre.style.color = color;
        pre.style.backgroundColor = bgColor;
        pre.textContent = prefix + part.value;
        pre.classList.add("diff-pre");

        style.textContent = `
.diff-pre {
    margin: 0 !important;
}
`;
        document.head.append(style);
        fragment.appendChild(pre);
    });

    const diffView = document.createElement("div");
    diffView.id = "diffView";
    diffView.appendChild(fragment);
    container?.prepend(diffView);
}

export function removeDiffElement(): void {
    log("debug", "Removing diff element");
    viewStore.setState({ diffOpen: false });
    const diffView = document.getElementById("diffView");
    diffView?.parentNode?.removeChild(diffView);
}

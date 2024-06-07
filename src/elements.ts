import { diffWords } from "diff";
import { handleDiffTabClicked } from "./handlers";
import { log } from "./helpers";
import { getTabContainer, getTabContentParentElement } from "./selectors";
import { cssStore, viewStore } from "./store";

async function insertDiffTab(
    tabContainerSelector: () => HTMLDivElement | null,
    styles: string,
    onClick: (e: Event) => void,
    timeout: number = 10000,
): Promise<void> {
    return new Promise((resolve, reject) => {
        let intervalId: number;

        const insertTab = () => {
            const tabContainer = tabContainerSelector();

            if (tabContainer) {
                clearInterval(intervalId);

                log("debug", "Inserting diff tab");

                const diffTab = document.createElement("div");

                diffTab.className = "tab hover:text-theme-main";
                diffTab.textContent = "Diff";
                diffTab.style.cssText = styles;
                diffTab.style.cursor = "pointer";
                diffTab.addEventListener("click", onClick);

                tabContainer.appendChild(diffTab);
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

export async function insertElements(): Promise<void> {
    log("debug", "Inserting elements");

    try {
        await insertDiffTab(
            getTabContainer,
            cssStore.getState().tabCss,
            handleDiffTabClicked,
        );
    } catch (error) {
        log("error", "Failed to insert elements: " + (error as Error).message);
    }
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

    const diff = diffWords(originalContent, editedContent);
    const fragment = document.createDocumentFragment();
    const container = getTabContentParentElement();

    diff.forEach((part) => {
        const color = part.added ? "green" : part.removed ? "red" : "grey";
        const pre = document.createElement("pre");
        pre.style.color = color;
        pre.textContent = part.value;
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

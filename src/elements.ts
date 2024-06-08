import { diffLines } from "diff";
import { log, poll } from "./helpers";
import { getTabContentParentElement } from "./selectors";
import { viewStore } from "./store";

export async function insertDiffTab(
    tabContainerSelector: () => Promise<HTMLDivElement | null>,
    onClick: (e: Event) => void,
): Promise<void> {
    const tabContainer = await tabContainerSelector();
    if (!tabContainer) {
        log("error", "No tab container found, cancelling diff tab insertion");
        throw new Error(
            "No tab container found, cancelling diff tab insertion",
        );
    }

    const diffTabInserted = viewStore.getState().diffTabInserted;
    const conversationOpen = viewStore.getState().conversationOpen;

    if (!conversationOpen) {
        log("error", "No conversation, cancelling diff tab insertion");
        throw new Error("No conversation, cancelling diff tab insertion");
    }
    if (!tabContainer) {
        log("error", "No tab container, cancelling diff tab insertion");
        throw new Error("No tab container, cancelling diff tab insertion");
    }
    if (diffTabInserted) {
        log("warn", "Diff tab already inserted");
    }

    log("debug", "Inserting diff tab");
    const diffTab = document.createElement("div");

    diffTab.className = "tab hover:text-theme-main";
    diffTab.textContent = "Toggle Diff";
    diffTab.style.cursor = "pointer";
    diffTab.addEventListener("click", onClick);

    tabContainer.appendChild(diffTab);
    viewStore.setState({ diffTabInserted: true });
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

        const prefix = part.added ? "+ " : part.removed ? "- " : "";
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

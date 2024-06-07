import { createStore } from "zustand/vanilla";
import { log } from "./helpers";

interface ResponseContentState {
    editedContent: string;
    originalContent: string;
    setEditedContent: (content: string) => void;
    setOriginalContent: (content: string) => void;
    resetContent: () => void;
}

export const responseContentStore = createStore<ResponseContentState>(
    (set) => ({
        editedContent: "",
        originalContent: "",
        // this is used like store.getState().setEditedContent(tabContent);
        // this could also be done with store.setState({ editedContent: tabContent }),
        // but this way lets us process the content within the store before setting it
        setEditedContent: (content: string) => {
            log("debug", `Setting edited content in the store: ${content}`);
            set({ editedContent: content });
        },
        setOriginalContent: (content: string) => {
            log("debug", `Setting original content in the store: ${content}`);
            set({ originalContent: content });
        },
        resetContent: () => {
            log("debug", "Resetting response content store");
            set({ editedContent: "", originalContent: "" });
        },
    }),
);

interface CssState {
    tabCss: string;
    setTabCss: (css: string) => void;
}

export const cssStore = createStore<CssState>((set) => ({
    tabCss: "",
    setTabCss: (css: string) => {
        log("debug", `Setting tab CSS in the store: ${css}`);
        set({ tabCss: css });
    },
}));

type Tab = "edited" | "original";

interface ViewState {
    currentTab: Tab;
    diffOpen: boolean;
    conversationOpen: boolean;
    setCurrentTab: (tab: Tab) => void;
    setConversationOpen: (open: boolean) => void;
}

export const viewStore = createStore<ViewState>((set) => ({
    currentTab: "edited",
    diffOpen: false,
    conversationOpen: false,
    setCurrentTab: (tab: Tab) => {
        log("debug", `Setting current tab in the store: ${tab}`);
        set({ currentTab: tab });
    },
    setDiffOpen: (open: boolean) => {
        log("debug", `Setting diff open in the store: ${open}`);
        set({ diffOpen: open });

        if (!open) {
            // delete the diff element
        }
    },
    setConversationOpen: (open: boolean) => {
        log("debug", `Setting conversation open in the store: ${open}`);
        set({ conversationOpen: open });
    },
}));

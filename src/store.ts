import { createStore } from "zustand/vanilla";
import { log } from "./helpers";

interface SignalState {
    abortController: AbortController;
    setAbortSignal: () => void;
    getAbortSignal: () => AbortSignal;
    reset: () => void;
}

// Global event bus
export const signalStore = createStore<SignalState>((set, get) => ({
    abortController: new AbortController(),
    setAbortSignal: () => {
        const newController = new AbortController();
        log("debug", "Setting signal in the store");
        set({ abortController: newController });
    },
    getAbortSignal: () => {
        return get().abortController.signal;
    },
    reset: () => {
        log("debug", "Resetting signal store");
        const newController = new AbortController();
        set({ abortController: newController });
    },
}));

interface ResponseContentState {
    editedContent: string;
    originalContent: string;
    setEditedContent: (content: string) => void;
    setOriginalContent: (content: string) => void;
    reset: () => void;
}

export const responseContentStore = createStore<ResponseContentState>(
    (set) => ({
        editedContent: "",
        originalContent: "",
        // this is used like store.getState().setEditedContent(tabContent);
        // this could also be done with store.setState({ editedContent: tabContent }),
        // but this way lets us process the content within the store before setting it
        setEditedContent: (content: string) => {
            log(
                "debug",
                `Setting edited content in the store:
${content}`,
            );
            set({ editedContent: content });
        },
        setOriginalContent: (content: string) => {
            log(
                "debug",
                `Setting original content in the store:
${content}`,
            );
            set({ originalContent: content });
        },
        reset: () => {
            log("debug", "Resetting response content store");
            set({ editedContent: "", originalContent: "" });
        },
    }),
);

type Tab = "edited" | "original";

interface ViewState {
    currentTab: Tab;
    diffOpen: boolean;
    diffTabInserted: boolean;
    conversationOpen: boolean;
    setCurrentTab: (tab: Tab) => void;
    setConversationOpen: (open: boolean) => void;
    reset: () => void;
}

export const viewStore = createStore<ViewState>((set) => ({
    currentTab: "edited",
    diffOpen: false,
    diffTabInserted: false,
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
    setDiffTabInserted: (inserted: boolean) => {
        set({ diffTabInserted: inserted });
    },
    setConversationOpen: (open: boolean) => {
        log("debug", `Setting conversation open in the store: ${open}`);
        set({ conversationOpen: open });
    },
    reset: () => {
        log("debug", "Resetting view store");
        set({
            currentTab: "edited",
            diffOpen: false,
            diffTabInserted: false,
            conversationOpen: false,
        });
    },
}));

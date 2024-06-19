import { truncateString } from '@src/lib/helpers';
import Logger from '@src/lib/logging';
import { create } from 'zustand';

export type ResponseContent = {
    original?: string;
    edited?: string;
    previousOriginal?: string;
    previousEdited?: string;
};

export type ContentStoreState = {
    taskId: string | undefined;
    orochiTests: string | undefined;
    orochiPrompt: string | undefined;
    orochiOperatorNotes: string | undefined;
    orochiErrorLabels: string | undefined;
    orochiConversationTitle: string | undefined;
    orochiResponse: ResponseContent;
    orochiCode: ResponseContent;
    pandaEditedResponse: string | undefined;
    pandaOriginalResponse: string | undefined;
};

type ContentStoreActions = {
    setTaskId: (id: string | undefined) => void;
    setOrochiTests: (content: string | undefined) => void;
    setOrochiPrompt: (content: string | undefined) => void;
    setOrochiOperatorNotes: (content: string | undefined) => void;
    setOrochiErrorLabels: (content: string | undefined) => void;
    setOrochiConversationTitle: (content: string | undefined) => void;
    setOrochiResponse: (content: ResponseContent) => void;
    setOrochiCode: (content: ResponseContent) => void;
    setPandaEditedResponse: (content: string | undefined) => void;
    setPandaOriginalResponse: (content: string | undefined) => void;
    reset: () => void;
};

const initialState: ContentStoreState = {
    taskId: undefined,
    orochiTests: undefined,
    orochiPrompt: undefined,
    orochiOperatorNotes: undefined,
    orochiErrorLabels: undefined,
    orochiConversationTitle: undefined,
    orochiResponse: {},
    orochiCode: {},
    pandaEditedResponse: undefined,
    pandaOriginalResponse: undefined
};

// The actions defined in here intentionally use shallow comparison because we want to
// err on the side of updating the store to fresh state rather than missing updates.
// JSON.stringify is used to compare objects because we only care about the content of
// the object, not that they are the same object.
export const useContentStore = create<ContentStoreState & ContentStoreActions>(
    (set, get) => ({
        ...initialState,
        setTaskId: id => {
            if (id == get().taskId) {
                return;
            }

            Logger.debug(`Setting setting task ID to ${id} in store.`);

            set({ taskId: id });
        },
        setOrochiTests: content => {
            if (content == get().orochiTests) {
                return;
            }

            Logger.debug(
                `Setting test content to "${truncateString(content)}" in store.`
            );

            set({ orochiTests: content });
        },
        setOrochiResponse: content => {
            if (JSON.stringify(content) == JSON.stringify(get().orochiResponse)) {
                return;
            }

            Logger.debug(`Updating orochi response content in store.`);

            set({ orochiResponse: { ...content } });
        },
        setOrochiCode: content => {
            if (JSON.stringify(content) == JSON.stringify(get().orochiCode)) {
                return;
            }

            Logger.debug(`Updating orochi code in store.`);

            set({ orochiCode: { ...content } });
        },
        setPandaEditedResponse: content => {
            if (content == get().pandaEditedResponse) {
                return;
            }

            Logger.debug(
                `Setting panda edited response to "${truncateString(content)}" in store.`
            );

            set({ pandaEditedResponse: content });
        },
        setPandaOriginalResponse: content => {
            if (content == get().pandaOriginalResponse) {
                return;
            }

            Logger.debug(
                `Setting panda original response to "${truncateString(content)}" in store.`
            );

            set({ pandaOriginalResponse: content });
        },
        setOrochiPrompt: content => {
            if (content == get().orochiPrompt) {
                return;
            }

            Logger.debug(
                `Setting orochiPrompt to "${truncateString(content)}" in store.`
            );

            set({ orochiPrompt: content });
        },
        setOrochiOperatorNotes: content => {
            if (content == get().orochiOperatorNotes) {
                return;
            }

            Logger.debug(
                `Setting orochiOperatorNotes to "${truncateString(content)}" in store.`
            );

            set({ orochiOperatorNotes: content });
        },
        setOrochiErrorLabels: content => {
            if (content == get().orochiErrorLabels) {
                return;
            }

            Logger.debug(
                `Setting orochiErrorLabels to "${truncateString(content)}" in store.`
            );

            set({ orochiErrorLabels: content });
        },
        setOrochiConversationTitle: content => {
            if (content == get().orochiConversationTitle) {
                return;
            }

            Logger.debug(
                `Setting orochiConversationTitle to "${truncateString(content)}" in store.`
            );

            set({ orochiConversationTitle: content });
        },
        reset: () => {
            if (JSON.stringify(get()) == JSON.stringify(initialState)) {
                return;
            }

            Logger.debug('Resetting content store');

            set({ ...initialState });
        }
    })
);

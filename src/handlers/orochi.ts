import Logger from '@src/lib/logging';
import {
    selectMetadataSectionElement as selectEditedViewMetadataSectionElement,
    selectOriginalTabContentElement
} from '@src/selectors/shared';
import { useContentStore } from '@src/store/ContentStore';
import { Process, useMTCStore } from '@src/store/MTCStore';
import {
    selectResponseElement,
    selectPromptElement,
    selectOrochiOperatorNotesElement,
    selectOrochiConversationTitle,
    selectOrochiErrorLabels,
    selectOrochiTaskWindowMetadataSectionElement
} from '@src/selectors/orochi';
import { getTextFromElement } from '@src/lib/helpers';

import {
    addMtcHelperAttributeToElement,
    elementHasMtcHelperAttribute,
    MutHandler
} from './shared';

export const handleOrochiPromptMutation: MutHandler = (mutation: MutationRecord) => {
    const isOrochi = useMTCStore.getState().process === 'Orochi';
    const element = selectPromptElement();
    if (!isOrochi || !element) {
        return;
    }

    const processedText = getTextFromElement(element);

    useContentStore.getState().setOrochiPrompt(processedText);
};

export const handleOrochiOriginalResponseMutation: MutHandler = (
    mutation: MutationRecord
) => {
    const isOrochi = useMTCStore.getState().process === 'Orochi';
    const element = selectOriginalTabContentElement();
    if (!isOrochi || !element) {
        return;
    }

    const state = useContentStore.getState();
    const { orochiResponse, orochiCode } = state;

    const responseChanged = orochiResponse.previousOriginal !== orochiResponse.original;
    const codeChanged = orochiCode.previousOriginal !== orochiCode.original;

    const elementSeen = elementHasMtcHelperAttribute(element);

    // The element has already been seen and the content hasn't changed
    if (elementSeen && !responseChanged && !codeChanged) {
        return;
    }

    Logger.debug('Handling change in original response element state.');

    // The element has either not been seen or the content has changed
    if (!elementSeen) {
        addMtcHelperAttributeToElement(element);
    }

    const newResponse = element.textContent || undefined;
    const newCode = element.querySelector('pre code')?.textContent || undefined;

    state.setOrochiResponse({
        ...orochiResponse,
        original: newResponse,
        previousOriginal: orochiResponse.original
    });
    state.setOrochiCode({
        ...orochiCode,
        original: newCode,
        previousOriginal: orochiCode.original
    });
};

// TODO: Currently almost identical to originalContentMutHandler.
export const handleOrochiEditedResponseMutation: MutHandler = (
    mutation: MutationRecord
) => {
    const isOrochi = useMTCStore.getState().process === 'Orochi';
    const element = selectResponseElement();
    if (!isOrochi || !element) {
        return;
    }

    // Remove the first character which is the number associated with the response
    const elemContent = element.textContent?.slice(1) || undefined;
    const elemCode = element.querySelector('pre code')?.textContent || undefined;

    const state = useContentStore.getState();
    const { orochiResponse, orochiCode } = state;

    const responseChanged = elemContent !== orochiResponse.edited;
    const codeChanged = elemCode !== orochiCode.edited;

    // The element has already been seen and the content hasn't changed
    if (elementHasMtcHelperAttribute(element) && !responseChanged && !codeChanged) {
        return;
    }

    Logger.debug('Handling change in edited response element state.');

    // The element has either not been seen or the content has changed
    if (!elementHasMtcHelperAttribute(element)) {
        addMtcHelperAttributeToElement(element);
    }

    state.setOrochiResponse({
        ...orochiResponse,
        edited: elemContent,
        previousEdited: orochiResponse.edited
    });
    state.setOrochiCode({
        ...orochiCode,
        edited: elemCode,
        previousEdited: orochiCode.edited
    });
};

export const handleOrochiEditedViewMetadataSectionMutation: MutHandler = (
    mutation: MutationRecord
) => {
    const { process } = useMTCStore.getState();
    const element = selectEditedViewMetadataSectionElement();
    if (!(process == Process.Orochi) || !element) {
        return;
    }
    element.remove();
    Logger.debug('Metadata section removed.');
};

export const handleOrochiTaskWindowMetadataSectionMutation: MutHandler = (
    mutation: MutationRecord
) => {
    const { process } = useMTCStore.getState();
    const element = selectOrochiTaskWindowMetadataSectionElement();
    if (!(process == Process.Orochi) || !element) {
        return;
    }

    const state = useContentStore.getState();
    const operatorNotes = getTextFromElement(selectOrochiOperatorNotesElement());
    const conversationTitle = selectOrochiConversationTitle()?.textContent || undefined;
    const errorLabels = selectOrochiErrorLabels()?.textContent || undefined;

    state.setOrochiOperatorNotes(operatorNotes);
    state.setOrochiConversationTitle(conversationTitle);
    state.setOrochiErrorLabels(errorLabels);
};

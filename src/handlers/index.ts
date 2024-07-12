/**
 * Handlers will be called by the MutationObserver on each mutation where
 * target.nodeType === Node.ELEMENT_NODE.
 *
 * The handlers are exported as arrays associated with their project so that they can be
 * passed to the MutationObserver and run only when a relevant mutation is detected.
 */

import { handleAnyCloseButtonMutation } from './global/closeButton';
import { handleAnySubmitButtonMutation } from './global/submitButton';
import { handleAnyTaskWindowMutation } from './global/taskWindow';
import { handleLanguageMutation } from './orochi/language';
import { handleResponseMutation } from './orochi/response';
import { handlePromptMutation as handleOrochiPromptMutation } from './orochi/prompt';
import { handleReturnTargetMutation } from './orochi/rework';
import { handleScoreMutation } from './orochi/score';
import { handleUsefulMetadataSection } from './orochi/usefulMetadata';
import { handleUselessMetadataSection } from './orochi/uselessMetadata';
import {
    resetSelectedResponseState,
    updateModelResponseState,
    updateOperatorResponseState
} from './general/onMut_selectedResponse_updateSelectedResponseState';
import { updateUnselectedResponseState } from './general/onMut_unselectedResponse_updateUnselectedResponseState';
import { resetPromptState } from './general/onClick_promptCloseButton_resetPromptState';
import { updatePromptState } from './general/onMut_selectedPrompt_updatePromptState';

export type MutHandler = (target: Element) => void;
export type ClickHandler = (event: MouseEvent, target: Element) => void;

export type MutHandlers = {
    global: MutHandler[];
    orochi: MutHandler[];
    general: MutHandler[];
};

export type ClickHandlers = {
    global: ClickHandler[];
    orochi: ClickHandler[];
    general: ClickHandler[];
};

/**
 * Add a data-mtc-helper attribute to an element to indicate that it has been handled by
 * the extension.
 */
export const addMtcHelperAttributeToElement = (element: Element) => {
    element.setAttribute('data-mtc-helper', 'true');
};

/**
 * Check if an element has a data-mtc-helper attribute, indicating that it has been
 * handled by the extension.
 */
export const elementHasMtcHelperAttribute = (element: Element) => {
    return Boolean(element.attributes.getNamedItem('data-mtc-helper'));
};

export const mutHandlers: MutHandlers = {
    global: [
        handleAnyTaskWindowMutation,
        handleAnyCloseButtonMutation,
        handleAnySubmitButtonMutation
    ],
    orochi: [
        handleLanguageMutation,
        updateModelResponseState,
        handleOrochiPromptMutation,
        handleResponseMutation,
        handleReturnTargetMutation,
        handleScoreMutation,
        handleUsefulMetadataSection,
        handleUselessMetadataSection
    ],
    general: [
        updateOperatorResponseState,
        updateModelResponseState,
        updateUnselectedResponseState,
        updatePromptState,
        resetSelectedResponseState
    ]
};

export const clickHandlers: ClickHandlers = {
    global: [],
    orochi: [],
    general: [resetPromptState]
};

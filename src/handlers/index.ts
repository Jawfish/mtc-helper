/**
 * Handlers will be called by the MutationObserver on each mutation where
 * target.nodeType === Node.ELEMENT_NODE.
 *
 * The handlers are exported as arrays associated with their project so that they can be
 * passed to the MutationObserver and run only when a relevant mutation is detected.
 */

import { onMut_submitButton_updateTaskOpenState } from './global/onMut_submitButton_updateTaskOpenState';
import { onMut_taskWindow_updateTaskOpenState } from './global/onMut_taskWindow_updateTaskOpenState';
import { onMut_languageMetadata_updateLanguage } from './orochi/onMut_orochiLanguageMetadata_updateOrochiLanguageState';
import { onMut_response_updateResponseState } from './orochi/onMut_response_updateResponseState';
import { onMut_prompt_updatePromptState as handleOrochiPromptMutation } from './orochi/onMut_prompt_updatePromptState';
import { onMut_usefulMetadata_updateMetadataState } from './orochi/onMut_usefulMetadata_updateMetadataState';
import { onMut_uselessMetadata_removeUselessMetadata } from './orochi/onMut_uselessMetadata_removeUselessMetadata';
import {
    onMut_selectedResponse_resetSelectedResponseState,
    onMut_modelResponse_updateModelResponseState,
    onMut_operatorResponse_updateOperatorResponseState
} from './general/onMut_selectedResponse_updateSelectedResponseState';
import { onMut_unselectedResponse_updateUnselectedResponseState } from './general/onMut_unselectedResponse_updateUnselectedResponseState';
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
        onMut_taskWindow_updateTaskOpenState,
        onMut_submitButton_updateTaskOpenState
    ],
    orochi: [
        onMut_languageMetadata_updateLanguage,
        onMut_modelResponse_updateModelResponseState,
        handleOrochiPromptMutation,
        onMut_response_updateResponseState,
        onMut_usefulMetadata_updateMetadataState,
        onMut_uselessMetadata_removeUselessMetadata
    ],
    general: [
        onMut_operatorResponse_updateOperatorResponseState,
        onMut_modelResponse_updateModelResponseState,
        onMut_unselectedResponse_updateUnselectedResponseState,
        updatePromptState,
        onMut_selectedResponse_resetSelectedResponseState
    ]
};

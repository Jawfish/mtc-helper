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
import { handleOperatorResponseMutation } from './general/operatorResponse';
import { handleEditResponseButtonMutation } from './general/editResponseButton';
import { handleModelResponseMutation } from './general/modelResponse';
import { handlePromptMutation as handleGeneralPromptMutation } from './general/prompt';
import { handleSaveButtonMutation } from './general/saveButton';
import { handleUnselectedResponseMutation } from './general/unselectedResponse';

export type MutHandler = (target: Element) => void;

export interface Handlers {
    global: MutHandler[];
    orochi: MutHandler[];
    general: MutHandler[];
}

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

export const handlers: Handlers = {
    global: [
        handleAnyTaskWindowMutation,
        handleAnyCloseButtonMutation,
        handleAnySubmitButtonMutation
    ],
    orochi: [
        handleLanguageMutation,
        handleModelResponseMutation,
        handleOrochiPromptMutation,
        handleResponseMutation,
        handleReturnTargetMutation,
        handleScoreMutation,
        handleUsefulMetadataSection,
        handleUselessMetadataSection
    ],
    general: [
        handleOperatorResponseMutation,
        handleEditResponseButtonMutation,
        handleModelResponseMutation,
        handleGeneralPromptMutation,
        handleSaveButtonMutation,
        handleUnselectedResponseMutation
    ]
};

/**
 * Handlers that satisfy this type will be  called by the MutationObserver on each
 * mutation where target.nodeType === Node.ELEMENT_NODE.
 *
 * The imported files should ONLY contain handlers that implement this type. They are
 * all exported as arrays below so that they can be passed to the MutationObserver. This
 * is so that they can automatically be treated as handlers once defined.
 *
 * These originally had selectors injected as an argument to help with testing. Given a
 * choice between mocking selectors and mocking the DOM, a mocked DOM that is structured
 * like the real DOM is more useful than fake selectors.
 */

import { handleAnyCloseButtonMutation } from './global/closeButton';
import { handleAnySubmitButtonMutation } from './global/submitButton';
import { handleAnyTaskWindowMutation } from './global/taskWindow';
import { handleLanguageMutation } from './orochi/language';
import { handlePromptMutation } from './orochi/prompt';
import { handleResponseMutation } from './orochi/response';
import { handleReturnTargetMutation } from './orochi/rework';
import { handleScoreMutation } from './orochi/score';
import { handleUsefulMetadataSection } from './orochi/usefulMetadata';
import { handleUselessMetadataSection } from './orochi/uselessMetadata';
import { handleGeneralEditedResponseMutation } from './general/editedResponse';
import { handleGeneralEditResponseButtonMutation } from './general/editResponseButton';
import { handleGeneralOriginalResponseMutation } from './general/originalResponse';
import { handleGeneralPromptMutation } from './general/prompt';
import { handleSaveButtonMutation } from './general/saveButton';
import { Handlers } from './types';

export const addMtcHelperAttributeToElement = (element: Element) => {
    element.setAttribute('data-mtc-helper', 'true');
};

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
        handleUselessMetadataSection,
        handleUsefulMetadataSection,
        handlePromptMutation,
        handleResponseMutation,
        handleReturnTargetMutation,
        handleScoreMutation
    ],
    general: [
        handleGeneralEditedResponseMutation,
        handleGeneralEditResponseButtonMutation,
        handleGeneralOriginalResponseMutation,
        handleGeneralPromptMutation,
        handleSaveButtonMutation
    ]
};

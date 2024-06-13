import { formatMessages, determineWarnings, log } from './helpers';

import { DiffViewState, store } from './store';
import { selectSubmitButtonElement } from './selectors';

export function handleSubmitButtonClicked(e: Event) {
    e.preventDefault();
    e.stopImmediatePropagation();
    log('debug', 'Attempting to submit conversation...');

    const messages = determineWarnings();
    log('debug', `Found ${messages.length} issues.`);
    const prefix =
        'Are you sure you want to submit? The following issues were detected:\n\n';
    const suffix = 'Click OK to submit anyway or Cancel to cancel the submission.';
    const conversationButton = selectSubmitButtonElement();

    if (!conversationButton) {
        log('error', 'Conversation submit button not found.');
        return;
    }

    log('debug', 'Conversation submit button found.');

    if (messages.length > 0) {
        const formattedMessages = formatMessages(messages).join('');
        if (confirm(prefix + formattedMessages + suffix)) {
            log('debug', 'Conversation submit confirmed. Removing listener.');
            conversationButton.removeEventListener('click', handleSubmitButtonClicked);
            log('debug', 'Clicking conversation submit button.');
            conversationButton.click();
        } else {
            log('debug', 'Conversation submit cancelled.');
        }
    } else {
        log('debug', 'No issues detected, submitting conversation.');
        conversationButton.removeEventListener('click', handleSubmitButtonClicked);
        conversationButton.click();
    }
}

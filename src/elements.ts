import {
    copyConversation,
    copyEmail,
    copyId,
    determineWarnings,
    isPython,
    log,
    logDiff
} from './helpers';

import { selectSubmitButtonElement } from './selectors';
import { store } from './store';
import React from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';

// TODO: These buttons are ported functionality from bookmarklets. They're a bit hacked-together right now and the code can be cleaned up, but they work fine.
export function insertCheckButton(): void {
    log('debug', 'Inserting check button');
    const checkButton = document.createElement('button');
    const submitButton = selectSubmitButtonElement();
    const span = document.createElement('span');

    span.textContent = 'Check Task';
    checkButton.className = submitButton?.className || '';
    checkButton.addEventListener('click', () => {
        log('debug', 'Check button clicked');
        const messages = determineWarnings();
        if (messages.length === 0) {
            alert('No issues detected.');
            return;
        }
        alert(messages.join('\n'));
    });
    checkButton.appendChild(span);

    const toolbar = store.getState().orochiToolbar;
    if (!toolbar) {
        log('error', 'Orochi toolbar not found while inserting check button');
        return;
    }

    toolbar.appendChild(checkButton);
}

export function insertConvoCopyButton(): void {
    log('debug', 'Inserting conversation copy button');
    const copyButton = document.createElement('button');
    const submitButton = selectSubmitButtonElement();
    const span = document.createElement('span');

    span.textContent = 'Copy Conversation';
    copyButton.className = submitButton?.className || '';
    copyButton.addEventListener('click', () => {
        log('debug', 'Copy button clicked');
        copyConversation();
    });
    copyButton.appendChild(span);

    const toolbar = store.getState().orochiToolbar;
    if (!toolbar) {
        log('error', 'Orochi toolbar not found while inserting copy convo button');
        return;
    }

    toolbar.appendChild(copyButton);
}

export function insertCopyIdButton(): void {
    log('debug', 'Inserting copy ID button');
    const copyIdButton = document.createElement('button');
    const submitButton = selectSubmitButtonElement();
    const span = document.createElement('span');

    span.textContent = 'Copy ID';
    copyIdButton.className = submitButton?.className || '';
    copyIdButton.addEventListener('click', () => {
        log('debug', 'Copy ID button clicked');
        copyId();
    });
    copyIdButton.appendChild(span);

    const toolbar = store.getState().orochiToolbar;
    if (!toolbar) {
        log('error', 'Orochi toolbar not found while inserting copy ID button');
        return;
    }

    toolbar.appendChild(copyIdButton);
}

export function insertCopyEmailButton(): void {
    log('debug', 'Inserting copy email button');
    const copyEmailButton = document.createElement('button');
    const submitButton = selectSubmitButtonElement();
    const span = document.createElement('span');

    span.textContent = 'Copy Email';
    copyEmailButton.className = submitButton?.className || '';
    copyEmailButton.addEventListener('click', () => {
        log('debug', 'Copy email button clicked');
        copyEmail();
    });
    copyEmailButton.appendChild(span);

    const toolbar = store.getState().orochiToolbar;
    if (!toolbar) {
        log('error', 'Orochi toolbar not found while inserting copy email button');
        return;
    }

    toolbar.appendChild(copyEmailButton);
}

/**
 * Inserts a toolbar that is always visible at the top of the page and on top of all other elements.
 */
export function insertOrochiHelperToolbar(): void {
    log('debug', 'Inserting Orochi Helper toolbar');
    const toolbar = document.createElement('div');

    toolbar.id = 'orochiToolbar';
    toolbar.style.position = 'fixed';
    toolbar.style.top = '0';
    toolbar.style.left = '50%';
    toolbar.style.transform = 'translateX(-50%)';
    toolbar.style.display = 'flex';
    toolbar.style.gap = '1em';
    toolbar.style.backgroundColor = '#FFFFFFCC';
    toolbar.style.borderBottomLeftRadius = '0.5em';
    toolbar.style.borderBottomRightRadius = '0.5em';
    toolbar.style.boxShadow = '0 0 1em 0.5em #00000022';
    toolbar.style.padding = '1em';
    toolbar.style.flexDirection = 'row';
    toolbar.style.justifyContent = 'center';
    toolbar.style.alignItems = 'center';
    toolbar.style.width = 'auto';
    toolbar.style.zIndex = '1000';

    store.setState({ orochiToolbar: toolbar });

    document.body.appendChild(toolbar);
    if (isPython()) {
        insertConvoCopyButton();
    }
    // TODO: make these take the toolbar and their styles as an argument
    insertCopyIdButton();
    insertCopyEmailButton();
    insertCheckButton();
    insertDiffButton();
}

export function insertDiffButton(): void {
    log('debug', 'Inserting diff button');
    const diffButton = document.createElement('button');
    const submitButton = selectSubmitButtonElement();
    const span = document.createElement('span');

    span.textContent = 'Diff';
    diffButton.className = submitButton?.className || '';
    diffButton.addEventListener('click', () => {
        if (!store.getState().originalContent) {
            alert('The original content must be viewed before diffing.');
            return;
        }
        log('debug', 'Diff button clicked');
        const modalOpen = store.getState().diffModalOpen;

        if (modalOpen) {
            log('debug', 'Diff modal already open');
            store.getState().reactRoot?.render(null);
            store.setState({ diffModalOpen: false });
            return;
        }

        openDiffModal(store.getState().originalContent, store.getState().editedContent);
    });
    diffButton.appendChild(span);

    const toolbar = store.getState().orochiToolbar;
    if (!toolbar) {
        log('error', 'Orochi toolbar not found while inserting diff button');
        return;
    }

    toolbar.appendChild(diffButton);
}

// TODO: extract to proper tsx component?
export function openDiffModal(originalContent: string, editedContent: string): void {
    logDiff(originalContent, editedContent);

    const diffViewerElement = React.createElement(ReactDiffViewer, {
        oldValue: originalContent,
        newValue: editedContent,
        splitView: true
    });

    const closeModal = () => {
        store.setState({ diffModalOpen: false });
        store.getState().reactRoot?.render(null);
        document.removeEventListener('keydown', handleKeyDown);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    };

    const backgroundProps = {
        style: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'fixed',
            zIndex: '1000',
            left: '0',
            top: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.4)'
        },
        onClick: (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) closeModal();
        }
    };

    const contentProps = {
        style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '90%',
            height: '90%',
            backgroundColor: '#fff',
            position: 'relative',
            overflow: 'auto'
        }
    };

    const closeButtonProps = {
        style: {
            color: 'red',
            zIndex: '1001',
            position: 'absolute',
            top: '20px',
            right: '20px',
            fontSize: '28px',
            fontWeight: 'bold',
            cursor: 'pointer'
        },
        onClick: closeModal
    };

    const Modal = React.createElement(
        'div',
        backgroundProps,
        React.createElement('span', closeButtonProps, '🗙'),
        React.createElement('div', contentProps, diffViewerElement)
    );

    document.addEventListener('keydown', handleKeyDown);
    store.getState().reactRoot?.render(Modal);
    store.setState({ diffModalOpen: true });
}

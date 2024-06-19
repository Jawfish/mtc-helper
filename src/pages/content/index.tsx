import './style.css';
import { createRoot } from 'react-dom/client';
import Logger from '@src/lib/logging';
import Watermark from '@src/components/Watermark';
import Toolbar from '@src/components/Toolbar';
import {
    initializeMonacoObserver,
    initializeMutationObserver,
    initializeUrlObserver
} from '@src/lib/init';
import { selectGlobalObserverTarget, selectTaskIdElement } from '@src/selectors/shared';
import { useMTCStore } from '@src/store/MTCStore';
import { injectScriptDest } from '@src/types/injectTypes';
import { useState } from 'react';
import Toasts from '@src/components/Toasts';
import { Tooltip } from 'react-tooltip';
import { ToastProvider } from '@src/contexts/ToastContext';
import {
    handleAnyCloseButtonMutation,
    handleAnySubmitButtonMutation,
    handleAnyTaskWindowMutation
} from '@handlers/shared';
import DiffViewer from '@src/components/DiffViewer';
import { TurndownProvider } from '@src/contexts/TurndownContext';
import {
    handleOrochiEditedResponseMutation,
    handleOrochiEditedViewMetadataSectionMutation,
    handleOrochiOriginalResponseMutation,
    handleOrochiPromptMutation,
    handleOrochiTaskWindowMetadataSectionMutation
} from '@src/handlers/orochi';
import { handlePandaResponseMutation } from '@src/handlers/panda';

const div = document.createElement('div');
div.id = 'mtc-helper-root';
document.body.appendChild(div);

const rootContainer = document.querySelector('#mtc-helper-root');
if (!rootContainer) throw new Error("Can't find Content root element");
const root = createRoot(rootContainer);

// TODO: refactor
const App = () => {
    const [diffViewOpen, setDiffViewOpen] = useState(false);
    const { taskOpen } = useMTCStore();

    if (!taskOpen) return <Watermark version='1.0.0' />;

    return (
        <>
            <Tooltip
                id='mtc-helper-tooltip'
                className='z-[1100] shadow text-base'
                variant='light'
                opacity={1}
                offset={10}
                delayShow={500}
                border={'1px solid lightgray'}
                openEvents={{ focus: false, mouseover: true, mouseenter: true }}
            />
            <Toasts />
            <Toolbar
                diffViewOpen={diffViewOpen}
                setDiffViewOpen={setDiffViewOpen}
                taskIdElementSelector={selectTaskIdElement}
            />
            {/* {process == Process.Orochi && <OrochiMetadata />} */}
            {diffViewOpen && (
                <TurndownProvider>
                    <DiffViewer setDiffViewOpen={setDiffViewOpen} />
                </TurndownProvider>
            )}
            <Watermark version='1.0.0' />
        </>
    );
};

/**
 * This is an async IIFE because it needs to wait for the observer target element to
 * exist for the extension to work at all. In the future this can probably done within
 * the React app and there can be much less reliance on the stores, keeping state local
 * to the components.
 */
(async () => {
    try {
        Logger.info('MTC Helper initializing...');

        const observerTarget = await selectGlobalObserverTarget();

        initializeMutationObserver(
            [
                handleAnyCloseButtonMutation,
                handleAnySubmitButtonMutation,
                handleAnyTaskWindowMutation,
                handleOrochiEditedResponseMutation,
                handleOrochiEditedViewMetadataSectionMutation,
                handleOrochiOriginalResponseMutation,
                handleOrochiPromptMutation,
                handleOrochiTaskWindowMetadataSectionMutation,
                handlePandaResponseMutation
            ],
            observerTarget
        );

        initializeUrlObserver();
        initializeMonacoObserver();

        Logger.debug('Injecting extension onto page');
        root.render(
            <ToastProvider>
                <App />
            </ToastProvider>
        );

        const injectScriptElement = document.createElement('script');
        injectScriptElement.src = chrome.runtime.getURL(injectScriptDest);
        (document.head || document.documentElement).appendChild(injectScriptElement);

        Logger.info('MTC Helper initialized.');
    } catch (e) {
        Logger.error(`Error initializing MTC Helper: ${(e as Error).message}`);
    }
})();

import { useEffect, useState } from 'react';
import Logger from '@lib/logging';
import * as globalActions from '@mtc/actions/global';
import * as globalSelectors from '@mtc/selectors/global';
import * as orochiActions from '@mtc/actions/orochi';
import * as orochiSelectors from '@mtc/selectors/orochi';
import * as mathSelectors from '@mtc/selectors/math';
import * as genericProcessActions from '@mtc/actions/genericProcess';
import * as genericProcessSelectors from '@mtc/selectors/genericProcess';
import { globalStore } from '@src/store/globalStore';
import { orochiStore } from '@src/store/orochiStore';
import { MutationHandler } from '@mtc/MutationHandler';
import { genericProcessStore } from '@src/store/genericProcessStore';

const useMutationHandler = () => {
    const [mutationHandler, setMutationHandler] = useState<MutationHandler | null>(
        null
    );

    useEffect(() => {
        const initializeMutationHandler = async () => {
            Logger.debug('Attempting to initialize mutation handler');

            const targetNode = await new Promise<Node>(resolve => {
                const target = document.querySelector('#__next');

                if (target) {
                    resolve(target);

                    return;
                }

                const observer = new MutationObserver(mutations => {
                    for (const mutation of mutations) {
                        for (const node of mutation.addedNodes) {
                            if (node instanceof Element && node.id === '__next') {
                                observer.disconnect();
                                resolve(node);

                                return;
                            }
                        }
                    }
                });

                observer.observe(document.body, { childList: true, subtree: true });
            });

            const newMutationHandler = new MutationHandler(targetNode);
            initializeActions(newMutationHandler);
            setMutationHandler(newMutationHandler);
            Logger.debug('Mutation handler initialized');
        };

        initializeMutationHandler();

        return () => {
            if (mutationHandler) {
                mutationHandler.disconnect();
            }
        };
        // Don't add mutationHandler to the dependencies array or it will cause an
        // infinite loop. Could also use useRef to avoid this.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const initializeActions = (mutationHandler: MutationHandler) => {
        Logger.debug('Adding actions to mutation handler');

        mutationHandler.addAction(
            globalSelectors.taskWindow,
            globalActions.updateTaskOpenState,
            globalStore,
            {
                runIfElementMissing: true,
                processes: ['Generic', 'STEM', 'Orochi', 'Math']
            }
        );

        mutationHandler.addAction(
            globalSelectors.submitButton,
            globalActions.addListenerToTaskSubmitButton,
            globalStore,
            {
                markElement: 'submit-listener-added',
                runIfElementMissing: false,
                processes: ['Generic', 'STEM', 'Orochi']
            }
        );

        mutationHandler.addAction(
            orochiSelectors.prompt,
            orochiActions.updatePrompt,
            orochiStore,
            {
                markElement: 'prompt-seen',
                runIfElementMissing: false,
                processes: ['Orochi']
            }
        );

        mutationHandler.addAction(
            orochiSelectors.languageMetadata,
            orochiActions.updateLanguage,
            orochiStore,
            {
                markElement: 'language-seen',
                runIfElementMissing: false,
                processes: ['Orochi']
            }
        );

        mutationHandler.addAction(
            orochiSelectors.testHeader,
            orochiActions.updateLanguage,
            orochiStore,
            {
                markElement: 'language-seen',
                runIfElementMissing: false,
                processes: ['Orochi']
            }
        );

        mutationHandler.addAction(
            orochiSelectors.operatorResponseCode,
            orochiActions.updateLanguage,
            orochiStore,
            {
                markElement: 'language-seen',
                runIfElementMissing: false,
                processes: ['Orochi']
            }
        );

        mutationHandler.addAction(
            globalSelectors.modelResponse,
            orochiActions.updateModelResponse,
            orochiStore,
            {
                markElement: 'model-response-seen',
                runIfElementMissing: false,
                processes: ['Orochi']
            }
        );

        mutationHandler.addAction(
            globalSelectors.editableOperatorResponse,
            orochiActions.updateOperatorResponse,
            orochiStore,
            { runIfElementMissing: false, processes: ['Orochi'] }
        );

        mutationHandler.addAction(
            globalSelectors.modelResponse,
            genericProcessActions.updateSelectedModelResponse,
            genericProcessStore,
            {
                markElement: 'model-response-seen',
                runIfElementMissing: false,
                processes: ['Generic', 'STEM']
            }
        );

        mutationHandler.addAction(
            globalSelectors.editableOperatorResponse,
            genericProcessActions.updateOperatorResponse,
            genericProcessStore,
            { runIfElementMissing: false, processes: ['Generic', 'STEM'] }
        );

        mutationHandler.addAction(
            globalSelectors.selectedResponse,
            genericProcessActions.resetSelectedResponse,
            genericProcessStore,
            { runIfElementMissing: true, processes: ['Generic', 'STEM'] }
        );

        mutationHandler.addAction(
            genericProcessSelectors.unselectedResponse,
            genericProcessActions.updateUnselectedModelResponse,
            genericProcessStore,
            {
                markElement: 'unselected-response-seen',
                runIfElementMissing: true,
                processes: ['Generic', 'STEM']
            }
        );

        mutationHandler.addAction(
            genericProcessSelectors.selectedPrompt,
            genericProcessActions.updateSelectedPrompt,
            genericProcessStore,
            { runIfElementMissing: true, processes: ['Generic', 'STEM'] }
        );

        mutationHandler.addAction(
            globalSelectors.editableOperatorResponse,
            orochiActions.updateOperatorResponse,
            orochiStore,
            { runIfElementMissing: false, processes: ['Orochi'] }
        );

        mutationHandler.addAction(
            orochiSelectors.nonEditableOperatorResponse,
            orochiActions.updateOperatorResponseCode,
            orochiStore,
            { runIfElementMissing: false, processes: ['Orochi'] }
        );

        mutationHandler.addAction(
            orochiSelectors.uselessMetadataSection,
            orochiActions.removeUselessMetadata,
            orochiStore,
            { runIfElementMissing: false, processes: ['Orochi'] }
        );

        mutationHandler.addAction(
            orochiSelectors.operatorNotes,
            orochiActions.updateOperatorNotes,
            orochiStore,
            {
                markElement: 'operator-notes-seen',
                runIfElementMissing: false,
                processes: ['Orochi']
            }
        );

        mutationHandler.addAction(
            orochiSelectors.conversationTitle,
            orochiActions.updateConversationTitle,
            orochiStore,
            {
                markElement: 'conversation-title-seen',
                runIfElementMissing: false,
                processes: ['Orochi']
            }
        );

        mutationHandler.addAction(
            mathSelectors.prompt,
            genericProcessActions.updateOperatorResponse,
            genericProcessStore,
            {
                markElement: 'math-prompt-seen',
                runIfElementMissing: false,
                processes: ['Math']
            }
        );

        mutationHandler.addAction(
            mathSelectors.scratchpad,
            genericProcessActions.updateSelectedModelResponse,
            genericProcessStore,
            {
                runIfElementMissing: false,
                processes: ['Math']
            }
        );

        mutationHandler.addAction(
            mathSelectors.finalAnswer,
            genericProcessActions.updateUnselectedModelResponse,
            genericProcessStore,
            {
                runIfElementMissing: false,
                processes: ['Math']
            }
        );

        Logger.debug('Actions added to mutation handler');
    };

    return mutationHandler;
};

export default useMutationHandler;

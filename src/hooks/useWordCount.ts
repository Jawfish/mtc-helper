import { useState, useEffect, useCallback } from 'react';
import { getWordCount } from '@lib/textProcessing';
import { useGeneralStore } from '@src/store/generalStore';
import { useGlobalStore } from '@src/store/globalStore';

type UseWordCountReturn = {
    operatorWordCount: number;
    selectionWordCount: number;
    unselectedModelWordCount: number;
    selectedModelWordCount: number;
    promptWordCount: number;
    ignoreListNumbers: boolean;
    toggleIgnoreListNumbers: () => void;
    toggleWordCountView: () => void;
    wordCountViewOpen: boolean;
};

export const useWordCount = (): UseWordCountReturn => {
    const {
        operatorResponseMarkdown,
        modelResponsePlaintext,
        prompt,
        unselectedResponse,
        wordCountViewOpen,
        toggleWordCountView: storeToggle
    } = useGeneralStore();

    const { ignoreListNumbers, toggleIgnoreListNumbers } = useGlobalStore();
    const [selectionWordCount, setSelectionWordCount] = useState(0);

    const toggleWordCountView = useCallback(() => {
        storeToggle();
    }, [storeToggle]);

    const updateSelectionWordCount = useCallback(() => {
        const selection = window.getSelection();
        const selectedText = selection?.toString() || '';
        setSelectionWordCount(getWordCount(selectedText, ignoreListNumbers));
    }, [ignoreListNumbers]);

    useEffect(() => {
        document.addEventListener('selectionchange', updateSelectionWordCount);

        return () => {
            document.removeEventListener('selectionchange', updateSelectionWordCount);
        };
    }, [updateSelectionWordCount]);

    const operatorWordCount = getWordCount(
        operatorResponseMarkdown || '',
        ignoreListNumbers
    );
    const unselectedModelWordCount = getWordCount(
        unselectedResponse || '',
        ignoreListNumbers
    );
    const selectedModelWordCount = getWordCount(
        modelResponsePlaintext || '',
        ignoreListNumbers
    );
    const promptWordCount = getWordCount(prompt || '', ignoreListNumbers);

    return {
        operatorWordCount,
        selectionWordCount,
        unselectedModelWordCount,
        selectedModelWordCount,
        promptWordCount,
        ignoreListNumbers,
        toggleIgnoreListNumbers,
        toggleWordCountView,
        wordCountViewOpen
    };
};

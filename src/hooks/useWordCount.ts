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
};

export const useWordCount = (): UseWordCountReturn => {
    const { selectedResponse, prompt, unselectedResponse } = useGeneralStore();

    const { ignoreListNumbers, toggleIgnoreListNumbers } = useGlobalStore();
    const [selectionWordCount, setSelectionWordCount] = useState(0);

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
        selectedResponse.operatorResponseMarkdown || '',
        ignoreListNumbers
    );
    const unselectedModelWordCount = getWordCount(
        unselectedResponse.textContent || '',
        ignoreListNumbers
    );
    const selectedModelWordCount = getWordCount(
        selectedResponse.modelResponseMarkdown || '',
        ignoreListNumbers
    );
    const promptWordCount = getWordCount(prompt.text || '', ignoreListNumbers);

    return {
        operatorWordCount,
        selectionWordCount,
        unselectedModelWordCount,
        selectedModelWordCount,
        promptWordCount,
        ignoreListNumbers,
        toggleIgnoreListNumbers
    };
};

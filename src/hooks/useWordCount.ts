import { useState, useEffect, useCallback } from 'react';
import { useGenericProcessStore } from '@src/store/genericProcessStore';
import { useGlobalStore } from '@src/store/globalStore';
import Logger from '@lib/logging';
import { isRTL } from '@lib/textProcessing';

// TODO: If the text is NOT Chinese but DOES contain Chinese characters (i.e. kanji,
// hanja), count things normally except for Chinese characters which should be counted
// individually.
const isChinese = (text: string): boolean => {
    // Check for CJK characters
    const hasCJK = /[\u4e00-\u9faf]/.test(text);

    // Check for Hiragana or Katakana
    const hasJapanese = /[\u3040-\u309f\u30a0-\u30ff]/.test(text);

    // Return true if there are CJK characters but no Japanese-specific characters,
    // indicating that the text is likely Chinese
    return hasCJK && !hasJapanese;
};

const getWordCount = (text: string, ignoreListNumbers?: boolean): number => {
    // This implementation provides parity with how the MTL team is counting words with
    // Google Docs. They have external tooling for more precise word counts. Hopefully,
    // that implementation can be integrated here.
    if (isChinese(text.replaceAll(' ', ''))) {
        Logger.debug('Counting Chinese characters as words');

        return text.replace(/\s+/g, '').length;
    }

    // Remove any numbering at the start of each line (e.g. "1. "; LTR only)
    const PREPROCESS_PATTERN = /^\d+\. /gm;

    // What to count as a word
    const WORD_PATTERN = /(?<!^|\n)\d+\.|\S+/gu;

    // If a string is made of entirely these characters, don't count it as a word
    const IGNORE_PATTERN = /^[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~""]+$/;

    // Use the preprocessed text for LTR languages, otherwise use the original text
    const preprocessedText =
        isRTL(text) || !ignoreListNumbers ? text : text.replace(PREPROCESS_PATTERN, '');
    const matches = preprocessedText.match(WORD_PATTERN);
    if (!matches) return 0;

    return matches
        .flatMap(word => {
            // Count decimal numbers as two words
            if (/^.\d+\.?$/.test(word)) {
                return word.replace(/\.$/, '').split('.');
            }

            // If two numbers/words are separated by one of these, count them as two
            // words
            return word.split(/[[\]/:—–,.^(){}+*/&=\\]/);
        })
        .filter(word => word.length > 0 && !IGNORE_PATTERN.test(word)).length;
};

export const useWordCount = () => {
    const {
        operatorResponseMarkdown,
        modelResponsePlaintext,
        prompt,
        unselectedResponse,
        wordCountViewOpen,
        toggleWordCountView: storeToggle
    } = useGenericProcessStore();

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

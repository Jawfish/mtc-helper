import Logger from '@lib/logging';
import { useCallback } from 'react';

class ClipboardError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ClipboardError';
    }
}

const cleanText = (text: string): string =>
    text.replace(/&nbsp;/g, '').replace(/\u00A0/g, '');

const copyToClipboard = async (text: string): Promise<void> => {
    try {
        await navigator.clipboard.writeText(cleanText(text));
    } catch (error) {
        throw new ClipboardError(`Error copying text to clipboard: ${error}`);
    }
};

export const useClipboard = () => {
    const copy = useCallback(async (content: string | undefined): Promise<boolean> => {
        if (!content) {
            Logger.warn('Attempted to copy undefined or empty content to clipboard');

            return false;
        }

        try {
            await copyToClipboard(content);
            Logger.debug('Successfully copied content to clipboard');

            return true;
        } catch (error) {
            Logger.error('Failed to copy content to clipboard:', error);
            throw error;
        }
    }, []);

    return { copy };
};

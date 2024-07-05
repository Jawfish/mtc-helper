import { copyToClipboard } from '@lib/clipboard';
import Logger from '@lib/logging';
import { useCallback } from 'react';

type ClipboardContent = string | undefined;

/**
 * Custom hook for copying content to the clipboard.
 */
export function useClipboard() {
    const copy = useCallback(async (content: ClipboardContent): Promise<boolean> => {
        if (content === undefined) {
            Logger.warn('Attempted to copy undefined content to clipboard');

            return false;
        }

        try {
            await copyToClipboard(content);
            Logger.debug('Successfully copied content to clipboard');

            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            Logger.error(`Failed to copy content to clipboard: ${errorMessage}`);
            throw new Error(`Clipboard operation failed: ${errorMessage}`);
        }
    }, []);

    return { copy };
}

import { copyToClipboard } from '@lib/clipboard';
import Logger from '@lib/logging';
import { useCallback } from 'react';

export function useClipboard() {
    const copy = useCallback(async (text: string | null) => {
        try {
            await copyToClipboard(text);
            Logger.debug(`Successfully copied content to clipboard`);
        } catch (error) {
            Logger.error(`Failed to copy content to clipboard: ${error}`);

            throw error;
        }
    }, []);

    return { copy };
}

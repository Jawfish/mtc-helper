import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyToClipboard } from '@lib/clipboard';
import Logger from '@lib/logging';
import { act, renderHook } from '@testing-library/react';

import { useClipboard } from './useClipboard';

vi.mock('@lib/clipboard');
vi.mock('@lib/logging');

describe('useClipboard', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should copy text to clipboard successfully', async () => {
        const { result } = renderHook(() => useClipboard());

        await act(async () => {
            await result.current.copy('Test text');
        });

        expect(copyToClipboard).toHaveBeenCalledWith('Test text');
        expect(Logger.debug).toHaveBeenCalledWith(
            'Successfully copied content to clipboard'
        );
    });

    it('should handle errors when copying fails', async () => {
        const error = new Error('Clipboard error');
        vi.mocked(copyToClipboard).mockRejectedValueOnce(error);

        const { result } = renderHook(() => useClipboard());

        await act(async () => {
            await expect(result.current.copy('Test text')).rejects.toThrow(
                'Clipboard error'
            );
        });

        expect(copyToClipboard).toHaveBeenCalledWith('Test text');
        expect(Logger.error).toHaveBeenCalledWith(
            'Failed to copy content to clipboard: Error: Clipboard error'
        );
    });

    it('should handle null input', async () => {
        const { result } = renderHook(() => useClipboard());

        await act(async () => {
            await result.current.copy(null);
        });

        expect(copyToClipboard).toHaveBeenCalledWith(null);
    });
});

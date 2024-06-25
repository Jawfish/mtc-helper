import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyToClipboard } from '@lib/clipboard';
import { act, renderHook } from '@testing-library/react';

import { useClipboard } from './useClipboard';

vi.mock('@lib/clipboard');

describe('useClipboard', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should copy text to clipboard successfully', async () => {
        const testText = 'Test text';
        const { result } = renderHook(() => useClipboard());

        await act(async () => {
            const success = await result.current.copy(testText);
            expect(success).toBe(true);
        });

        expect(copyToClipboard).toHaveBeenCalledWith(testText);
    });

    it('should handle errors when copying fails', async () => {
        const testText = 'Test text';
        const error = new Error('Clipboard error');
        vi.mocked(copyToClipboard).mockRejectedValueOnce(error);

        const { result } = renderHook(() => useClipboard());

        await expect(
            act(async () => {
                await result.current.copy(testText);
            })
        ).rejects.toThrow('Clipboard operation failed: Clipboard error');

        expect(copyToClipboard).toHaveBeenCalledWith(testText);
    });

    it('should handle null input', async () => {
        const { result } = renderHook(() => useClipboard());

        await act(async () => {
            const success = await result.current.copy(null);
            expect(success).toBe(true);
        });

        expect(copyToClipboard).toHaveBeenCalledWith(null);
    });

    it('should handle undefined input', async () => {
        const { result } = renderHook(() => useClipboard());

        await act(async () => {
            const success = await result.current.copy(undefined);
            expect(success).toBe(false);
        });

        expect(copyToClipboard).not.toHaveBeenCalled();
    });

    it('should handle non-Error objects thrown by copyToClipboard', async () => {
        const testText = 'Test text';
        vi.mocked(copyToClipboard).mockRejectedValueOnce('String error');

        const { result } = renderHook(() => useClipboard());

        await expect(
            act(async () => {
                await result.current.copy(testText);
            })
        ).rejects.toThrow('Clipboard operation failed: String error');

        expect(copyToClipboard).toHaveBeenCalledWith(testText);
    });
});

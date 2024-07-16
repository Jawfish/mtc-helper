import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useClipboard } from './useClipboard';

describe('useClipboard', () => {
    let clipboardContent: string | undefined;

    beforeEach(() => {
        clipboardContent = undefined;
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: async (text: string) => {
                    clipboardContent = text;
                },
                readText: async () => clipboardContent
            },
            configurable: true
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should copy text to clipboard successfully', async () => {
        const { result } = renderHook(() => useClipboard());
        const testText = 'Test text';

        await act(async () => {
            const success = await result.current.copy(testText);
            expect(success).toBe(true);
        });

        expect(await navigator.clipboard.readText()).toBe(testText);
    });

    it('should handle undefined input', async () => {
        const { result } = renderHook(() => useClipboard());

        await act(async () => {
            const success = await result.current.copy(undefined);
            expect(success).toBe(false);
        });

        expect(await navigator.clipboard.readText()).toBe(undefined);
    });

    it('should handle empty string input', async () => {
        const { result } = renderHook(() => useClipboard());

        await act(async () => {
            const success = await result.current.copy('');
            expect(success).toBe(false);
        });

        expect(await navigator.clipboard.readText()).toBe(undefined);
    });

    it('should clean text before copying', async () => {
        const { result } = renderHook(() => useClipboard());
        const dirtyText = 'Text with&nbsp;nbsp and\u00A0nbsp';
        const expectedCleanText = 'Text withnbsp andnbsp';

        await act(async () => {
            const success = await result.current.copy(dirtyText);
            expect(success).toBe(true);
        });

        expect(await navigator.clipboard.readText()).toBe(expectedCleanText);
    });

    it('should handle errors when copying fails', async () => {
        // Simulate a clipboard error
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: async () => {
                    throw new Error('Clipboard error');
                }
            },
            configurable: true
        });

        const { result } = renderHook(() => useClipboard());
        const testText = 'Test text';

        await act(async () => {
            await expect(result.current.copy(testText)).rejects.toThrow();
        });
    });
});

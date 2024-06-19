import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { copyToClipboard, ClipboardError } from './clipboard';

describe('Attempting to copy content', () => {
    let writeTextMock: Mock;

    beforeEach(() => {
        writeTextMock = vi.fn();
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText: writeTextMock },
            writable: true,
            configurable: true
        });
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('successfuly copies content to clipboard when content is found', async () => {
        const text = 'test text';
        const writeTextSpy = vi
            .spyOn(navigator.clipboard, 'writeText')
            .mockResolvedValue();
        await copyToClipboard(text);
        expect(writeTextSpy).toHaveBeenCalledWith(text);
    });

    it('throws an error when trying to copy null', async () => {
        await expect(copyToClipboard(null)).rejects.toThrow(ClipboardError);
    });

    it('handles unexpected errors while copying to clipboard', async () => {
        const text = 'test text';
        const originalError = new Error('Unexpected error');
        vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(originalError);

        await expect(copyToClipboard(text)).rejects.toThrow(ClipboardError);
        await expect(copyToClipboard(text)).rejects.toThrow(
            /Error copying text to clipboard/
        );
        await expect(copyToClipboard(text)).rejects.toThrow(/Unexpected error/);

        vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
            new TypeError('Type error')
        );
        await expect(copyToClipboard(text)).rejects.toThrow(ClipboardError);
        await expect(copyToClipboard(text)).rejects.toThrow(/Type error/);

        vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue('String error');
        await expect(copyToClipboard(text)).rejects.toThrow(ClipboardError);
        await expect(copyToClipboard(text)).rejects.toThrow(/String error/);
    });
});

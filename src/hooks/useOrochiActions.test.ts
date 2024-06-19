/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '@src/contexts/ToastContext';
import { useOrochiStore } from '@src/store/orochiStore';

import { useOrochiActions } from './useOrochiActions';
import { useClipboard } from './useClipboard';

// Mock the required modules
vi.mock('./useClipboard');
vi.mock('@src/contexts/ToastContext');
vi.mock('@src/store/orochiStore');

describe('useOrochiActions', () => {
    const mockCopy = vi.fn();
    const mockNotify = vi.fn();
    const mockStore = {
        editedCode: 'edited code',
        originalCode: 'original code',
        tests: 'test code',
        prompt: 'prompt text',
        operatorNotes: 'operator notes'
    };

    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(useClipboard).mockReturnValue({ copy: mockCopy });
        vi.mocked(useToast).mockReturnValue({ notify: mockNotify });
        vi.mocked(useOrochiStore).mockReturnValue(mockStore as any);
    });

    it('should copy edited code successfully', async () => {
        const { result } = renderHook(() => useOrochiActions());

        await act(async () => {
            await result.current.copyEditedCode();
        });

        expect(mockCopy).toHaveBeenCalledWith('edited code');
        expect(mockNotify).toHaveBeenCalledWith(
            'Edited code copied to clipboard.',
            'success'
        );
    });

    it('should handle error when copying edited code fails', async () => {
        mockCopy.mockRejectedValueOnce(new Error('Copy failed'));
        const { result } = renderHook(() => useOrochiActions());

        await act(async () => {
            await result.current.copyEditedCode();
        });

        expect(mockNotify).toHaveBeenCalledWith(
            'Error copying edited code: Error: Copy failed',
            'error'
        );
    });

    it('should copy original code successfully', async () => {
        const { result } = renderHook(() => useOrochiActions());

        await act(async () => {
            await result.current.copyOriginalCode();
        });

        expect(mockCopy).toHaveBeenCalledWith('original code');
        expect(mockNotify).toHaveBeenCalledWith(
            'Original code copied to clipboard.',
            'success'
        );
    });

    it('should handle error when original code is not available', async () => {
        mockCopy.mockRejectedValueOnce(new Error('No text to copy'));
        const { result } = renderHook(() => useOrochiActions());

        await act(async () => {
            await result.current.copyOriginalCode();
        });

        expect(mockNotify).toHaveBeenCalledWith(
            'No original code found. The original code must be viewed before it can be copied.',
            'error'
        );
    });

    it('should copy prompt successfully', async () => {
        const { result } = renderHook(() => useOrochiActions());

        await act(async () => {
            await result.current.copyPrompt();
        });

        expect(mockCopy).toHaveBeenCalledWith('prompt text');
        expect(mockNotify).toHaveBeenCalledWith(
            'Prompt copied to clipboard.',
            'success'
        );
    });

    it('should copy tests successfully', async () => {
        const { result } = renderHook(() => useOrochiActions());

        await act(async () => {
            await result.current.copyTests();
        });

        expect(mockCopy).toHaveBeenCalledWith('test code');
        expect(mockNotify).toHaveBeenCalledWith(
            'Tests copied to clipboard.',
            'success'
        );
    });

    it('should copy operator notes successfully', async () => {
        const { result } = renderHook(() => useOrochiActions());

        await act(async () => {
            await result.current.copyOperatorNotes();
        });

        expect(mockCopy).toHaveBeenCalledWith('operator notes');
        expect(mockNotify).toHaveBeenCalledWith(
            'Operator notes copied to clipboard.',
            'success'
        );
    });

    it('should copy all content as Python successfully', async () => {
        const { result } = renderHook(() => useOrochiActions());

        await act(async () => {
            await result.current.copyAllAsPython();
        });

        expect(mockCopy).toHaveBeenCalledWith(expect.stringContaining('prompt text'));
        expect(mockCopy).toHaveBeenCalledWith(expect.stringContaining('edited code'));
        expect(mockCopy).toHaveBeenCalledWith(expect.stringContaining('test code'));
        expect(mockCopy).toHaveBeenCalledWith(
            expect.stringContaining('operator notes')
        );
        expect(mockNotify).toHaveBeenCalledWith('Conversation copied', 'success');
    });

    it('should handle partial content when copying all as Python', async () => {
        vi.mocked(useOrochiStore).mockReturnValue({
            ...mockStore,
            tests: null,
            operatorNotes: null
        } as any);

        const { result } = renderHook(() => useOrochiActions());

        await act(async () => {
            await result.current.copyAllAsPython();
        });

        expect(mockNotify).toHaveBeenCalledWith(
            'Copied, but tests could not be found, operator reason could not be found',
            'warning'
        );
    });

    it('should handle error when all content is missing for copyAllAsPython', async () => {
        vi.mocked(useOrochiStore).mockReturnValue({
            editedCode: null,
            originalCode: null,
            tests: null,
            prompt: null,
            operatorNotes: null
        } as any);

        const { result } = renderHook(() => useOrochiActions());

        await act(async () => {
            await result.current.copyAllAsPython();
        });

        expect(mockNotify).toHaveBeenCalledWith(
            'Error copying task: prompt could not be found, code could not be found, tests could not be found, operator reason could not be found',
            'error'
        );
    });
});

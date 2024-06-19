/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '@src/contexts/ToastContext';
import { useGlobalStore } from '@src/store/globalStore';
import { isValidUUID } from '@lib/textProcessing';

import { useClipboard } from './useClipboard';
import { useTask } from './useTask';

vi.mock('./useClipboard');
vi.mock('@src/contexts/ToastContext');
vi.mock('@src/store/globalStore');
vi.mock('@src/lib/textProcessing');

describe('useTask', () => {
    const mockCopy = vi.fn();
    const mockNotify = vi.fn();
    const mockStore = {
        operatorName: 'john.doe@',
        taskId: '123e4567-e89b-12d3-a456-426614174000'
    };

    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(useClipboard).mockReturnValue({ copy: mockCopy });
        vi.mocked(useToast).mockReturnValue({ notify: mockNotify });
        vi.mocked(useGlobalStore).mockReturnValue(mockStore as any);
        vi.mocked(isValidUUID).mockReturnValue(true);
    });

    it('should return correct operatorEmail', () => {
        const { result } = renderHook(() => useTask());
        expect(result.current.operatorEmail).toBe('john.doe@invisible.email');
    });

    it('should return null for operatorEmail when operatorName is null', () => {
        vi.mocked(useGlobalStore).mockReturnValue({
            ...mockStore,
            operatorName: null
        } as any);
        const { result } = renderHook(() => useTask());
        expect(result.current.operatorEmail).toBeNull();
    });

    it('should return correct taskId', () => {
        const { result } = renderHook(() => useTask());
        expect(result.current.taskId).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should copy operator email successfully', async () => {
        const { result } = renderHook(() => useTask());

        await act(async () => {
            await result.current.copyOperatorEmail();
        });

        expect(mockCopy).toHaveBeenCalledWith('john.doe@invisible.email');
        expect(mockNotify).toHaveBeenCalledWith(
            'Operator email copied to clipboard.',
            'success'
        );
    });

    it('should handle error when copying operator email fails', async () => {
        mockCopy.mockRejectedValueOnce(new Error('Copy failed'));
        const { result } = renderHook(() => useTask());

        await act(async () => {
            await result.current.copyOperatorEmail();
        });

        expect(mockNotify).toHaveBeenCalledWith(
            'Error copying operator email: Error: Copy failed',
            'error'
        );
    });

    it('should copy task ID successfully', async () => {
        const { result } = renderHook(() => useTask());

        await act(async () => {
            await result.current.copyTaskId();
        });

        expect(mockCopy).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
        expect(mockNotify).toHaveBeenCalledWith(
            'Task ID copied to clipboard.',
            'success'
        );
    });

    it('should handle error when task ID is invalid', async () => {
        vi.mocked(isValidUUID).mockReturnValue(false);
        const { result } = renderHook(() => useTask());

        await act(async () => {
            await result.current.copyTaskId();
        });

        expect(mockNotify).toHaveBeenCalledWith(
            'Task ID could not be found in a row from the task list. This may happen if the task list in the background updates and the task you are working on moves to the next page.',
            'error'
        );
    });

    it('should handle error when copying task ID fails', async () => {
        mockCopy.mockRejectedValueOnce(new Error('Copy failed'));
        const { result } = renderHook(() => useTask());

        await act(async () => {
            await result.current.copyTaskId();
        });

        expect(mockNotify).toHaveBeenCalledWith(
            'Error copying task ID: Error: Copy failed',
            'error'
        );
    });

    it('should handle missing operator name', () => {
        vi.mocked(useGlobalStore).mockReturnValue({
            ...mockStore,
            operatorName: null
        } as any);
        const { result } = renderHook(() => useTask());
        expect(result.current.operatorEmail).toBeNull();
    });

    it('should handle missing task ID', async () => {
        vi.mocked(useGlobalStore).mockReturnValue({
            ...mockStore,
            taskId: null
        } as any);
        const { result } = renderHook(() => useTask());

        await act(async () => {
            await result.current.copyTaskId();
        });

        expect(mockNotify).toHaveBeenCalledWith(
            'Task ID could not be found in a row from the task list. This may happen if the task list in the background updates and the task you are working on moves to the next page.',
            'error'
        );
    });
});

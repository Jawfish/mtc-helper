/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGlobalStore } from '@src/store/globalStore';
import { useOrochiStore } from '@src/store/orochiStore';
import { usePandaStore } from '@src/store/pandaStore';
import { useToast } from '@src/contexts/ToastContext';
import Logger from '@lib/logging';

import { useDiffView } from './useDiffView';

// Mock the required modules
vi.mock('@src/store/globalStore');
vi.mock('@src/store/orochiStore');
vi.mock('@src/store/pandaStore');
vi.mock('@src/contexts/ToastContext');
vi.mock('@lib/logging');

describe('useDiffView', () => {
    const mockNotify = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(useToast).mockReturnValue({ notify: mockNotify });
        vi.mocked(Logger.debug).mockImplementation(() => {});
    });

    it('should initialize with diffViewOpen as false', () => {
        vi.mocked(useGlobalStore).mockReturnValue({ process: 'Orochi' } as any);
        const { result } = renderHook(() => useDiffView());
        expect(result.current.diffViewOpen).toBe(false);
    });

    it('should toggle diffViewOpen when conditions are met for Orochi', () => {
        vi.mocked(useGlobalStore).mockReturnValue({ process: 'Orochi' } as any);
        vi.mocked(useOrochiStore).mockReturnValue({
            originalResponse: 'original',
            editedResponse: 'edited'
        } as any);

        const { result } = renderHook(() => useDiffView());

        act(() => {
            result.current.toggleDiffView();
        });

        expect(result.current.diffViewOpen).toBe(true);
        expect(Logger.debug).toHaveBeenCalledWith('Diff view toggled on');

        act(() => {
            result.current.toggleDiffView();
        });

        expect(result.current.diffViewOpen).toBe(false);
        expect(Logger.debug).toHaveBeenCalledWith('Diff view toggled off');
    });

    it('should toggle diffViewOpen when conditions are met for PANDA', () => {
        vi.mocked(useGlobalStore).mockReturnValue({ process: 'PANDA' } as any);
        vi.mocked(usePandaStore).mockReturnValue({
            originalResponsePlaintext: 'original',
            editedResponsePlaintext: 'edited'
        } as any);

        const { result } = renderHook(() => useDiffView());

        act(() => {
            result.current.toggleDiffView();
        });

        expect(result.current.diffViewOpen).toBe(true);
    });

    it('should not toggle diffViewOpen and show error for Orochi when original response is missing', () => {
        vi.mocked(useGlobalStore).mockReturnValue({ process: 'Orochi' } as any);
        vi.mocked(useOrochiStore).mockReturnValue({
            originalResponse: null,
            editedResponse: 'edited'
        } as any);

        const { result } = renderHook(() => useDiffView());

        act(() => {
            result.current.toggleDiffView();
        });

        expect(result.current.diffViewOpen).toBe(false);
        expect(mockNotify).toHaveBeenCalledWith(
            'The original content must be viewed before a diff can be displayed.',
            'error'
        );
    });

    it('should not toggle diffViewOpen and show error for PANDA when edited response is missing', () => {
        vi.mocked(useGlobalStore).mockReturnValue({ process: 'PANDA' } as any);
        vi.mocked(usePandaStore).mockReturnValue({
            originalResponsePlaintext: 'original',
            editedResponsePlaintext: undefined
        } as any);

        const { result } = renderHook(() => useDiffView());

        act(() => {
            result.current.toggleDiffView();
        });

        expect(result.current.diffViewOpen).toBe(false);
        expect(mockNotify).toHaveBeenCalledWith(
            'The original content must be viewed before a diff can be displayed.',
            'error'
        );
    });

    it('should not toggle diffViewOpen for unknown process', () => {
        vi.mocked(useGlobalStore).mockReturnValue({ process: 'Unknown' } as any);

        const { result } = renderHook(() => useDiffView());

        act(() => {
            result.current.toggleDiffView();
        });

        expect(result.current.diffViewOpen).toBe(false);
        expect(mockNotify).toHaveBeenCalledWith(
            'The original content must be viewed before a diff can be displayed.',
            'error'
        );
    });
});

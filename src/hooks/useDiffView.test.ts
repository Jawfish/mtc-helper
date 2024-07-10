import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { globalStore } from '@src/store/globalStore';
import { orochiStore } from '@src/store/orochiStore';
import { generalStore } from '@src/store/generalStore';
import { useToast } from '@src/contexts/ToastContext';
import Logger from '@lib/logging';

import { useDiffView } from './useDiffView';

vi.mock('@src/contexts/ToastContext');
vi.mock('@lib/logging');

describe('useDiffView', () => {
    const mockNotify = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(useToast).mockReturnValue({ notify: mockNotify });
        vi.mocked(Logger.debug).mockImplementation(() => {});
        generalStore.getState().reset();
        orochiStore.getState().reset();
        globalStore.setState({ process: 'General' });
    });

    it('should initialize with diffViewOpen as false', () => {
        globalStore.setState({ process: 'Orochi' });
        const { result } = renderHook(() => useDiffView());
        expect(result.current.diffViewOpen).toBe(false);
    });

    it('should toggle diffViewOpen when conditions are met for Orochi', () => {
        globalStore.setState({ process: 'Orochi' });
        orochiStore.setState({
            modelResponse: 'original',
            operatorResponse: 'edited'
        });

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

    it('should toggle diffViewOpen when conditions are met for General', () => {
        globalStore.setState({ process: 'General' });
        generalStore.setState(state => ({
            selectedResponse: {
                ...state.selectedResponse,
                modelResponseMarkdown: 'original'
            }
        }));

        const { result } = renderHook(() => useDiffView());

        act(() => {
            result.current.toggleDiffView();
        });

        expect(result.current.diffViewOpen).toBe(true);
        expect(Logger.debug).toHaveBeenCalledWith('Diff view toggled on');
    });

    it('should not toggle diffViewOpen and show error for Orochi when original response is missing', () => {
        globalStore.setState({ process: 'Orochi' });
        orochiStore.setState({
            modelResponse: undefined,
            operatorResponse: 'edited'
        });

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

    it('should not toggle diffViewOpen and show error for Orochi when edited response is missing', () => {
        globalStore.setState({ process: 'Orochi' });
        orochiStore.setState({
            modelResponse: 'original',
            operatorResponse: undefined
        });

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

    it('should not toggle diffViewOpen and show error for General when original response is missing', () => {
        globalStore.setState({ process: 'General' });
        generalStore.setState(state => ({
            selectedResponse: {
                ...state.selectedResponse,
                modelResponseMarkdown: undefined,
                operatorResponseMarkdown: 'edited'
            }
        }));

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

    it('should not toggle diffViewOpen and show error for General when edited response is missing', () => {
        globalStore.setState({ process: 'General' });
        generalStore.setState(state => ({
            selectedResponse: {
                ...state.selectedResponse,
                modelResponseMarkdown: undefined
            }
        }));

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
        globalStore.setState({ process: 'General' });

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

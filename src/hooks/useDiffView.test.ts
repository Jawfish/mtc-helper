import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { globalStore, Process } from '@src/store/globalStore';
import { orochiStore } from '@src/store/orochiStore';
import { generalStore } from '@src/store/generalStore';
import { useToast } from '@src/contexts/ToastContext';
import Logger from '@lib/logging';

import { useDiffView } from './useDiffView';

vi.mock('@src/contexts/ToastContext');
vi.mock('@lib/logging');

const processes: Process[] = ['Orochi', 'General', 'STEM'];

describe('Diff view react hook', () => {
    const mockNotify = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(useToast).mockReturnValue({ notify: mockNotify });
        vi.mocked(Logger.debug).mockImplementation(() => {});
        generalStore.getState().reset();
        orochiStore.getState().reset();
        globalStore.setState({ process: 'General', diffViewOpen: false });
    });

    it.each(processes)('should initialize with diffViewOpen as false', process => {
        globalStore.setState({ process });
        const { result } = renderHook(() => useDiffView());
        expect(result.current.diffViewOpen).toBe(false);
    });

    it.each(processes)('should be able to open diff view', process => {
        const { result } = renderHook(() => useDiffView());
        act(() => {
            globalStore.setState({ process });
            if (process === 'Orochi') {
                orochiStore.setState({
                    originalCode: 'original'
                });
            } else {
                generalStore.setState(state => ({
                    selectedResponse: {
                        ...state.selectedResponse,
                        modelResponseMarkdown: 'response'
                    }
                }));
            }
        });

        act(() => {
            result.current.toggleDiffView();
        });

        expect(result.current.diffViewOpen).toBe(true);
    });

    it.each(processes)(
        'should be able to close diff view from an open state',
        process => {
            globalStore.setState({ process, diffViewOpen: false });
            orochiStore.setState({
                modelResponse: 'original',
                operatorResponse: 'edited'
            });

            const { result } = renderHook(() => useDiffView());

            act(() => {
                result.current.toggleDiffView();
            });
            act(() => {
                result.current.toggleDiffView();
            });

            expect(result.current.diffViewOpen).toBe(false);
            expect(globalStore.getState().diffViewOpen).toBe(false);
        }
    );

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

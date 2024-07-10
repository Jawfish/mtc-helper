import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useLatexView } from './useLatexView';

describe('useLatexView', () => {
    it('should initialize with latexViewOpen as false', () => {
        const { result } = renderHook(() => useLatexView());
        expect(result.current.latexViewOpen).toBe(false);
    });

    it('should toggle latexViewOpen when toggleLatexView is called', () => {
        const { result } = renderHook(() => useLatexView());

        act(() => {
            result.current.toggleLatexView();
        });
        expect(result.current.latexViewOpen).toBe(true);

        act(() => {
            result.current.toggleLatexView();
        });
        expect(result.current.latexViewOpen).toBe(false);
    });

    it('should maintain correct state across multiple toggles', () => {
        const { result } = renderHook(() => useLatexView());

        for (let i = 0; i < 5; i++) {
            act(() => {
                result.current.toggleLatexView();
            });
            expect(result.current.latexViewOpen).toBe(true);

            act(() => {
                result.current.toggleLatexView();
            });
            expect(result.current.latexViewOpen).toBe(false);
        }
    });
});

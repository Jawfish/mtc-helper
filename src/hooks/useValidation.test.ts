import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useValidation } from '@hooks/useValidation';
import * as helpers from '@lib/textProcessing';
import { useToast } from '@src/contexts/ToastContext';
import { orochiStore } from '@src/store/orochiStore';

vi.mock('@src/contexts/ToastContext', () => {
    const mockNotify = vi.fn();

    return {
        ToastContext: {
            Provider: ({ children }: { children: React.ReactNode }) => children
        },
        useToast: () => ({ notify: mockNotify })
    };
});

describe('response validation', () => {
    afterEach(() => {
        orochiStore.getState().reset();
        vi.clearAllMocks();
        vi.resetAllMocks();
    });

    it('returns functions for validating a full response and validating code by itself', () => {
        const { result } = renderHook(() => useValidation());
        expect(typeof result.current.validateResponse).toBe('function');
        expect(typeof result.current.validateCode).toBe('function');
    });

    it('handles when there is no code', () => {
        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode(undefined);
        expect(messages).toEqual(['No code found.']);
    });

    it('detects markdown fence closing issues', () => {
        vi.spyOn(helpers, 'codeContainsMarkdownFence').mockReturnValue(true);
        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode('some code```');
        expect(messages).toContain(
            'Code block appears to be improperly opened or closed.'
        );
    });

    it('detects markdown fence opening issues', () => {
        vi.spyOn(helpers, 'codeContainsMarkdownFence').mockReturnValue(true);
        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode('```some code');
        expect(messages).toContain(
            'Code block appears to be improperly opened or closed.'
        );
    });

    it('detects markdown fence issues when code contains multiple lines', () => {
        vi.spyOn(helpers, 'codeContainsMarkdownFence').mockReturnValue(true);
        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode('some code\n\na```');
        expect(messages).toContain(
            'Code block appears to be improperly opened or closed.'
        );
    });

    it('detects HTML in code', () => {
        vi.spyOn(helpers, 'codeContainsHtml').mockReturnValue(true);
        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode('<div>some html</div>');
        expect(messages).toContain('The bot response appears to contain HTML.');
    });

    it('notifies with success when no issues are found', async () => {
        orochiStore.setState({
            editedCode: 'def valid_python():',
            score: 85,
            rework: false,
            language: 'python'
        });

        const { result } = renderHook(() => useValidation());

        await act(async () => {
            result.current.validateResponse();
        });
        const mockNotify = vi.mocked(useToast().notify);
        expect(mockNotify).toHaveBeenCalledWith('No issues detected.', 'success');
    });
});

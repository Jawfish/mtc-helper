/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '@src/contexts/ToastContext';
import { useOrochiStore } from '@src/store/orochiStore';

import { useOrochiActions } from './useOrochiActions';
import { useClipboard } from './useClipboard';

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

    type CopyAction = keyof ReturnType<typeof useOrochiActions>;

    const testCopyAction = async (
        action: CopyAction,
        content: string,
        displayName: string
    ) => {
        const { result } = renderHook(() => useOrochiActions());
        await act(async () => {
            await result.current[action]();
        });
        expect(mockCopy).toHaveBeenCalledWith(content);
        expect(mockNotify).toHaveBeenCalledWith(
            `${displayName} copied to clipboard.`,
            'success'
        );
    };

    it.each([
        ['copyEditedCode', 'edited code', 'Edited Code'],
        ['copyOriginalCode', 'original code', 'Original Code'],
        ['copyTests', 'test code', 'Tests'],
        ['copyPrompt', 'prompt text', 'Prompt'],
        ['copyOperatorNotes', 'operator notes', 'Operator Notes']
    ] as [CopyAction, string, string][])('should copy %s successfully', testCopyAction);

    it('should handle error when copying fails', async () => {
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

    it('should handle missing content', async () => {
        vi.mocked(useOrochiStore).mockReturnValue({
            ...mockStore,
            editedCode: null
        } as any);
        const { result } = renderHook(() => useOrochiActions());
        await act(async () => {
            await result.current.copyEditedCode();
        });
        expect(mockNotify).toHaveBeenCalledWith(
            'No edited code found. The edited code must be viewed before it can be copied.',
            'error'
        );
    });

    it('should copy all content as Python successfully with correct formatting', async () => {
        const { result } = renderHook(() => useOrochiActions());
        await act(async () => {
            await result.current.copyAllAsPython();
        });

        const expectedContent = `######################################## PROMPT ########################################

"""
prompt text
"""

#################################### OPERATOR NOTES ####################################

"""
operator notes
"""

####################################### RESPONSE #######################################

edited code

######################################## TESTS #########################################

test code`;

        expect(mockCopy).toHaveBeenCalledWith(expectedContent);
        expect(mockNotify).toHaveBeenCalledWith('Conversation copied', 'success');
    });

    it('should format sections correctly when copying all content as Python', async () => {
        vi.mocked(useOrochiStore).mockReturnValue({
            ...mockStore,
            prompt: 'This is a\nmultiline prompt',
            editedCode: 'def example():\n    return "Hello, World!"',
            tests: 'assert example() == "Hello, World!"',
            operatorNotes: 'Some notes\nfrom the operator'
        } as any);

        const { result } = renderHook(() => useOrochiActions());
        await act(async () => {
            await result.current.copyAllAsPython();
        });

        const expectedContent = `######################################## PROMPT ########################################

"""
This is a
multiline prompt
"""

#################################### OPERATOR NOTES ####################################

"""
Some notes
from the operator
"""

####################################### RESPONSE #######################################

def example():
    return "Hello, World!"

######################################## TESTS #########################################

assert example() == "Hello, World!"`;

        expect(mockCopy).toHaveBeenCalledWith(expectedContent);
    });

    it('should omit operator notes if none were found', async () => {
        vi.mocked(useOrochiStore).mockReturnValue({
            ...mockStore,
            prompt: 'This is a\nmultiline prompt',
            editedCode: 'def example():\n    return "Hello, World!"',
            tests: 'assert example() == "Hello, World!"',
            operatorNotes: 'operator notes could not be found'
        } as any);

        const { result } = renderHook(() => useOrochiActions());
        await act(async () => {
            await result.current.copyAllAsPython();
        });

        const expectedContent = `######################################## PROMPT ########################################

"""
This is a
multiline prompt
"""

####################################### RESPONSE #######################################

def example():
    return "Hello, World!"

######################################## TESTS #########################################

assert example() == "Hello, World!"`;

        expect(mockCopy).toHaveBeenCalledWith(expectedContent);
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
            'Copied, but tests could not be found, operator notes could not be found',
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
            'Error copying task: prompt could not be found, code could not be found, tests could not be found, operator notes could not be found',
            'error'
        );
    });
});

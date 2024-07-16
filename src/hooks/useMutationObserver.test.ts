import { vi, describe, beforeEach, it, expect } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

import useMutationHandler from './useMutationHandler';

describe('useMutationHandler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = '<div id="__next"></div>';
    });

    it('initializes mutation handler when next element exists', async () => {
        const { result } = renderHook(() => useMutationHandler());
        await waitFor(() => expect(result.current).not.toBeNull(), { timeout: 250 });
        expect(result.current).toBeTruthy();
    });

    it('waits for next element to be added before initializing', async () => {
        document.body.innerHTML = '';
        const { result } = renderHook(() => useMutationHandler());
        expect(result.current).toBeNull();
        act(() => {
            const nextElement = document.createElement('div');
            nextElement.id = '__next';
            document.body.appendChild(nextElement);
        });
        await waitFor(() => expect(result.current).not.toBeNull(), { timeout: 250 });
        expect(result.current).toBeTruthy();
    });

    // TODO: Refactor things so we can test disconnecting on unmount and that actions
    // are added properly
});

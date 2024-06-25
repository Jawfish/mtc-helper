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

function setupTaskIdElement() {
    const testHtml = `
      <table>
        <tr>
          <td>
            <button class="cursor-pointer">
              <span>In Progress</span>
            </button>
          </td>
          <td>
            <div title="Task ID">123e4567-e89b-12d3-a456-426614174000</div>
          </td>
        </tr>
        <tr>
          <td>
            <button disabled>
              <span>Completed</span>
            </button>
          </td>
          <td>
            <div title="Task ID">987e6543-e21b-12d3-a456-426614174000</div>
          </td>
        </tr>
      </table>
    `;

    document.body.innerHTML = testHtml;
}

function setupOperatorNameElement() {
    const testHtml = `
      <p class="MuiTypography-root MuiTypography-body2 MuiTypography-noWrap">john.doe@</p>
    `;

    document.body.innerHTML = testHtml;
}

describe('useTask', () => {
    const mockCopy = vi.fn();
    const mockNotify = vi.fn();
    const mockStore = {
        operatorName: 'john.doe@'
    };

    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(useClipboard).mockReturnValue({ copy: mockCopy });
        vi.mocked(useToast).mockReturnValue({ notify: mockNotify });
        vi.mocked(useGlobalStore).mockReturnValue(mockStore as any);
        vi.mocked(isValidUUID).mockReturnValue(true);
        document.body.innerHTML = '';
    });

    it('should copy correct email to clipboard', async () => {
        const { result } = renderHook(() => useTask());
        setupOperatorNameElement();

        await act(async () => {
            await result.current.copyOperatorEmail();
        });

        expect(mockCopy).toHaveBeenCalledWith('john.doe@invisible.email');
        expect(mockNotify).toHaveBeenCalledWith(
            'Operator email copied to clipboard.',
            'success'
        );
    });

    it('should not try to copy non-existent email', async () => {
        const { result } = renderHook(() => useTask());

        await act(async () => {
            await result.current.copyOperatorEmail();
        });

        expect(mockCopy).toBeCalledTimes(0);
    });

    it('should copy correct task ID to clipboard', async () => {
        const { result } = renderHook(() => useTask());
        setupTaskIdElement();

        await act(async () => {
            await result.current.copyTaskId();
        });

        expect(mockCopy).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
        expect(mockNotify).toHaveBeenCalledWith(
            'Task ID copied to clipboard.',
            'success'
        );
    });

    it('should not try to copy non-existent task ID', async () => {
        const { result } = renderHook(() => useTask());

        await act(async () => {
            await result.current.copyTaskId();
        });

        expect(mockCopy).toBeCalledTimes(0);
    });

    it('should handle error when copying operator email fails', async () => {
        mockCopy.mockRejectedValueOnce(new Error('Copy failed'));
        const { result } = renderHook(() => useTask());

        await act(async () => {
            await result.current.copyOperatorEmail();
        });

        expect(mockNotify).toHaveBeenCalledWith(
            'Error copying operator email: Operator name not found.',
            'error'
        );
    });

    it('should handle error when task ID is invalid', async () => {
        vi.mocked(isValidUUID).mockReturnValue(false);
        const { result } = renderHook(() => useTask());

        await act(async () => {
            await result.current.copyTaskId();
        });

        expect(mockNotify).toHaveBeenCalledWith(
            'Error copying task ID: Invalid or missing Task ID. The task list may have updated.',
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
            'Error copying task ID: Invalid or missing Task ID. The task list may have updated.',
            'error'
        );
    });
});

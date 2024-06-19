import { orochiStore } from '@src/store/orochiStore';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { checkAlignmentScore } from './checkAlignmentScore';

vi.mock('@src/store/orochiStore');

describe('checkAlignmentScore', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('returns null when score is above threshold', () => {
        vi.mocked(orochiStore.getState).mockReturnValue({ score: 90, rework: false });
        expect(checkAlignmentScore(85)).toBeNull();
    });

    it('returns a message when score is below threshold and not marked as rework', () => {
        vi.mocked(orochiStore.getState).mockReturnValue({ score: 80, rework: false });
        expect(checkAlignmentScore(85)).toBe(
            'The alignment score is 80, but the task is not marked as a rework.'
        );
    });

    it('returns null when score is below threshold but marked as rework', () => {
        vi.mocked(orochiStore.getState).mockReturnValue({ score: 80, rework: true });
        expect(checkAlignmentScore(85)).toBeNull();
    });

    it('returns an error message when score is null', () => {
        vi.mocked(orochiStore.getState).mockReturnValue({ score: null, rework: false });
        expect(checkAlignmentScore(85)).toBe(
            'Unable to determine alignment score or rework status'
        );
    });

    it('returns an error message when rework is null', () => {
        vi.mocked(orochiStore.getState).mockReturnValue({ score: 90, rework: null });
        expect(checkAlignmentScore(85)).toBe(
            'Unable to determine alignment score or rework status'
        );
    });

    it('returns an error message when both score and rework are null', () => {
        vi.mocked(orochiStore.getState).mockReturnValue({ score: null, rework: null });
        expect(checkAlignmentScore(85)).toBe(
            'Unable to determine alignment score or rework status'
        );
    });

    it('handles errors from orochiStore', () => {
        vi.mocked(orochiStore.getState).mockImplementation(() => {
            throw new Error('Store error');
        });
        expect(checkAlignmentScore(85)).toBe(
            'Error checking alignment score: Store error'
        );
    });
});

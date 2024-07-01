import { orochiStore } from '@src/store/orochiStore';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { checkAlignmentScore } from './checkAlignmentScore';

describe('checkAlignmentScore', () => {
    beforeEach(() => {
        orochiStore.getState().reset();
        vi.resetAllMocks();
        vi.clearAllMocks();
    });

    it('returns undefined when score is above threshold', () => {
        orochiStore.setState({ score: 90, rework: false });
        expect(checkAlignmentScore(85)).toBeUndefined();
    });

    it('returns a message when score is below threshold and not marked as rework', () => {
        orochiStore.setState({ score: 80, rework: false });
        expect(checkAlignmentScore(85)).toBe(
            'The alignment score is 80, but the task is not marked as a rework.'
        );
    });

    it('returns undefined when score is below threshold but marked as rework', () => {
        orochiStore.setState({ score: 80, rework: true });
        expect(checkAlignmentScore(85)).toBeUndefined();
    });

    it('returns an error message when score is undefined', () => {
        orochiStore.setState({ score: undefined, rework: false });
        expect(checkAlignmentScore(85)).toBe('Unable to determine alignment score');
    });

    it('returns an error message when rework is undefined', () => {
        orochiStore.setState({ score: 90, rework: undefined });
        expect(checkAlignmentScore(85)).toBe('Unable to determine alignment score');
    });

    it('returns an error message when both score and rework are undefined', () => {
        orochiStore.setState({ score: undefined, rework: undefined });
        expect(checkAlignmentScore(85)).toBe('Unable to determine alignment score');
    });

    it('handles errors from orochiStore', () => {
        const getStateSpy = vi.spyOn(orochiStore, 'getState').mockImplementation(() => {
            throw new Error('Store error');
        });

        expect(checkAlignmentScore(85)).toBe(
            'Error checking alignment score: Store error'
        );

        getStateSpy.mockRestore();
    });
});

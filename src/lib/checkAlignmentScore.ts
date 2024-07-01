import { orochiStore } from '@src/store/orochiStore';

type AlignmentScore = {
    score: number | undefined;
    rework: boolean | undefined;
};

type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

/**
 * Retrieves the alignment score and rework status from the store.
 * @returns A Result containing the AlignmentScore or an error message.
 */
const getAlignmentScore = (): Result<AlignmentScore> => {
    try {
        const { score, rework } = orochiStore.getState();

        return { ok: true, value: { score, rework } };
    } catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
};

/**
 * Validates the alignment score and rework status.
 * @param score - The alignment score.
 * @param rework - The rework status.
 * @returns A Result containing a validation message or undefined if valid.
 */
const validateAlignmentScore = (
    score: number | undefined,
    rework: boolean | undefined
): Result<undefined> => {
    if (score === undefined || rework === undefined) {
        return {
            ok: false,
            error: 'Unable to determine alignment score'
        };
    }

    return { ok: true, value: undefined };
};

/**
 * Checks if the alignment score is below the threshold and the task is not marked as a rework.
 * @param threshold - The alignment score threshold below which the response should be reworked.
 * @param score - The alignment score.
 * @param rework - The rework status.
 * @returns A Result containing a message if there's an issue, or undefined if everything is okay.
 */
const checkScoreThreshold = (
    threshold: number,
    score: number,
    rework: boolean
): Result<undefined> => {
    if (score < threshold && !rework) {
        return {
            ok: false,
            error: `The alignment score is ${score}, but the task is not marked as a rework.`
        };
    }

    return { ok: true, value: undefined };
};

/**
 * Checks if the alignment score is below the threshold and the task is not marked as a rework.
 * @param threshold - The alignment score threshold below which the response should be reworked.
 * @returns A message if there's an issue with the alignment score, or undefined if everything is okay.
 */
export const checkAlignmentScore = (threshold: number): string | undefined => {
    const scoreResult = getAlignmentScore();
    if (!scoreResult.ok) return `Error checking alignment score: ${scoreResult.error}`;

    const { score, rework } = scoreResult.value;

    const validationResult = validateAlignmentScore(score, rework);
    if (!validationResult.ok) return validationResult.error;

    if (score !== undefined && rework !== undefined) {
        const thresholdResult = checkScoreThreshold(threshold, score, rework);
        if (!thresholdResult.ok) return thresholdResult.error;
    }

    return undefined;
};

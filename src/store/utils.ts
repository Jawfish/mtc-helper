/**
 * Check if incoming state is equal to the initial state to prevent unnecessary updates.
 *
 * @param state The current state to compare.
 * @param initialState The initial state to compare.
 * @returns `true` if the states are equal, `false` otherwise.
 */
export const isStateEqual = <T extends Record<string, unknown>>(
    state: T,
    initialState: T
): boolean => {
    return Object.keys(initialState).every(
        key => state[key as keyof T] === initialState[key as keyof T]
    );
};

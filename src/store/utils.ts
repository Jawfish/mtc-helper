export const isStateEqual = <T extends Record<string, unknown>>(
    state: T,
    initialState: T
): boolean => {
    return Object.keys(initialState).every(
        key => state[key as keyof T] === initialState[key as keyof T]
    );
};

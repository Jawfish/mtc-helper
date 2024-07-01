import { describe, it, expect } from 'vitest';

import { isStateEqual } from './utils';

describe('Store state equality checker', () => {
    type SimpleState = {
        count: number;
        text: string;
        isActive: boolean;
    };

    const simpleInitialState: SimpleState = {
        count: 0,
        text: '',
        isActive: false
    };

    it('should return true for identical simple states', () => {
        expect(isStateEqual(simpleInitialState, simpleInitialState)).toBe(true);
    });

    it('should return false when a property differs in simple state', () => {
        const modifiedState = { ...simpleInitialState, count: 1 };
        expect(isStateEqual(modifiedState, simpleInitialState)).toBe(false);
    });

    type ComplexState = {
        user: { name: string; age: number } | undefined;
        preferences: { theme: 'light' | 'dark'; notifications: boolean };
        lastLogin: Date | undefined;
    };

    const complexInitialState: ComplexState = {
        user: undefined,
        preferences: { theme: 'light', notifications: true },
        lastLogin: undefined
    };

    it('should return true for identical complex states', () => {
        expect(isStateEqual(complexInitialState, complexInitialState)).toBe(true);
    });

    it('should return false when a nested property differs', () => {
        const modifiedState = {
            ...complexInitialState,
            preferences: { ...complexInitialState.preferences, theme: 'dark' as const }
        };
        expect(isStateEqual(modifiedState, complexInitialState)).toBe(false);
    });

    it('should return false when an object property changes from undefined', () => {
        const modifiedState = {
            ...complexInitialState,
            user: { name: 'John', age: 30 }
        };
        expect(isStateEqual(modifiedState, complexInitialState)).toBe(false);
    });

    it('should return true when an additional property is present', () => {
        const stateWithExtra = { ...simpleInitialState, extraProp: 'something' };
        expect(isStateEqual(stateWithExtra, simpleInitialState)).toBe(true);
    });

    it('should return false when a property is missing', () => {
        // eslint-disable-next-line unused-imports/no-unused-vars
        const { text, ...stateWithMissing } = simpleInitialState;
        expect(isStateEqual(stateWithMissing, simpleInitialState)).toBe(false);
    });

    // Test with array properties
    type StateWithArray = {
        items: string[];
        matrix: number[][];
    };

    const arrayInitialState: StateWithArray = {
        items: ['a', 'b', 'c'],
        matrix: [
            [1, 2],
            [3, 4]
        ]
    };

    it('should return true for identical states with arrays', () => {
        expect(isStateEqual(arrayInitialState, arrayInitialState)).toBe(true);
    });

    it('should return false when an array property differs', () => {
        const modifiedState = { ...arrayInitialState, items: ['a', 'b', 'd'] };
        expect(isStateEqual(modifiedState, arrayInitialState)).toBe(false);
    });

    it('should return false when a nested array differs', () => {
        const modifiedState = {
            ...arrayInitialState,
            matrix: [
                [1, 2],
                [3, 5]
            ]
        };
        expect(isStateEqual(modifiedState, arrayInitialState)).toBe(false);
    });
});

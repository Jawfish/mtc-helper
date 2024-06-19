/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { pandaStore } from './pandaStore';
import { globalStore } from './globalStore';

vi.mock('./globalStore', () => ({
    globalStore: {
        subscribe: vi.fn()
    }
}));

vi.mock('./pandaStore', async importOriginal => {
    const mod = await importOriginal<typeof import('./pandaStore')>();

    return {
        ...mod,
        usePandaStore: vi.fn().mockReturnValue(mod.pandaStore.getState())
    };
});

describe('pandaStore', () => {
    beforeEach(() => {
        pandaStore.setState({
            editedResponsePlaintext: undefined,
            originalResponsePlaintext: undefined
        });
    });

    it('should initialize with correct default values', () => {
        const state = pandaStore.getState();
        expect(state.editedResponsePlaintext).toBeUndefined();
        expect(state.originalResponsePlaintext).toBeUndefined();
    });

    it('should update state correctly', () => {
        pandaStore.setState({
            editedResponsePlaintext: 'edited',
            originalResponsePlaintext: 'original'
        });
        const state = pandaStore.getState();
        expect(state.editedResponsePlaintext).toBe('edited');
        expect(state.originalResponsePlaintext).toBe('original');
    });

    it('should reset state correctly', () => {
        pandaStore.setState({
            editedResponsePlaintext: 'edited',
            originalResponsePlaintext: 'original'
        });
        pandaStore.getState().reset();
        const state = pandaStore.getState();
        expect(state.editedResponsePlaintext).toBeUndefined();
        expect(state.originalResponsePlaintext).toBeUndefined();
    });

    it('should subscribe to globalStore', () => {
        expect(globalStore.subscribe).toHaveBeenCalled();
    });

    it('should reset when task is closed', () => {
        const [[mockSubscribeCallback]] = vi.mocked(globalStore.subscribe).mock.calls;

        pandaStore.setState({
            editedResponsePlaintext: 'edited',
            originalResponsePlaintext: 'original'
        });

        mockSubscribeCallback(
            { taskIsOpen: false } as any,
            { taskIsOpen: true } as any
        );

        const state = pandaStore.getState();
        expect(state.editedResponsePlaintext).toBeUndefined();
        expect(state.originalResponsePlaintext).toBeUndefined();
    });

    it('should not reset when task is open', () => {
        const [[mockSubscribeCallback]] = vi.mocked(globalStore.subscribe).mock.calls;

        pandaStore.setState({
            editedResponsePlaintext: 'edited',
            originalResponsePlaintext: 'original'
        });

        mockSubscribeCallback(
            { taskIsOpen: true } as any,
            { taskIsOpen: false } as any
        );

        const state = pandaStore.getState();
        expect(state.editedResponsePlaintext).toBe('edited');
        expect(state.originalResponsePlaintext).toBe('original');
    });
});

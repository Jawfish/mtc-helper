import { describe, it, expect, vi } from 'vitest';

import { globalStore } from './globalStore';

vi.mock('./globalStore', async importOriginal => {
    const mod = await importOriginal<typeof import('./globalStore')>();

    return {
        ...mod,
        useGlobalStore: vi.fn().mockReturnValue(mod.globalStore.getState())
    };
});

describe('globalStore', () => {
    it('should initialize with correct default values', () => {
        const state = globalStore.getState();
        expect(state.process).toBe('Generic');
        expect(state.taskIsOpen).toBe(false);
    });

    it('should update state correctly', () => {
        globalStore.setState({
            process: 'Orochi',
            taskIsOpen: true
        });
        const state = globalStore.getState();
        expect(state.process).toBe('Orochi');
        expect(state.taskIsOpen).toBe(true);
    });

    it('should close task correctly', () => {
        globalStore.setState({
            process: 'Orochi',
            taskIsOpen: true
        });
        globalStore.getState().closeTask();
        const state = globalStore.getState();
        expect(state.process).toBe('Orochi'); // Process should not be reset
        expect(state.taskIsOpen).toBe(false);
    });
});

/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { orochiStore } from './orochiStore';
import { globalStore } from './globalStore';

vi.mock('./globalStore', () => ({
    globalStore: {
        subscribe: vi.fn()
    }
}));

vi.mock('./orochiStore', async importOriginal => {
    const mod = await importOriginal<typeof import('./orochiStore')>();

    return {
        ...mod,
        useOrochiStore: vi.fn().mockReturnValue(mod.orochiStore.getState())
    };
});

describe('orochiStore', () => {
    beforeEach(() => {
        orochiStore.setState({
            originalCode: null,
            editedCode: null,
            conversationTitle: null,
            editedResponse: null,
            errorLabels: null,
            operatorNotes: null,
            originalResponse: null,
            prompt: null,
            tests: null,
            score: null,
            rework: null,
            language: 'unknown',
            metadataRemoved: false
        });
    });

    it('should initialize with correct default values', () => {
        const state = orochiStore.getState();
        expect(state.originalCode).toBeNull();
        expect(state.editedCode).toBeNull();
        expect(state.conversationTitle).toBeNull();
        expect(state.editedResponse).toBeNull();
        expect(state.errorLabels).toBeNull();
        expect(state.operatorNotes).toBeNull();
        expect(state.originalResponse).toBeNull();
        expect(state.prompt).toBeNull();
        expect(state.tests).toBeNull();
        expect(state.score).toBeNull();
        expect(state.rework).toBeNull();
        expect(state.language).toBe('unknown');
        expect(state.metadataRemoved).toBe(false);
    });

    it('should update state correctly', () => {
        orochiStore.setState({
            originalCode: 'original',
            editedCode: 'edited',
            language: 'python'
        });
        const state = orochiStore.getState();
        expect(state.originalCode).toBe('original');
        expect(state.editedCode).toBe('edited');
        expect(state.language).toBe('python');
    });

    it('should reset state correctly', () => {
        orochiStore.setState({
            originalCode: 'original',
            editedCode: 'edited',
            language: 'python'
        });
        orochiStore.getState().reset();
        const state = orochiStore.getState();
        expect(state.originalCode).toBeNull();
        expect(state.editedCode).toBeNull();
        expect(state.language).toBe('unknown');
    });

    it('should subscribe to globalStore', () => {
        expect(globalStore.subscribe).toHaveBeenCalled();
    });

    it('should reset when task is closed', () => {
        const [[mockSubscribeCallback]] = vi.mocked(globalStore.subscribe).mock.calls;

        orochiStore.setState({
            originalCode: 'original',
            editedCode: 'edited',
            language: 'python'
        });

        mockSubscribeCallback(
            { taskIsOpen: false } as any,
            { taskIsOpen: true } as any
        );

        const state = orochiStore.getState();
        expect(state.originalCode).toBeNull();
        expect(state.editedCode).toBeNull();
        expect(state.language).toBe('unknown');
    });

    it('should not reset when task is open', () => {
        const [[mockSubscribeCallback]] = vi.mocked(globalStore.subscribe).mock.calls;

        orochiStore.setState({
            originalCode: 'original',
            editedCode: 'edited',
            language: 'python'
        });

        mockSubscribeCallback({ taskIsOpen: true } as any, { taskIsOpen: true } as any);

        const state = orochiStore.getState();
        expect(state.originalCode).toBe('original');
        expect(state.editedCode).toBe('edited');
        expect(state.language).toBe('python');
    });
});

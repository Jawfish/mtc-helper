import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { orochiStore } from '@src/store/orochiStore';

import { handleReturnTargetMutation } from './rework';

describe('handleReturnTargetMutation', () => {
    beforeEach(() => {
        // Reset the DOM
        document.body.innerHTML = '';
        // Reset the store
        orochiStore.getState().reset();
    });

    afterEach(() => {
        // Ensure the store is reset after each test
        orochiStore.getState().reset();
    });

    it('should set rework to true when "Rework (Same Operator)" is present', () => {
        document.body.innerHTML = `
            <div>
                <button>Send case to</button>
                <div>Rework (Same Operator)</div>
            </div>
        `;
        handleReturnTargetMutation(document.body);
        expect(orochiStore.getState().rework).toBe(true);
    });

    it('should set rework to false when "Rework (Same Operator)" is not present', () => {
        document.body.innerHTML = `
            <div>
                <button>Send case to</button>
                <div>Some other text</div>
            </div>
        `;
        handleReturnTargetMutation(document.body);
        expect(orochiStore.getState().rework).toBe(false);
    });

    it('should not change rework state when "Send case to" button is not found', () => {
        document.body.innerHTML = `
            <div>
                <button>Some other button</button>
                <div>Rework (Same Operator)</div>
            </div>
        `;
        handleReturnTargetMutation(document.body);
        expect(orochiStore.getState().rework).toBeUndefined();
    });

    it('should handle empty DOM', () => {
        handleReturnTargetMutation(document.body);
        expect(orochiStore.getState().rework).toBeUndefined();
    });

    it('should handle DOM with unrelated content', () => {
        document.body.innerHTML = `
            <div>
                <p>Some unrelated content</p>
            </div>
        `;
        handleReturnTargetMutation(document.body);
        expect(orochiStore.getState().rework).toBeUndefined();
    });

    it('should set rework to false when "Send case to" button is present but rework text is not', () => {
        document.body.innerHTML = `
            <div>
                <button>Send case to</button>
                <div>Some other option</div>
            </div>
        `;
        handleReturnTargetMutation(document.body);
        expect(orochiStore.getState().rework).toBeFalsy();
    });

    it('should not change rework state on multiple calls with the same DOM', () => {
        document.body.innerHTML = `
            <div>
                <button>Send case to</button>
                <div>Rework (Same Operator)</div>
            </div>
        `;
        handleReturnTargetMutation(document.body);
        expect(orochiStore.getState().rework).toBe(true);

        // Call the function again
        handleReturnTargetMutation(document.body);
        expect(orochiStore.getState().rework).toBe(true);

        // Change the DOM slightly
        document.body.innerHTML = `
            <div>
                <button>Send case to</button>
                <div>Some other option</div>
            </div>
        `;
        handleReturnTargetMutation(document.body);
        expect(orochiStore.getState().rework).toBe(false);
    });

    it('should verify that the store is reset before each test', () => {
        expect(orochiStore.getState().rework).toBeUndefined();
    });
});

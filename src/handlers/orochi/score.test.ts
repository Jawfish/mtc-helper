import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { orochiStore } from '@src/store/orochiStore';

import { handleScoreMutation } from './score';

describe('handleScoreMutation', () => {
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

    it('should set score when "Alignment %" element is present', () => {
        document.body.innerHTML = `
            <div>
                <span>Alignment %</span>
                <span>: 85</span>
            </div>
        `;
        handleScoreMutation(document.body);
        expect(orochiStore.getState().score).toBe(85);
    });

    it('should not set score when "Alignment %" element is not present', () => {
        document.body.innerHTML = `
            <div>
                <span>Some other text</span>
            </div>
        `;
        handleScoreMutation(document.body);
        expect(orochiStore.getState().score).toBeUndefined();
    });

    it('should handle empty DOM', () => {
        handleScoreMutation(document.body);
        expect(orochiStore.getState().score).toBeUndefined();
    });

    it('should handle DOM with unrelated content', () => {
        document.body.innerHTML = `
            <div>
                <p>Some unrelated content</p>
            </div>
        `;
        handleScoreMutation(document.body);
        expect(orochiStore.getState().score).toBeUndefined();
    });

    it('should handle "Alignment %" element without a valid score', () => {
        document.body.innerHTML = `
            <div>
                <span>Alignment %</span>
                <span>: Not a number</span>
            </div>
        `;
        handleScoreMutation(document.body);
        expect(orochiStore.getState().score).toBeNaN();
    });

    it('should handle multiple "Alignment %" elements and use the first one', () => {
        document.body.innerHTML = `
            <div>
                <span>Alignment %</span>
                <span>: 85</span>
            </div>
            <div>
                <span>Alignment %</span>
                <span>: 90</span>
            </div>
        `;
        handleScoreMutation(document.body);
        expect(orochiStore.getState().score).toBe(85);
    });

    it('should handle decimal scores', () => {
        document.body.innerHTML = `
            <div>
                <span>Alignment %</span>
                <span>: 85.5</span>
            </div>
        `;
        handleScoreMutation(document.body);
        expect(orochiStore.getState().score).toBe(85);
    });

    it('should verify that the store is reset before each test', () => {
        expect(orochiStore.getState().score).toBeUndefined();
    });
});

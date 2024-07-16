import { describe, it, expect, beforeEach } from 'vitest';
import { orochiStore } from '@src/store/orochiStore';

import { onMut_prompt_updatePromptState } from './onMut_prompt_updatePromptState';

describe('handlePromptMutation', () => {
    beforeEach(() => {
        orochiStore.getState().reset();
        document.body.innerHTML = '';
    });

    it('should set prompt when the correct element is present', () => {
        document.body.innerHTML = `
            <div>
                <div class="rounded-xl bg-indigo-100">
                    <p class="whitespace-pre-wrap">This is the prompt text</p>
                </div>
            </div>
        `;
        onMut_prompt_updatePromptState(document.body);
        expect(orochiStore.getState().prompt).toContain('This is the prompt text');
    });

    it('should not set prompt when the correct element is not present', () => {
        document.body.innerHTML = `
            <div>
                <div class="some-other-class">
                    <p>This is not the prompt text</p>
                </div>
            </div>
        `;
        onMut_prompt_updatePromptState(document.body);
        expect(orochiStore.getState().prompt).toBeUndefined();
    });

    it('should handle empty container', () => {
        document.body.innerHTML = '';
        onMut_prompt_updatePromptState(document.body);
        expect(orochiStore.getState().prompt).toBeUndefined();
    });

    it('should handle container with unrelated content', () => {
        document.body.innerHTML = `
            <div>
                <div>Unrelated content</div>
                <div>More unrelated content</div>
            </div>
        `;
        onMut_prompt_updatePromptState(document.body);
        expect(orochiStore.getState().prompt).toBeUndefined();
    });

    it('should handle multiple matching elements and use the first one', () => {
        document.body.innerHTML = `
            <div>
                <div class="rounded-xl bg-indigo-100">
                    <p class="whitespace-pre-wrap">First prompt text</p>
                </div>
                <div class="rounded-xl bg-indigo-100">
                    <p class="whitespace-pre-wrap">Second prompt text</p>
                </div>
            </div>
        `;
        onMut_prompt_updatePromptState(document.body);
        expect(orochiStore.getState().prompt).toContain('First prompt text');
    });
});

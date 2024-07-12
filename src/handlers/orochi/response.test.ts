import { describe, it, expect, beforeEach } from 'vitest';
import { orochiStore } from '@src/store/orochiStore';

import { handleResponseMutation } from './response';

function createElement(
    tag: string,
    attributes: Record<string, string>,
    children: (string | HTMLElement)[]
) {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });

    return element;
}

function createCodeBlock(code: string) {
    return createElement('pre', {}, [createElement('code', {}, [code])]);
}

describe('handleResponseMutation', () => {
    beforeEach(() => {
        orochiStore.getState().reset();
        document.body.innerHTML = '';
    });

    it('should handle original response element', () => {
        const tab = createElement('div', { 'data-cy': 'tab' }, [
            createElement('div', {}, [
                'This is the original response intro.',
                createCodeBlock('def original_code()'),
                'This is the original response outro.'
            ])
        ]);
        document.body.appendChild(tab);

        handleResponseMutation(document.body);
        expect(orochiStore.getState().modelResponse).toBe(
            'This is the original response intro.def original_code()This is the original response outro.'
        );
        expect(orochiStore.getState().modelResponseCode).toBe('def original_code()');
    });

    it('should handle edited response element', () => {
        const operatorResponse = createElement('div', { class: 'rounded-xl' }, [
            createElement('div', { class: 'rounded-xl' }, [
                createElement('div', {}, [
                    '1This is the edited response intro.',
                    createCodeBlock('def edited_code()'),
                    'This is the edited response outro.'
                ])
            ])
        ]);
        document.body.appendChild(operatorResponse);

        handleResponseMutation(document.body);

        // The first character is cut off because in the real DOM it's the number of the
        // response
        expect(orochiStore.getState().operatorResponse?.trim()).toBe(
            'This is the edited response intro.def edited_code()This is the edited response outro.'
        );

        expect(orochiStore.getState().operatorResponseCode?.trim()).toBe(
            'def edited_code()'
        );
    });

    it('should not update state if content has not changed', () => {
        const tab = createElement('div', { 'data-cy': 'tab' }, [
            createElement('div', {}, ['This is the original response'])
        ]);
        document.body.appendChild(tab);
        document.body.appendChild(createCodeBlock('def original_code():\n    pass'));

        handleResponseMutation(document.body);
        const initialState = orochiStore.getState();
        handleResponseMutation(document.body);
        const newState = orochiStore.getState();
        expect(newState).toEqual(initialState);
    });

    it('should handle missing response element', () => {
        document.body.appendChild(
            createElement('div', {}, ['No response element here'])
        );
        handleResponseMutation(document.body);
        expect(orochiStore.getState().modelResponse).toBeUndefined();
        expect(orochiStore.getState().operatorResponse).toBeUndefined();
        expect(orochiStore.getState().modelResponseCode).toBeUndefined();
        expect(orochiStore.getState().operatorResponseCode).toBeUndefined();
    });

    it('should handle response element without code', () => {
        const tab = createElement('div', { 'data-cy': 'tab' }, [
            createElement('div', {}, ['This is a response without code'])
        ]);
        document.body.appendChild(tab);

        handleResponseMutation(document.body);
        expect(orochiStore.getState().modelResponse).toBe(
            'This is a response without code'
        );
        expect(orochiStore.getState().modelResponseCode).toBeUndefined();
    });
});

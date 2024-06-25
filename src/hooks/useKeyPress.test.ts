import { describe, it, expect, vi, beforeEach, afterEach, MockInstance } from 'vitest';
import { renderHook } from '@testing-library/react';

import useKeyPress from './useKeyPress';

describe('useKeyPress', () => {
    let addEventListenerSpy: MockInstance<
        [
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | AddEventListenerOptions
        ],
        void
    >;
    let removeEventListenerSpy: MockInstance<
        [
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | EventListenerOptions
        ],
        void
    >;

    beforeEach(() => {
        addEventListenerSpy = vi.spyOn(document, 'addEventListener');
        removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should add event listener on mount', () => {
        renderHook(() => useKeyPress('Enter', vi.fn()));
        expect(addEventListenerSpy).toHaveBeenCalledWith(
            'keydown',
            expect.any(Function)
        );
    });

    it('should remove event listener on unmount', () => {
        const { unmount } = renderHook(() => useKeyPress('Enter', vi.fn()));
        unmount();
        expect(removeEventListenerSpy).toHaveBeenCalledWith(
            'keydown',
            expect.any(Function)
        );
    });

    it('should call action when specified key is pressed', () => {
        const mockAction = vi.fn();
        renderHook(() => useKeyPress('Enter', mockAction));
        const keydownEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        document.dispatchEvent(keydownEvent);
        expect(mockAction).toHaveBeenCalledTimes(1);
        expect(mockAction).toHaveBeenCalledWith(expect.any(KeyboardEvent));
    });

    it('should not call action when a different key is pressed', () => {
        const mockAction = vi.fn();
        renderHook(() => useKeyPress('Enter', mockAction));
        const keydownEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(keydownEvent);
        expect(mockAction).not.toHaveBeenCalled();
    });

    it('should work with multiple key presses', () => {
        const mockAction = vi.fn();
        renderHook(() => useKeyPress('a', mockAction));
        const keydownEventA = new KeyboardEvent('keydown', { key: 'a' });
        const keydownEventB = new KeyboardEvent('keydown', { key: 'b' });
        document.dispatchEvent(keydownEventA);
        document.dispatchEvent(keydownEventB);
        document.dispatchEvent(keydownEventA);
        expect(mockAction).toHaveBeenCalledTimes(2);
    });

    it('should work with an array of keys', () => {
        const mockAction = vi.fn();
        renderHook(() => useKeyPress(['a', 'b'], mockAction));
        const keydownEventA = new KeyboardEvent('keydown', { key: 'a' });
        const keydownEventB = new KeyboardEvent('keydown', { key: 'b' });
        const keydownEventC = new KeyboardEvent('keydown', { key: 'c' });
        document.dispatchEvent(keydownEventA);
        document.dispatchEvent(keydownEventB);
        document.dispatchEvent(keydownEventC);
        expect(mockAction).toHaveBeenCalledTimes(2);
    });

    it('should use keyup event when specified', () => {
        renderHook(() => useKeyPress('Enter', vi.fn(), { event: 'keyup' }));
        expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
    });

    it('should prevent default when specified', () => {
        const mockAction = vi.fn();
        renderHook(() => useKeyPress('Enter', mockAction, { preventDefault: true }));
        const keydownEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        Object.defineProperty(keydownEvent, 'preventDefault', { value: vi.fn() });
        document.dispatchEvent(keydownEvent);
        expect(keydownEvent.preventDefault).toHaveBeenCalled();
    });
});

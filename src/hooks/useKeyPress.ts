import { useEffect, useCallback, RefObject } from 'react';

type KeyPressOptions = {
    target?: RefObject<HTMLElement> | undefined;
    event?: 'keydown' | 'keyup';
    preventDefault?: boolean;
};

const useKeyPress = (
    key: string | string[],
    action: (event: KeyboardEvent) => void,
    options: KeyPressOptions = {}
) => {
    const { target = undefined, event = 'keydown', preventDefault = false } = options;

    const handleKeyPress = useCallback(
        (e: KeyboardEvent) => {
            const keys = Array.isArray(key) ? key : [key];
            if (keys.includes(e.key)) {
                if (preventDefault) {
                    e.preventDefault();
                }
                action(e);
            }
        },
        [key, action, preventDefault]
    );

    useEffect(() => {
        const targetElement = target?.current || document;

        targetElement.addEventListener(event, handleKeyPress as EventListener);

        return () => {
            targetElement.removeEventListener(event, handleKeyPress as EventListener);
        };
    }, [target, event, handleKeyPress]);
};

export default useKeyPress;

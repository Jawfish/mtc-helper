import { useEffect } from 'react';

const useKeyPress = (key: string, action: () => void) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === key) {
                action();
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [key, action]);
};

export default useKeyPress;

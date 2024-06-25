import React, { useState } from 'react';
import clsx from 'clsx';

export const DiffBackground = ({
    children,
    onClick
}: React.PropsWithChildren<{ onClick: () => void }>) => {
    // Ensure the full click happens on the background to avoid mouseup triggering the
    // onClick event if elements shift during the click
    const [isMouseDownOnBackground, setIsMouseDownOnBackground] = useState(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setIsMouseDownOnBackground(true);
        }
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && isMouseDownOnBackground) {
            onClick();
        }
        setIsMouseDownOnBackground(false);
    };

    return (
        <div
            className='fixed left-0 top-0 flex size-full items-center justify-center bg-black/20 z-[900]'
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}>
            {children}
        </div>
    );
};

export const DiffForeground: React.FC<React.PropsWithChildren> = ({ children }) => (
    <div className='relative flex w-[90%] max-w-[116rem] flex-col rounded-md bg-white shadow-lg'>
        {children}
    </div>
);

export const DiffControls: React.FC<React.PropsWithChildren> = ({ children }) => (
    <div className='my-4 flex justify-center gap-4 items-center'>{children}</div>
);

export const DiffContainer: React.FC<
    React.PropsWithChildren<{ roundTop?: boolean }>
> = ({ roundTop = false, children }) => (
    <div className={clsx(roundTop && 'overflow-x-hidden rounded-t-md')}>
        <div className='overflow-auto max-h-[80vh]'>{children}</div>
    </div>
);

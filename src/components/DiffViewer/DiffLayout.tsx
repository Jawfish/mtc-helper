import React, { useState } from 'react';
import clsx from 'clsx';

type Props = {
    onClick: () => void;
    children: React.ReactNode;
};

export const DiffBackground = ({ children, onClick }: Props) => {
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

export const DiffForeground = ({ children }: { children: React.ReactNode }) => (
    <div className='relative flex w-[90%] max-w-[116rem] flex-col rounded-md bg-white shadow-lg'>
        {children}
    </div>
);

export const DiffControls = ({ children }: { children: React.ReactNode }) => (
    <div className='my-4 flex justify-center gap-4 items-center'>{children}</div>
);

export const DiffContainer = ({
    children
}: {
    roundTop?: boolean;
    children: React.ReactNode;
}) => (
    <div className={'overflow-x-hidden rounded-t-md'}>
        <div className='overflow-auto max-h-[80vh]'>{children}</div>
    </div>
);

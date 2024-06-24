import React from 'react';
import clsx from 'clsx';

export const DiffBackground: React.FC<React.PropsWithChildren> = ({ children }) => (
    <div className='fixed left-0 top-0 flex size-full items-center justify-center bg-black/20 z-[900]'>
        {children}
    </div>
);

export const DiffForeground: React.FC<React.PropsWithChildren> = ({ children }) => (
    <div className='relative flex w-[90%] max-w-[116rem] flex-col rounded-md bg-white shadow-lg'>
        {children}
    </div>
);

export const DiffControls: React.FC<React.PropsWithChildren> = ({ children }) => (
    <div className='my-4 flex justify-center gap-4'>{children}</div>
);

export const DiffContainer: React.FC<
    React.PropsWithChildren<{ roundTop?: boolean }>
> = ({ roundTop = false, children }) => (
    <div className={clsx(roundTop && 'overflow-x-hidden rounded-t-md')}>
        <div className='overflow-auto max-h-[80vh]'>{children}</div>
    </div>
);

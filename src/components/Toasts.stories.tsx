import type { Meta, StoryObj } from '@storybook/react';

import { useEffect } from 'react';
import { ToastProvider, useToast } from '@src/contexts/ToastContext';

import Toasts from './Toasts';

const meta: Meta<typeof Toasts> = {
    title: 'Components/Toasts',
    component: Toasts,
    decorators: [
        Story => (
            <ToastProvider>
                <Story />
            </ToastProvider>
        )
    ],
    parameters: {
        layout: 'fullscreen'
    }
};

export default meta;
type Story = StoryObj<typeof Toasts>;

const ToastTrigger = () => {
    const { notify } = useToast();

    useEffect(() => {
        notify('This is a success toast', 'success');
        notify('This is an error toast', 'error');
        notify('This is an info toast', 'info');
        notify('This is a warning toast', 'warning');
    }, [notify]);

    return null;
};

export const Default: Story = {
    render: () => (
        <>
            <Toasts />
            <ToastTrigger />
            <div className='p-4'>
                <h1 className='text-2xl font-bold mb-4'>Toast Container Demo</h1>
                <p>Toasts should appear in the top-right corner of the screen.</p>
            </div>
        </>
    )
};

export const InteractiveToasts: Story = {
    render: () => {
        const ToastButtons = () => {
            const { notify } = useToast();

            return (
                <div className='space-x-2'>
                    <button
                        onClick={() => notify('Success!', 'success')}
                        className='px-4 py-2 bg-green-500 text-white rounded'>
                        Success Toast
                    </button>
                    <button
                        onClick={() => notify('Error!', 'error')}
                        className='px-4 py-2 bg-red-500 text-white rounded'>
                        Error Toast
                    </button>
                    <button
                        onClick={() => notify('Info!', 'info')}
                        className='px-4 py-2 bg-blue-500 text-white rounded'>
                        Info Toast
                    </button>
                    <button
                        onClick={() => notify('Warning!', 'warning')}
                        className='px-4 py-2 bg-yellow-500 text-white rounded'>
                        Warning Toast
                    </button>
                </div>
            );
        };

        return (
            <>
                <Toasts />
                <div className='p-4'>
                    <h1 className='text-2xl font-bold mb-4'>Interactive Toast Demo</h1>
                    <p className='mb-4'>
                        Click the buttons below to trigger different types of toasts:
                    </p>
                    <ToastButtons />
                </div>
            </>
        );
    }
};

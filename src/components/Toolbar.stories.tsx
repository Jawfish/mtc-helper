import type { Meta, StoryObj } from '@storybook/react';

import { ToastProvider } from '@src/contexts/ToastContext';
import { orochiStore } from '@src/store/orochiStore';
import { genericProcessStore } from '@src/store/genericProcessStore';

import Toolbar from './Toolbar';

orochiStore.setState({
    modelResponseCode: 'original code',
    modelResponse: 'original response',
    operatorResponseCode: 'operator code',
    operatorResponse: 'edited response',
    prompt: 'prompt',
    tests: 'tests',
    operatorNotes: 'operator notes'
});

genericProcessStore.setState({
    modelResponseMarkdown: 'original response',
    operatorResponseMarkdown: 'edited response'
});

const meta: Meta<typeof Toolbar> = {
    title: 'Components/Toolbar',
    component: Toolbar,
    decorators: [
        Story => (
            <ToastProvider>
                <Story />
            </ToastProvider>
        )
    ],
    argTypes: {
        process: {
            control: 'radio',
            options: ['Orochi', 'Generic']
        }
    }
};
export default meta;
type Story = StoryObj<typeof Toolbar>;

export const Orochi: Story = {
    args: {
        process: 'Orochi'
    },
    decorators: [
        Story => {
            orochiStore.setState({ language: 'unknown' });

            return <Story />;
        }
    ]
};

export const Generic: Story = {
    args: {
        process: 'Generic'
    }
};

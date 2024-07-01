import type { Meta, StoryObj } from '@storybook/react';

import { fn } from '@storybook/test';
import { ToastProvider } from '@src/contexts/ToastContext';
import { orochiStore } from '@src/store/orochiStore';
import { generalStore } from '@src/store/generalStore';

import Toolbar from './Toolbar';

orochiStore.setState({
    originalCode: 'original code',
    originalResponse: 'original response',
    editedCode: 'edited code',
    editedResponse: 'edited response',
    prompt: 'prompt',
    tests: 'tests',
    operatorNotes: 'operator notes'
});

generalStore.setState({
    originalResponseMarkdown: 'original response',
    editedResponseMarkdown: 'edited response'
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
            options: ['Orochi', 'General', 'Unknown']
        }
    }
};
export default meta;
type Story = StoryObj<typeof Toolbar>;

export const Orochi: Story = {
    args: {
        process: 'Orochi',
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            orochiStore.setState({ language: 'unknown' });

            return <Story />;
        }
    ]
};

export const OrochiPython: Story = {
    args: {
        process: 'Orochi',
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            orochiStore.setState({ language: 'python' });

            return <Story />;
        }
    ]
};

export const General: Story = {
    args: {
        process: 'General',
        toggleDiffView: fn().mockName('toggleDiffView')
    }
};

export const OtherProcess: Story = {
    args: {
        process: 'Unknown',
        toggleDiffView: fn().mockName('toggleDiffView')
    }
};

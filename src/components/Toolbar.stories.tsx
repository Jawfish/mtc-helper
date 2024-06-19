import type { Meta, StoryObj } from '@storybook/react';

import { fn } from '@storybook/test';
import { ToastProvider } from '@src/contexts/ToastContext';
import { globalStore } from '@src/store/globalStore';
import { v4 } from 'uuid';
import { orochiStore } from '@src/store/orochiStore';
import { pandaStore } from '@src/store/pandaStore';

import Toolbar from './Toolbar';

globalStore.setState({
    operatorName: 'test.name@',
    taskId: v4()
});

orochiStore.setState({
    originalCode: 'original code',
    originalResponse: 'original response',
    editedCode: 'edited code',
    editedResponse: 'edited response',
    prompt: 'prompt',
    tests: 'tests',
    operatorNotes: 'operator notes'
});

pandaStore.setState({
    originalResponsePlaintext: 'original response',
    editedResponsePlaintext: 'edited response'
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
            options: ['Orochi', 'PANDA', 'Unknown']
        }
    }
};
export default meta;
type Story = StoryObj<typeof Toolbar>;
globalStore.setState({ operatorName: 'test.name@', taskId: v4() });

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

export const Panda: Story = {
    args: {
        process: 'PANDA',
        toggleDiffView: fn().mockName('toggleDiffView')
    }
};

export const OtherProcess: Story = {
    args: {
        process: 'Unknown',
        toggleDiffView: fn().mockName('toggleDiffView')
    }
};

import type { Meta, StoryObj } from '@storybook/react';

import { ToastProvider } from '@src/contexts/ToastContext';
import { orochiStore } from '@src/store/orochiStore';
import { generalStore } from '@src/store/generalStore';

import Toolbar from './Toolbar';

orochiStore.setState({
    originalCode: 'original code',
    modelResponse: 'original response',
    editedCode: 'edited code',
    operatorResponse: 'edited response',
    prompt: 'prompt',
    tests: 'tests',
    operatorNotes: 'operator notes'
});

generalStore.setState(state => ({
    ...state,
    selectedResponse: {
        ...state.selectedResponse,
        modelResponseMarkdown: 'original response',
        operatorResponseMarkdown: 'edited response'
    }
}));

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
            options: ['Orochi', 'General']
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

export const General: Story = {
    args: {
        process: 'General'
    }
};

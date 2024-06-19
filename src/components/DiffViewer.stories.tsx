import type { Meta, StoryObj } from '@storybook/react';

import { fn } from '@storybook/test';
import { globalStore } from '@src/store/globalStore';
import { orochiStore } from '@src/store/orochiStore';
import { pandaStore } from '@src/store/pandaStore';

import DiffViewer from './DiffViewer';

const meta: Meta<typeof DiffViewer> = {
    title: 'Components/DiffViewer',
    component: DiffViewer,
    decorators: [
        Story => (
            <div style={{ height: '100vh', width: '100vw' }}>
                <Story />
            </div>
        )
    ],
    parameters: {
        layout: 'fullscreen'
    }
};

export default meta;
type Story = StoryObj<typeof DiffViewer>;

export const OrochiDiff: Story = {
    args: {
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            globalStore.setState({ process: 'Orochi' });
            orochiStore.setState({
                originalCode: 'function greeting() {\n  console.log("Hello");\n}',
                editedCode:
                    'function greeting(name) {\n  console.log(`Hello, ${name}!`);\n}',
                originalResponse: `This is the original response.`,
                editedResponse: 'This is the edited response with some changes.'
            });

            return <Story />;
        }
    ]
};

export const OrochiDiffWithLongResponse: Story = {
    args: {
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            globalStore.setState({ process: 'Orochi' });
            orochiStore.setState({
                originalCode:
                    'function greeting() {\n  console.log("Hello");\n}'.repeat(100),
                editedCode:
                    'function greeting(name) {\n  console.log(`Hello, ${name}!`);\n}'.repeat(
                        100
                    ),
                originalResponse: 'This is the original response.'.repeat(100),
                editedResponse: 'This is the edited response with some changes.'.repeat(
                    100
                )
            });

            return <Story />;
        }
    ]
};

export const PandaDiff: Story = {
    args: {
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            globalStore.setState({ process: 'PANDA' });
            pandaStore.setState({
                originalResponsePlaintext: 'This is the original response.',
                editedResponsePlaintext:
                    'This is the edited response with some changes.'
            });

            return <Story />;
        }
    ]
};

export const PandaDiffWithLongResponse: Story = {
    args: {
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            globalStore.setState({ process: 'PANDA' });
            pandaStore.setState({
                originalResponsePlaintext: 'This is the original response.'.repeat(100),
                editedResponsePlaintext:
                    'This is the edited response with some changes.'.repeat(100)
            });

            return <Story />;
        }
    ]
};

export const EmptyDiff: Story = {
    args: {
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            globalStore.setState({ process: 'Unknown' });

            return <Story />;
        }
    ]
};

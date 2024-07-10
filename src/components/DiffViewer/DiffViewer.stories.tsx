import type { Meta, StoryObj } from '@storybook/react';

import { fn } from '@storybook/test';
import { globalStore } from '@src/store/globalStore';
import { orochiStore } from '@src/store/orochiStore';
import { generalStore } from '@src/store/generalStore';

import { DiffViewer } from './DiffViewer';

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

export const OrochiDiffShort: Story = {
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
                modelResponse: `This is the original response.`,
                operatorResponse: 'This is the edited response with some changes.'
            });

            return <Story />;
        }
    ]
};

export const OrochiDiffLong: Story = {
    args: {
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            globalStore.setState({ process: 'Orochi' });
            orochiStore.setState({
                originalCode:
                    'function greeting() {\n  console.log("Hello");\n}\n\n'.repeat(25),
                editedCode:
                    'function greeting(name) {\n  console.log(`Hello, ${name}!`);\n}\n\n'.repeat(
                        25
                    ),
                modelResponse: 'This is the original response.\n\n'.repeat(25),
                operatorResponse:
                    'This is the edited response with some changes.\n\n'.repeat(25)
            });

            return <Story />;
        }
    ]
};

export const GeneralDiffShort: Story = {
    args: {
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            globalStore.setState({ process: 'General' });
            generalStore.setState(state => ({
                ...state,
                selectedResponse: {
                    ...state.selectedResponse,
                    modelResponseMarkdown: 'This is the original response.',
                    operatorResponseMarkdown:
                        'This is the edited response with some changes.'
                }
            }));

            return <Story />;
        }
    ]
};

export const GeneralDiffMarkdown: Story = {
    args: {
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            globalStore.setState({ process: 'General' });
            generalStore.setState(state => ({
                ...state,
                selectedResponse: {
                    ...state.selectedResponse,
                    modelResponseMarkdown:
                        '# Title\nBaragraph Bith **bold** and *bitalic* bext.\n\n- Item 1\n- Bitem 2',
                    operatorResponseMarkdown:
                        '# Title\nParagraph with **bold** and *italic* text.\n\n- Item 1\n- Item 2'
                }
            }));

            return <Story />;
        }
    ]
};

export const GeneralDiffLong: Story = {
    args: {
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            globalStore.setState({ process: 'General' });
            generalStore.setState(state => ({
                ...state,
                selectedResponse: {
                    ...state.selectedResponse,
                    modelResponseMarkdown: 'This is the original response.\n\n'.repeat(
                        25
                    ),
                    operatorResponseMarkdown:
                        'This is the edited response with some changes.\n\n'.repeat(25)
                }
            }));

            return <Story />;
        }
    ]
};

export const GeneralDiffRTL: Story = {
    args: {
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            globalStore.setState({ process: 'General' });
            generalStore.setState(state => ({
                ...state,
                selectedResponse: {
                    ...state.selectedResponse,
                    modelResponseMarkdown:
                        '10. بريتوريا (العاصمة التنفيذية) بلومفونتين (العاصمة القضائية) كيب تاون (العاصمة التشريعية)، جنوب أفريقيا ',
                    operatorResponseMarkdown: '10. بريتوريا، جنوب أفريقيا'
                }
            }));

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
            globalStore.setState({ process: 'General' });

            return <Story />;
        }
    ]
};

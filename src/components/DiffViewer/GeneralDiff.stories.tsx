import type { Meta, StoryObj } from '@storybook/react';

import { generalStore } from '@src/store/generalStore';
import { DiffMethod } from 'react-diff-viewer-continued';

import { GeneralDiff } from './GeneralDiff';

const meta: Meta<typeof GeneralDiff> = {
    title: 'Components/GeneralDiff',
    component: GeneralDiff,
    decorators: [
        Story => (
            <div style={{ height: '100vh', width: '100vw' }}>
                <Story />
            </div>
        )
    ],
    parameters: {
        layout: 'fullscreen'
    },
    argTypes: {
        diffMethod: {
            control: { type: 'select' },
            options: Object.values(DiffMethod)
        },
        disableWordDiff: {
            control: 'boolean'
        }
    }
};

export default meta;
type Story = StoryObj<typeof GeneralDiff>;

const setupStore = (modelResponse: string, operatorResponse: string) => {
    generalStore.setState({
        modelResponseMarkdown: modelResponse,
        operatorResponseMarkdown: operatorResponse
    });
};

export const Default: Story = {
    args: {
        diffMethod: DiffMethod.WORDS,
        disableWordDiff: false
    },
    decorators: [
        Story => {
            setupStore(
                '# Original Heading\n\nThis is the original content.',
                '# Modified Heading\n\nThis is the modified content with some changes.'
            );

            return <Story />;
        }
    ]
};

export const LongContent: Story = {
    args: {
        ...Default.args
    },
    decorators: [
        Story => {
            setupStore(
                '# Original Heading\n\nThis is the original content. '
                    .repeat(25)
                    .trim(),
                '# Modified Heading\n\nThis is the modified content with some changes. '
                    .repeat(25)
                    .trim()
            );

            return <Story />;
        }
    ]
};

export const RTLContent: Story = {
    args: {
        ...Default.args
    },
    decorators: [
        Story => {
            setupStore(
                '# عنوان أصلي\n\nهذا هو المحتوى الأصلي.',
                '# عنوان معدل\n\nهذا هو المحتوى المعدل مع بعض التغييرات.'
            );

            return <Story />;
        }
    ]
};

export const DifferentDiffMethod: Story = {
    args: {
        ...Default.args,
        diffMethod: DiffMethod.CHARS
    },
    decorators: [
        Story => {
            setupStore(
                '# Original Heading\n\nThis is the original content.',
                '# Modified Heading\n\nThis is the modified content with some changes.'
            );

            return <Story />;
        }
    ]
};

export const WordDiffDisabled: Story = {
    args: {
        ...Default.args,
        disableWordDiff: true
    },
    decorators: [
        Story => {
            setupStore(
                '# Original Heading\n\nThis is the original content.',
                '# Modified Heading\n\nThis is the modified content with some changes.'
            );

            return <Story />;
        }
    ]
};

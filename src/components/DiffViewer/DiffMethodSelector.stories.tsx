import type { Meta, StoryObj } from '@storybook/react';

import { DiffMethod } from 'react-diff-viewer-continued';

import { DiffMethodSelector } from './DiffMethodSelector';

const meta: Meta<typeof DiffMethodSelector> = {
    title: 'Components/DiffMethodSelector',
    component: DiffMethodSelector,
    parameters: {
        layout: 'centered'
    },
    argTypes: {
        value: {
            control: 'select',
            options: Object.values(DiffMethod)
        },
        onChange: { action: 'onChange' }
    }
};

export default meta;
type Story = StoryObj<typeof DiffMethodSelector>;

export const Default: Story = {
    args: {
        value: DiffMethod.WORDS
    }
};

export const CharsDiffMethod: Story = {
    args: {
        value: DiffMethod.CHARS
    }
};

export const LinesDiffMethod: Story = {
    args: {
        value: DiffMethod.LINES
    }
};

export const SentencesDiffMethod: Story = {
    args: {
        value: DiffMethod.SENTENCES
    }
};

export const WithCallback: Story = {
    args: {
        value: DiffMethod.WORDS,
        onChange: (newValue: DiffMethod) => {
            // eslint-disable-next-line no-console
            console.log(`New diff method selected: ${newValue}`);
        }
    }
};

export const InContext: Story = {
    decorators: [
        Story => (
            <div className='p-4 bg-gray-100'>
                <div className='mb-2'>Select Diff Method:</div>
                <Story />
            </div>
        )
    ],
    args: {
        value: DiffMethod.WORDS
    }
};

import type { Meta, StoryObj } from '@storybook/react';

import { genericProcessStore } from '@src/store/genericProcessStore';
import { globalStore } from '@src/store/globalStore';

import { Sidebar } from './Sidebar';

const meta: Meta<typeof Sidebar> = {
    title: 'Components/Sidebar',
    component: Sidebar,
    parameters: {
        layout: 'fullscreen'
    },
    decorators: [
        Story => {
            // Reset stores to initial state before each story
            genericProcessStore.getState().reset();
            globalStore.setState({ ignoreListNumbers: false });

            return <Story />;
        }
    ]
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {};

export const WithCustomWordCounts: Story = {
    decorators: [
        Story => {
            genericProcessStore.setState({
                operatorResponseMarkdown:
                    'This is the operator response. It has some words.',
                modelResponseMarkdown:
                    'This is the model response. It also has some words.',
                prompt: 'This is the prompt text. It contains a few words.',
                unselectedResponse:
                    'This is the unselected response. It has a different word count.'
            });

            return <Story />;
        }
    ]
};

export const WithIgnoreListNumbers: Story = {
    decorators: [
        Story => {
            genericProcessStore.setState({
                operatorResponseMarkdown:
                    '1. First item\n2. Second item\n3. Third item',
                modelResponseMarkdown:
                    '1. Model item 1\n2. Model item 2\n3. Model item 3',
                prompt: 'Create a numbered list with 3 items.',
                unselectedResponse:
                    '1. Unselected item 1\n2. Unselected item 2\n3. Unselected item 3'
            });
            globalStore.setState({ ignoreListNumbers: true });

            return <Story />;
        }
    ]
};

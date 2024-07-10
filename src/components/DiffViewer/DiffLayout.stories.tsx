import type { Meta, StoryObj } from '@storybook/react';

import { action } from '@storybook/addon-actions';

import { DiffBackground, DiffContainer } from './DiffLayout';

const meta: Meta<typeof DiffBackground> = {
    title: 'Components/DiffLayoutComponents',
    parameters: {
        layout: 'fullscreen'
    }
};

export default meta;

type DiffBackgroundStory = StoryObj<typeof DiffBackground>;
type DiffContainerStory = StoryObj<typeof DiffContainer>;

export const Background: DiffBackgroundStory = {
    render: () => (
        <DiffBackground onClick={action('background-clicked')}>
            <div className='bg-white p-4 rounded'>
                Click outside this box to trigger the background click
            </div>
        </DiffBackground>
    )
};

export const ScrollableContent: DiffContainerStory = {
    render: () => (
        <DiffContainer>
            <div
                className='p-4'
                style={{ height: '1000px' }}>
                {Array(20)
                    .fill('This is a long content to demonstrate scrolling. ')
                    .join('')}
            </div>
        </DiffContainer>
    )
};

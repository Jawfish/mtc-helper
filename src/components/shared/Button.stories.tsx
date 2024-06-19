import type { Meta, StoryObj } from '@storybook/react';

import { Tooltip } from 'react-tooltip';

import Button from './Button';

const meta: Meta<typeof Button> = {
    title: 'Components/Button',
    component: Button,
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: ['default', 'destructive', 'ghost', 'link', 'outline', 'secondary']
        }
    },
    decorators: [
        Story => (
            <div>
                <Tooltip
                    id='mtc-helper-tooltip'
                    className='z-[1100] shadow text-base'
                    variant='light'
                    opacity={1}
                    offset={10}
                    delayShow={500}
                    border={'1px solid lightgray'}
                    openEvents={{ focus: false, mouseover: true, mouseenter: true }}
                />
                <Story />
            </div>
        )
    ]
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
    args: {
        children: 'Click me',
        onClick: () => alert('Button clicked!'),
        tooltip: 'This is a tooltip'
    }
};

export const WithLongText: Story = {
    args: {
        ...Default.args,
        children: 'This is a button with very long text'
    }
};

export const Destructive: Story = {
    args: {
        ...Default.args,
        variant: 'destructive'
    }
};

export const Ghost: Story = {
    args: {
        ...Default.args,
        variant: 'ghost'
    }
};

export const Link: Story = {
    args: {
        ...Default.args,
        variant: 'link'
    }
};

export const Outline: Story = {
    args: {
        ...Default.args,
        variant: 'outline'
    }
};

export const Secondary: Story = {
    args: {
        ...Default.args,
        variant: 'secondary'
    }
};

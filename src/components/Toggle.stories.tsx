import type { Meta, StoryObj } from '@storybook/react';

import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
    title: 'Components/Toggle',
    component: Toggle,
    argTypes: {
        checked: { control: 'boolean' },
        onCheckedChange: { action: 'checked changed' }
    }
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
    args: {
        children: 'Enable feature',
        checked: false
    }
};

export const Checked: Story = {
    args: {
        ...Default.args,
        checked: true
    }
};

export const WithLongLabel: Story = {
    args: {
        ...Default.args,
        children: 'This is a toggle with a very long label text'
    }
};

export const WithCustomLabel: Story = {
    args: {
        ...Default.args,
        children: (
            <span>
                Custom <strong>formatted</strong> label
            </span>
        )
    }
};
